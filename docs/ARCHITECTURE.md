# RaceMetrics Architecture

## Product boundary

RaceMetrics is an authenticated motorsport analytics application. Public repository visibility does not imply public application access.

The application separates three concerns:

1. Identity and access: account creation, password authentication, OAuth, sessions, recovery and verification.
2. Motorsport data: drivers, teams, races, circuits, seasons, classifications and derived metrics.
3. User-owned state: favorites, saved comparisons, preferences and future personal workspaces.

## Frontend direction

React + TypeScript + Vite is the presentation layer. UI components must not contain API-specific business rules or authentication secrets.

Planned structure:

```text
src/
  app/           application shell, routes and providers
  components/    reusable interface components
  features/      domain-oriented screens and interactions
  data/          API clients, schemas and data adapters
  lib/           shared utilities
  types/         domain types
  styles/        design tokens and global styles
```

The current repository is still in the visual foundation phase, so files are intentionally being introduced incrementally rather than generating a large empty architecture for decoration.

## Backend boundary

Authentication and authorization will live on trusted server-side infrastructure. The browser is never considered a security boundary.

Every protected resource must be authorized against the authenticated user's identity. Ownership checks must be performed server-side, even when the frontend already hides the corresponding UI.

## Data flow

```text
Official / trusted motorsport source
            |
            v
      Data ingestion
            |
            v
   Validation + normalization
            |
            v
       Domain model
        /         \
       /           \
 Dashboard        Analytics
                    |
                    v
              Derived insights
```

User state follows a separate path:

```text
Authenticated user
        |
        v
 Authorization layer
        |
        v
 User-owned records
```

## Design rule

RaceMetrics must not look like a generic AI-generated dashboard. Visual decisions should come from motorsport information architecture: timing hierarchy, race-control language, classification tables, sector/lap concepts, disciplined typography and purposeful density.

No decorative component should exist only because a template normally has one.
