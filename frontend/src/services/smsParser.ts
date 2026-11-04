import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { Transaction, Category, PaymentMethod } from '../data/mockData';

const { SmsModule } = NativeModules;

export interface RawSms {
  id?: string;
  sender: string;
  body: string;
  timestamp: number;
}

/**
 * Normalizes text and capitalizes merchant name
 */
export function cleanMerchantName(raw: string): string {
  if (!raw) return 'Unknown';
  let cleaned = raw
    .replace(/^(VPA|to\s+VPA|to|at|from|towards|by|payment\s+to|transfer\s+to|paid\s+to)\s+/i, '')
    .replace(/@.*$/, '') // remove UPI handle domain e.g. @icici, @okhdfcbank
    .replace(/\s+(using|via|through|on|for|ref|rrn|upi|order).*$/i, '') // strip trailing app/channel
    .replace(/[._-]+/g, ' ')
    .trim();

  // If camelCase or lowercase, convert cleanly to Title Case
  if (cleaned.length > 0) {
    cleaned = cleaned
      .split(' ')
      .filter(w => w.length > 0)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  // Filter out noise or false merchant names
  if (/^(your|the|a|an|bank|account|acct|rs|inr|card|vpa|credit|debit|payment|transfer|transaction|txn|info|alert|order|ref|upi|request)$/i.test(cleaned)) {
    return 'Unknown';
  }

  // If pure digits (e.g. phone number in UPI handle), format cleanly
  if (/^\d{8,14}$/.test(cleaned)) {
    return 'UPI Transfer';
  }

  return cleaned || 'Unknown';
}

/**
 * Deterministic Indian Bank / UPI / Card SMS Transaction Parser
 * Supports SBI, HDFC, ICICI, Axis, Kotak, Baroda, PNB, Paytm, PhonePe, GPay, CRED, UPI Lite, etc.
 */
export function parseSms(raw: RawSms): Transaction | null {
  const { sender, body, timestamp } = raw;
  if (!body || typeof body !== 'string') return null;

  const cleanBody = body.replace(/\r?\n|\r/g, ' ').trim();

  // 1. Exclude OTPs, Passwords, PINs, Verification
  const isOtp = /\b(otp|verification code|one time password|secret code|security code|login pin|cvv)\b/i.test(cleanBody);
  if (isOtp) return null;

  // 2. Exclude Marketing, Loans, Offers, Promotions
  const isMarketing = /\b(apply now|pre-approved|loan offer|win up to|claim your|click here|discount on|special offer)\b/i.test(cleanBody);
  if (isMarketing) return null;

  // 3. Exclude Payment / Collect Requests and Reminders (not completed transactions)
  const isRequest = /\b(request to pay|has requested|collect request|requested from you|reminder to pay|is due on|will be debited on)\b/i.test(cleanBody);
  if (isRequest) return null;

  // 4. Exclude Failed or Declined Transactions
  const isFailed = /\b(declined|failed|unsuccessful|cancelled|timed out|could not be processed|insufficient funds)\b/i.test(cleanBody);
  if (isFailed) return null;

  // 5. Exclude Balance Only inquiries without any debit or credit verb
  const hasDebitAction = /\b(debited|spent|paid|withdrawn|sent|deducted|purchase|payment|transaction|txn|swiped|charged|transferred|transfer of|used for|used at)\b/i.test(cleanBody);
  const hasCreditAction = /\b(credited|received|deposited|refunded|refund|added to|transferred to your|cashback|salary|reversed)\b/i.test(cleanBody);

  if (!hasDebitAction && !hasCreditAction) {
    return null;
  }

  // 6. Direction resolution
  let direction: 'debit' | 'credit' = 'debit';
  if (hasCreditAction && !hasDebitAction) {
    direction = 'credit';
  } else if (hasDebitAction && !hasCreditAction) {
    direction = 'debit';
  } else {
    // Both present: evaluate perspective
    const isRefund = /\b(refund|refunded|cashback|reversed)\b/i.test(cleanBody);
    const acctCredited = /(?:a\/c|account|card)\s*(?:no\.?)?\s*[*Xx\d]*\s*(?:is|has been)?\s*credited/i.test(cleanBody);
    const acctDebited = /(?:a\/c|account|card)\s*(?:no\.?)?\s*[*Xx\d]*\s*(?:is|has been)?\s*debited/i.test(cleanBody);

    if (isRefund || acctCredited) {
      direction = 'credit';
    } else if (acctDebited) {
      direction = 'debit';
    } else {
      direction = 'debit';
    }
  }

  // 7. Amount Extraction (Must NOT pick available balance!)
  let amountFloat: number | null = null;

  // Helper: check if index in string is preceded or followed by balance keywords
  function isBalanceContext(str: string, matchIndex: number, matchLen: number): boolean {
    const preceding = str.substring(Math.max(0, matchIndex - 40), matchIndex).toLowerCase();
    const succeeding = str.substring(matchIndex + matchLen, Math.min(str.length, matchIndex + matchLen + 40)).toLowerCase();

    // e.g. "avl bal:", "balance is", "limit:", "clear bal - "
    if (/(?:avl|avail|available|tot|total|net|closing|clear)?\s*(?:bal|balance|limit|lim)\s*[:.\-]?\s*(?:is|of)?\s*$/i.test(preceding)) {
      return true;
    }
    // e.g. "is avl bal", "is your available limit"
    if (/^\s*(?:is\s+)?(?:your\s+)?(?:avl|avail|available|tot|total|net|closing)?\s*(?:bal|balance|limit)/i.test(succeeding)) {
      return true;
    }
    return false;
  }

  // Priority 1: Currency prefix e.g. Rs. 450, INR 1,200.50, ₹ 350
  const currencyRegex = /(?:Rs\.?|INR|₹|Re\.?|Rupees)\s*([\d,]+(?:\.\d{1,2})?)/gi;
  let curMatch: RegExpExecArray | null;
  while ((curMatch = currencyRegex.exec(cleanBody)) !== null) {
    if (isBalanceContext(cleanBody, curMatch.index, curMatch[0].length)) {
      continue;
    }
    const val = parseFloat(curMatch[1].replace(/,/g, ''));
    if (!isNaN(val) && val > 0) {
      amountFloat = val;
      break;
    }
  }

  // Priority 2: "debited by 460.0" or "credited with 500" without currency symbol (SBI style)
  if (!amountFloat) {
    const verbNumRegex = /(?:debited(?:\s+(?:by|with|for))?|credited(?:\s+(?:by|with|to))?|withdrawn(?:\s+of)?|paid|spent)\s+([\d,]+(?:\.\d{1,2})?)\b(?!\s*[-/]\s*\d)/i;
    const vMatch = cleanBody.match(verbNumRegex);
    if (vMatch && !isBalanceContext(cleanBody, vMatch.index, vMatch[0].length)) {
      const val = parseFloat(vMatch[1].replace(/,/g, ''));
      if (!isNaN(val) && val > 0) {
        amountFloat = val;
      }
    }
  }

  // Priority 3: Currency suffix e.g. "450.00/-" or "500 INR"
  if (!amountFloat) {
    const suffixRegex = /\b([\d,]+(?:\.\d{1,2})?)\s*(?:Rs\.?|INR|₹|\/-)/gi;
    let sMatch: RegExpExecArray | null;
    while ((sMatch = suffixRegex.exec(cleanBody)) !== null) {
      if (isBalanceContext(cleanBody, sMatch.index, sMatch[0].length)) {
        continue;
      }
      const val = parseFloat(sMatch[1].replace(/,/g, ''));
      if (!isNaN(val) && val > 0) {
        amountFloat = val;
        break;
      }
    }
  }

  if (!amountFloat || isNaN(amountFloat) || amountFloat <= 0) {
    return null;
  }
  const amountPaise = Math.round(amountFloat * 100);

  // 8. Account / Card Suffix (match 3-6 digits, e.g. A/C XXXXX12345, Card 5678, ending with 1234)
  let accountSuffix = '';
  const acctMatch = cleanBody.match(/(?:a\/c|acct|account|card|ending(?:\s+(?:in|with))?)\s*(?:no\.?)?\s*[*Xx]*(\d{3,6})\b/i);
  if (acctMatch) {
    accountSuffix = acctMatch[1];
  } else {
    // Check wallet/app context
    if (/paytm/i.test(cleanBody) || /paytm/i.test(sender)) accountSuffix = 'Paytm';
    else if (/phonepe/i.test(cleanBody) || /phonepe/i.test(sender)) accountSuffix = 'PhonePe';
    else if (/upi\s*lite/i.test(cleanBody)) accountSuffix = 'UPI Lite';
    else accountSuffix = 'Bank';
  }

  // 9. Merchant Extraction
  let merchant = 'Unknown';

  if (direction === 'credit') {
    if (/salary|payroll/i.test(cleanBody)) {
      merchant = 'Salary';
    } else if (/refund/i.test(cleanBody)) {
      const forMatch = cleanBody.match(/for\s+([A-Za-z0-9&'.-]{2,20}?)(?:\s+order|\s+txn|\s+on|\.|\,|$)/i);
      merchant = forMatch ? cleanMerchantName(forMatch[1]) + ' (Refund)' : 'Refund';
    } else if (/cashback/i.test(cleanBody)) {
      merchant = 'Cashback';
    } else if (/reversed/i.test(cleanBody)) {
      merchant = 'Reversal';
    } else if (/dividend|interest/i.test(cleanBody)) {
      merchant = 'Bank Interest';
    } else {
      const fromMatch = cleanBody.match(/(?:from|by)\s+(?:a\/c\s+linked\s+to\s+)?(?:VPA\s+)?([A-Za-z0-9_.-]+@?[A-Za-z0-9_.-]*)/i);
      if (fromMatch && fromMatch[1].length > 1) {
        merchant = cleanMerchantName(fromMatch[1]);
      }
    }
  } else {
    // Debit merchant detection in order of specificity:

    // 1: UPI slash pattern e.g. "UPI/UBER/4225123456", "UPI/DR/3253.../Swiggy", "UPI/531234567890/Zepto", "UPI/Zomato/42258923"
    const upiParts = cleanBody.match(/UPI[:\/-]([A-Za-z0-9_\/-]+)/i);
    if (upiParts && upiParts[1]) {
      const segments = upiParts[1].split(/[\/-]/);
      for (const seg of segments) {
        if (/^(dr|cr|p2m|p2p|ref|no|txn)$/i.test(seg)) continue;
        if (/^\d+$/.test(seg)) continue; // skip pure reference numbers
        if (seg.length >= 2) {
          merchant = cleanMerchantName(seg);
          break;
        }
      }
    }

    // 2: "at <Merchant>" e.g. "at BLINKIT on", "at AMAZON on", "at Swiggy using PhonePe", "at Starbucks via"
    if (merchant === 'Unknown') {
      const atMatch = cleanBody.match(/\bat\s+([A-Za-z0-9\s&'.-]{2,25}?)(?:\s+using|\s+via|\s+through|\s+on\b|\s+ref|\s+avl|\s+bal|\.|\,|$)/i);
      if (atMatch && atMatch[1].trim().length > 1) {
        merchant = cleanMerchantName(atMatch[1]);
      }
    }

    // 3: "to VPA <handle>" or "transfer to VPA <handle>"
    if (merchant === 'Unknown') {
      const vpaMatch = cleanBody.match(/(?:to\s+VPA|transfer\s+to\s+VPA|to)\s+([A-Za-z0-9_.-]+@[A-Za-z0-9_.-]+)/i);
      if (vpaMatch && vpaMatch[1]) {
        merchant = cleanMerchantName(vpaMatch[1]);
      }
    }

    // 4: "to <Recipient> via/using" or "txn to <Merchant>" or "paid to <Merchant>" or "sent to <Recipient>"
    if (merchant === 'Unknown') {
      const toMatch = cleanBody.match(/\b(?:payment\s+to|paid\s+to|sent\s+to|transfer\s+to|txn\s+to|to)\s+([A-Za-z0-9\s&'.-]{2,25}?)(?:\s+via\b|\s+using\b|\s+through\b|\s+on\s+\d|\s+ref\b|\s+avl\b|\s+bal\b|\.|\,|$)/i);
      if (toMatch && toMatch[1].trim().length > 1) {
        const candidate = cleanMerchantName(toMatch[1]);
        if (candidate !== 'Unknown') {
          merchant = candidate;
        }
      }
    }

    // 5: "towards <Merchant>" e.g. "towards Food order", "towards Tata Play"
    if (merchant === 'Unknown') {
      const towardsMatch = cleanBody.match(/towards\s+([A-Za-z0-9\s&'.-]{2,25}?)(?:\s+using|\s+via|\s+on\b|\s+ref|\s+bal|\.|\,|$)/i);
      if (towardsMatch && towardsMatch[1].trim().length > 1) {
        const candidate = cleanMerchantName(towardsMatch[1]);
        if (candidate !== 'Unknown') {
          merchant = candidate;
        }
      }
    }

    // 6: "for <Bill/Utility> Bill" e.g. "for Airtel Broadband Bill"
    if (merchant === 'Unknown') {
      const forBillMatch = cleanBody.match(/for\s+([A-Za-z0-9\s&'.-]{2,25}?)\s+Bill/i);
      if (forBillMatch && forBillMatch[1].trim().length > 1) {
        merchant = cleanMerchantName(forBillMatch[1]);
      }
    }
  }

  // Fallback: If still Unknown, clean up sender or set generic
  if (merchant === 'Unknown' || merchant.length === 0) {
    const cleanedSender = sender.replace(/^[A-Za-z]{2}-/i, '');
    merchant = cleanedSender ? cleanMerchantName(cleanedSender) : (direction === 'credit' ? 'Deposit' : 'Expense');
  }

  // 10. Payment Method Detection
  let paymentMethod: PaymentMethod = 'upi';
  if (/credit card|cc\b|ending\s+\d{4}\s+has been used/i.test(cleanBody)) {
    paymentMethod = 'credit_card';
  } else if (/debit card|dc\b|atm\b|withdrawn/i.test(cleanBody)) {
    paymentMethod = 'debit_card';
  } else if (/upi|vpa|rrn/i.test(cleanBody)) {
    paymentMethod = 'upi';
  } else if (/neft|rtgs|imps|netbanking|salary|bank transfer/i.test(cleanBody)) {
    paymentMethod = 'bank_transfer';
  }

  // 11. Category Classification
  let category: Category = 'Other';
  const textCorpus = `${merchant} ${cleanBody}`.toLowerCase();

  if (direction === 'credit') {
    category = 'Income';
  } else if (/\b(swiggy|zomato|mcdonald|starbucks|kfc|burger|pizza|domino|cafe|restaurant|dine|dining|food|eat|bakery|haldiram|biryani|chaat|tea|chai|coffee|bar|pub|faasos|behrouz|pan palace)\b/i.test(textCorpus)) {
    category = 'Food & Dining';
  } else if (/\b(blinkit|zepto|instamart|bigbasket|bb daily|dmart|grocery|groceries|supermarket|fruits|vegetables|milk|dairy|country delight|freshtohome|meat)\b/i.test(textCorpus)) {
    category = 'Groceries';
  } else if (/\b(uber|ola|rapido|namma yatri|metro|irctc|railway|redbus|flight|indigo|air india|petrol|fuel|diesel|cng|hpcl|bpcl|iocl|shell|fastag|toll|cab|auto|driver)\b/i.test(textCorpus)) {
    category = 'Transport';
  } else if (/\b(amazon|flipkart|myntra|ajio|meesho|nykaa|zara|h&m|tata cliq|decathlon|croma|shopping|retail|mall|store|lenskart|uniqlo|reliance digital)\b/i.test(textCorpus)) {
    category = 'Shopping';
  } else if (/\b(airtel|jio|vi\b|bsnl|electricity|bescom|tneb|power|bill|utility|recharge|broadband|wifi|water|gas|indane|billdesk|bbps|cred|dth|tata play)\b/i.test(textCorpus)) {
    category = 'Bills & Utilities';
  } else if (/\b(apollo|pharmacy|1mg|netmeds|pharmeasy|hospital|clinic|doctor|medplus|health|medicine|pathology|diagnostic|dentist)\b/i.test(textCorpus)) {
    category = 'Health';
  } else if (/\b(netflix|prime|hotstar|spotify|bookmyshow|cinema|pvr|inox|youtube|movie|entertainment|playstation|steam|theatre)\b/i.test(textCorpus)) {
    category = 'Entertainment';
  } else if (/\b(atm|cash withdrawal|cash dispense|nfs atm|cash wdl)\b/i.test(textCorpus)) {
    category = 'Cash Withdrawal';
  } else if (/\b(transfer to|sent to|imps to|neft to|reversal)\b/i.test(textCorpus)) {
    category = 'Transfers';
  }

  // 12. Reference ID Extraction
  const refMatch = cleanBody.match(/(?:ref(?:\s*no)?|rrn|txn\s*id|upi\s*ref(?:\s*no)?)\s*[:.]?\s*([A-Za-z0-9]+)/i);
  const referenceId = refMatch ? refMatch[1] : undefined;

  return {
    id: raw.id || `${timestamp || Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    amountPaise,
    direction,
    merchant,
    accountSuffix,
    paymentMethod,
    category,
    occurredAt: new Date(timestamp && timestamp > 0 ? timestamp : Date.now()).toISOString(),
    referenceId,
    source: 'sms',
    confidence: 'high',
  };
}

/**
 * Android Native Module Bridge Wrappers
 */
export async function requestSmsPermission(): Promise<boolean> {
  if (Platform.OS !== 'android' || !SmsModule) return true;
  try {
    const res = await SmsModule.requestSmsPermission();
    return res === 'granted';
  } catch (e) {
    console.warn('[SMS Bridge] Failed to request SMS permission', e);
    return false;
  }
}

export async function fetchHistoricTransactions(daysBack: number = 30): Promise<Transaction[]> {
  if (Platform.OS !== 'android' || !SmsModule) return [];
  try {
    const messages: RawSms[] = await SmsModule.getHistoricSms(daysBack);
    console.log(`[SMS Bridge] Read ${messages?.length || 0} raw SMS from device (daysBack=${daysBack})`);
    const parsedMap = new Map<string, Transaction>();

    for (const msg of messages) {
      const txn = parseSms(msg);
      if (txn) {
        // Deduplicate using referenceId if present, else composite key
        const dedupeKey = txn.referenceId
          ? `${txn.referenceId}-${txn.amountPaise}`
          : `${txn.amountPaise}-${txn.merchant}-${txn.occurredAt.substring(0, 10)}`;

        if (!parsedMap.has(dedupeKey)) {
          parsedMap.set(dedupeKey, txn);
        }
      }
    }
    const result = Array.from(parsedMap.values());
    // Sort chronological descending (latest transactions first)
    result.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
    console.log(`[SMS Bridge] Successfully parsed ${result.length} unique bank transactions`);
    return result;
  } catch (e) {
    console.warn('[SMS Bridge] Failed to fetch historic SMS', e);
    return [];
  }
}

export function subscribeToNewSms(onNewTxn: (txn: Transaction) => void) {
  if (Platform.OS !== 'android' || !SmsModule) return () => {};
  const emitter = new NativeEventEmitter(SmsModule);
  const sub = emitter.addListener('onNewSms', (raw: any) => {
    const txn = parseSms(raw as RawSms);
    if (txn) {
      console.log(`[SMS Bridge] New incoming SMS parsed: ₹${txn.amountPaise / 100} at ${txn.merchant}`);
      onNewTxn(txn);
    }
  });
  return () => sub.remove();
}
