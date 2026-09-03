# FILE 1 — `SNS_Antigravity_Master_Prompt.md`

# SNS — Antigravity AI Master Development Prompt

## Role:

You are the principal engineering agent for **SNS**, a personal financial memory and money-movement tracking system.

Act simultaneously as a:

* Senior Full-Stack Software Engineer
* Next.js and TypeScript specialist
* Supabase/PostgreSQL architect
* Product Architect
* Human-Computer Interaction specialist
* Accessibility-focused UX engineer
* Security-conscious application engineer
* QA and testing engineer
* Code reviewer
* Technical documentation maintainer

You have access to the entire SNS project directory.

Your role is not merely to generate code. You must preserve the intended product philosophy, understand the existing implementation before editing it, prevent unnecessary complexity, and make technically sound decisions that prioritize the actual end user.

Treat the files inside `/docs` as the project's source of truth.

Before making architectural or feature decisions, read:

1. `/docs/SNS_Antigravity_Master_Prompt.md`
2. `/docs/product-requirements.md`
3. `/docs/database-design.md`
4. `/docs/ui-guidelines.md`
5. `/docs/future-features.md`

If implementation and documentation conflict, do not silently guess. Prefer the documented product intent unless the developer explicitly instructs otherwise.

---

# Context:

## Project Name

SNS

## Intended Production URL

`https://sns.vercel.app`

The application is intended to be deployed using Vercel.

## Primary Technology Stack

* Next.js
* React
* TypeScript
* Tailwind CSS
* Supabase
* PostgreSQL
* Vercel

Use the current project-installed versions rather than assuming a specific framework version.

Inspect `package.json` before selecting framework APIs or patterns.

---

# Product Identity

SNS is a:

> **Personal Financial Memory Assistant**

It is designed primarily for an older small-business owner who currently records incoming and outgoing money manually on paper.

SNS exists to make her existing workflow easier and more reliable.

It is deliberately **not** intended to become traditional accounting software.

---

# Primary User

The primary user is an older woman who operates:

* an auto-supply business;
* a mobile-loading business.

She manages money using several locations/platforms, including:

* Maya
* GCash
* MariBank
* physical cash
* a separate loading-phone balance or loading fund

Her eyesight is not as strong as it used to be.

Therefore the application must be:

* highly readable;
* simple;
* predictable;
* forgiving;
* fast to operate;
* usable with minimal typing;
* suitable for large touch targets;
* free from unnecessary business terminology.

The application should reduce mental workload rather than introduce additional administrative work.

---

# Existing Real-World Workflow

The user currently writes transactions on paper.

For many e-wallet transactions, the useful information she records is primarily:

* person/name;
* number, when relevant;
* amount;
* whether money came in or went out.

She does not normally record individual auto-supply products.

She does not maintain a detailed inventory ledger.

SNS must therefore avoid forcing her to enter information she does not already need.

---

# Central Product Rule

> **If the user does not normally need to write something on paper, SNS should not force her to enter it digitally unless it is necessary for the system to solve one of her actual problems.**

Every proposed field, screen, dialog, category, and workflow must be evaluated against this rule.

---

# Problems SNS Must Solve

## 1. Incoming and Outgoing Money Tracking

The user needs an easy way to record:

* money received;
* money sent/spent.

Records should identify:

* wallet/account;
* person or descriptive name;
* amount;
* direction;
* date/time.

Optional information may be added only when useful.

---

## 2. Multiple Money Locations

The user handles several financial sources.

SNS should allow her to understand balances separately for:

* Maya
* GCash
* MariBank
* Cash
* Loading

The application should also show a useful overall total when appropriate.

---

## 3. Remembering Repeated Names

The same people may transact repeatedly.

SNS should remember previously entered names.

When the user begins typing a known name, autocomplete/suggestions should appear.

Recent and frequently used people should be easy to select without typing the full name repeatedly.

This functionality should behave similarly to lightweight contacts.

---

## 4. Borrowed Funds

A critical clarification:

The user sometimes **borrows money from another person when she is short on business funds**.

This is different from customers borrowing money from her.

Example:

* Maya balance is low.
* She needs ₱20,000.
* Maria provides ₱10,000.
* The ₱10,000 enters Maya.
* Her available Maya balance increases.
* However, she now owes Maria ₱10,000.

SNS must remember:

* lender;
* amount borrowed;
* date;
* repayments;
* remaining amount owed.

Borrowed money is a source of available funds, but it also creates an obligation.

The application must not label borrowed money as profit or ordinary business income.

---

## 5. Balance Mismatches

The user sometimes discovers that the balance she expects does not match the actual balance displayed in Maya, GCash, MariBank, Cash, or Loading.

SNS should support reconciliation.

Example:

Expected Maya balance:

₱15,500

Actual Maya balance entered by user:

₱15,000

Difference:

-₱500

SNS should clearly show the difference and help the user inspect recent transactions.

It should never silently modify transaction history merely to force the balance to match.

---

## 6. Large or Unusual Transactions

The system should help surface unusually large activity, particularly when a person appears to be transacting amounts significantly larger than expected.

This feature is intended as a **review aid**, not an accusation or fraud detector.

Never describe a person as:

* criminal;
* fraudulent;
* suspicious;
* money laundering;
* guilty.

Prefer neutral wording such as:

* Unusual transaction
* Large transaction
* Higher than usual amount
* Worth reviewing
* Transaction differs from recent activity

The system should explain why something was flagged whenever possible.

---

# Task/Command:

Develop SNS incrementally as a production-quality web application.

Your responsibilities include:

1. Inspecting the existing project before modifying it.
2. Preserving existing working functionality.
3. Maintaining the documented product scope.
4. Building reusable, understandable components.
5. Designing a reliable Supabase/PostgreSQL data model.
6. Implementing appropriate Row Level Security.
7. Building an elderly-friendly responsive interface.
8. Keeping financial calculations deterministic.
9. Preventing duplicate or inconsistent transaction effects.
10. Writing tests for critical financial logic.
11. Keeping documentation aligned with implementation.
12. Preparing the project for Vercel deployment.
13. Avoiding unnecessary dependencies.
14. Avoiding premature abstraction.
15. Avoiding feature creep.

Work iteratively.

Do not attempt to implement the entire roadmap in one uncontrolled rewrite.

---

# Product Scope

## MVP Features

The first useful version should support:

### Authentication

A simple secure sign-in flow appropriate for a private financial application.

Do not invent insecure custom authentication merely to create a four-digit PIN.

Use Supabase-supported authentication unless the developer explicitly chooses another secure architecture.

A simplified unlock/PIN experience may be considered later, but never store plain-text PINs.

---

