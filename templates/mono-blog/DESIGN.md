# Mono. — Editorial Blog · Design Doc

## Concept
A reading-first personal blog: one narrow measure, serif body type at a generous 18px/1.75, near-zero chrome. The design goal is that nothing competes with sentences. It's the collection's typography benchmark and its only template with a **full light/dark theme system**.

## Design tokens (dual theme)
| Token | Light | Dark | Role |
|-------|-------|------|------|
| `--bg` | `#fbfbf9` | `#141416` | Canvas |
| `--ink` | `#141414` | `#e9e9e4` | Text |
| `--soft` | `#6b6b66` | `#96968f` | Secondary text |
| `--line` | `#e6e6e0` | `#2b2b2f` | Hairlines |
| `--accent` | `#2a5db0` | `#7ba3e3` | Links, category labels |
| `--tint` | `#f2f2ec` | `#1c1c20` | Newsletter panel |

Theme switching = swapping one `data-theme` attribute; every color is a variable, so components never branch. Dark accent is lightened for contrast on dark ground.

## Typography
- Georgia serif, 18px/1.75 body — deliberately book-like.
- Headlines weight 400 (size, not boldness, carries hierarchy): intro `clamp(30px, 5vw, 44px)`, post titles `clamp(22px, 3.4vw, 30px)`.
- Sans utility only for machinery: masthead links, meta rows, chips, forms — 12.5–15px, uppercase letterspaced for meta.

## Layout
Single 680px column (the measure is the layout). Rhythm: masthead → intro manifesto → filter chips → post list → newsletter card → footer. Hairline dividers between everything; no cards for posts — whitespace and rules do the separation.

## Signature components
- **Post entries** — meta row (category in accent / date / read-time), serif title that tints accent on hover, teaser, and an underlined "Read essay" caption.
- **Category chips** — pill filters (`role=tablist`) re-render the list from the `POSTS` array; active chip inverts to ink; an italic empty state appears for empty categories.
- **Theme toggle** — ◐ button cycles light/dark; initial state honors `localStorage` then `prefers-color-scheme`; 0.25s background/color transition eases the swap.
- **Newsletter card** — tinted panel, inline email form with real validation and a friendly `role="status"` confirmation; stacks vertically ≤560px.

## Motion
Almost none by design: color transitions on hover/theme only. A reading site should hold still.

## Accessibility
WCAG AAA-range body contrast in both themes; chips and toggle are real buttons with aria state; single H1; form input labelled; status messages in a live region.
