# FORGE — Creative Agency · Design Doc

## Concept
Neo-brutalist agency site: three colors (off-white, near-black, signal yellow), 3px structural rules everywhere, screaming uppercase display type, and instant hard-edged hover inversions. No gradients, no shadows, no border-radius — the grid *is* the design. It's the loudest voice in the collection, deliberately contrasting the soft SaaS and editorial templates.

## Design tokens
| Token | Value | Role |
|-------|-------|------|
| `--black` | `#111111` | Ink, inversion fills, 3px rules |
| `--white` | `#f5f4f0` | Warm off-white canvas |
| `--yellow` | `#ffe600` | The only accent: highlights, hovers, ticker text, `::selection` |
| `--gray` | `#8a8a85` | Metadata only |

## Typography
- Display: system sans at 900 weight, uppercase, tracking −0.04em; H1 `clamp(52px, 11.5vw, 168px)` at line-height 0.92.
- Three display treatments in the H1: solid, **outline** (`-webkit-text-stroke`), and **highlighter** (yellow background padding-box) — the template's signature.
- Monospace utility for numerals (project indices `/01`, clock, service letters).
- Meta text: 12–13px uppercase, letterspaced 0.08–0.14em, weight 700–800.

## Layout system
No max-width container — full-bleed sections separated by 3px black rules with 28px page gutters. Every section opens with a `sec-label` strip (left/right justified uppercase captions). Services are a 4-up grid sharing 3px internal borders.

## Signature components
- **Project index rows** — number / giant uppercase title / tags; hover inverts the entire row to black with yellow tags (background/color swap at 0.12s — fast on purpose; brutalism doesn't ease).
- **Ticker** — black marquee band with yellow uppercase services separated by ◆; JS duplicates the track for a seamless `translateX(-50%)` loop.
- **Manifesto band** — full-black section with a single poster-scale sentence; dimmed words (`#555`) vs white vs yellow create emphasis rhythm without punctuation.
- **Live studio clock** — nav shows real JHB time (UTC+2 computed from the visitor's clock), updating every second — a small proof-of-life detail.
- **CTA** — giant "Got a brief? Bring it." with a black/yellow swap button.

## Motion
Only two moves: the infinite ticker and hard hover inversions. No scroll-reveal — content is already loud; adding motion would soften it.

## Responsive
≤900px: services 2×2 (border directions rotated), project tags drop, secondary nav links hide, CTA stacks. Type scales via clamp so the poster feel survives on phones.

## Extension rules
Never introduce a fourth color, rounded corner, or drop shadow. New sections must be separated by 3px rules and open with a `sec-label` strip.
