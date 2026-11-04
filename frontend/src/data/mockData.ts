/**
 * Kharcho data models, categories, and currency formatting helpers
 */

export type Direction = 'debit' | 'credit';

export type Category =
  | 'Food & Dining'
  | 'Groceries'
  | 'Transport'
  | 'Shopping'
  | 'Bills & Utilities'
  | 'Health'
  | 'Entertainment'
  | 'Cash Withdrawal'
  | 'Transfers'
  | 'Income'
  | 'Other';

export type PaymentMethod =
  | 'upi'
  | 'credit_card'
  | 'debit_card'
  | 'bank_transfer'
  | 'cash';

export interface Transaction {
  id: string;
  amountPaise: number;
  direction: Direction;
  merchant: string;
  accountSuffix: string;
  paymentMethod: PaymentMethod;
  category: Category;
  occurredAt: string; // ISO date string
  referenceId?: string;
  source: 'sms' | 'manual';
  confidence: 'high' | 'medium' | 'low';
  note?: string;
}

export const CATEGORY_ICONS: Record<Category, string> = {
  'Food & Dining': '🍽️',
  'Groceries': '🛒',
  'Transport': '🚗',
  'Shopping': '🛍️',
  'Bills & Utilities': '📋',
  'Health': '❤️',
  'Entertainment': '🎬',
  'Cash Withdrawal': '💵',
  'Transfers': '↔️',
  'Income': '💼',
  'Other': '📦',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  'Food & Dining': '#E66A5C',
  'Groceries': '#29B879',
  'Transport': '#E8A63A',
  'Shopping': '#A78BFA',
  'Bills & Utilities': '#60A5FA',
  'Health': '#F472B6',
  'Entertainment': '#FB923C',
  'Cash Withdrawal': '#94A3B8',
  'Transfers': '#6EE7B7',
  'Income': '#29B879',
  'Other': '#CBD5E1',
};

/**
 * Format number into Indian comma system (e.g., 1,23,456.78)
 */
export function formatIndianRupees(val: number): string {
  const isNegative = val < 0;
  const absVal = Math.abs(val);
  const rounded = Math.round(absVal * 100) / 100;
  const parts = rounded.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  // Indian grouping: last 3 digits, then groups of 2
  if (integerPart.length > 3) {
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    const withCommas = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    integerPart = withCommas + ',' + lastThree;
  }

  // Omit .00 if whole number, otherwise show decimals
  const formatted = decimalPart === '00' ? integerPart : `${integerPart}.${decimalPart}`;
  return `${isNegative ? '-' : ''}₹${formatted}`;
}

/**
 * Format paise into full rupee string with rupee symbol (e.g. ₹24,850 or ₹320.50)
 */
export function formatFullAmount(paise: number): string {
  const rupees = paise / 100;
  return formatIndianRupees(rupees);
}

/**
 * Format amount for display. Only abbreviates if above 10 Lakhs (₹10L) or 1 Crore (₹1Cr).
 * Keeps standard amounts fully legible (e.g. ₹32,400).
 */
export function formatAmount(paise: number): string {
  const rupees = Math.abs(paise / 100);
  if (rupees >= 10000000) {
    return `${paise < 0 ? '-' : ''}₹${(rupees / 10000000).toFixed(2)}Cr`;
  }
  if (rupees >= 1000000) {
    return `${paise < 0 ? '-' : ''}₹${(rupees / 100000).toFixed(1)}L`;
  }
  return formatFullAmount(paise);
}

/**
 * Group transactions by date relative to today
 */
export function groupByDate(txns: Transaction[]): { title: string; data: Transaction[] }[] {
  const groups: Record<string, Transaction[]> = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Sort descending by date first
  const sorted = [...txns].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );

  sorted.forEach(t => {
    const d = new Date(t.occurredAt);
    let label: string;
    if (d.toDateString() === today.toDateString()) {
      label = 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      label = 'Yesterday';
    } else {
      label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(t);
  });

  return Object.entries(groups).map(([title, data]) => ({ title, data }));
}

/**
 * Initial sample transactions as safe offline fallback
 */
export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'mock-1',
    amountPaise: 32000,
    direction: 'debit',
    merchant: 'Zomato',
    accountSuffix: '4821',
    paymentMethod: 'upi',
    category: 'Food & Dining',
    occurredAt: new Date().toISOString(),
    source: 'sms',
    confidence: 'high',
  },
  {
    id: 'mock-2',
    amountPaise: 68000,
    direction: 'debit',
    merchant: 'Uber',
    accountSuffix: '4821',
    paymentMethod: 'upi',
    category: 'Transport',
    occurredAt: new Date().toISOString(),
    source: 'sms',
    confidence: 'high',
  },
  {
    id: 'mock-3',
    amountPaise: 2500000,
    direction: 'credit',
    merchant: 'Salary Transfer',
    accountSuffix: '4821',
    paymentMethod: 'bank_transfer',
    category: 'Income',
    occurredAt: new Date(Date.now() - 86400000).toISOString(),
    source: 'sms',
    confidence: 'high',
  },
  {
    id: 'mock-4',
    amountPaise: 245000,
    direction: 'debit',
    merchant: 'Amazon',
    accountSuffix: '4821',
    paymentMethod: 'credit_card',
    category: 'Shopping',
    occurredAt: new Date(Date.now() - 86400000).toISOString(),
    source: 'sms',
    confidence: 'high',
  },
  {
    id: 'mock-5',
    amountPaise: 124000,
    direction: 'debit',
    merchant: 'Blinkit',
    accountSuffix: '4821',
    paymentMethod: 'upi',
    category: 'Groceries',
    occurredAt: new Date(Date.now() - 86400000).toISOString(),
    source: 'sms',
    confidence: 'high',
  },
  {
    id: 'mock-6',
    amountPaise: 39900,
    direction: 'debit',
    merchant: 'Airtel Broadband',
    accountSuffix: '4821',
    paymentMethod: 'upi',
    category: 'Bills & Utilities',
    occurredAt: new Date(Date.now() - 172800000).toISOString(),
    source: 'sms',
    confidence: 'high',
  },
  {
    id: 'mock-7',
    amountPaise: 500000,
    direction: 'credit',
    merchant: 'Client Payment',
    accountSuffix: '4821',
    paymentMethod: 'bank_transfer',
    category: 'Income',
    occurredAt: new Date(Date.now() - 259200000).toISOString(),
    source: 'sms',
    confidence: 'medium',
  },
  {
    id: 'mock-8',
    amountPaise: 85000,
    direction: 'debit',
    merchant: 'BookMyShow',
    accountSuffix: '4821',
    paymentMethod: 'credit_card',
    category: 'Entertainment',
    occurredAt: new Date(Date.now() - 259200000).toISOString(),
    source: 'sms',
    confidence: 'high',
  },
];
