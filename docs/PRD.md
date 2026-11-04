# Kharcho V1 Product Requirements

## Product summary

Kharcho is an Android expense tracker that turns bank transaction SMS into a private, useful view of income, expenses, accounts, and spending patterns. It works locally on the user's phone. No bank connection, account, cloud sync, or manual daily entry is required for bank SMS transactions.

## Problem

People receive transaction messages from banks, cards, and UPI payments but do not get a clear, unified spending picture. Existing trackers demand manual entry or bank credentials. Kharcho removes the daily entry burden by parsing transaction SMS on device.

## V1 outcome

After granting consent, a user imports a chosen period of transaction SMS, sees clean categorized transactions, and receives new transactions automatically.

## Goals

1. Import transaction SMS from the previous 7, 30, or 90 days.
2. Detect new bank SMS while the app is installed and permitted.
3. Extract amount, debit or credit direction, merchant, account suffix, transaction date, and reference when present.
4. Categorize transactions automatically and let users correct categories.
5. Support manual Cash, Credit Card, Debit Card, UPI, Bank Transfer, and Other transactions.
6. Show monthly balance, income, expenses, categories, accounts, transactions, and budget progress.
7. Keep raw SMS and financial data on device.

## Non goals

1. Bank login or Open Banking connection.
2. iPhone SMS inbox access.
3. Cloud backup, multi device sync, family sharing, or social features.
4. Investment, tax, credit score, lending, or payment features.
5. Receipt scanning and statement import.

## Target user

India based Android user who gets bank, card, and UPI transaction SMS, uses multiple payment methods, and wants an automatic private money overview.

## Primary flow

1. User opens Kharcho.
2. User sees clear disclosure: Kharcho reads only transaction SMS, processes it on device, and never uploads raw SMS.
3. User grants SMS permission and selects an import period.
4. Kharcho scans SMS, identifies transaction candidates, removes duplicates, and shows import progress.
5. Parsed transactions appear on Home and Transactions screens.
6. New transaction SMS are parsed and added automatically.
7. User optionally edits any transaction or adds a manual expense.

## Functional requirements

### SMS import

| Requirement | V1 behaviour |
| --- | --- |
| Import range | 7, 30, or 90 days |
| Included messages | Bank, card, UPI, wallet, and payment transaction SMS that match supported rules |
| Excluded messages | OTP, marketing, balance only, promotional, and unparseable SMS |
| New messages | Parse new SMS after consent and permission |
| Duplicate detection | Reference ID first. Otherwise sender, amount, timestamp, direction, and account suffix fingerprint |
| Permission refused | App remains usable with manual entry and explains what automatic import needs |

### Transaction model

Each transaction contains:

```text
amount
direction: debit or credit
merchant
account suffix
payment method
category
transaction date
reference ID when available
source: sms or manual
confidence: high, medium, low
note
```

### Categories

Food and Dining, Groceries, Transport, Shopping, Bills and Utilities, Health, Entertainment, Cash Withdrawal, Transfers, Income, and Other.

User corrections create a local merchant rule for future matching.

### Screens

1. Welcome and privacy promise.
2. SMS permission and import period selection.
3. Home dashboard.
4. Transactions list with filters.
5. Transaction detail and category edit.
6. Add manual transaction.
7. Insights and category budgets.
8. Accounts and settings.

## Success measures

| Measure | V1 target |
| --- | --- |
| Import completion | 90% of permission granted users complete first import |
| Parser precision | 95% for supported SMS templates |
| Duplicate rate | Below 1% of imported transactions |
| Category correction | Below 20% for recognized merchants after local rules mature |
| Time to first dashboard | Under 90 seconds for a 30 day scan on supported devices |

## Privacy and trust requirements

1. Clear consent before requesting SMS permission.
2. Process raw SMS on device.
3. Persist only parsed transaction fields needed for the product.
4. Never use SMS data for advertising, profiling, or unrelated features.
5. Allow user to delete all local data from Settings.
6. Provide a privacy policy before distribution.

## Open product decisions

1. Exact supported banks and UPI senders for launch.
2. Whether low confidence transactions are auto saved or placed in review.
3. Whether budgets are V1 launch scope or first post launch update.
4. Whether manual income and transfer forms require separate entry flows.
