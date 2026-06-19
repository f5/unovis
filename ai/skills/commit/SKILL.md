---
name: commit
description: >-
  Create git commits in the Unovis repo that pass its commitlint rules. Unovis uses a CUSTOM
  commit format (`Type | Scope | Subscope: Sentence-case subject`), NOT Conventional Commits, so
  `feat:`/`fix:` will be rejected by the commit-msg hook. Use this whenever staging and committing
  changes, writing or rewriting a commit message, splitting work into commits, or recovering from a
  commitlint rejection in this repository.
---

# Committing in Unovis

Unovis enforces commit messages with **commitlint** (`commitlint.config.ts`) via a Husky
`commit-msg` hook. The format is custom — Conventional Commits (`feat:`, `fix:`, `chore:`) **fail**.

## Format

```
Type | Scope | Subscope | Subscope2: Sentence-case subject
```

`Scope` and `Subscope`s are optional depending on type. Parser regex (from the config):

```
^\s*(\w*)(?:\s\|\s(\w*))?(?:\s\|\s([\w\s|]+))?: (.*)$
```

→ capture groups `[type, scope, subscopes, subject]`. Separators are ` | ` (space-pipe-space).

## Rules (what the hook checks)

- **`type` (required, error)** — must be one of exactly:
  `React`, `Angular`, `Vue`, `Svelte`, `Solid`, `Website`, `Dev`, `Shared`, `Core`, `Component`,
  `Container`, `Release`, `CI`, `Misc`.
- **`subject` (error)** — **sentence case** (first word capitalized, the rest lowercase unless a
  proper noun or `code`), must not be empty, no trailing period. Backtick code/prop names:
  `` `brushHeightExtend` ``.
- **`scope` (warning, not blocking)** —
  - May be empty **only** for `Release` and `CI`.
  - For type `Component`, the scope should be the component's name. Use the human-readable display
    name as it appears in the gallery/docs; it may be multiple words (e.g. `Radial Bar`, `Time
    Series`). Multi-word scopes produce a non-blocking `validate-scope` warning — that's fine and
    matches existing history. (A single-word registered name like `Crosshair` produces zero
    warnings.)
  - Subscopes are PascalCase.

Because `validate-scope` is a **warning**, commits with a readable multi-word component scope still
succeed. Only `type` and `subject` can actually block a commit.

## Picking the type and scope

Choose the type from **where the change lives**:

| You changed… | Type | Typical scope / subscope |
| --- | --- | --- |
| `packages/ts/src/components/<x>/` logic | `Component` | the component name (`Crosshair`, `Radial Bar`) |
| `packages/ts/src/core/**` or `utils/**` | `Core` | the area (`Utils`, `Utils | trimSVGText`) |
| `packages/ts/src/containers/**` | `Container` | the container name |
| `packages/dev/**` | `Dev` | `Examples`, `Examples | <Area>`, `Build` |
| `packages/website/**` | `Website` | `Docs | <Component>`, `Gallery`, `Build`, `Theming` |
| `packages/shared/**` (examples, registry, parser) | `Shared` | `Gallery`, `Examples`, `TS Parser` |
| Regenerated wrappers across all frameworks | `Misc` | `Framework integrations` (subject) |
| One framework wrapper's own (non-generated) code | `React`/`Angular`/`Vue`/`Svelte`/`Solid` | `Wrappers`, `Containers`, a component name |
| Version bump | `Release` | — (no scope) |
| `.github/workflows/**` | `CI` | — (scope optional) |
| Cross-cutting / none of the above | `Misc` | optional |

## Procedure

1. `git status` and `git diff` (and `git diff --staged`) to see what changed.
2. Group changes that belong together. If a PR spans core + dev + wrappers + website, prefer
   **separate commits per concern** (see `/open-pr` for the standard 4-commit grouping).
3. For each commit: pick type + scope from the table, write a sentence-case subject in the
   imperative ("Add", "Fix", "Allow", "Remove"), stage the right files, and `git commit`.
4. The `commit-msg` hook runs commitlint and `pre-commit` runs `lint-staged` (`eslint --fix` on
   staged `*.{js,ts,jsx,tsx,svelte}`) automatically. **Do not pass `--no-verify`** unless the user
   explicitly asks.
5. If the hook rejects the message, read the error (it links to
   https://unovis.dev/contributing/pull-requests#commit-messages), fix the message, and retry — do
   not bypass.

To check a message without committing:

```bash
echo "Component | Crosshair: Add configurable visibility threshold" | pnpm exec commitlint
```

## Real examples (from this repo's history)

**Component** (core component logic):
```
Component | Boxplot: New component
Component | Radial Bar: New component
Component | Axis: Configurable tick size
Component | Crosshair: Add configurable visibility threshold
Component | Brush: New `brushHeightExtend` config option
Component | Sankey: Allow configuring zoom origin
Component | Scatter: Point hover performance fix
Component | Timeline: CSS variable for row icon cursor
Component | TopoJSON: Fix zoom out behavior via visControl
Component | StackedBar: Remove elements from DOM when transition was interrupted
```

**Core** (shared core / utils):
```
Core | Utils | trimSVGText: Fix fontSize value parsing
Core: Fix vulnerabilities
```

**Dev** (visual test app):
```
Dev | Examples: SVG Filters
Dev | Examples | Area: Gradient areas; custom font; time axis formatting
Dev | Examples | Axis: Add tick text alignment example
Dev: Replace seedrandom with d3-random
```

**Website** (docs + gallery):
```
Website | Docs | Axis: Tick Size section
Website | Docs | Theming: Add SVG filters section
Website | Gallery: Add Synced Crosshairs example
Website | Build: Increase Node heap size for the production build
Website: Add logo to homepage
```

**Framework wrappers**:
```
React | Containers: Allow setting css variables via `style`
React: Regenerate wrappers
Vue | Wrappers: Use `useAttrs()` for prop reactivity
Angular | Timeline: Wrapper update
```

**Shared**:
```
Shared | Gallery: Example fixes
Shared | TS Parser: Handle `TemplateLiteralType`
```

**Misc / Release**:
```
Misc: Framework integrations
Misc: Update node version to 24
Misc | Vue: Fix autogen script and build issue
Release: 1.6.5
```

## Anti-patterns (these get rejected or warned)

- `feat: add boxplot` / `fix(scatter): hover` → wrong format, rejected (`feat`/`fix` not a type).
- `Component | crosshair: ...` → lowercase scope (warning) — prefer `Crosshair`.
- `Component | Crosshair: Added a new threshold.` → past tense + trailing period; prefer
  `Add configurable visibility threshold`.
- `component | Crosshair: ...` → lowercase type, rejected.
