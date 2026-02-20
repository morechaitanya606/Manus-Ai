# 13. Security, API Versioning, and Environment Separation

## 13.1 Security Architecture

Implemented controls:

- Helmet for secure HTTP headers.
- Strict CORS allowlist with explicit origins.
- Input validation via Zod schemas.
- Request sanitization for body/query/params.
- Role middleware for admin access enforcement.
- HTTPS-only enforcement in sensitive environments.
- No stack trace exposure in production responses.

## 13.2 API Versioning

Preferred base path:

- `/api/v1`

Examples:

- `/api/v1/products`
- `/api/v1/orders`

Legacy `/api/*` routes are still available for backward compatibility.

## 13.3 Environment Separation

Environment-specific files:

- `.env.development`
- `.env.staging`
- `.env.production`

Loader behavior:

- Base `.env` is loaded first when present.
- Optional `.env.local` overrides base keys.
- Environment file (`.env.<NODE_ENV>`) is loaded next.
- Optional `.env.<NODE_ENV>.local` applies final overrides.
- Runtime config validation enforces safe defaults and secret requirements.

Security note:

- Do not hardcode production secrets in source control.
