# Bloom — Conference / Events · Design Doc

## Concept
A joyful festival-of-ideas conference site: a fixed plum→magenta gradient canvas, pink→peach gradient accents, and soft blurred "petal" blobs drifting behind the hero. The three conference essentials — live countdown, speaker grid, day-switching agenda timeline — all work for real.

## Design tokens
| Token | Value | Role |
|-------|-------|------|
| `--plum` / `--magenta` | `#2b0f3a` / `#7a1f6e` | Fixed body gradient poles |
| `--pink` / `--peach` | `#ff5fa2` / `#ffb47e` | Gradient identity: CTAs, timeline, active states |
| `--blush` | `#ffd1f0` | Petals, hairline tint |
| `--text` / `--dim` | `#fff5fb` / `#d5a8c8` | Body / muted |
| `--panel` / `--line` | `rgba(255,255,255,.06)` / `rgba(255,209,240,.22)` | Glass cards / borders |

The body gradient is `fixed` so cards glide over a stable wash while scrolling.

## Signature components
- **Petals** — four absolutely-positioned blobs with organic `border-radius` ratios (60% 40% 55% 45% / …), 2px blur, floating on a 9s ease keyframe with staggered negative delays.
- **Live countdown** — four glass tiles (days/hours/min/sec, `tabular-nums`) ticking every second toward doors-open (`2026-11-12T08:30+02:00`), clamped at zero after the date.
- **Speaker cards** — data-driven from the `SPEAKERS` array: initials disc in a per-speaker pastel, name/role, and a pill talk-topic; hover lifts + pink border.
- **Agenda timeline** — vertical gradient spine (pink→peach) with dot markers ringed in the page color; Day 1 / Day 2 pill toggle (`role=tablist`) re-renders slots (time / title / description / speaker) from the `AGENDA` object.
- **Ticket tiers** — sold-out tier at 55% opacity with a disabled button; featured tier glowing pink with a strikethrough anchor price; team bundle plain.

## Typography
System sans; H1 `clamp(52px, 11vw, 132px)` weight 800 with an italic gradient-clipped year; eyebrows peach uppercase 0.22em; countdown digits 34px/800.

## Layout
1080px container; centered hero → speakers 4-up (2-up ≤900px, 1-up ≤520px) → agenda (720px timeline) → tickets 3-up → footer. Sections at 84px with centered 560px heads.

## Motion
Petal float (continuous, slow, behind content), countdown tick, card hover lifts, scroll-reveal. Gradients carry the energy; motion stays gentle.

## Accessibility
Countdown grouped with `aria-label`; day toggle uses tab semantics with `aria-selected`; sold-out button `aria-disabled`; petals are decorative empty spans; dim-on-plum text kept ≥4.5:1.
