# ADR-001 — Authentication platform

Status: accepted

Date: 2026-09-11

## Context

RaceMetrics requires individual accounts, private user-owned data, email/password authentication and social login through Google and Microsoft. Security, authorization and session management are core product requirements.

Building authentication primitives from scratch would increase the attack surface and create security-sensitive maintenance work that does not improve the project's main purpose, which is motorsport analytics.

## Decision

Use **Supabase Auth** as the identity foundation and **Postgres with Row Level Security (RLS)** for user-owned application data.

Supabase Auth currently supports password authentication and social login, and integrates its authenticated JWT identity with Postgres RLS for row-level authorization. Google and Microsoft/Azure providers are supported. citeturn0search0turn0search3turn0search9

## Security posture

The application will not treat the Supabase client as an authorization boundary. RLS policies remain the source of truth for user-owned database records.

Planned controls include:

- verified email accounts
- strong password policy
- password recovery without account enumeration
- OAuth with Google and Microsoft
- controlled redirect URLs
- session lifetime and inactivity controls appropriate to the deployment
- optional MFA after the core authentication flow is stable
- RLS policies for every user-owned table
- tests attempting cross-user reads and writes
- security notifications where supported

Supabase documents protections for password storage, recovery flows and session controls, including bcrypt password hashing, anti-enumeration behavior for password reset and configurable session lifetime controls. citeturn0search1turn0search2turn0search8

## Consequences

Positive:

- avoids implementing password hashing and identity protocols ourselves
- supports the selected login methods
- gives the project a real authorization layer through RLS
- keeps user data in Postgres
- allows security-focused tests to target concrete authorization policies

Trade-offs:

- the project becomes dependent on a hosted authentication/data platform
- provider configuration is required outside the repository
- production security still depends on correct RLS policies and configuration
- secrets and provider credentials must remain outside source control

## Non-goals

This decision does not mean every future backend feature must use Supabase Edge Functions. Application boundaries will be kept modular so that domain logic can be moved if requirements justify it.

## Source note

Provider capabilities and security behavior were checked against the current Supabase documentation before recording this decision.
