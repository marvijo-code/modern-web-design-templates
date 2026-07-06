# Atlas — Travel Agency · Design Doc

## Concept
An optimistic, airy travel-agency landing: a dusk-to-daylight vertical gradient hero with a layered SVG mountain silhouette, a floating search card that overlaps the hero (the classic booking-site device), and gradient "vista" destination cards that need zero photography. Serif display + sans body gives it a travel-journal voice.

## Design tokens
| Token | Value | Role |
|-------|-------|------|
| `--deep` / `--sea` | `#062b3a` / `#0d5c74` | Hero gradient, primary action |
| `--sky` | `#e9f4f6` | Page canvas (the hero gradient resolves into it) |
| `--sand` | `#ffd98e` | Sun glow, italic hero accent |
| `--coral` | `#ff7e5f` | Eyebrow labels only |
| `--text` / `--dim` | `#10333f` / `#5b7681` | Body / muted |
| `--line` / `--card` | `#d3e3e7` / `#fff` | Borders / cards |

## Signature devices
- **Hero horizon** — `linear-gradient(deep → sea → sky)` ends in the page background so the header "dissolves" into the page; two stacked SVG mountain paths (one translucent, one page-colored) form the horizon; a radial-gradient sun floats top-right.
- **Overlapping search card** — white card pulled up with `margin-top: -64px` over the hero seam; 4-column grid (region / budget / duration / submit). **It actually filters**: submit re-renders the journey grid from the `JOURNEYS` array, shows a result count, an empty-state panel when nothing matches, and smooth-scrolls to results.
- **Vista cards** — each journey renders a `linear-gradient` header block from its own two-color palette (data-driven scenery), a temperature chip, then name/where/price/days with a dashed divider.
- **Numbered steps band** — CSS counters render oversized serif "01/02/03" ghost numerals; dashed dividers between steps rotate direction on mobile.
- **Quote band** — deep-navy rounded panel, 90px serif quotation mark, italic Georgia pull-quote.

## Typography
Sans (system) as base 16px; Georgia serif reserved for H1/H2 and the ghost step numerals — the serif is the "wanderlust" note. Hero H1 `clamp(38px, 6vw, 64px)`, weight 400 with italic accent in `--sand`.

## Layout
1120px container; sections at 84px; `sec-head` is a two-column flex lockup (title block left, supporting copy right) that wraps on small screens.

## Responsive
900px: cards 2-up, search 2×2, steps stack, nav links hide (Plan-a-trip button persists). 580px: everything single-column.

## Accessibility
Labels bound to every control; decorative SVG/sun `aria-hidden`; result count announced via text node; empty state visible in DOM (display toggled).
