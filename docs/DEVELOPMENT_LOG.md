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
- Supabase client boundary using environment variables only.
- Typed authentication service for password auth, Google, Microsoft/Azure, recovery and sign-out.
- Initial private user-data schema with RLS for profiles, preferences, favorites and saved comparisons.
- New-user profile trigger.
- `.env.example` with required public frontend configuration.

### Security notes

- The browser receives only Supabase's public/publishable key. A service-role key must never be shipped to the frontend.
- Row Level Security is treated as the authorization boundary for user-owned database records.
- OAuth redirect destinations are constrained to application-owned auth routes in code. Provider-side allowlists still have to be configured in Supabase.
- No production authentication is claimed until a real Supabase project is connected and the security matrix passes.

### External configuration still required

The remaining infrastructure step is project-owned Supabase configuration: project URL, publishable key, email provider behavior, and Google/Microsoft OAuth provider setup. These values must come from the project's Supabase dashboard and must not be fabricated or committed.

## Documentation rule

Every substantial architectural, security, product or UX decision should be added here before or together with the implementation that depends on it.
