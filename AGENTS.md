# AGENTS.md

This repo is an OpenCode workspace and currently contains only `.opencode/` (tools + skills). Treat it like configuration/runtime, not a product app.

Agent expectations:
- Small, surgical edits; avoid drive-by reformatting.
- Do not edit vendored dependencies in `.opencode/node_modules/`.
- If you introduce tooling (typecheck/lint/test), update this file with exact commands.

## Repo Layout

- `AGENTS.md`
- `.opencode/package.json` (OpenCode plugin deps)
- `.opencode/tools/*.ts` (OpenCode tools)
- `.opencode/skills/*/SKILL.md` (skill docs)
- `.opencode/skills/*/scripts/` (helper scripts; mostly Python)

## Cursor / Copilot Rules

- Cursor: none found in `.cursor/rules/` or `.cursorrules`.
- Copilot: none found in `.github/copilot-instructions.md`.

If rules are added later, they override this document.

## Build / Lint / Test

No first-party build/lint/test is configured (no `tsconfig.json`, ESLint/Prettier/Biome, Jest/Vitest, etc.). Use the checks below.

### Install

```bash
cd .opencode
bun install
```

Fallback: `npm install`.

### TypeScript (tools)

Quick “does it parse/execute” check:

```bash
cd .opencode
bun --smol tools/getAiNewsPublic.ts
```

If a `tsconfig.json` is added, standardize on:

```bash
cd .opencode
bunx tsc --noEmit
```

### Tests

No repo tests exist today. If tests are added, prefer Bun so single-test workflows stay simple:

```bash
cd .opencode
bun test
bun test path/to/foo.test.ts
bun test -t "pattern"
```

Never add tests under `.opencode/node_modules/`.

### Lint / Format

No linter/formatter exists today. If added, prefer one-command flows and document them here (e.g. `bunx biome check --write .`).

### Shell conventions

- Run commands from repo root unless a section says otherwise.
- Prefer Bun (`bun`, `bunx`) for JS/TS tasks since a `bun.lock` exists.

## Code Style

Follow existing conventions in touched files. For new code, use the rules below.

### TypeScript (OpenCode tools)

Placement:
- New tools go in `.opencode/tools/<toolName>.ts` and default-export `tool(...)`.

Imports:
- ESM only; external imports first, then local.
- Prefer `import { tool } from "@opencode-ai/plugin"`.
- Do not import from `.opencode/node_modules/...` paths.

Formatting:
- 2-space indent; double quotes; trailing commas in multi-line literals.

Schemas/types:
- Validate inputs with `tool.schema` at the boundary; add tight constraints (`.int()`, `.min()`, `.max()`).
- Add concrete examples in `.describe()` for brittle formats (timestamps, IDs).
- Avoid `any` in tool boundaries.

Tool behavior:
- Make `description` actionable: what it does + when to use it.
- Prefer deterministic outputs. If returning JSON, pretty-print and keep a plain-text fallback.
- Keep I/O in `execute`; keep helpers pure where reasonable.

Naming:
- `camelCase` vars/functions/files; `PascalCase` types; `UPPER_SNAKE_CASE` constants.
- Prefer intentful arg names (e.g. `startCreatedAt`, `endCreatedAt`, `pageSize`).

Error handling:
- For `fetch`, always read body (`await res.text()`), check `res.ok`, then throw with endpoint + status + body.
- When expecting JSON from an untrusted server: parse with try/catch; fall back to raw text.

Comments/text:
- Prefer English for new comments/strings; don’t introduce non-ASCII unless the file already uses it or it is user-facing.
- Only add comments for non-obvious intent (avoid narrating the code).

Networking:
- Build URLs via `new URL(path, base)`; set query params via `url.searchParams`.
- Set `Accept: application/json` when you expect JSON.

Security:
- No secrets in source; read from env vars when needed and fail with a clear message.

### Python (skill scripts)

- Target Python 3.10+.
- Keep deps minimal; use `requirements.txt` only when necessary.
- Avoid bare `except:`; raise errors with context.
- Prefer explicit paths via CLI args; don’t hardcode absolute paths.
- Use `argparse` for CLIs; ensure `--help` is informative and examples are copy/pasteable.

Quick check:

```bash
python -m compileall .opencode/skills
```

### Markdown (skills)

- Keep `SKILL.md` concise (aim: <500 lines); push deep reference to `reference/` files.
- Prefer runnable commands and “run `--help` first” guidance for scripts.
- Avoid huge inline code blocks; link to scripts/resources by path instead.

## Workspace Hygiene

- Don’t touch `.opencode/node_modules/` or other generated artifacts.
- Keep changes scoped to the user request; avoid sweeping renames or formatting passes.
