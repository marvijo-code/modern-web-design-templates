# Verde — Restaurant Site · Design Doc

## Concept
A warm, botanical fine-dining site: deep forest greens against cream paper, gold accents, serif menus set like a printed carte. The mood is "garden restaurant at dusk" — organic but disciplined. Content is data-driven (menus render from JS), and the reservation form and hours table have real behavior.

## Design tokens
| Token | Value | Role |
|-------|-------|------|
| `--forest` | `#13291c` | Darkest green — hero, story band, footer |
| `--moss` | `#1e4630` | Primary action green |
| `--cream` | `#f6f0e2` | Page canvas |
| `--gold` | `#e8d9a8` | Accent — eyebrows, stats, dividers |
| `--ink` / `--soft` | `#22301f` / `#6f7d68` | Body / muted text |
| `--line` | `#d9d0ba` | Hairlines, dashed menu rules |

## Typography
Georgia serif for everything editorial (H1 at `clamp(48px, 9vw, 104px)`, weight 400, wide tracking); system sans (`.sans`) for machinery — nav, tabs, labels, prices — in letterspaced uppercase 11–13px. Italic serif for dish descriptions and the tagline.

## Layout & sections
Announcement strip → sticky cream nav (blur) → full-bleed gradient hero with scattered botanical glyphs (❦ ❧ ✿, decorative) → menu → inverted story band → hours/location cards → reservation form → footer. 1040px container, 88px section rhythm, centered 560px `sec-head` lockups.

## Signature components
- **Menu with leader dots** — classic carte layout: dish name, dotted leader (`border-bottom: dotted` flex filler), price; italic description wraps below; optional pill badge (v / 0%). Four categories switch via pill tabs (`role=tablist`, `aria-selected` maintained), re-rendering from the `MENUS` data object.
- **Story stats mosaic** — 3×2 grid of stat tiles separated by 2px gold-tinted gaps (gap-as-border technique) on the forest band.
- **Hours table** — dashed rows; **JS highlights today's row** via `data-day` (the merged Mon & Tue row matches both days).
- **Reservation form** — 2-column grid; date input floored to today; validation rejects missing fields, bad emails, and Monday/Tuesday dates with a friendly message; success message echoes the guest's name.

## Motion
IntersectionObserver reveal (16px rise); button/nav color transitions only — no parallax, the mood is calm.

## Responsive
≤800px: nav links hide (Reserve button remains as the primary path), story and info grids stack, form goes single-column.

## Accessibility
Tabs carry proper roles/aria state; form fields have real `<label for>`; status messages in a `role="status"` live region; decorative glyphs are presentational text in `aria`-neutral spans.
