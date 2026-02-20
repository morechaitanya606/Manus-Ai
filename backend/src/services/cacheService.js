const { getRedisClient, isRedisEnabled } = require('../config/redis');

const CACHE_PREFIX = process.env.REDIS_PREFIX || 'fashion';

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getCatalogListTtl = () =>
  toNumber(process.env.REDIS_CATALOG_LIST_TTL_SECONDS, 120);

const getCatalogProductTtl = () =>
  toNumber(process.env.REDIS_CATALOG_PRODUCT_TTL_SECONDS, 300);

const getCatalogCategoriesTtl = () =>
  toNumber(process.env.REDIS_CATALOG_CATEGORIES_TTL_SECONDS, 600);

const buildCacheKey = (...parts) => `${CACHE_PREFIX}:${parts.join(':')}`;

const stableSerialize = (value) => {
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`)
      .join(',')}}`;
  }

  return JSON.stringify(value ?? null);
};

const getCatalogListCacheKey = (query = {}) =>
  buildCacheKey('catalog', 'list', stableSerialize(query));

const getCatalogProductCacheKey = (productId) =>
  buildCacheKey('catalog', 'product', String(productId));

const getCatalogCategoriesCacheKey = () =>
  buildCacheKey('catalog', 'categories');

const withRedis = async (operation, fallback) => {
  if (!isRedisEnabled()) {
    return fallback;
  }

  const client = await getRedisClient();
  if (!client) {
    return fallback;
  }

  try {
    return await operation(client);
  } catch (error) {
    console.warn(`Redis operation failed: ${error.message}`);
    return fallback;
  }
};

const getCachedJson = async (cacheKey) =>
  withRedis(async (client) => {
    const payload = await client.get(cacheKey);
    if (!payload) return null;

    try {
      return JSON.parse(payload);
    } catch (error) {
      await client.del(cacheKey);
      return null;
    }
  }, null);

const setCachedJson = async (cacheKey, value, ttlSeconds) =>
  withRedis(async (client) => {
    const ttl = Math.max(1, Number(ttlSeconds) || 60);
    await client.set(cacheKey, JSON.stringify(value), { EX: ttl });
    return true;
  }, false);

const deleteByPattern = async (pattern) =>
  withRedis(async (client) => {
    const batch = [];
    let deleted = 0;

    for await (const key of client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
      batch.push(key);

      if (batch.length >= 100) {
        deleted += await client.del(...batch);
        batch.length = 0;
      }
    }

    if (batch.length) {
      deleted += await client.del(...batch);
    }

    return deleted;
  }, 0);

const invalidateCatalogReadCache = async () =>
  deleteByPattern(buildCacheKey('catalog', '*'));

module.exports = {
  getCatalogListTtl,
  getCatalogProductTtl,
  getCatalogCategoriesTtl,
  getCatalogListCacheKey,
  getCatalogProductCacheKey,
  getCatalogCategoriesCacheKey,
  getCachedJson,
  setCachedJson,
  invalidateCatalogReadCache,
  stableSerialize
};
