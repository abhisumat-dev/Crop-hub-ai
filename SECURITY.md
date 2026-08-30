# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 1.x (current) | ✅ Yes |

## Reporting a Vulnerability

**Please do NOT file a public GitHub issue for security vulnerabilities.**

If you discover a security issue (e.g. exposed API keys, authentication bypass, SQL injection), please report it responsibly:

1. Email: [abhisumat.dev@gmail.com] — include "SECURITY" in the subject
2. Describe the vulnerability and steps to reproduce
3. We will acknowledge within 48 hours and aim to patch within 7 days

## Scope

- Admin PIN bypass or session cookie vulnerabilities
- Supabase RLS policy bypasses that allow unauthorised writes
- Server-side API key exposure
- XSS or CSRF vulnerabilities in the Next.js app

## Out of Scope

- Issues in third-party services (Supabase, OpenWeatherMap, Vercel)
- Theoretical vulnerabilities without a proof-of-concept
- Issues in development/local environments only
