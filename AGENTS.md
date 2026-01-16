# Repository Guidelines
These notes keep contributions consistent as we evolve the Next.js app and internal admin surfaces.

## Project Structure & Module Organization
The App Router lives under `app/`, with route groups such as `app/(app)` for the public blog and `app/(admin)` for internal tooling. `app/layout.tsx` defines the shared shell, while `app/globals.css` provides Tailwind v4 utility layers. Add view-specific assets beside their route, but place static media (logos, SVGs, Open Graph files) in `public/`. Keep configuration in the repo root (`next.config.ts`, `tsconfig.json`, `components.json`), and never commit artifacts from `.next/` or `node_modules/`. Use the `@/*` path alias for shared helpers instead of deep relative imports.

## Build, Test, and Development Commands
- `bun install` — install dependencies tracked in `bun.lock`.
- `bun dev` — start the hot-reloading dev server on `http://localhost:3000`.
- `bun run build` — create the production bundle inside `.next/`; run this before any PR.
- `bun run start` — serve the last build locally for smoke testing.
- `bunx next lint` — optional lint pass to catch TypeScript and accessibility issues.

## Coding Style & Naming Conventions
Use strict TypeScript and modern React (see `tsconfig.json`). Prefer Server Components unless you opt in to `use client`. Keep route segment folders lowercase-kebab-case (`app/(app)/posts/[slug]/page.tsx`), and co-locate supporting components inside a `components/` subfolder near that route. JSX should use two-space indentation, descriptive prop names, and early returns for conditional UI. Favor Tailwind utilities from `app/globals.css`; add scoped CSS modules only when utilities fall short, and document any new design tokens in that file.

## Typography & Fonts
- Global fonts are configured in `app/layout.tsx` with `next/font/google`.
- Primary Latin UI font: Quicksand weight 300; keep it as the base sans stack.
- Chinese default font: Noto Serif Simplified Chinese weight 300, wired as a fallback in `--font-sans`.
- Logo font: Liu Jian Mao Cao. Apply it via the `.font-logo` utility class (defined in `app/globals.css`) to logo text only.
- Tailwind v4 font tokens live in `app/globals.css` under `@theme inline` (`--font-sans`, `--font-mono`).

## Testing Guidelines
An automated test harness is not yet wired up, so every change must be validated with `bun dev` for interactive checks and `bun run build && bun run start` for production parity. When adding tests, colocate them as `*.test.tsx` files next to the component or API route they cover, and name suites after the user behavior under test (e.g., `describe('draft publishing flow')`). Target at least the happy path plus one failure path for any new feature, and capture coverage expectations in the PR description until a reporter is introduced.

## Commit & Pull Request Guidelines
History currently consists of the Create Next App baseline, so keep commit messages short, imperative, and scoped (e.g., `feat: add hero animation`). Reference an issue number where available. Each pull request should include: a one-paragraph summary of the change, a checklist confirming `bun run build` passed, screenshots or recordings for UI updates (desktop and mobile when relevant), and notes on how reviewers can trigger the new behavior (route path or admin feature flag). Draft PRs are welcome while work is in progress, but convert to “Ready for review” only after resolving lint/build warnings.

Concise rules for building accessible, fast, delightful UIs Use MUST/SHOULD/NEVER to guide decisions

## Interactions

- Keyboard
  - MUST: Full keyboard support per [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/)
  - MUST: Visible focus rings (`:focus-visible`; group with `:focus-within`)
  - MUST: Manage focus (trap, move, and return) per APG patterns
- Targets & input
  - MUST: Hit target ≥24px (mobile ≥44px) If visual <24px, expand hit area
  - MUST: Mobile `<input>` font-size ≥16px or set:
    ```html
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">
    ```
  - NEVER: Disable browser zoom
  - MUST: `touch-action: manipulation` to prevent double-tap zoom; set `-webkit-tap-highlight-color` to match design
- Inputs & forms (behavior)
  - MUST: Hydration-safe inputs (no lost focus/value)
  - NEVER: Block paste in `<input>/<textarea>`
  - MUST: Loading buttons show spinner and keep original label
  - MUST: Enter submits focused text input In `<textarea>`, ⌘/Ctrl+Enter submits; Enter adds newline
  - MUST: Keep submit enabled until request starts; then disable, show spinner, use idempotency key
  - MUST: Don’t block typing; accept free text and validate after
  - MUST: Allow submitting incomplete forms to surface validation
  - MUST: Errors inline next to fields; on submit, focus first error
  - MUST: `autocomplete` + meaningful `name`; correct `type` and `inputmode`
  - SHOULD: Disable spellcheck for emails/codes/usernames
  - SHOULD: Placeholders end with ellipsis and show example pattern (eg, `+1 (123) 456-7890`, `sk-012345…`)
  - MUST: Warn on unsaved changes before navigation
  - MUST: Compatible with password managers & 2FA; allow pasting one-time codes
  - MUST: Trim values to handle text expansion trailing spaces
  - MUST: No dead zones on checkboxes/radios; label+control share one generous hit target
