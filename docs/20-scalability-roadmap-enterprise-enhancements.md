# 20. Scalability Roadmap and Future Enterprise Enhancements

## 15. Scalability Roadmap

Phase 1:

- Monolith MERN

Phase 2:

- Service separation:
  - Auth Service
  - Product Service
  - Order Service

Phase 3:

- Message Queue (RabbitMQ)

Implementation note:

- Current codebase runs as a modular monolith with domain modules.
- Async processing is available today via BullMQ/Redis as a transitional step.
- RabbitMQ is the target broker for later service-split deployments.

## 16. Future Enterprise Enhancements

- Payment Gateway
- Inventory Service
- Recommendation Engine
- Notification Service
- Mobile App
- Admin Analytics

Execution strategy:

- Introduce each enhancement behind feature flags.
- Keep API contracts versioned under `/api/v1` and evolve with `/api/v2` when needed.
- Use event-driven contracts for cross-service communication after service split.
