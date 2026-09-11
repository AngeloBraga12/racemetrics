# RaceMetrics Quality Gates

These gates apply to every meaningful feature and release.

## Product

- The feature must have a clear user purpose.
- Domain terminology must belong to motorsport or data analysis.
- No decorative UI is added without a functional reason.
- Placeholder data must be visibly identified until replaced by verified source data.

## Visual

- No generic AI/SaaS dashboard patterns.
- No excessive gradients, glassmorphism, oversized rounded cards, or decorative blobs used as substitutes for hierarchy.
- Typography, spacing, density and alignment must be intentional.
- Motorsport identity should come from information structure, typography, status indicators and data presentation, not from random racing imagery.
- Mobile layouts must be designed, not merely compressed desktop layouts.

## Engineering

- TypeScript strictness is preserved.
- Domain data is separated from presentation components.
- Loading, empty and error states are explicit.
- New shared UI belongs in reusable components.
- Sensitive configuration never enters source control.

## Security

- Authentication is not treated as authorization.
- User-owned data requires server-side authorization.
- RLS policies protect private database records.
- Cross-user access is tested explicitly.
- Authentication and recovery flows avoid unnecessary account enumeration.
- OAuth redirect origins are allowlisted.

## Accessibility

- Keyboard navigation works for interactive flows.
- Focus states remain visible.
- Form controls have accessible labels.
- Color is never the only carrier of meaning.
- Charts provide accessible summaries or equivalent tabular information.

## Verification

Before release, run the available typecheck, build, lint and automated tests. Critical authentication and authorization paths require dedicated security tests.