### Wallets

Default logical wallets:

* Maya
* GCash
* MariBank
* Cash
* Loading

Each wallet needs:

* name;
* starting/opening balance;
* transaction history;
* calculated expected balance.

---

### Transactions

The user must be able to record money:

* IN;
* OUT.

The minimum interaction should remain simple.

Typical visible inputs:

* Who/person/name
* Amount
* Wallet
* Money in or money out

Date/time should normally default automatically.

Notes should be optional.

---

### Contacts

Store previously used names.

Provide:

* autocomplete;
* recent contacts;
* frequently used contacts;
* contact transaction history.

Phone/number information may be optional where useful.

Do not require a phone number for every contact.

---

### Borrowed Money

Support:

* recording borrowed funds;
* identifying lender;
* recording partial repayments;
* displaying remaining amount owed;
* displaying settled obligations.

Repayments must not exceed the remaining obligation unless deliberately handled as a separate transaction.

---

### Reconciliation

Allow user to enter an actual observed balance for a wallet.

Display:

* expected balance;
* observed balance;
* difference;
* timestamp.

Do not automatically manufacture a transaction to correct the difference unless the user explicitly chooses a correction workflow.

---

### Unusual Transaction Review

At minimum, support straightforward rules such as:

* amount greater than a configurable threshold;
* amount far above that contact's typical recent transaction amount;
* unusually large activity within a short time window.

Keep rules understandable.

Explain flags.

Do not build opaque machine learning unless explicitly requested.

---

# Transaction Philosophy

The transaction ledger should be the authoritative financial event history.

Do not treat a mutable `wallet.balance` field as the sole source of truth.

Expected wallet balances should be derived from:

* opening balance;
* incoming transactions;
* outgoing transactions;
* valid adjustments.

This prevents silent balance corruption.

Cached balances may be introduced later for performance, but they must never become inconsistent with the ledger.

---

# Transfers Between Wallets

A wallet-to-wallet transfer is not income and not an expense.

Example:

Transfer ₱5,000 from GCash to Maya.

Effects:

GCash:

-₱5,000

Maya:

+₱5,000

Overall money:

unchanged.

Implement transfers in a way that allows the paired entries to be associated with one transfer operation.

Never allow internal transfers to inflate total income.

---

# Money Storage

Never use JavaScript floating-point arithmetic as the authoritative representation of financial values.

At the database layer, use an appropriate exact numeric type.

At the application layer:

* validate monetary input;
* format Philippine peso values consistently;
* avoid floating-point rounding errors.

Default currency:

PHP / Philippine Peso.

Display:

`₱1,250.00`

unless UX testing shows that removing decimals improves the primary user's workflow.

---

# Editing and Deleting Transactions

Users will make mistakes.

Provide a safe correction workflow.

Financial history should not disappear silently.

Prefer:

* edit with audit metadata;
* soft delete/void;
* recorded timestamps.

Important records should include:

* created_at;
* updated_at;
* created_by where appropriate.

Avoid destructive behavior without confirmation.

---

# UI Principles

SNS is designed for an older user.

Therefore:

## Favor

* large text;
* strong contrast;
* large touch targets;
* obvious primary actions;
* one clear purpose per screen;
* minimal typing;
* familiar language;
* visible confirmation after saving;
* predictable navigation;
* generous spacing.

## Avoid

* tiny gray text;
* icon-only critical actions;
* nested menus;
* hidden gestures;
* dense spreadsheets;
* excessive analytics;
* jargon;
* excessive modal dialogs;
* dozens of categories;
* visually impressive but cognitively difficult dashboards.

Refer to `/docs/ui-guidelines.md`.

---

# Navigation

Keep primary navigation small.

A likely structure:

* Home
* Maya
* GCash
* MariBank
* Cash
* Loading

Alternatively, wallet selection may live within a simplified Accounts/Wallets screen if this creates a better mobile experience.

Do not add primary navigation items merely because space exists.

---

# Dashboard Philosophy

The dashboard must answer:

1. How much money is currently expected?
2. Where is the money?
3. How much borrowed money remains unpaid?
4. What happened recently?
5. Is there anything that should be reviewed?

Avoid charts unless they clearly help this user.

Large numeric summaries are preferable to complex visualizations.

---

# Example Dashboard

HOME

TOTAL EXPECTED MONEY

₱45,500

MAYA
₱10,000

GCASH
₱8,500

MARIBANK
₱20,000

CASH
₱5,000

LOADING
₱2,000

BORROWED MONEY TO RETURN

₱7,000

RECENT

Maria Santos
+₱10,000
Borrowed

Juan Cruz
+₱2,500
Received

Supplier
-₱4,000
Sent

TO REVIEW

1 unusually large transaction

---

# Example Simple Transaction Flow

Step 1:

What happened?

[ Money came in ]

[ Money went out ]

Step 2:

Who?

Search or choose recent contact.

Step 3:

How much?

₱ __________

Step 4:

Choose wallet if it was not already selected.

Step 5:

Save.

When context requires borrowed money, provide a simple path such as:

Money came in

→ Regular received money

or

→ Borrowed money

Do not force the user through a full accounting classification screen.

---

# Examples:

## Good

Name:

Maria Santos

Amount:

₱10,000

Wallet:

Maya

[ SAVE ]

---

## Bad

Transaction Classification

General Ledger Account

Subledger

Cost Center

Product Category

Tax Classification

Posting Period

Reference Type

Payment Instrument

Reconciliation Code

The bad example violates SNS's product philosophy.

---

# Contact Suggestions Example

User types:

`Mar`

Show:

Maria Santos
Last used today

Marites Cruz
Last used August 28

Prefer exact/recent/frequently used matches.

---

# Borrowed Money Example

September 3:

Maria Santos

Borrowed into Maya

+₱10,000

Remaining owed to Maria:

₱10,000

September 10:

Paid Maria

-₱4,000

Remaining owed:

₱6,000

---

# Reconciliation Example

MAYA

Expected:

₱15,500

Actual balance:

[ ₱15,000 ]

Difference:

-₱500

Message:

"Your actual Maya balance is ₱500 lower than expected. Review recent transactions to check whether something was not recorded."

---

# Unusual Transaction Example

Maria normally transacts amounts between ₱500 and ₱3,000.

New transaction:

₱35,000

Display:

"Large transaction to review"

"₱35,000 is significantly higher than Maria's recent transaction amounts."

Do not accuse Maria of wrongdoing.

---

# Constraints:

## Product Constraints

Do not turn SNS into:

* inventory software;
* point-of-sale software;
* bookkeeping software;
* ERP;
* payroll software;
* CRM;
* product catalog;
* warehouse system.

