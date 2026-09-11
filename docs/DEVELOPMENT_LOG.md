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

## 2026-09-11 — Authentication UX foundation

### Implemented

- Supabase browser client using only public runtime configuration.
- Persistent session restoration and auth-state subscription.
- Protected application shell: unauthenticated users do not receive the dashboard.
- Email/password sign-in.
- Account creation with display-name metadata.
- Google OAuth entry point.
- Microsoft/Azure OAuth entry point.
- Password recovery request flow.
- Password recovery callback state and password update UI.
- Generic client-facing authentication errors to reduce unnecessary information disclosure.
- Explicit setup state when Supabase environment variables are absent.
- Account identity display and sign-out control in the dashboard.
- Responsive authentication interface aligned with RaceMetrics visual rules.
- No service-role/admin credential exposed to browser code.

### Security notes

- OAuth redirects use the current application origin and must still be allowlisted in the Supabase project configuration.
- The frontend session gate is a UX boundary, not the authorization boundary. Database RLS remains authoritative for private data.
- Real provider credentials are intentionally not committed.
- Password recovery responses are intentionally phrased without confirming whether an account exists.

### Deliberately not implemented yet

- Real authentication provider credentials/configuration in the user's Supabase project.
- Real motorsport API integration.
- Production database deployment/migration execution.
- Automated browser security tests.
- MFA enrollment UX.

These require external project configuration or a later security-testing stage and must not be faked.

## Documentation rule

Every substantial architectural, security, product or UX decision should be added here before or together with the implementation that depends on it.
