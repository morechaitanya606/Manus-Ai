# 9. Database Scalability

## 9.1 MongoDB Setup

Use:

- Replica set (high availability)
- Read preference controls
- Index optimization

For large scale:

- Sharding by `userId` or `orderId`/`orderNumber`

Implemented config knobs:

- `MONGO_REPLICA_SET`
- `MONGO_READ_PREFERENCE`
- `MONGO_RETRY_READS`
- `MONGO_RETRY_WRITES`
- `MONGO_SYNC_INDEXES`

Container topology note:

- `docker-compose.yml` and `docker-compose.scale.yml` run MongoDB with `--replSet rs0`
- `mongodb-rs-init` sidecar initializes the replica set for transaction support

## 9.2 Caching Layer (Redis)

Products are read-heavy. Redis is added as a cache-aside layer:

```text
Client
  -> API
  -> Check Redis
  -> Cache miss -> MongoDB
  -> Store in Redis
```

Cached endpoints:

- Product listing (`GET /api/products`)
- Product details (`GET /api/products/:id`)
- Category listing (`GET /api/products/categories`)

Operational rules:

- Never cache order endpoints
- Invalidate catalog cache after product/stock writes
- Cache status surfaced via response header: `X-Cache: HIT|MISS`

Environment knobs:

- `REDIS_ENABLED`
- `REDIS_REQUIRED`
- `REDIS_URL`
- `REDIS_PREFIX`
- `REDIS_CATALOG_LIST_TTL_SECONDS`
- `REDIS_CATALOG_PRODUCT_TTL_SECONDS`
- `REDIS_CATALOG_CATEGORIES_TTL_SECONDS`