Do not add:

* product SKU fields;
* inventory quantity;
* barcode scanning;
* sales itemization;
* tax accounting;
* employee management;
* payroll;
* purchase orders;

unless explicitly requested later.

---

## Technical Constraints

* Use TypeScript.
* Do not use `any` unnecessarily.
* Prefer server-safe patterns.
* Validate user-controlled input.
* Do not expose Supabase service-role secrets to the browser.
* Keep secrets in environment variables.
* Apply RLS to private user data.
* Do not trust client-side ownership checks as security.
* Avoid duplicate financial mutations.
* Financial write operations that affect multiple related records must be atomic where practical.
* Do not mutate balances optimistically in ways that can permanently disagree with persisted transactions.
* Avoid unnecessary packages.
* Prefer platform/framework capabilities already present.

---

## Accessibility Constraints

Critical information may not rely on color alone.

Interactive elements must have meaningful accessible names.

Keyboard usage should remain functional.

Form errors must be understandable.

Use semantic HTML.

Maintain visible focus states.

---

## Mobile Constraints

Assume the primary user may access SNS from a phone.

Pages must work well on narrow screens.

Avoid horizontal scrolling for primary workflows.

Primary buttons should remain comfortably tappable.

---

# Error Handling

Errors must use plain language.

Bad:

`PostgREST PGRST116 error`

Good:

"We couldn't save this transaction. Please try again."

Technical details may be logged safely for development, but do not expose unnecessary internal details to the primary user.

Never claim a transaction was saved unless persistence succeeded.

---

# Loading and Save States

Financial actions must clearly communicate:

* saving;
* success;
* failure.

Prevent accidental double-submission.

After successful creation, provide visible confirmation.

Example:

"Transaction saved."

---

# Testing Requirements

At minimum, critical business logic should eventually cover:

* incoming balance calculation;
* outgoing balance calculation;
* transfers;
* borrowing;
* partial repayment;
* full repayment;
* repayment validation;
* reconciliation differences;
* unusual-transaction calculation;
* transaction edits;
* void/deletion behavior.

Run existing:

* lint;
* type checking;
* tests;
* build

before considering a substantial change complete.

Do not claim tests passed without running them.

---

# Code Modification Protocol

Before editing a feature:

1. Inspect relevant files.
2. Understand existing conventions.
3. Identify affected database/API/UI boundaries.
4. Make the smallest coherent change.
5. Run appropriate checks.
6. Review for regressions.
7. Summarize changes.

Do not rewrite unrelated files.

Do not delete functionality merely because a different architecture seems cleaner.

---

# Format:

When reporting substantial work to the developer, use:

## Understanding

State what you understood about the request.

## Changes

Explain the meaningful implementation changes.

## Files Changed

List the principal files affected.

## Database Impact

Explain migrations/RLS/schema impact if applicable.

## Testing

List checks actually performed and their results.

## Notes

State limitations, unresolved issues, or deliberate scope exclusions.

Do not provide fake output.

Do not state that something was tested if it was not.

---

# Final Priority Order

When priorities conflict, follow this order:

1. Correct financial behavior
2. Data integrity
3. Security and privacy
4. Usability for the elderly primary user
5. Simplicity
6. Accessibility
7. Maintainability
8. Performance
9. Visual polish
10. Additional features

SNS succeeds when the primary user can use it confidently without needing to understand accounting software.

---

---

# FILE 2 — `product-requirements.md`

# SNS Product Requirements Document

## 1. Product Overview

**Product Name:** SNS

**Category:** Personal financial memory and money-movement tracker

**Primary Platform:** Responsive web application

**Deployment Target:** `sns.vercel.app`

**Primary User:** Older small-business owner

SNS helps the user remember and reconcile incoming and outgoing money across several financial locations.

It replaces parts of a handwritten money notebook without attempting to replace the user's entire business process.

---

# 2. Problem Statement

The primary user currently tracks financial activity manually on paper.

Because she handles:

* several e-wallets;
* physical cash;
* loading funds;
* repeated transactions;
* borrowed money;

it becomes difficult to remember why balances changed.

The user may encounter questions such as:

* "Who sent this money?"
* "Did I record this?"
* "Why is my GCash short?"
* "Who did I borrow from?"
* "How much do I still need to return?"
* "Did this person transact an unusually large amount?"

SNS should act as a reliable financial memory aid.

---

# 3. Product Goal

Enable the user to record a normal transaction with minimal effort and later understand what happened to her money.

The product should make it easier to:

* record;
* remember;
* search;
* reconcile;
* review.

---

# 4. Product Principles

## 4.1 Simplicity First

Every additional input increases cognitive burden.

Only require information that materially helps solve the user's problems.

## 4.2 Mirror Existing Behavior

The application should feel familiar to someone used to recording:

* name;
* number when needed;
* amount;
* money in/out.

## 4.3 Financial Memory, Not Accounting

SNS tracks money movement.

It does not attempt to produce a complete general ledger, tax system, profit-and-loss statement, or inventory valuation.

## 4.4 Explain Rather Than Accuse

Unusual activity should be surfaced neutrally.

## 4.5 Make Mistakes Recoverable

The user must be able to correct an accidental entry safely.

---

# 5. Primary Money Locations

Initial wallets:

1. Maya
2. GCash
3. MariBank
4. Cash
5. Loading

The architecture should permit wallets to be renamed, hidden, reordered, or added later without redesigning the entire database.

---

# 6. Core User Stories

## Transaction Recording

As the user, I want to record money received so I can remember who gave it and where it went.

As the user, I want to record money sent so I can remember who received it.

As the user, I want the date/time filled automatically so I do not need to type it every time.

---

## Contact Memory

As the user, I want familiar names suggested automatically so I do not repeatedly type the same names.

As the user, I want to see recent transactions with a familiar person.

---

## Wallet Monitoring

As the user, I want to see the expected amount in Maya, GCash, MariBank, Cash, and Loading.

As the user, I want to know how the system calculated that amount.

---

## Borrowing

As the user, I want to record money I borrowed from another person.

As the user, I want to see how much I still owe that person.

As the user, I want to record partial repayments.

---

## Reconciliation

As the user, I want to compare the application's expected balance with the actual balance displayed in an e-wallet.

As the user, I want to know the difference if they do not match.

---

## Review

As the user, I want unusually large transactions highlighted so I can review them.

---

# 7. Functional Requirements

## FR-001 — Authentication

Private financial records must not be publicly accessible.

The application must provide authenticated access.

---

## FR-002 — Wallet List

The user can view active wallets.

Each wallet displays at minimum:

* wallet name;
* expected balance.

---

## FR-003 — Transaction Creation

