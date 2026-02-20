import api from './client';

const createIdempotencyKey = (prefix) =>
  `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

const withIdempotency = (key) => ({
  headers: {
    'Idempotency-Key': key
  }
});

export const authApi = {
  signup: (payload) => api.post('/auth/signup', payload),
  login: (payload) => api.post('/auth/login', payload),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  refreshFuture: () => api.post('/auth/refresh')
};

export const productApi = {
  list: (params) => api.get('/products', { params }),
  listCategories: () => api.get('/products/categories'),
  getById: (id) => api.get(`/products/${id}`),
  create: (formData) =>
    api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  update: (id, formData) =>
    api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  updateStock: (id, stock) => api.patch(`/products/${id}/stock`, { stock }),
  remove: (id) => api.delete(`/products/${id}`)
};

export const userApi = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (payload) => api.put('/users/me', payload),
  getUsers: (params) => api.get('/users', { params }),
  addWishlist: (productId) => api.post('/users/wishlist', { productId }),
  removeWishlist: (productId) => api.delete(`/users/wishlist/${productId}`),
  addCart: (payload) => api.post('/users/cart', payload),
  updateCart: (itemId, quantity) => api.put(`/users/cart/${itemId}`, { quantity }),
  removeCart: (itemId) => api.delete(`/users/cart/${itemId}`),
  clearCart: () => api.delete('/users/cart')
};

export const orderApi = {
  create: (payload, idempotencyKey = createIdempotencyKey('order_create')) =>
    api.post('/orders', payload, withIdempotency(idempotencyKey)),
  checkoutCart: (payload, idempotencyKey = createIdempotencyKey('order_checkout')) =>
    api.post('/orders/checkout', payload, withIdempotency(idempotencyKey)),
  myOrders: (params) => api.get('/orders/my', { params }),
  allOrders: (params) => api.get('/orders', { params }),
  paymentIntent: (amount, idempotencyKey = createIdempotencyKey('payment_intent')) =>
    api.post('/orders/payment-intent', { amount }, withIdempotency(idempotencyKey)),
  markPaid: (orderId, paymentReference) =>
    api.patch(`/orders/${orderId}/pay`, { paymentReference }),
  updateStatus: (orderId, payload) => api.patch(`/orders/${orderId}/status`, payload)
};