- State & navigation
  - MUST: URL reflects state (deep-link filters/tabs/pagination/expanded panels) Prefer libs like [nuqs](https://nuqs.dev)
  - MUST: Back/Forward restores scroll
  - MUST: Links are links—use `<a>/<Link>` for navigation (support Cmd/Ctrl/middle-click)
- Feedback
  - SHOULD: Optimistic UI; reconcile on response; on failure show error and rollback or offer Undo
  - MUST: Confirm destructive actions or provide Undo window
  - MUST: Use polite `aria-live` for toasts/inline validation
  - SHOULD: Ellipsis (`…`) for options that open follow-ups (eg, "Rename…") and loading states (eg, "Loading…", "Saving…", "Generating…")
- Touch/drag/scroll
  - MUST: Design forgiving interactions (generous targets, clear affordances; avoid finickiness)
  - MUST: Delay first tooltip in a group; subsequent peers no delay
  - MUST: Intentional `overscroll-behavior: contain` in modals/drawers
  - MUST: During drag, disable text selection and set `inert` on dragged element/containers
  - MUST: No “dead-looking” interactive zones—if it looks clickable, it is
- Autofocus
  - SHOULD: Autofocus on desktop when there’s a single primary input; rarely on mobile (to avoid layout shift)

## Animation

- MUST: Honor `prefers-reduced-motion` (provide reduced variant)
- SHOULD: Prefer CSS > Web Animations API > JS libraries
- MUST: Animate compositor-friendly props (`transform`, `opacity`); avoid layout/repaint props (`top/left/width/height`)
- SHOULD: Animate only to clarify cause/effect or add deliberate delight
- SHOULD: Choose easing to match the change (size/distance/trigger)
- MUST: Animations are interruptible and input-driven (avoid autoplay)
- MUST: Correct `transform-origin` (motion starts where it “physically” should)

## Layout

- SHOULD: Optical alignment; adjust by ±1px when perception beats geometry
- MUST: Deliberate alignment to grid/baseline/edges/optical centers—no accidental placement
- SHOULD: Balance icon/text lockups (stroke/weight/size/spacing/color)
- MUST: Verify mobile, laptop, ultra-wide (simulate ultra-wide at 50% zoom)
- MUST: Respect safe areas (use env(safe-area-inset-*))
- MUST: Avoid unwanted scrollbars; fix overflows

## Content & Accessibility

- SHOULD: Inline help first; tooltips last resort
- MUST: Skeletons mirror final content to avoid layout shift
- MUST: `<title>` matches current context
- MUST: No dead ends; always offer next step/recovery
- MUST: Design empty/sparse/dense/error states
- SHOULD: Curly quotes (“ ”); avoid widows/orphans
- MUST: Tabular numbers for comparisons (`font-variant-numeric: tabular-nums` or a mono like Geist Mono)
- MUST: Redundant status cues (not color-only); icons have text labels
- MUST: Don’t ship the schema—visuals may omit labels but accessible names still exist
- MUST: Use the ellipsis character `…` (not ``)
- MUST: `scroll-margin-top` on headings for anchored links; include a “Skip to content” link; hierarchical `<h1–h6>`
- MUST: Resilient to user-generated content (short/avg/very long)
- MUST: Locale-aware dates/times/numbers/currency
- MUST: Accurate names (`aria-label`), decorative elements `aria-hidden`, verify in the Accessibility Tree
- MUST: Icon-only buttons have descriptive `aria-label`
- MUST: Prefer native semantics (`button`, `a`, `label`, `table`) before ARIA
- SHOULD: Right-clicking the nav logo surfaces brand assets
- MUST: Use non-breaking spaces to glue terms: `10&nbsp;MB`, `⌘&nbsp;+&nbsp;K`, `Vercel&nbsp;SDK`

## Performance

- SHOULD: Test iOS Low Power Mode and macOS Safari
- MUST: Measure reliably (disable extensions that skew runtime)
- MUST: Track and minimize re-renders (React DevTools/React Scan)
- MUST: Profile with CPU/network throttling
- MUST: Batch layout reads/writes; avoid unnecessary reflows/repaints
- MUST: Mutations (`POST/PATCH/DELETE`) target <500 ms
- SHOULD: Prefer uncontrolled inputs; make controlled loops cheap (keystroke cost)
- MUST: Virtualize large lists (eg, `virtua`)
- MUST: Preload only above-the-fold images; lazy-load the rest
- MUST: Prevent CLS from images (explicit dimensions or reserved space)

## Design

- SHOULD: Layered shadows (ambient + direct)
- SHOULD: Crisp edges via semi-transparent borders + shadows
- SHOULD: Nested radii: child ≤ parent; concentric
- SHOULD: Hue consistency: tint borders/shadows/text toward bg hue
- MUST: Accessible charts (color-blind-friendly palettes)
- MUST: Meet contrast—prefer [APCA](https://apcacontrast.com/) over WCAG 2
- MUST: Increase contrast on `:hover/:active/:focus`
- SHOULD: Match browser UI to bg
- SHOULD: Avoid gradient banding (use masks when needed)