The user can create a transaction.

Required business data:

* direction;
* amount;
* wallet;
* person/name or meaningful description.

System-managed:

* ID;
* creation timestamp;
* user ownership.

Optional:

* note;
* phone/number;
* transaction date adjustment where necessary.

---

## FR-004 — Incoming Transactions

An incoming transaction increases the expected balance of its destination wallet.

---

## FR-005 — Outgoing Transactions

An outgoing transaction decreases the expected balance of its wallet.

---

## FR-006 — Recent Transactions

The user can see recent transactions sorted newest first.

Each item should clearly show:

* person;
* amount;
* direction;
* wallet when context requires;
* date/time.

---

## FR-007 — Search

The user can search transaction history by person/name.

Future search may include:

* amount;
* date;
* phone number.

---

## FR-008 — Contact Suggestions

Existing contacts must be suggested during name entry.

Ranking should favor:

1. strong text match;
2. recent usage;
3. frequent usage.

---

## FR-009 — Contact History

A contact view should provide relevant transaction history.

---

## FR-010 — Borrowed Funds

An incoming transaction may be identified as borrowed money.

A borrowed-money event must create or participate in an obligation to a lender.

---

## FR-011 — Loan Repayment

The user can record repayment to a lender.

A repayment:

* decreases the selected wallet;
* decreases remaining amount owed.

---

## FR-012 — Partial Repayment

Repayment may be smaller than the outstanding amount.

---

## FR-013 — Settled Obligation

When remaining amount reaches zero, the obligation is considered settled.

---

## FR-014 — Wallet Transfer

The user may eventually transfer money between her own wallets.

A transfer should:

* decrease source;
* increase destination;
* leave total money unchanged.

---

## FR-015 — Reconciliation

The user can enter an actual observed wallet balance.

SNS calculates:

`difference = observed balance - expected balance`

---

## FR-016 — Reconciliation History

Reconciliation checks may be retained with:

* wallet;
* expected balance at check time;
* observed balance;
* difference;
* timestamp.

---

## FR-017 — Large Transaction Flags

Transactions meeting a configured review rule may receive a review flag.

Flags do not modify financial calculations.

---

## FR-018 — Edit

The user can correct an erroneous transaction.

Changes affecting financial amounts must correctly update all derived balances.

---

## FR-019 — Void/Delete

The user can remove an accidental transaction through a safe deletion/void workflow.

Destructive action requires confirmation.

---

# 8. MVP User Flow

## Record Transaction

Home/wallet screen

→ Add Transaction

→ Money came in / Money went out

→ Choose/type person

→ Enter amount

→ Select wallet if not already known

→ Choose special reason only when relevant, such as Borrowed

→ Save

The normal path should remain short.

---

# 9. Borrowed Funds Flow

Example:

Maria lends ₱10,000.

User selects:

Money came in

Person:

Maria

Amount:

₱10,000

Wallet:

Maya

Indicate:

Borrowed

Result:

Maya expected balance:

+₱10,000

Amount owed to Maria:

+₱10,000

---

# 10. Repayment Flow

Current amount owed to Maria:

₱10,000

User selects:

Repay borrowed money

Maria

₱4,000

From Maya

Result:

Maya:

-₱4,000

Remaining owed:

₱6,000

---

# 11. Reconciliation Flow

User opens Maya.

System expected:

₱25,000

User chooses:

Check Balance

User enters actual Maya balance:

₱24,500

SNS displays:

Expected:
₱25,000

Actual:
₱24,500

Difference:
-₱500

Recommendation:

"Review recent Maya transactions. There may be a transaction that was not recorded."

---

# 12. Unusual Transaction Rules

The first implementation should use transparent rules.

Possible rules:

## Absolute Threshold

Example:

Flag transactions ≥ ₱50,000.

Threshold should eventually be configurable.

## Contact Comparison

Compare amount against the contact's recent historical amounts when enough data exists.

## Short-Period Volume

Flag when cumulative transactions for one person exceed a configured amount within a specified period.

Do not imply wrongdoing.

---

# 13. Dashboard Requirements

The home dashboard should prioritize:

## Total Expected Money

Large and immediately visible.

## Wallet Balances

Maya, GCash, MariBank, Cash, Loading.

## Borrowed Money Outstanding

Clearly distinguish this from available wallet money.

## Recent Transactions

A short list.

## To Review

Only when relevant.

Avoid cluttering the home screen with secondary analytics.

---

# 14. Non-Goals

The MVP does not include:

* auto-supply inventory;
* product lists;
* SKU tracking;
* barcode scanning;
* POS;
* customer invoicing;
* payroll;
* employee attendance;
* complete accounting;
* tax filing;
* bank statement ingestion;
* automatic direct integration with Maya/GCash;
* cryptocurrency;
* complex business intelligence.

---

# 15. Success Criteria

SNS is successful when the primary user can:

1. Record a common transaction without assistance.
2. Record it quickly.
3. Find a previous person's transaction.
4. Understand the current expected wallet balances.
5. Understand how much borrowed money remains unpaid.
6. Compare an e-wallet's actual balance against SNS.
7. Recognize when SNS is asking her to review an unusually large transaction.

---

# 16. Usability Success Test

Give the primary user the application without verbal navigation instructions.

Ask her to complete:

Task A:

Record ₱1,000 received from an existing contact in GCash.

Task B:

Find that person's previous transactions.

Task C:

Record ₱5,000 borrowed from a contact into Maya.

Task D:

Record ₱2,000 repayment.

Task E:

Check Maya actual balance.

Observe:

* hesitation;
* misclicks;
* reading difficulty;
* forgotten steps;
* need for assistance.

The interface should be adjusted based on actual observed behavior.

---

# 17. Product Decision Rule

When deciding between:

A. More functionality

and

B. Easier operation

prefer B unless the missing functionality solves a demonstrated user problem.

---

---

# FILE 3 — `database-design.md`

# SNS Database Design

## 1. Purpose

The database must provide:

* reliable transaction history;
* exact financial calculations;
* private per-user data;
* contacts/autocomplete;
* borrowed-money tracking;
* reconciliation;
* review flags.

PostgreSQL is provided through Supabase.

---

# 2. Design Principles

## Ledger First

Transactions are the authoritative source for money movement.

Do not rely exclusively on manually changing a `current_balance` field.

## Exact Money

Use an exact numeric representation.

Recommended PostgreSQL type:

`numeric(14,2)`

Do not use floating-point database types for money.

## User Ownership

Every private business record must be traceable to the authenticated owner.

## Auditable Corrections

Important financial records should not disappear silently.

## Simple Schema

Avoid enterprise accounting abstractions that SNS does not need.

