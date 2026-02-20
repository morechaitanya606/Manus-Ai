# 3. High Level Architecture

## Pattern Used

- Three-tier architecture
- REST API
- MVC backend
- SPA frontend

## Tier Flow

```text
Client (React SPA)
        |
APIGateway(Express)
        |
Business Services Layer
        |
PersistenceLayer(MongoDB)
```

## Logical Topology

- Presentation tier:
  - React SPA (`frontend/`)
- Application tier:
  - Express API gateway (`backend/server/app.js`)
  - Domain modules + shared cross-cutting layer (`backend/server/modules`, `backend/server/shared`)
  - Existing business/domain implementation (`backend/src/modules`)
- Data tier:
  - MongoDB with Mongoose models

## Current Deployment Style

- Modular monolith runtime:
  - single deployable API service with clear domain boundaries
- Evolution path:
  - split high-volume domains (catalog, checkout, order orchestration) into microservices when needed

## Cross-Cutting Layers

- Security middleware (`helmet`, JWT auth, RBAC)
- Request governance (validation, rate limiting, request IDs)
- Integration services (payment and storage abstraction)
