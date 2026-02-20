# 19. Platform Operations Architecture

## 11. Data Flow Diagram (Level 1)

```text
Customer -> Frontend -> Backend -> Database
Admin    -> Frontend -> Backend -> Database
```

## 12. Deployment Architecture

```text
Browser
  |
Vercel (React)
  |
Render (Node API)
  |
MongoDB Atlas
```

Implementation mapping:

- Frontend: `frontend/` (Vite React app), deployable on Vercel.
- Backend API: `backend/server/server.js`, deployable on Render.
- Database: `MONGO_URI` points to managed MongoDB Atlas cluster.
- Optional cache/queue: Redis (Render service or managed provider).

## 13. Observability

- Morgan logging (request logs)
- Central error middleware
- Structured JSON logs (Winston)
- Future: Prometheus + Grafana

Current implementation mapping:

- Request logging: Morgan in `backend/server/app.js`.
- Error handling: central middleware in `backend/src/middleware/errorMiddleware.js`.
- Structured logs: Winston config in `backend/src/config/logger.js`.
- Health endpoints:
  - `GET /api/v1/health/live`
  - `GET /api/v1/health/ready`
  - `GET /api/v1/health`

## 14. DevOps Strategy

- GitHub version control
- Environment configs
- CI/CD pipeline
- Build automation

Current implementation mapping:

- Environment separation:
  - `backend/.env.development`
  - `backend/.env.staging`
  - `backend/.env.production`
- CI/CD workflow:
  - `.github/workflows/ci-cd-render.yml`
- Build automation:
  - root scripts in `package.json`
  - backend/frontend build scripts in each workspace
