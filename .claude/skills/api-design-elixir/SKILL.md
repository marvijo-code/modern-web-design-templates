---
name: api-design-elixir
description: Design or extend the drift-store API (Elixir + Phoenix) idiomatically — Ecto changesets, OTP-supervised checkout reservations, PubSub stock events. Use for any change to templates/drift-store/API.md or new Elixir API design work in this repo.
---

# API Design — Elixir · Phoenix (drift-store)

Owns `templates/drift-store/API.md`. Drift is a small-batch goods store (catalog with limited stock, anonymous-first carts, checkout → orders, repair requests).

## Stack choices (fixed)
- **Phoenix 1.8** (API pipeline), Ecto + PostgreSQL, Jason with a camelCase view layer, `Phoenix.Token` signed cart tokens, magic-link customer auth that merges carts on login.
- Contexts (`Drift.Catalog`, `Drift.Orders`) own business logic; controllers stay thin. All input flows through **Ecto changesets** — validation errors mirror changeset structure in responses.

## Conventions to preserve
- Stock mutations are conditional SQL (`UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?`) inside `Repo.transaction` — never read-then-write. `insufficient_stock` on failure.
- Checkout: reserve stock → order `:pending_payment` + payment intent; a **per-order GenServer under a DynamicSupervisor** owns the 15-min reservation TTL (release on timeout). Webhook (HMAC-verified) confirms `:paid`. One crashed worker never affects other checkouts.
- `Phoenix.PubSub` broadcasts `product:stock_changed` on every reservation/release — new stock-touching code must broadcast too.
- `Idempotency-Key` on `/checkout` stored with the order; money in minor units + `"ZAR"`.
- Honest-pricing `cost_breakdown` map ships on product detail — keep it populated.

## When adding an endpoint
1. Add to the right context; new writes get a changeset with explicit `validate_*` pipelines.
2. Route in `api/v1` scope with the correct plug chain (cart-token plug vs customer auth vs staff).
3. Long-lived/stateful behavior → supervised process, not request-scoped hacks.
4. Update API.md endpoint table, schema snippets, and the checkout-flow diagram if states changed.
5. Testing story: ExUnit + Ecto sandbox (async), Bypass for provider stubs, and keep the 50-task/3-stock concurrency test green for anything touching stock.

## Idiom checklist
- Pattern-match happy paths; `with` chains for multi-step flows returning tagged errors.
- Telemetry events on checkout/stock paths (PromEx).
- No raw SQL outside the conditional stock update; Ecto queries composable per filter.
