# Drift — E-commerce Storefront · Design Doc

## Concept
A calm, craft-goods storefront in the "considered objects" idiom: warm greige canvas, white cards, terracotta accent, serif headlines over quiet sans machinery. The centerpiece is a **fully working client-side cart** — slide-in drawer, quantity steppers, localStorage persistence, badge count — so the template demonstrates real storefront mechanics without a backend.

## Design tokens
| Token | Value | Role |
|-------|-------|------|
| `--bg` / `--card` | `#f4f2ee` / `#fff` | Canvas / cards & drawer |
| `--ink` / `--soft` | `#20201c` / `#7c7a72` | Body / muted |
| `--line` | `#e2ded6` | Hairlines |
| `--clay` | `#b46a4a` | Accent: hero em, hovers, cart badge |
| `--sagegr` | `#7d8b74` | "Added ✓" confirmation state only |

## Signature components
- **Cart drawer** — fixed right panel (min(400px, 92vw)) translated off-canvas; `body.cart-open` slides it in and fades a veil. Closes via ✕, veil click, or Escape. Line items show thumb, name, − / + steppers, and line totals; empty state has personality ("the vases are waiting").
- **Cart state** — a `Map(id → qty)` persisted to `localStorage`; badge shows total item count; subtotal recomputed on every mutation. "Add" buttons flash to sage "Added ✓" for 900 ms.
- **Product cards** — square color-block placeholder (per-product pastel + emoji standing in for photography), name, category, price, pill Add button. Category chips filter the grid.
- **Hero illustration** — pure CSS vase (rounded rects) on a clay gradient with a translucent arc; `role="img"` + `aria-label` so it reads as an image.
- **Values row** — three repair/small-batch/honest-pricing promises above the footer, establishing brand voice.

## Typography
Georgia serif for headlines (weight 400, italic accent in clay); sans body at 15.5px; product names 14.5px/600; prices 700. Promo strip is 12.5px uppercase letterspaced.

## Layout
Promo strip → sticky nav (logo / links / cart button) → two-column hero (text + art, art stacks on top ≤920px) → filterable 4-up product grid (2-up ≤920px, 1-up ≤520px) → values row → footer.

## Motion
Drawer 0.28s ease slide + veil fade; cards lift 3px on hover; Add-button state flash. No scroll-reveal — shopping UIs should feel instant.

## Accessibility
Drawer is an `aria-label`led `<aside>` with Escape-to-close; steppers have aria-labels; cart button labelled; category chips are real buttons; hero art exposed as a described image.
