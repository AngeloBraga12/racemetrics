# Contributing to RaceMetrics

## Before changing code

1. Read `README.md`.
2. Read `docs/ARCHITECTURE.md`.
3. Check `docs/DESIGN.md` before changing visual patterns.
4. Check `docs/SECURITY.md` before touching authentication, user data or API boundaries.
5. Record meaningful architectural decisions in `docs/DEVELOPMENT_LOG.md`.

## Quality bar

A feature is not complete because it renders successfully.

It should have:

- explicit loading, empty and error states where relevant
- keyboard accessibility
- responsive behavior
- predictable TypeScript types
- tests for important behavior
- no secrets in source control
- no client-only authorization assumptions
- documentation when it changes architecture or product behavior

## Visual review

Avoid adding generic dashboard patterns just because they are convenient. New UI should reinforce the motorsport-analysis identity and have a clear information purpose.

## Commits

Prefer focused commits describing one meaningful change, for example:

- `feat: add driver comparison shell`
- `feat: implement account recovery flow`
- `test: cover cross-user authorization`
- `docs: record authentication architecture`
- `fix: handle empty race classification`
