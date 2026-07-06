# Nova — SaaS Landing Page · Design Doc

## Concept
A dark, premium developer-tool landing page in the glassmorphism idiom: deep near-black canvas, soft radial gradient glows, translucent frosted panels, and a two-hue gradient identity (indigo → teal). The page sells a fictional dev-productivity platform ("Nova") and demonstrates the canonical SaaS narrative: hero → product mock → social proof → features → pricing → CTA.

## Design tokens
| Token | Value | Role |
|-------|-------|------|
| `--bg` | `#0a0c14` | Page canvas |
| `--surface` | `rgba(255,255,255,.04)` | Glass panels/cards |
| `--line` | `rgba(255,255,255,.09)` | Hairline borders |
| `--text` | `#eef1fa` | Primary text |
| `--dim` | `#98a0b6` | Secondary text |
| `--brand` | `#7c8cff` | Primary brand (indigo) |
| `--brand2` | `#4fd8c0` | Secondary brand (teal) |
| `--radius` | `16px` | Card corner radius |

## Typography
- System stack (`-apple-system … Inter, sans-serif`), antialiased.
- Display: `clamp(38px, 6vw, 68px)`, weight 800, tracking −0.03em.
- Section heads: `clamp(28px, 4vw, 42px)`; body 16px/1.65; captions 13–14.5px in `--dim`.
- Gradient text (`background-clip: text`) reserved for the single hero keyword.

## Layout system
- 1140px max-width container, 24px gutters.
- Sticky glass nav (64px, `backdrop-filter: blur`).
- Sections at 90px vertical rhythm with a centered 640px `sec-head` lockup (eyebrow → h2 → lede).
- Feature grid and pricing: 3-column CSS grid collapsing to 1 column below 860px.

## Signature components
- **Product window mock** — faux macOS window (traffic-light dots, sidebar, animated gradient progress bars via `@keyframes grow`) standing in for a screenshot without any image assets.
- **Popular pricing plan** — elevated with brand border, gradient wash, and a floating "Most popular" flag.
- **Pill badge** — announcement chip above the H1.

## Motion
- Scroll-reveal: `IntersectionObserver` adds `.in` (fade + 18px rise, 0.6s ease), one-shot per element.
- Hover: cards lift 3px and re-border in brand; primary buttons deepen their glow.
- `scroll-behavior: smooth` for in-page anchors.

## Responsive behavior
- <860px: grids collapse, window sidebar hides, nav links move into a hamburger-toggled sheet (aria-expanded maintained), secondary nav button hidden.
- `overflow-x: clip` on body guards against gradient/glow overflow scrollbars.

## Accessibility
- Semantic landmarks (`nav`, `header`, `section`, `footer`), single H1, labelled hamburger button, ✓ list markers injected via CSS so screen readers read plain list items.
