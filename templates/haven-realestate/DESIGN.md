# Haven — Real Estate · Design Doc

## Concept
A trust-first property brand: deep navy + warm paper + restrained gold. Serif headlines lend establishment credibility; the machinery (filters, cards, calculator) is crisp sans. Three genuinely functional units — a filtering listing grid, localStorage favorites, and a live bond calculator — make it the most "app-like" of the light templates.

## Design tokens
| Token | Value | Role |
|-------|-------|------|
| `--navy` / `--slate` | `#1c2430` / `#2c3e50` | Nav, hero, bands, primary buttons |
| `--paper` | `#f7f6f3` | Page canvas |
| `--gold` / `--gold-soft` | `#c9a227` / `#e7cf9f` | Accents, eyebrows, "New" badges, slider thumbs |
| `--text` / `--dim` | `#232a33` / `#75808d` | Body / muted |
| `--line` / `--card` | `#e1ded7` / `#fff` | Borders / cards |
| `--green` | `#2e7d5b` | Third agent gradient only |

## Signature devices
- **Skyline hero** — navy gradient hero closed by a rectilinear SVG skyline silhouette (`aria-hidden`), echoing "city property" without photos.
- **Overlapping filter bar** — white card pulled −56px over the hero seam; area/type/beds/price selects **actually filter** the grid, with a result count and dashed empty state.
- **Listing cards** — data-driven: gradient "visual" block per property (palette stored on the record), status pill (gold "New" variant, `hidden` when empty), ♥ favorite button persisting to `localStorage` (`aria-pressed` kept true to state), price + specs row with dashed divider.
- **Bond calculator** — four range sliders (price/deposit/term/rate) with live `<output>` readouts driving the standard amortization formula `P·r / (1 − (1+r)^−n)`; result in gold at 30px. Gold `accent-color` styles the native sliders.
- **Agent cards** — initials avatar discs with per-agent gradients, stat rows (sold/experience/rating).

## Typography
Sans 15.5px base; Georgia serif for H1/H2 (weight 400) — "established firm" voice. Prices 20px/800; micro-labels 11px uppercase letterspaced.

## Layout
1120px container; nav → hero → overlap filter bar → listings → inverted calculator band (2-col) → agents → footer. Sections at 76px rhythm; `sec-head` pairs title with a result-count on the baseline.

## Responsive
920px: grids 2-up, filter 2×2, calculator stacks, nav links hide. 600px: single column everywhere.

## Accessibility
Every select labelled; favorite buttons carry `aria-label` + `aria-pressed`; outputs are real `<output>` elements; decorative skyline hidden from AT; currency formatted with `toLocaleString('en-ZA')`.