---

# 3. Core Entities

Recommended core entities:

* profiles
* wallets
* contacts
* transactions
* obligations
* obligation_repayments
* reconciliations
* transaction_flags

Exact implementation may evolve, but behavioral guarantees must remain intact.

---

# 4. `profiles`

Supabase Auth should remain responsible for authentication.

Do not create a separate insecure password system.

Suggested profile fields:

```sql
id uuid primary key references auth.users(id)
display_name text
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

`id` corresponds to authenticated Supabase user ID.

---

# 5. `wallets`

Represents money locations.

Suggested fields:

```sql
id uuid primary key default gen_random_uuid()
user_id uuid not null references profiles(id)
name text not null
slug text
opening_balance numeric(14,2) not null default 0
is_active boolean not null default true
sort_order integer not null default 0
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

Initial wallets:

* Maya
* GCash
* MariBank
* Cash
* Loading

Do not hardcode database logic around exactly five wallets.

---

# 6. Expected Wallet Balance

Conceptually:

```text
expected_balance
=
opening_balance
+ valid incoming transactions
- valid outgoing transactions
```

Transfers naturally appear as one outflow and one inflow.

Voided transactions must not affect expected balance.

Do not store expected balance redundantly unless later performance requirements justify a safe cached mechanism.

---

# 7. `contacts`

Represents remembered people/names.

Suggested fields:

```sql
id uuid primary key default gen_random_uuid()
user_id uuid not null references profiles(id)
name text not null
phone text
normalized_name text
last_used_at timestamptz
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

`phone` is optional.

Contact creation must remain lightweight.

Do not require:

* address;
* birthday;
* email;
* company;

for the MVP.

---

# 8. Contact Matching

For autocomplete:

* case-insensitive matching;
* prefix matching;
* partial matching;
* recent usage ordering.

Normalization may include:

* lowercase;
* trimmed spaces;
* collapsed duplicate spaces.

Be careful not to automatically merge distinct people merely because names look similar.

---

# 9. `transactions`

Primary financial event table.

Suggested fields:

```sql
id uuid primary key default gen_random_uuid()

user_id uuid not null references profiles(id)

wallet_id uuid not null references wallets(id)

contact_id uuid references contacts(id)

display_name text

amount numeric(14,2) not null

direction text not null

kind text not null

note text

occurred_at timestamptz not null default now()

transfer_group_id uuid

obligation_id uuid

status text not null default 'active'

created_at timestamptz not null default now()

updated_at timestamptz not null default now()
```

---

# 10. Transaction Direction

Allowed logical values:

```text
IN
OUT
```

Prefer a database enum or check constraint.

---

# 11. Transaction Kind

Suggested kinds:

```text
REGULAR
BORROWED
REPAYMENT
TRANSFER
ADJUSTMENT
OTHER
```

Keep backend classification separate from user-facing wording.

Do not force users to select a kind when context can determine it automatically.

---

# 12. Transaction Status

Suggested values:

```text
active
void
```

A void transaction does not contribute to balance calculations.

If permanent deletion is ever used, reserve it for safe development/admin situations rather than normal user corrections.

---

# 13. `display_name`

Why store both `contact_id` and optionally a transaction display name?

Historical financial records should remain understandable even if a contact is later renamed.

One implementation may snapshot the visible name at transaction time.

Exact implementation can vary, but contact edits should not make old financial history confusing.

---

# 14. Transfers

Example:

Transfer:

GCash → Maya

₱5,000

Create logically paired effects:

Transaction A:

```text
wallet = GCash
direction = OUT
kind = TRANSFER
amount = 5000
transfer_group_id = X
```

Transaction B:

```text
wallet = Maya
direction = IN
kind = TRANSFER
amount = 5000
transfer_group_id = X
```

Both share the same `transfer_group_id`.

Create transfer effects atomically where possible.

Total money across wallets remains unchanged.

---

# 15. Borrowed Money

Borrowing creates:

1. incoming wallet transaction;
2. obligation.

Example:

Borrow ₱10,000 from Maria into Maya.

Transaction:

```text
direction = IN
kind = BORROWED
amount = 10000
contact = Maria
```

Obligation:

```text
lender = Maria
original_amount = 10000
remaining amount initially = 10000
```

---

# 16. `obligations`

Suggested fields:

```sql
id uuid primary key default gen_random_uuid()

user_id uuid not null references profiles(id)

contact_id uuid not null references contacts(id)

origin_transaction_id uuid

original_amount numeric(14,2) not null

status text not null default 'open'

opened_at timestamptz not null default now()

settled_at timestamptz

created_at timestamptz not null default now()

updated_at timestamptz not null default now()
```

Possible statuses:

```text
open
settled
void
```

Prefer calculating remaining amount from repayments rather than manually mutating a value without history.

---

# 17. `obligation_repayments`

Suggested fields:

```sql
id uuid primary key default gen_random_uuid()

user_id uuid not null references profiles(id)

obligation_id uuid not null references obligations(id)

transaction_id uuid not null references transactions(id)

amount numeric(14,2) not null

created_at timestamptz not null default now()
```

Remaining:

```text
remaining
=
original_amount
-
sum(active repayments)
```

This creates an auditable history.

---

# 18. Repayment Validation

A repayment:

* must be positive;
* must reference an active obligation;
* should not exceed remaining amount without explicit handling;
* should create an outgoing wallet transaction.

The repayment operation should be atomic.

Do not create the repayment row successfully while failing to create the corresponding financial transaction.

---

# 19. `reconciliations`

Suggested fields:

```sql
id uuid primary key default gen_random_uuid()

user_id uuid not null references profiles(id)

wallet_id uuid not null references wallets(id)

expected_balance numeric(14,2) not null

observed_balance numeric(14,2) not null

difference numeric(14,2) not null

checked_at timestamptz not null default now()

note text

created_at timestamptz not null default now()
```

Store the expected value at the time of reconciliation so historical reconciliation remains understandable.

---

# 20. Reconciliation Behavior

A reconciliation is a check.

It does not automatically alter transaction history.

If a future "Create correction" feature exists:

1. show difference;
2. ask user explicitly;
3. create an adjustment transaction;
4. preserve reconciliation history.

Never silently change opening balance.

---

# 21. `transaction_flags`

Suggested fields:

```sql
id uuid primary key default gen_random_uuid()

user_id uuid not null references profiles(id)

transaction_id uuid not null references transactions(id)

flag_type text not null

severity text

reason text not null

is_reviewed boolean not null default false

reviewed_at timestamptz

