# Kharcho V1 Technical Specification

## Scope

Android first React Native app. React Native shares UI and business logic for a future iPhone app, but V1 SMS ingestion is Android native only.

## Stack

| Area | Choice |
| --- | --- |
| App framework | React Native CLI |
| Language | TypeScript |
| Android native bridge | Kotlin |
| Navigation | React Navigation |
| Client state | Zustand |
| Persistent storage | SQLite |
| Sensitive storage | Android Keystore for encryption key material |
| Motion | React Native Reanimated |
| 3D style assets | Rive or optimized static render assets |
| Testing | Jest, React Native Testing Library, Kotlin unit tests |

Expo Go is not suitable because Kharcho needs a custom Android SMS native module.

## Architecture

```text
React Native screens
        |
application state and use cases
        |
repositories and SQLite database
        |
Android SMS bridge, parser, permission manager
        |
Telephony SMS provider and incoming SMS receiver
```

### Modules

| Module | Responsibility |
| --- | --- |
| `features/onboarding` | Disclosure, consent, permission, import progress |
| `features/transactions` | List, detail, manual entry, filters, edits |
| `features/dashboard` | Monthly totals, recent activity, category summary |
| `features/insights` | Category totals and budgets |
| `features/accounts` | Account discovery, rename, hide |
| `core/parser` | Sender identification, amount and merchant extraction, classification |
| `native/sms` | Android permission requests, historic scan, new SMS receiver |
| `data` | SQLite schema, migrations, repositories |

## Android permission design

Required Android permissions:

```xml
android.permission.READ_SMS
android.permission.RECEIVE_SMS
```

Rules:

1. Request permission only from explicit user action after a plain language disclosure.
2. Do not parse SMS before consent.
3. Stop receiving and scanning if permission is revoked.
4. Submit the Google Play SMS declaration for SMS based money management before production release.
5. Keep permission use limited to the documented core transaction tracking feature.

## SMS pipeline

```text
SMS received or historic scan
        |
sender allow list and template detector
        |
transaction parser
        |
normalizer
        |
duplicate detector
        |
category resolver
        |
SQLite transaction record
        |
React Native event refreshes dashboard
```

### Parser strategy

Use deterministic parsers first. Each parser has sender patterns, debit and credit phrases, amount expressions, account suffix patterns, merchant extraction rules, reference extraction rules, and confidence scoring.

Parser result:

```ts
type ParsedTransaction = {
  amountPaise: number;
  direction: 'debit' | 'credit';
  merchant?: string;
  accountSuffix?: string;
  paymentMethod?: 'upi' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash';
  occurredAt: string;
  referenceId?: string;
  confidence: 'high' | 'medium' | 'low';
};
```

Do not use generative AI to parse transaction SMS in V1. Rules are easier to test, audit, and run fully offline.

## Data model

### `transactions`

```text
id
amount_paise
direction
merchant
merchant_normalized
account_id
payment_method
category_id
occurred_at
reference_id
source
confidence
note
dedupe_fingerprint
created_at
updated_at
```

### Supporting tables

```text
accounts
categories
merchant_rules
budgets
import_runs
parser_templates
```

Raw SMS body is transient parser input and is not persisted after a transaction record is created.

## Duplicate strategy

1. If reference ID exists, use a unique fingerprint made from sender and reference ID.
2. Otherwise hash normalized sender, direction, amount, account suffix, merchant, and a narrow timestamp window.
3. If matched, retain existing record and log the duplicate for diagnostics without raw SMS text.

## Security

1. Store database locally.
2. Encrypt sensitive database fields using a key protected by Android Keystore.
3. Do not log raw SMS, account numbers, amounts, or reference IDs in production logs.
4. Disable Android backup for production financial data unless encrypted backup is intentionally designed.
5. Provide destructive local data deletion in Settings.

## Motion and assets

Use React Native Reanimated for UI motion. Use static 3D assets or Rive only where they support hierarchy. Do not load a full 3D scene engine for every screen.

| Interaction | Motion |
| --- | --- |
| Button press | 120ms scale and haptic response |
| Card and bottom sheet | 220ms spring |
| Screen transition | 280ms fade and slide |
| Logo entrance | 600ms single rotation and settle |
| Reduce Motion enabled | Fade only. No decorative motion |

## Test plan

1. Parser fixtures for each supported bank or payment sender.
2. Unit tests for debit and credit detection, amount formats, account suffixes, duplicates, and category rules.
3. Android permission tests for grant, deny, revoke, and re grant.
4. Import test with SMS fixture corpus for 7, 30, and 90 day ranges.
5. UI tests for manual entry, edit, delete, filter, and budget display.
6. Performance test on a low end Android device with 5,000 SMS messages.

## Delivery sequence

1. Build app shell, visual design system, SQLite schema, and manual transactions.
2. Add Android permission and historic SMS import.
3. Add incoming SMS receiver, parser templates, and duplicate logic.
4. Add dashboard, transactions, accounts, and insights.
5. Add animation and 3D assets with accessibility fallbacks.
6. Run device tests, policy review, privacy review, and closed testing release.
