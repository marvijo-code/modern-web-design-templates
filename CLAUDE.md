# Modern Web Design Templates — Agent Instructions

12 self-contained web design templates under `templates/<name>/`, each exactly three files: `index.html` (single-file, embedded CSS/JS, **zero external network requests**), `DESIGN.md` (design doc), `API.md` (backend API design — each template in a different language).

## Hard rules
- Never add external requests (CDNs, webfonts, remote images) to any template — the validator fails the build on them.
- Never drop below 10 templates; each template dir keeps exactly its three files.
- Read a template's `DESIGN.md` before editing it — several have strict extension rules.
- `node scripts/validate.mjs` must pass before every commit (files, skeleton, inline-JS syntax, links, gallery/README coverage, HTTP smoke).
- Gallery `index.html` and the README table must always cover every template.

## Skills (in `.claude/skills/`)
- `maintain-templates` — audit/fix pass across the collection.
- `add-template` — scaffold a new template (+ new-language API doc + skill + wiring).
- `add-feature` — extend one template safely.
- `update-design-docs` — keep DESIGN.md files truthful.
- `api-design-<language>` — per-language API design conventions (typescript, csharp, go, php, python, rust, ruby, java, kotlin, elixir, swift, scala), one per template.
