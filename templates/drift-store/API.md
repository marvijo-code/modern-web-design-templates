# Drift API — Design Doc (Elixir · Phoenix)

**Language:** Elixir 1.18 (BEAM/OTP 27) · **Framework:** [Phoenix 1.8](https://www.phoenixframework.org) · **Why:** the best-in-class Elixir web framework — Ecto changesets make cart/checkout state transitions safe and explicit, Phoenix Channels/PubSub give free real-time stock updates, and OTP supervision keeps checkout workers isolated and fault-tolerant.

## Domain
Drift is a small-batch goods store: a product catalog with limited stock, carts, checkout → orders, and repair-request intake (the brand promise).

## Conventions
- Base `/api/v1`; `camelCase` JSON via a Jason encoder view layer; money in minor units + `"ZAR"`.
- Carts are anonymous-first: a signed cart token (`Phoenix.Token`) issued on first write; customer auth (magic-link) merges carts on login.
- Errors: `{ "error": { "code": "insufficient_stock", "message": "...", "details": {...} } }`; validation errors mirror Ecto changeset structure.

## Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/products?category=ceramics&sort=price` | — | Catalog with stock flags |
| GET | `/products/{slug}` | — | Detail incl. cost-breakdown (honest pricing) |
| POST | `/carts` | — | Create cart → `{ cartToken }` |
| GET | `/carts/current` | cart token | Cart with priced lines |
| PUT | `/carts/current/items/{productId}` | cart token | Set quantity (0 removes) |
| POST | `/checkout` | cart token | Reserve stock + create payment intent |
| POST | `/webhooks/payments` | HMAC | Provider webhook → confirm/release |
| GET | `/orders/{number}` | email+number | Order status for guests |
| POST | `/repairs` | — | Repair-request intake (product, issue, photos) |
| GET | `/admin/orders?status=` | staff | Fulfillment queue |
| PATCH | `/admin/orders/{id}` | staff | pack → ship (+ tracking) |

## Representative schema & changeset
```elixir
defmodule Drift.Catalog.Product do
  use Ecto.Schema

  schema "products" do
    field :slug, :string
    field :name, :string
    field :category, Ecto.Enum, values: [:ceramics, :textiles, :tools]
    field :price_minor, :integer
    field :stock, :integer
    field :cost_breakdown, :map      # maker / materials / logistics / margin
    timestamps()
  end
end

def set_item(cart, product, qty) when qty >= 0 do
  cart
  |> change_line(product, qty)
  |> validate_number(:quantity, less_than_or_equal_to: product.stock,
       message: "insufficient_stock")
  |> Repo.insert_or_update()
end
```

## Checkout flow (the interesting part)
```
cart -> POST /checkout
  1. Repo.transaction: decrement stock with optimistic check
     (UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?)
  2. create Order (status: :pending_payment) + reservation TTL (15 min)
  3. create payment intent, return client secret
payment webhook -> confirm order (:paid) | timeout worker releases stock
```
A per-order GenServer (under a DynamicSupervisor) owns the reservation timeout — if payment never lands, it releases stock and expires the order; a crash of one worker never touches other checkouts (OTP isolation).

**Real-time stock:** `Phoenix.PubSub` broadcasts `product:stock_changed` on every reservation/release; a future storefront can subscribe over a channel to show "only 2 left" live.

## Non-functional
- **Storage:** PostgreSQL + Ecto; stock mutations always via the conditional UPDATE — no read-then-write races.
- **Rate limiting:** plug-based token bucket on cart writes and `/repairs`.
- **Idempotency:** `Idempotency-Key` on `/checkout` stored with the order — retries return the same intent.
- **Observability:** Telemetry → PromEx (Prometheus); LiveDashboard in staging.
- **Testing:** ExUnit + Ecto sandbox (async tests); a checkout concurrency test spawning 50 tasks against 3-stock product asserting exactly 3 orders; Bypass for payment-provider stubs.
