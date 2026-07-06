---
name: api-design-swift
description: Design or extend the orbit-fintech API (Swift + Vapor) idiomatically — Codable DTOs shared with iOS, actor-based rate cache, double-entry money safety. Use for any change to templates/orbit-fintech/API.md or new Swift API design work in this repo.
---

# API Design — Swift · Vapor (orbit-fintech)

Owns `templates/orbit-fintech/API.md`. Orbit is a multi-currency account (balances, FX quotes/conversions, transfers, cards, rate alerts).

## Stack choices (fixed)
- **Vapor 4** on SwiftNIO, async/await handlers, Fluent on PostgreSQL, Swift 6 strict concurrency (shared mutable state lives in **actors**, e.g. `RateCache`).
- DTOs are `Content`/`Codable` structs **shared verbatim with the iOS app** — one source of truth. Money is always `Money { amountMinor: Int64, currency }`; `Decimal` for rates; **never floating point for amounts**.
- Errors via custom `AbortError` conformances: `{ "code", "reason" }`.

## Conventions to preserve (money rules are hard rules)
- **Double-entry**: every conversion/transfer inserts matching debit+credit ledger rows and updates balances with conditional `WHERE available_minor >= amount`, in one transaction. Ledger is append-only; balances derived; reconciliation job alerts on drift.
- **Quotes pin rates**: 30 s expiry; execution after expiry = `quote_expired` (410) — the user never gets a silently different rate.
- `Idempotency-Key` required on all money-moving POSTs (409 on reuse with different payload).
- Step-up `confirmationToken` for sensitive actions (external transfer, card unfreeze).
- External transfers pass screening before `sent`; status timeline `created → screening → sent → settled`.

## When adding an endpoint
1. DTO struct(s) with `Validatable` where input is user-shaped; mark the iOS-shared file.
2. Route in the right group: public (`/rates`), authenticated, or authenticated+idempotency middleware for money paths.
3. Anything touching balances goes through the ledger service — no direct balance writes from handlers.
4. Update API.md endpoint table, DTOs, and Money-safety rules if invariants were extended.
5. Testing story: `XCTVapor` route tests + property-based rounding tests (bankers') asserting debit+credit sum to zero.

## Idiom checklist
- `UUID` ids; ISO-4217 currency enum; cursor pagination on ledgers.
- Rate provider flows through the `RateCache` actor (5 s snapshots) — no per-request provider calls.
- Structured logging + trace IDs on every response.
