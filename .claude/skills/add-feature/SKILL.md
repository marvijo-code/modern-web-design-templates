---
name: add-feature
description: Add a feature, section, or behavior to an existing template without breaking its design system, accessibility, or the zero-dependency rule. Use for "add X to template Y", "give the store a wishlist", "add a testimonials section", etc.
---

# Add a Feature to a Template

## Before writing code
1. Read the target template's `DESIGN.md` — tokens, typography rules, layout rhythm, signature components, and any **Extension rules** (e.g. forge-agency: no gradients/shadows/radius, new sections need a `sec-label` strip; mono-blog: every color must exist in both themes).
2. Read the existing `<script>` block — features are data-driven (objects/arrays at the top, render functions, delegated listeners). New features must follow that shape, not add a second style of code.

## Rules
- **Zero dependencies stays absolute**: no CDN scripts, webfonts, or remote images. New visuals = CSS, inline SVG, gradients, emoji.
- Use only the template's existing CSS custom properties; if a genuinely new token is needed, add it to `:root` *and* to the DESIGN.md token table (and to the dark theme block where one exists).
- Match the section rhythm: same container class, same section padding, same heading lockup pattern (`eyebrow` + `h2` etc.).
- State that should persist uses `localStorage` with a template-prefixed key (`drift-cart`, `haven-favs`, `mono-theme` are the precedents).
- Interactivity: real elements + ARIA state; keyboard reachable; status messages via `role="status"`; new decorative art `aria-hidden`.
- Responsive: extend the template's existing breakpoints (don't invent new ones); verify collapse at ~900px and ~560px.

## After
1. `node scripts/validate.mjs` passes (it syntax-checks your inline JS).
2. Headless-browser check: zero console errors; exercise the new control.
3. Update `DESIGN.md`: add the feature under Signature components / Interaction inventory, and Motion/Responsive/Accessibility notes if affected.
4. If the feature implies backend capability (e.g. wishlist sync, search), add or extend the matching endpoints in the template's `API.md` using the language skill (`api-design-<language>`).
5. Commit `feat(<template>): <feature>` and push.
