# RaceMetrics Security Plan

Security is a release requirement, not a post-launch cleanup task.

## Identity

Planned authentication methods:

- Email + password
- Google OAuth / OpenID Connect
- Microsoft identity platform
- Email verification
- Password recovery with short-lived, single-use tokens

Passwords must only be stored as strong password hashes. OAuth credentials and provider tokens must never be exposed to the client application beyond what the provider flow requires.

## Sessions

The production authentication design must use secure session handling with:

- HttpOnly cookies where applicable
- Secure cookies in production
- Appropriate SameSite policy
- Session expiration
- Server-side revocation
- Logout invalidation
- Protection against token reuse

## Authorization

Authentication answers "who is this?". Authorization answers "what can this identity access?".

Every private endpoint must enforce ownership or an explicit permission on the server. Client-side route guards are UX controls, not security controls.

## Input and request protection

Before production release, the application must address:

- brute-force and credential-stuffing resistance
- rate limiting
- CSRF where applicable
- XSS
- injection attacks
- strict input validation
- safe error handling
- CORS configuration
- security headers
- abuse of account recovery flows
- enumeration of registered accounts

## User data isolation

All user-owned entities must carry an ownership relationship and server-side authorization check.

Examples:

- favorites
- saved comparisons
- preferences
- account settings
- session records

A user must never be able to read or modify another user's records by changing an identifier in a request.

## Security testing gates

Before a feature is considered complete, test at least:

1. unauthenticated access to protected routes
2. authenticated access with an expired session
3. cross-user resource access attempts
4. invalid and expired recovery tokens
5. repeated login failures
6. malformed request payloads
7. privilege escalation attempts
8. logout followed by reuse of the previous session
9. OAuth callback validation
10. sensitive information leakage in errors and logs

Security findings must be documented and resolved before release rather than hidden behind a future milestone.
