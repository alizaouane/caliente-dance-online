# caliente-dance-online — Claude Code Operating Manual

Conforms to the AI-Native Development Operating Standard v4.0.
General engineering discipline lives in `~/.claude/CLAUDE.md` and applies here
unchanged. Cross-project stack defaults: `~/.bmad/user-preferences.md`.

## MANDATORY SESSION PROTOCOL

### On Session Start
1. Read this file completely before any action
2. Read SPEC.md and identify the active story for this session
3. Read the active story file at /docs/stories/[epic]/[story].md
4. Read the latest entry in SESSION_LOG.md
5. Check git status and the current branch; confirm worktree matches story
6. State your understanding of the story and the plan to implement it
7. Do NOT write code until I confirm

### On Session End (run /done)
1. Run the Wire Check on all code added this session
2. Run the 5-layer test pyramid (contract → unit → integration → component → E2E)
3. Open or update the pull request for this branch
4. Monitor CI; address any failures before declaring done
5. Update the story file: status, Dev Notes, files touched
6. Update SPEC.md story-status table
7. Update docs/sprint-status.yaml
8. Append a session entry to SESSION_LOG.md

## FEATURE DEVELOPMENT PROTOCOL

### Step 1 — Story Reading
The story file is the single source of truth. If it is ambiguous, STOP and
ask. Do not infer. Do not expand scope.

### Step 2 — Implementation Rules
- No stubs. No TODOs. No mock data in production code paths
- Every API route validates input and handles errors
- Every DB operation handles null/undefined results
- Every async operation has error handling
- All env vars used are listed in .env.example
- Zero `any` in TypeScript without an inline justification comment
- 100% docstring coverage on every function, method, class, and exported
  symbol added or modified — a real contract, not a restatement of the signature

### Step 3 — Wire Check (mandatory after implementation)
For every interactive element added this session:
  [ ] Event handler attached
  [ ] Handler fully implemented (not a stub)
  [ ] Handler wired to real data/state
  [ ] Success result is user-visible
  [ ] Failure path is user-visible

### Step 4 — Test Pyramid
Write tests at every applicable layer:
  Contract — structural invariants (DDL, RLS, auth, code-split)
  Unit     — pure functions
  Integration — real backend round-trips (if API changed)
  Component   — Playwright CT (if React component changed)
  E2E         — full browser journey (if user-facing flow changed)

### Step 5 — PR & CI Autonomy (mandatory; do not wait to be asked)
- Run the pre-PR review gate on the working diff and resolve every finding
  BEFORE opening the PR. Do not open a PR straight off the first commit
- Push the branch and open a PR as soon as the review gate is clean
- Use the PR template; fill every section
- After every push, watch the GitHub Actions run until terminal
- If CI fails: read the log, diagnose the root cause, fix it, commit, push
- If a reviewer leaves comments, address every comment in code or with a reply
  explaining why no change is required; resolve threads via GraphQL
  resolveReviewThread, not just inline replies
- Never request a re-review until CI is green and all comments are resolved

### Step 6 — Definition of Done
A story is DONE only when ALL are true:
  - Feature Contract written and approved (story status was Approved before
    work began)
  - Wire Check passes with zero failures
  - Test pyramid passes at every applicable layer
  - PR is open, CI is green, all reviewer comments resolved
  - Story file status is set to Done with QA Verdict filled in
  - SPEC.md updated
  - docs/architecture.md updated if new data model or API was added

## ARCHITECTURE

Archetype: [A / B / C / D — see Operating Standard §6.1]
Stack: [NOT YET LOCKED until docs/architecture.md answers the Stack Lock
Checklist (§6.2). Do not assume a framework — raise it.]
Active worktree: [./ or ../proj-wt/feature-name]

## PROJECT CONSTRAINTS

[Derived from docs/prd.md. Each one traces to a specific FR or NFR. Breaking one
is a story-level defect, not a style disagreement. Delete this heading if the
PRD does not yet exist — do not invent constraints.]

## QUALITY CONSTRAINTS

- TypeScript strict, zero `any` without justification
- All API responses use envelope: `{ data, error, meta }`
- No PII in logs, error messages, or URLs
- All user-facing text is i18n-keyed
- All interactive elements have aria labels

## BANNED PATTERNS

- `any` in TypeScript without an inline comment
- `console.log` in production paths (use structured logger)
- Secrets in code; only in env vars
- Raw SQL strings; use the ORM
- Committing .env files
- Synchronous file I/O in API handlers
- Marking a story Done before CI is green
- `--no-verify` or force push without explicit user permission
