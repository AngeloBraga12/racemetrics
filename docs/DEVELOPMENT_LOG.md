# RaceMetrics Development Log

This file records meaningful project decisions and implementation steps so the project remains auditable and reproducible.

## 2026-09-11 — Product foundation

### Decisions

- RaceMetrics is an authenticated motorsport analytics application.
- Each person has an individual account and private user-owned state.
- Email/password, Google and Microsoft sign-in are planned authentication methods.
- Main product areas are Dashboard, Explore, Compare and Analytics.
- Advanced features are planned incrementally rather than forced into the first release.
- Security is a release gate.
- The interface must not resemble a generic AI-generated dashboard.

### Implemented

- React + TypeScript + Vite foundation.
- Initial dashboard composition.
- Motorsport-inspired dark visual system.
- Responsive base layout.
- Product README.
- Architecture documentation.
- Security requirements.
- Roadmap.
- Design and anti-generic rules.

### Deliberately not implemented yet

- Real authentication.
- Real user data.
- Real motorsport API integration.
- Production database.
- OAuth credentials.
- Security-sensitive infrastructure.

These are intentionally deferred until the application boundaries and test strategy are established.

## Documentation rule

Every substantial architectural, security, product or UX decision should be added here before or together with the implementation that depends on it.