created_at timestamptz not null default now()
```

Possible types:

```text
LARGE_AMOUNT
CONTACT_OUTLIER
HIGH_RECENT_VOLUME
```

Flags do not imply fraud.

---

# 22. Financial Constraints

At database/application boundaries:

```text
amount > 0
```

Direction determines sign behavior.

Do not store negative amounts as a substitute for direction unless the architecture deliberately changes to signed-ledger accounting.

For SNS simplicity:

```text
amount = positive
direction = IN / OUT
```

is easier to reason about.

---

# 23. Date Handling

Use timezone-aware timestamps.

Database:

`timestamptz`

Store consistently.

Display using the user's local timezone.

The expected user timezone is Philippine time unless later made configurable.

---

# 24. Row Level Security

Enable RLS on all user-owned tables.

Policies should ensure authenticated users can access only rows where:

```text
user_id = auth.uid()
```

Do not rely on hidden UI elements for security.

Tables requiring RLS include:

* profiles
* wallets
* contacts
* transactions
* obligations
* obligation_repayments
* reconciliations
* transaction_flags

Where a child table does not directly contain ownership, either add `user_id` deliberately or use secure relational policies.

Simple explicit ownership is preferable for this small private application.

---

# 25. Service Role

Never expose:

`SUPABASE_SERVICE_ROLE_KEY`

to browser code.

Only public-safe values such as Supabase URL and appropriate publishable/anon client key may be exposed according to Supabase's current recommended architecture.

---

# 26. Indexes

Likely useful indexes:

```text
transactions(user_id, occurred_at desc)
transactions(wallet_id, occurred_at desc)
transactions(contact_id, occurred_at desc)
contacts(user_id, normalized_name)
contacts(user_id, last_used_at desc)
obligations(user_id, status)
reconciliations(wallet_id, checked_at desc)
transaction_flags(user_id, is_reviewed)
```

Do not prematurely optimize beyond demonstrated need.

---

# 27. Seed Data

Development seed data may include:

Wallets:

* Maya
* GCash
* MariBank
* Cash
* Loading

Fake contacts only.

Never commit real personal financial data to source control.

---

# 28. Database Migration Rule

All production schema changes should eventually be represented in version-controlled migrations.

Avoid undocumented manual database edits.

---

# 29. Balance Calculation Tests

Must test:

### Incoming

Opening:

₱1,000

IN:

₱500

Expected:

₱1,500

### Outgoing

Opening:

₱1,000

OUT:

₱300

Expected:

₱700

### Transfer

GCash:

₱5,000

Maya:

₱1,000

Transfer:

₱2,000

Result:

GCash:

₱3,000

Maya:

₱3,000

Combined:

₱6,000 unchanged

### Borrow

Maya:

₱5,000

Borrow:

₱10,000

Expected Maya:

₱15,000

Obligation:

₱10,000

### Partial Repayment

Repay:

₱4,000

Maya:

₱11,000

Remaining obligation:

₱6,000

---

# 30. Database Architecture Rule

Choose the simplest model that preserves:

* historical accuracy;
* balance correctness;
* user ownership;
* borrowing history;
* reliable reconciliation.

Do not recreate a full accounting ledger architecture merely because PostgreSQL can support one.

---

---

# FILE 4 — `ui-guidelines.md`

# SNS UI and Accessibility Guidelines

## 1. Design Goal

SNS is designed primarily for an older user with reduced eyesight who currently uses paper.

The UI must prioritize:

* readability;
* confidence;
* speed;
* simplicity;
* low cognitive load.

A visually impressive interface that confuses the primary user is a failed design.

---

# 2. Product Experience

SNS should feel like:

> A clear digital notebook with helpful memory.

It should not feel like:

> A bank dashboard, enterprise accounting package, or analytics platform.

---

# 3. Primary Design Principles

## 3.1 One Clear Main Action

Each screen should have an obvious purpose.

Example:

On a wallet screen:

Primary:

`ADD TRANSACTION`

Secondary:

`CHECK BALANCE`

Do not display eight equally prominent actions.

---

## 3.2 Large Readable Typography

Avoid small body text.

Suggested starting points:

Body:

16–18px

Important labels:

18–20px

Section headings:

20–24px

Wallet balances:

28–36px+

Primary total:

36–48px+

Actual sizes should be validated visually on the devices the user uses.

---

# 4. Touch Targets

Critical interactive controls should have at least approximately:

48 × 48 CSS pixels

Prefer larger primary buttons:

52–60px high.

Provide enough spacing to reduce accidental taps.

---

# 5. Contrast

Use high contrast.

Avoid light gray text on white.

Avoid dark gray text on black.

Critical values should remain easy to read under imperfect lighting.

Do not rely on color alone.

Example:

Incoming transaction:

`+ ₱5,000`

may use a positive color, but must still include the `+` indicator.

Outgoing:

`- ₱2,000`

must include the `-` indicator.

---

# 6. Color Philosophy

Use a small consistent semantic palette.

Possible roles:

* Primary action
* Positive/incoming
* Negative/outgoing
* Warning/review
* Neutral

Do not create rainbow dashboards.

Do not use red for ordinary outgoing money in a way that makes every normal payment appear alarming.

Distinguish:

normal outflow

from

warning/error.

---

# 7. Icons

Icons may supplement words.

Critical actions should not be icon-only.

Good:

`+ Add Transaction`

Bad:

A floating unlabeled `+` that the user must understand.

---

# 8. Navigation

Navigation should remain predictable.

Possible desktop structure:

* Home
* Maya
* GCash
* MariBank
* Cash
* Loading

Possible mobile structure may simplify this into:

* Home
* Wallets
* Add
* History

Choose based on usability, not aesthetic novelty.

Keep primary navigation limited.

---

# 9. Home Screen

The user should not need to scroll through complex analytics to answer basic questions.

Top priority:

## Total Expected Money

Then:

## Wallets

Then:

## Borrowed Money To Return

Then:

## Recent Transactions

Then:

## Items To Review

---

# 10. Wallet Cards

A wallet card should prominently show:

```text
MAYA

₱15,500
```

Optional secondary text:

`Updated from recorded transactions`

Avoid overloading each card with:

* charts;
* percentages;
* monthly statistics;
* multiple action buttons.

---

# 11. Add Transaction Button

This should be one of the easiest controls to find.

Example:

`+ ADD TRANSACTION`

Use sufficient contrast and size.

---

# 12. Transaction Direction Screen

Use simple everyday language.

Preferred:

`Money came in`

`Money went out`

Instead of:

`Credit`

`Debit`

or:

`Cash inflow category`

---

# 13. Name/Contact Input

Label:

`Who?`

or:

`Name`

Autocomplete should show familiar people.

Example:

```text
Who?

[ Mar________ ]

