# Orbit — Fintech App Landing · Design Doc

## Concept
A deep-space fintech landing: near-black navy canvas, cyan→violet gradient identity, and a literal **orbital system** behind the hero — three concentric rings with glowing satellites animating on different periods and directions. The metaphor (money in orbit, crossing borders) drives every visual decision. A working currency converter is the interactive centerpiece.

## Design tokens
| Token | Value | Role |
|-------|-------|------|
| `--space` | `#070b1a` | Canvas |
| `--panel` / `--panel2` | `#0d1430` / `#111a3e` | Cards / inputs |
| `--line` | `#1e2a55` | Borders, orbit rings |
| `--cyan` / `--violet` | `#6ee7ff` / `#9d7bff` | Gradient identity, glows |
| `--green` / `--red` | `#4ade80` / `#fb7185` | Ticker deltas, security ticks |
| `--text` / `--dim` | `#eaf0ff` / `#8c9ac2` | Body / muted |

## Signature devices
- **Orbital hero** — three bordered circles centered behind the headline; each satellite is a glowing dot offset by `translateX(radius)` inside a zero-size wrapper rotating via `@keyframes spin` (14s / 26s reversed / 40s). Outer rings and their satellites are dropped ≤880px for performance and calm. All decorative (`aria-hidden`).
- **FX ticker** — monospace marquee of currency pairs with ▲/▼ deltas in semantic green/red; duplicated in JS for the seamless `-50%` loop.
- **Currency converter** — the template's proof of life: send-amount input + from/to selects compute cross rates from a `USD_RATES` table (`rate = to/from`), formatted with locale separators; ⇅ swap button (rotates 180° on hover) exchanges the currencies; a rate line states the mid-market promise. Read-only receive field.
- **Security panel** — 2-column gradient card: claim copy left, checklist right — each item a bordered sub-card with green tick, bold claim, dim substantiation.
- **Glow CTA** — cyan→violet gradient button with a colored shadow that deepens on hover.

## Typography
System sans; H1 `clamp(38px, 6.4vw, 72px)` weight 800, gradient-clipped keyword only. Monospace for everything numeric (ticker, converter amounts) — money should look tabular.

## Layout
1120px container; centered hero → ticker band → converter (520px card) → 3-up feature grid → security band → footer with a compliance-toned disclaimer. Sections at 88px.

## Motion
Orbit rotation (continuous, slow), ticker scroll, scroll-reveal on cards, hover lifts. The two continuous animations sit in low-attention zones (behind hero, thin band) so they energize without distracting.

## Accessibility
Converter fields labelled; swap button `aria-label`ed; ticker + orbits `aria-hidden`; deltas pair arrows with percentages (not color-only); disclaimer clarifies the product is fictional and rates indicative.
