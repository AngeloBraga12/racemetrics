# Development Policy

## 2026-09-11

The project owner authorized autonomous execution of work judged necessary while the available plan/tooling permits it.

Working principles:

1. Continue implementation without requesting confirmation for every routine engineering step.
2. Document meaningful architectural, product and security decisions.
3. Prefer small, reversible changes over opaque rewrites.
4. Do not introduce fake integrations, fake security or fabricated official motorsport data.
5. Keep credentials, provider secrets and deployment secrets outside source control.
6. Treat security, accessibility, performance and maintainability as release requirements.
7. Preserve a distinctive RaceMetrics identity and reject generic AI-generated visual patterns.
8. When external infrastructure requires user-owned credentials or dashboard configuration, document the exact prerequisite instead of fabricating access.

## Product direction

RaceMetrics is an authenticated motorsport data analysis platform. The main navigation is Dashboard, Explore, Compare and Analytics. User-owned features will include preferences, favorites and saved comparisons.

Authentication is planned around Supabase Auth with Google and Microsoft OAuth plus email/password, with PostgreSQL Row Level Security protecting private records.