Maria Santos
Used today

Marites Cruz
Used Aug 30
```

The user should be able to select a suggestion with one tap.

---

# 14. Recent Contacts

Where useful, show:

`Recent`

with a few large selectable contact chips/cards.

Avoid dozens of tiny chips.

---

# 15. Amount Input

Amount entry is critical.

Display the peso sign clearly.

Example:

```text
How much?

₱ 10,000
```

Use numeric keyboard hints on mobile.

Avoid requiring manual commas.

Format safely.

---

# 16. Save Action

The save button should have explicit wording.

Preferred:

`SAVE TRANSACTION`

or:

`SAVE`

After success:

`Transaction saved.`

Do not simply close the screen without confirmation.

---

# 17. Prevent Duplicate Saves

During persistence:

```text
Saving...
```

Disable repeated submission appropriately.

Never create two financial records because the user tapped twice.

---

# 18. Borrowing UI

Do not overwhelm the normal transaction workflow with loan terminology.

Possible flow:

Money came in

→ Was this borrowed?

`No, normal money`

`Yes, borrowed`

Then:

`Who lent the money?`

If contact already selected, reuse it.

---

# 19. Borrowed Money Display

Use plain language.

Preferred:

```text
Money to return

Maria Santos
₱6,000 remaining
```

Avoid:

```text
Outstanding liability account balance
```

---

# 20. Repayment UI

From obligation:

```text
Maria Santos

You still need to return:

₱6,000

[ RECORD PAYMENT ]
```

Payment screen:

```text
Amount returned

₱ ________

Paid from:

Maya

[ SAVE PAYMENT ]
```

---

# 21. Reconciliation UI

Preferred:

```text
MAYA

Expected balance

₱15,500

What does Maya show now?

₱ __________

[ CHECK ]
```

Result:

```text
Difference

₱500 lower than expected

Review recent transactions.
```

Avoid technical accounting language.

---

# 22. Unusual Transaction UI

Use neutral warning design.

Example:

```text
TO REVIEW

Large transaction

Maria Santos
₱35,000

This amount is much higher than Maria's recent transactions.
```

Provide:

`Mark as reviewed`

Do not create panic-oriented messaging.

---

# 23. Transaction History

History should resemble a readable ledger.

Example:

```text
TODAY

Maria Santos
Borrowed
+ ₱10,000
Maya
2:15 PM

Juan Cruz
Money received
+ ₱2,500
GCash
11:30 AM
```

On mobile, prefer stacked entries over dense tables.

---

# 24. Search

Search should tolerate partial names.

Placeholder:

`Search name`

Avoid requiring advanced filters for basic use.

Future filters may be hidden under:

`Filters`

instead of permanently occupying the screen.

---

# 25. Confirmation Dialogs

Do not confirm every normal action.

Confirmation is appropriate for destructive/high-impact actions such as:

* voiding transaction;
* deleting wallet;
* resetting opening balance.

Example:

`Remove this transaction?`

Explain consequence clearly.

---

# 26. Error Messages

Use plain language.

Bad:

`Constraint transaction_amount_check violated`

Good:

`Enter an amount greater than ₱0.`

Bad:

`Unauthorized 401`

Good:

`Your session expired. Please sign in again.`

---

# 27. Empty States

Never show a blank screen.

Example:

```text
No Maya transactions yet.

Record your first transaction here.

[ ADD TRANSACTION ]
```

---

# 28. Loading States

Avoid unnecessary spinners that make the app feel broken.

For page-level data loading:

* skeletons;
* concise loading indicator.

For actions:

`Saving...`

---

# 29. Responsive Design

Test at minimum:

* small mobile width;
* common smartphone width;
* tablet;
* desktop.

Primary workflows must work without horizontal scrolling.

---

# 30. Desktop Design

Desktop may use more space but must not become unnecessarily dense.

Large typography can remain.

Do not shrink controls simply because more screen space is available.

---

# 31. Accessibility

Use:

* semantic HTML;
* labels associated with form inputs;
* visible keyboard focus;
* accessible button names;
* proper heading hierarchy;
* adequate contrast.

Do not rely solely on:

* hover;
* color;
* icons.

---

# 32. Motion

Keep animation subtle.

Avoid:

* bouncing interfaces;
* unnecessary parallax;
* long page transitions.

Respect reduced-motion preferences where applicable.

---

# 33. Language

Use familiar language.

Preferred:

* Money came in
* Money went out
* Who?
* Amount
* Save
* Money to return
* Check balance
* Recent

Avoid unless necessary:

* Liability
* Receivable
* Ledger
* Debit
* Credit
* Variance
* Reconciliation discrepancy

Internal code can use technical terminology.

User-facing copy should remain simple.

---

# 34. Philippine Peso Formatting

Default:

`₱10,000`

or:

`₱10,000.00`

Choose one consistent display convention after usability testing.

Do not show:

`PHP 10000.000000`

---

# 35. Dates

Prefer human-readable formats:

`September 3, 2026`

or:

`Sep 3`

For recent entries:

`Today, 2:15 PM`

Avoid raw ISO strings.

---

# 36. Accessibility Testing

Before considering important screens finished, test:

* browser zoom at 125%;
* browser zoom at 150%;
* keyboard navigation;
* mobile width;
* long contact names;
* five-digit and six-digit peso amounts;
* error states;
* slow network state.

---

# 37. Primary Usability Question

For every screen ask:

> Can she understand what to do next without someone explaining it?

If the answer is no, simplify the screen.

---

# 38. Secondary Usability Question

Ask:

> Can she finish this task with fewer taps and less typing?

If yes, improve the design.

---

# 39. Visual Priority

The UI hierarchy should generally be:

1. Main financial amount
2. Primary action
3. Important labels
4. Recent/relevant supporting information
5. Secondary metadata

Do not visually prioritize timestamps or technical metadata over money and names.

---

# 40. Final UI Rule

The design should make the user feel:

> "I know what happened to my money."

Not:

> "I need to learn how to use this software."

---

---

# FILE 5 — `future-features.md`

# SNS Future Features and Product Backlog

## Purpose

This file stores ideas that may be valuable later.

Features in this document are **not automatically approved for implementation**.

Antigravity must not implement future features simply because they are documented here.

They require an explicit developer request or clear promotion into current scope.

This prevents feature creep.

---

# Priority Model

Future features are classified as:

## Near-Term

Natural extensions after the MVP is stable.

## Medium-Term

Useful but require additional validation.

## Experimental

Potentially valuable but should not complicate the core application.

## Explicitly Deferred

Ideas that contradict current simplicity unless requirements change.

---

# Near-Term Features

## 1. PWA Installation

Allow SNS to be installed from the browser on the user's phone.

Benefits:

* home-screen icon;
* app-like experience;
* easier daily access.

Do not implement until the core web application is stable.

---

## 2. Offline Drafting

Allow a transaction to be entered during temporary connectivity loss and synchronized safely later.

Requirements:

* prevent duplicates;
* clearly show unsynced state;
* resolve sync failure safely.

Financial consistency is more important than seamless offline appearance.

---

## 3. User-Configurable Large Transaction Threshold

Example:

`Alert me when a transaction is ₱20,000 or higher.`

Use simple settings.

---

## 4. Favorite Contacts

Allow important/frequent names to appear first.

Could be automatic or user-pinned.

---

## 5. Wallet Reordering

Allow the user to place most-used wallets first.

---

## 6. Wallet Visibility

Allow unused wallets to be hidden without deleting history.

---

## 7. Simple Daily Summary

Example:

```text
TODAY

