# 14. CI/CD, Deployment Architecture, and Performance Optimization

## 14.1 CI/CD Pipeline

Automated pipeline is implemented in:

- `.github/workflows/ci-cd-render.yml`

Flow:

1. Push/PR to GitHub (`main`/`master`).
2. Build + test job:
   - install dependencies (root/backend/frontend)
   - backend syntax checks
   - backend bootstrap smoke test
   - frontend production build
   - compose config validation
3. Deploy job:
   - triggers Render deploy hooks after successful build/test

Supported deploy hook secrets:

- `RENDER_DEPLOY_HOOK_URL`
- `RENDER_BACKEND_DEPLOY_HOOK_URL`
- `RENDER_FRONTEND_DEPLOY_HOOK_URL`
- `RENDER_WORKER_DEPLOY_HOOK_URL`

## 14.2 Deployment Architecture

Reference artifacts:

- `docker-compose.scale.yml`
- `infra/nginx/load-balancer.conf`
- `backend/ecosystem.config.js`
- `render.yaml`

Target topology:

```text
Users
  |
Cloud Load Balancer / NGINX
  |
Node API Instances (stateless, horizontal scale)
  |
Redis (cache + queue + distributed rate limit)
  |
MongoDB Cluster (replica set / managed cluster)
```

Render blueprint (`render.yaml`) includes:

- backend API service
- order notification worker
- frontend static service
- Redis service

MongoDB is expected as an external managed cluster (`MONGO_URI` injected by env var).

## 14.3 Performance Optimization

Implemented optimizations:

- Lean read queries on hot endpoints:
  - product, category, order listing
  - user/profile/admin list reads
  - cart/profile read paths
- Field projection to reduce payload and query cost:
  - selective projections in repository layer
- N+1 reduction:
  - batch product fetch by IDs for:
    - order item validation
    - legacy cart migration during checkout/cart/profile
- Index-heavy fields:
  - product filter/sort indexes (category/type/price, size, color, title)
  - order timeline/payment status indexes
- Aggregation caution:
  - hot list endpoints continue to use indexed `find + sort + pagination`
  - avoid expensive ad-hoc aggregation in request path unless required and index-backed
