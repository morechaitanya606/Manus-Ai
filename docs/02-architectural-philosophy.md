# 2. Architectural Philosophy

## Design Principles

1. Separation of Concerns
2. Domain-Driven Design (lightweight)
3. API-First Development
4. Stateless Backend
5. Horizontal Scalability
6. Security by Default

## Implementation Mapping

- Separation of concerns:
  - `controllers` for request orchestration
  - `models` for persistence schemas
  - `routes` for API contracts
  - `services` for integrations (storage, payment)
  - `middleware` for cross-cutting policies
- Lightweight DDD:
  - domain split by bounded contexts (`auth`, `products`, `orders`, `users`)
- API-first:
  - explicit route namespaces and documented contracts in `docs/openapi.yaml`
- Stateless backend:
  - JWT auth, no server-side session state
- Horizontal scalability:
  - rate limiting, pagination, environment-driven configuration
- Security by default:
  - Helmet, CORS policy, bcrypt, JWT, request validation, role-based access
