# VOLT — Fitness Club · Design Doc

## Concept
High-energy gym branding: black canvas, a single electric volt-green, italic 900-weight uppercase type that leans forward like a sprinter, angular clipped buttons, and a magenta secondary reserved for "hard" intensity. The diagonal pinstripe hero texture and glow accents say "industrial gym at night" without a single photo.

## Design tokens
| Token | Value | Role |
|-------|-------|------|
| `--black` / `--panel` | `#0a0a0f` / `#12121a` | Canvas / cards |
| `--line` | `#23232f` | Borders |
| `--volt` | `#c8ff2e` | THE accent: CTAs, tabs, counters, marquee |
| `--mag` | `#ff3d81` | Intensity marker only ("hard" classes) |
| `--text` / `--dim` | `#f2f2ee` / `#8d8d99` | Body / muted |

## Typography
Everything display is **italic, weight 900, uppercase, tracking −0.03/−0.04em** — the leaning italic is the brand's motion cue. H1 `clamp(56px, 12vw, 150px)` at line-height 0.9 mixes solid, volt-colored, and outline (`-webkit-text-stroke`) treatments. Meta text 10.5–13px uppercase letterspaced.

## Signature components
- **Animated stat counters** — hero numbers count from 0 to `data-target` with cubic ease-out over 1.2s, triggered once by IntersectionObserver at 40% visibility.
- **Weekly schedule** — day tabs (Mon–Sun, `role=tablist`) render class slots from the `SCHEDULE` object. Each slot card has a 4px intensity spine: volt for standard, magenta for "hard"; hover nudges the card 4px right (forward motion, on-theme).
- **Membership tiers** — dark cards; the featured tier gets a volt border + outer glow + "Most lifted" flag; ▸ list markers in volt; outlined CTAs fill on hover.
- **Volt marquee strip** — full-width volt band with black italic services separated by ⚡; JS duplicates content for a seamless loop.
- **Clipped join button** — `clip-path: polygon(...)` skews the CTA into a parallelogram; whitens on hover.

## Texture & light
Hero background layers a soft volt radial glow (top right) over a `repeating-linear-gradient` diagonal pinstripe at 2% white — enough grit to kill the flatness, subtle enough to keep text contrast.

## Layout
1120px container; hero is a flex row (headline vs counters) that wraps; sections separated by 1px rules at 80px rhythm; schedule 3-up grid, tiers 3-up — both collapse to one column ≤880px, where nav links hide behind the persistent Join CTA.

## Accessibility
Tabs carry aria-selected; counters group has an `aria-label`; the marquee is `aria-hidden`; intensity is conveyed by the level text, not just the spine color; volt-on-black and black-on-volt both clear WCAG AA large-text easily.
