const {
  getCatalogListCacheKey,
  getCatalogProductCacheKey,
  getCatalogCategoriesCacheKey,
  getCachedJson,
  setCachedJson,
  getCatalogListTtl,
  getCatalogProductTtl,
  getCatalogCategoriesTtl
} = require('../services/cacheService');

const createCacheMiddleware = ({ cacheKeyBuilder, ttlSeconds }) => async (req, res, next) => {
  if (req.method !== 'GET') {
    return next();
  }

  const cacheKey = cacheKeyBuilder(req);
  const cached = await getCachedJson(cacheKey);

  if (cached !== null) {
    res.set('X-Cache', 'HIT');
    return res.json(cached);
  }

  const json = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      setCachedJson(cacheKey, body, ttlSeconds()).catch(() => {});
      res.set('X-Cache', 'MISS');
    }
    return json(body);
  };

  return next();
};

const catalogListCache = createCacheMiddleware({
  cacheKeyBuilder: (req) => getCatalogListCacheKey(req.query || {}),
  ttlSeconds: getCatalogListTtl
});

const catalogProductCache = createCacheMiddleware({
  cacheKeyBuilder: (req) => getCatalogProductCacheKey(req.params.id),
  ttlSeconds: getCatalogProductTtl
});

const catalogCategoriesCache = createCacheMiddleware({
  cacheKeyBuilder: () => getCatalogCategoriesCacheKey(),
  ttlSeconds: getCatalogCategoriesTtl
});

module.exports = {
  catalogListCache,
  catalogProductCache,
  catalogCategoriesCache
};
