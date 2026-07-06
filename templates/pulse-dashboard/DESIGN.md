# Pulse — Analytics Dashboard · Design Doc

## Concept
A dense, data-first admin shell in the GitHub-dark idiom: cool slate panels on a near-black canvas, one saturated accent (signal blue) plus a semantic palette (green/amber/red) reserved strictly for data meaning. Everything renders from JS data structures — switching the date range re-renders KPIs and the chart, proving the template is wired like a real app, not a static mock.

## Design tokens
| Token | Value | Role |
|-------|-------|------|
| `--bg` | `#0d1117` | App canvas |
| `--panel` / `--panel2` | `#151b26` / `#1a2233` | Cards / hover & active fills |
| `--line` | `#26304a` | Borders and dividers |
| `--text` / `--dim` | `#e6ecf7` / `#8b96ad` | Primary / secondary text |
| `--blue` / `--cyan` | `#58a6ff` / `#43d9c0` | Series 1 / series 2 |
| `--green` `--amber` `--red` | semantic | healthy / degraded / down |

## Layout system
- Two-pane CSS grid: fixed 230px sidebar (sticky, full-height) + fluid main.
- Main column rhythm: topbar → 4-up KPI grid → 2:1 chart row → full-width table panel.
- Breakpoints: 960px (sidebar becomes a horizontal toolbar; grids collapse), 560px (KPIs single-column). Table scrolls horizontally in its own wrapper — the page never scrolls sideways.

## Typography
14px base (denser than marketing pages), system stack. KPI values 26px/800 with tight tracking; panel titles 15px; uppercase 10.5–12px letterspaced micro-labels for sidebar sections and table headers.

## Signature components
- **KPI card** — name + delta chip (green/red), large value, 8-bar CSS sparkline.
- **Stacked bar chart** — pure CSS flex columns with two stacked segments, height computed from data against the series max; hover lightens; `title` tooltips.
- **Donut** — `conic-gradient` ring with a punched-out center label; legend list.
- **Service table** — sortable by every column (click header toggles direction), pill status badges, hover rows, CSV export via Blob download.
- **Range switcher** — segmented 7d/30d/90d control that swaps the entire dataset.

## Interaction inventory
| Control | Behavior |
|---------|----------|
| Range segment | Re-renders KPI cards + chart + hint from `DATA[days]` |
| Table header | Sort asc/desc, numeric vs string aware |
| Export CSV | Generates a real downloadable CSV from the table data |
| Sidebar links | Hover/active states with inset accent bar |

## Accessibility
Buttons (not divs) for all interactive controls; table uses real `<table>` semantics; status conveyed by text + color, never color alone.
