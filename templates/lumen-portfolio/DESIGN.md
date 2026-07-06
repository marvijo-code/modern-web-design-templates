# Lumen — Designer Portfolio · Design Doc

## Concept
A light, editorial portfolio in the "printed matter" idiom: warm paper background, serif display type at poster scale, hairline rules, and a single burnt-orange accent. It reads like a beautifully set magazine — the opposite pole of the collection's dark SaaS templates, proving the system spans moods.

## Design tokens
| Token | Value | Role |
|-------|-------|------|
| `--paper` | `#faf7f2` | Warm paper canvas |
| `--ink` | `#1e1a14` | Near-black ink text |
| `--soft` | `#6e6557` | Muted body copy |
| `--line` | `#e2d9c9` | Hairline rules |
| `--accent` | `#c4531f` | Burnt orange — italics, hovers, marquee stars |
| `--wash` | `#efe7da` | Tinted band / hover fill |

## Typography — the identity carrier
- **Serif (Georgia)** for display and body: H1 at `clamp(44px, 8vw, 92px)`, weight 400 (elegance from scale, not boldness); italics in accent color for emphasis words.
- **Sans (system)** via a `.sans` utility for all "machinery": nav, labels, captions, facts — 12.5–15px, letterspaced uppercase for kickers (0.14–0.22em).
- The serif/sans contrast is the core visual device; keep it strict when extending.

## Layout system
- 1080px container, generous 88–96px section padding.
- Sections open with a `sec-title` lockup: serif h2 + sans caption on a shared baseline over a 2px ink rule.
- About: 1.1/0.9 asymmetric grid (essay + facts card). Services: 3-up bordered grid sharing internal hairlines (single outer border, `border-right` dividers).

## Signature components
- **Case-study index rows** — grid rows (index № / title / tags / year / arrow) instead of thumbnails; hover fills with `--wash`, indents 20px, italicizes the title in accent, and nudges the arrow ↗. Image-free by design.
- **Marquee band** — CSS keyframe scroll of letterspaced service names separated by ✳; JS duplicates the track so `translateX(-50%)` loops seamlessly; `aria-hidden` (decorative).
- **Facts card** — white bordered card of key/value rows (based, experience, availability).
- **Inverted contact section** — full-bleed ink panel, giant serif mailto underlined in accent.

## Motion
Scroll-reveal via IntersectionObserver (16px rise); nav links animate a 1px accent underline; work-row hover choreography (fill + indent + italic + arrow). Nothing bounces — restraint is the brief.

## Responsive
≤820px: tags column drops from work rows, about and services collapse to single column (dividers rotate to `border-bottom`), nav tightens. `overflow-x: clip` guards the marquee.

## Accessibility
Real anchors for rows, single H1, decorative marquee hidden from AT, contrast ≥ 7:1 for ink-on-paper text.