Money in
₱25,000

Money out
₱14,000

3 transactions to review
```

Avoid turning this into complete accounting.

---

# Medium-Term Features

## 8. Voice-Assisted Transaction Entry

Example spoken phrase:

`Maria, ten thousand, Maya.`

Possible structured interpretation:

Person:

Maria

Amount:

₱10,000

Wallet:

Maya

The system must show extracted information for confirmation before saving.

Never silently create financial transactions from speech recognition.

---

## 9. Tagalog/English Language Mode

Because everyday usage may be easier in Filipino.

Potential terminology:

Money came in:

`Pumasok na pera`

Money went out:

`Lumabas na pera`

Borrowed:

`Hiniram`

Paid back:

`Ibinalik`

Language should be validated with the actual user rather than translated mechanically.

---

## 10. Better Contact Intelligence

Possible:

* nickname support;
* alias support;
* duplicate contact detection.

Never merge people automatically without confirmation.

---

## 11. Monthly Search and Review

Allow:

* date range;
* person;
* wallet;
* amount range.

Keep filters hidden until requested so normal transaction history remains simple.

---

## 12. Export

Potential exports:

* CSV;
* PDF;
* printable transaction report.

Useful for backup or manual checking.

Do not expose sensitive data unnecessarily.

---

## 13. Backup Reminder

Provide a simple reminder that financial data is backed up/synced successfully.

Actual implementation depends on Supabase and retention strategy.

---

# Experimental Features

## 14. AI Financial Memory Assistant

Example queries:

`Kailan ako huling humiram kay Maria?`

`Magkano pa ang utang ko kay Maria?`

`Bakit maaaring kulang ang Maya ko?`

AI must retrieve factual answers from stored records.

Never fabricate transactions.

Any generative summary must distinguish facts from suggestions.

---

## 15. Natural-Language Search

Examples:

`Show Maria transactions this month.`

`Show Maya transactions over ₱10,000.`

---

## 16. Smarter Anomaly Detection

Possible future statistical methods:

* rolling median;
* median absolute deviation;
* per-contact transaction distribution;
* frequency deviation.

Do not adopt opaque machine-learning models unless there is a demonstrated advantage.

Explainability is important.

---

## 17. Transaction Pattern Summary

Example:

`Maria usually transacts between ₱1,000 and ₱5,000.`

Only display if enough historical data exists.

---

## 18. Notifications

Possible reminders:

* unpaid borrowed money;
* unusually large transaction;
* reconciliation overdue.

Notifications must be configurable and not annoying.

---

## 19. Borrowed Money Due Dates

Currently the system does not need to force due dates.

Future option:

Add optional due date when the lender/user actually uses one.

Do not require due dates by default.

---

## 20. Notes Templates

Common optional notes could appear as quick choices.

Only implement if the user repeatedly enters the same wording.

---

# Device and Usability Features

## 21. Extra-Large Text Mode

Allow the primary user to increase interface text even beyond standard accessible sizing.

---

## 22. Simplified Home Mode

An even simpler dashboard showing only:

* total;
* wallets;
* add transaction;
* money to return.

Useful if future features make the normal dashboard too complex.

---

## 23. High-Contrast Mode

Consider if normal design does not provide enough visibility.

---

# Security Improvements

## 24. App Lock

After secure authentication is established, investigate a simplified local re-unlock experience.

Example:

biometrics/passkey or safe short unlock mechanism.

Do not create insecure plain-text PIN storage.

---

## 25. Passkeys

Potentially easier than passwords for an older user if device/browser support and actual usability are good.

---

## 26. Session Timeout Preferences

Financial data should not remain indefinitely visible on a shared device.

Balance security against usability.

---

# Data Features

## 27. Import Historical Paper Records

Potentially allow manual historical entry.

Do not require the user to digitize years of notebooks before using SNS.

The app should become useful immediately.

---

## 28. Opening Balance Wizard

For initial setup:

Maya:

Current balance?

GCash:

Current balance?

etc.

Creates initial opening balances.

This may be brought into MVP if required during onboarding.

---

## 29. Correction Transactions

When reconciliation reveals a known missing event, allow the user to create an explicit adjustment.

Example:

`Forgot to record ₱500 fee`

The system should preserve the reason.

---

# Explicitly Deferred Features

Do not implement these unless the project purpose changes.

## Inventory Management

No:

* products;
* SKUs;
* stock count;
* reorder levels;
* warehouse.

## POS

No checkout system.

## Product Sales Itemization

Do not ask which auto-supply item was sold.

## Full Accounting

No:

* chart of accounts;
* journal entries;
* trial balance;
* balance sheet;
* income statement;
* tax accounting.

## Payroll

Not part of SNS.

## Employee Management

Not part of SNS.

## Supplier Management System

A supplier may exist as a normal contact, but SNS should not become supplier-management software.

---

# Feature Evaluation Checklist

Before promoting any future feature, answer:

1. Does the primary user have this real problem?
2. How often does it occur?
3. Can SNS solve it without adding another required input?
4. Will the user understand it without training?
5. Does it increase transaction-entry time?
6. Does it make the home screen more complicated?
7. Could it cause financial inconsistency?
8. Does it require sensitive permissions?
9. Is there a simpler solution?
10. Can the feature remain optional?

If a feature increases complexity more than usefulness, do not build it.

---

# Long-Term Vision

SNS may eventually become an exceptionally simple money-memory application for people who find existing financial software overwhelming.

However, the project must first succeed for its original user.

Do not prematurely generalize the application for:

* thousands of businesses;
* enterprise customers;
* complex industries;
* unrelated use cases.

Solve the real user's problem first.

---

# Final Backlog Principle

Future features are possibilities, not commitments.

The product should grow only when real usage reveals a reason to grow.
