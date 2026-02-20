const mongoose = require('mongoose');
const { getPagination } = require('../../../utils/query');
const { createPaymentIntent } = require('../../../services/paymentService');
const { orderRepository } = require('../repositories/orderRepository');
const { userRepository } = require('../../users/repositories/userRepository');
const { cartRepository } = require('../repositories/cartRepository');
const { reserveStock } = require('../../catalog/services/inventoryService');
const { productRepository } = require('../../catalog/repositories/productRepository');
const { ROLES } = require('../../users/constants/roles');
const { addressRepository } = require('../../users/repositories/addressRepository');
const { invalidateCatalogReadCache } = require('../../../services/cacheService');
const { publishOrderCreatedEvent } = require('../../../services/orderEventService');

const ORDER_STATUS_DB = ['PLACED', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const PAYMENT_STATUS_DB = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

const isTransactionUnsupportedError = (error) => {
  const message = error?.message || '';
  return (
    message.includes('Transaction numbers are only allowed') ||
    message.toLowerCase().includes('replica set') ||
    message.toLowerCase().includes('transactions are not supported')
  );
};

const normalizeOrderStatusToDb = (value) => {
  if (!value) return null;

  const lowered = String(value).trim().toLowerCase();
  const mapped = lowered === 'processing' ? 'paid' : lowered;
  const status = mapped.toUpperCase();

  return ORDER_STATUS_DB.includes(status) ? status : null;
};

const normalizePaymentStatusToDb = (value) => {
  if (!value) return null;
  const status = String(value).trim().toUpperCase();
  return PAYMENT_STATUS_DB.includes(status) ? status : null;
};

const toLegacyOrderStatus = (value) => String(value || '').trim().toLowerCase();
const toLegacyPaymentStatus = (value) => String(value || '').trim().toLowerCase();

const resolveTaxRate = () => {
  const configured = Number(process.env.ORDER_TAX_RATE || 0);
  if (Number.isNaN(configured) || configured < 0) return 0;
  return configured;
};

const roundCurrency = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const toIdKey = (value) => String(value);

const buildProductPriceMap = (products = []) =>
  new Map(products.map((product) => [toIdKey(product._id), product]));

const toOrderResponse = (orderDoc) => {
  const order = typeof orderDoc?.toObject === 'function' ? orderDoc.toObject() : orderDoc;
  if (!order) return order;

  const status = order.status || 'PLACED';
  const paymentStatus = order.payment?.status || 'PENDING';
  const paymentProvider = order.payment?.provider || 'mock';
  const paymentReference = order.payment?.transactionId || '';
  const products = (order.items || []).map((item) => ({
    ...item,
    unitPrice: item.price
  }));

  return {
    ...order,
    products,
    orderStatus: toLegacyOrderStatus(status),
    paymentStatus: toLegacyPaymentStatus(paymentStatus),
    paymentProvider,
    paymentReference
  };
};

const validateAndBuildOrderItems = async (products, session = null) => {
  const normalizedInput = products.map((item) => {
    const quantity = Number(item.quantity) || 1;
    if (quantity < 1) {
      const error = new Error('Quantity must be at least 1');
      error.statusCode = 400;
      throw error;
    }
    return {
      ...item,
      quantity
    };
  });

  const uniqueProductIds = [...new Set(normalizedInput.map((item) => toIdKey(item.productId)))];
  const productsById = buildProductPriceMap(
    await productRepository.findByIds(uniqueProductIds, {
      session,
      projection: '_id title price stock',
      lean: true
    })
  );

  const items = [];

  for (const item of normalizedInput) {
    const product = productsById.get(toIdKey(item.productId));

    if (!product) {
      const error = new Error(`Product not found: ${item.productId}`);
      error.statusCode = 404;
      throw error;
    }

    if (Number(product.stock) < quantity) {
      const error = new Error(`Insufficient stock for ${product.title}`);
      error.statusCode = 409;
      throw error;
    }

    const priceFromInput = Number(item.priceSnapshot);
    const price =
      Number.isFinite(priceFromInput) && priceFromInput >= 0
        ? priceFromInput
        : Number(product.price);

    items.push({
      productId: product._id,
      title: product.title,
      price,
      quantity: item.quantity,
      selectedSize: item.selectedSize || '',
      selectedColor: item.selectedColor || '',
      customization: {
        customText: item.customization?.customText || '',
        customColor: item.customization?.customColor || '',
        customImage: item.customization?.customImage || ''
      }
    });
  }

  const subtotal = roundCurrency(
    items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0)
  );
  const tax = roundCurrency(subtotal * resolveTaxRate());
  const totalAmount = roundCurrency(subtotal + tax);

  return {
    items,
    subtotal,
    tax,
    totalAmount
  };
};

const reduceStockForOrderItems = async (items, session = null) => {
  for (const item of items) {
    await reserveStock({
      productId: item.productId,
      quantity: item.quantity,
      session
    });
  }
};

const resolveShippingAddressId = async ({
  userId,
  shippingAddress,
  session = null,
  user = null
}) => {
  const name = user?.name || '';

  if (shippingAddress && String(shippingAddress).trim()) {
    const saved = await addressRepository.upsertDefaultFromString(
      userId,
      String(shippingAddress).trim(),
      { session, name }
    );
    return saved?._id || null;
  }

  const existingDefault = await addressRepository.findDefaultByUserId(userId, {
    session,
    lean: true
  });
  return existingDefault?._id || null;
};

const mapCartItemsToProductsInput = (items = []) =>
  items.map((item) => ({
    productId: String(item.productId),
    quantity: item.quantity,
    priceSnapshot: item.priceSnapshot,
    selectedSize: item.selectedSize || '',
    selectedColor: item.selectedColor || '',
    customization: {
      customText: item.customization?.customText || '',
      customColor: item.customization?.customColor || '',
      customImage: item.customization?.customImage || ''
    }
  }));

const buildProductsInputForWorkflow = async ({ userId, body, session, source }) => {
  if (source === 'cart') {
    const cart = await cartRepository.findByUserId(userId, { session, lean: true });

    if (!cart || !Array.isArray(cart.items) || !cart.items.length) {
      const error = new Error('Cart is empty');
      error.statusCode = 400;
      throw error;
    }

    return mapCartItemsToProductsInput(cart.items);
  }

  const products = Array.isArray(body.products) ? body.products : [];

  if (!products.length) {
    const error = new Error('At least one product is required to place an order');
    error.statusCode = 400;
    throw error;
  }

  return products;
};

const executeCreateOrderWorkflow = async ({
  userId,
  body,
  session = null,
  source = 'products'
}) => {
  const paymentProvider = body.paymentProvider || 'mock';
  const userReadOptions = session
    ? {
        session,
        projection: '_id name email role isActive isDeleted profile address tokenVersion',
        lean: true
      }
    : {
        projection: '_id name email role isActive isDeleted profile address tokenVersion',
        lean: true
      };
  const userWriteOptions = session ? { session } : {};
  const user = await userRepository.findById(userId, userReadOptions);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === ROLES.ADMIN) {
    const error = new Error('Admins are not allowed to place customer orders');
    error.statusCode = 403;
    throw error;
  }

  const shippingAddressId = await resolveShippingAddressId({
    userId,
    shippingAddress: body.shippingAddress,
    session,
    user
  });

  // 1) Validate cart/products payload.
  const productsInput = await buildProductsInputForWorkflow({
    userId,
    body,
    session,
    source
  });

  // 2) Validate stock and create immutable order snapshot.
  const { items, subtotal, tax, totalAmount } = await validateAndBuildOrderItems(
    productsInput,
    session
  );

  // 3) Create order.
  const [order] = await orderRepository.create(
    {
      userId,
      items,
      subtotal,
      tax,
      totalAmount,
      status: 'PLACED',
      shippingAddressId,
      payment: {
        provider: paymentProvider,
        transactionId: '',
        status: 'PENDING'
      }
    },
    session
  );

  // 4) Reduce stock.
  await reduceStockForOrderItems(items, session);

  // 5) Update user order history and clear cart if checkout flow.
  await userRepository.pushOrderHistory(userId, order._id, userWriteOptions);
  if (source === 'cart') {
    await cartRepository.clearItems(userId, { session });
  }

  return { order, user };
};

const requireAtomicTransactions = () => {
  if (process.env.ENABLE_DB_TRANSACTIONS === 'false') {
    const error = new Error(
      'Atomic order placement requires MongoDB transactions. Set ENABLE_DB_TRANSACTIONS=true.'
    );
    error.statusCode = 503;
    throw error;
  }
};

const createOrder = async ({ userId, body, source = 'products' }) => {
  requireAtomicTransactions();

  let session;
  let workflowResult;

  try {
    session = await mongoose.startSession();

    await session.withTransaction(
      async () => {
        workflowResult = await executeCreateOrderWorkflow({
          userId,
          body,
          session,
          source
        });
      },
      {
        readConcern: { level: 'snapshot' },
        writeConcern: { w: 'majority' }
      }
    );
  } catch (error) {
    if (isTransactionUnsupportedError(error)) {
      const txError = new Error(
        'Order placement requires MongoDB replica-set transactions. Configure MongoDB for transactions.'
      );
      txError.statusCode = 503;
      throw txError;
    }

    throw error;
  } finally {
    if (session) {
      await session.endSession();
    }
  }

  const order = workflowResult?.order;
  const user = workflowResult?.user;
  const response = toOrderResponse(order);

  await invalidateCatalogReadCache();
  await publishOrderCreatedEvent({ order: response, user });

  return response;
};

const checkoutCartToOrder = async ({ userId, body = {} }) => {
  const user = await userRepository.findById(userId, {
    projection: '_id name cart isActive isDeleted',
    lean: true
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  let cart = await cartRepository.findByUserId(userId);

  if (!cart && Array.isArray(user.cart) && user.cart.length) {
    cart = await cartRepository.findOrCreateByUserId(userId);
    const uniqueProductIds = [...new Set(user.cart.map((item) => toIdKey(item.product)))];
    const productsById = buildProductPriceMap(
      await productRepository.findByIds(uniqueProductIds, {
        projection: '_id price',
        lean: true
      })
    );

    for (const item of user.cart) {
      const product = productsById.get(toIdKey(item.product));
      if (!product) {
        continue;
      }

      cart.items.push({
        productId: item.product,
        quantity: Number(item.quantity) || 1,
        priceSnapshot: Number(product.price) || 0,
        selectedSize: item.selectedSize || '',
        selectedColor: item.selectedColor || '',
        customization: {
          customText: item.customization?.customText || '',
          customColor: item.customization?.customColor || '',
          customImage: item.customization?.customImage || ''
        }
      });
    }

    await cartRepository.save(cart);
    await userRepository.clearLegacyEmbeddedCart(userId);
  }

  return createOrder({
    userId,
    source: 'cart',
    body: {
      shippingAddress: body.shippingAddress || '',
      paymentProvider: body.paymentProvider || 'mock'
    }
  });
};

const createOrderPaymentIntent = async ({ amount, userId }) => {
  if (!amount || Number(amount) <= 0) {
    const error = new Error('Valid amount is required');
    error.statusCode = 400;
    throw error;
  }

  return createPaymentIntent({
    amount: Number(amount),
    metadata: { userId: String(userId) }
  });
};

const markOrderPaid = async ({ orderId, actor, paymentReference = '' }) => {
  const order = await orderRepository.findById(orderId);

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  if (String(order.userId) !== String(actor._id) && actor.role !== ROLES.ADMIN) {
    const error = new Error('Not authorized to update this order');
    error.statusCode = 403;
    throw error;
  }

  order.payment.status = 'PAID';
  order.payment.transactionId = paymentReference || `manual_${Date.now()}`;
  if (order.status === 'PLACED') {
    order.status = 'PAID';
  }

  const saved = await orderRepository.save(order);
  return toOrderResponse(saved);
};

const getMyOrders = async (userId, queryParams = {}) => {
  const pagination = getPagination(queryParams);

  const [orders, total] = await Promise.all([
    orderRepository.findByUserIdPaginated(userId, {
      skip: pagination.skip,
      limit: pagination.limit
    }),
    orderRepository.countByUserId(userId)
  ]);

  return {
    data: orders.map(toOrderResponse),
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit)
    }
  };
};

const getAllOrders = async (queryParams) => {
  const pagination = getPagination(queryParams);

  const [orders, total] = await Promise.all([
    orderRepository.findAllPaginated({
      skip: pagination.skip,
      limit: pagination.limit
    }),
    orderRepository.countAll()
  ]);

  return {
    data: orders.map(toOrderResponse),
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit)
    }
  };
};

const updateOrderStatus = async ({ orderId, orderStatus, paymentStatus }) => {
  const order = await orderRepository.findById(orderId);

  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }

  const normalizedOrderStatus = normalizeOrderStatusToDb(orderStatus);
  const normalizedPaymentStatus = normalizePaymentStatusToDb(paymentStatus);

  if (orderStatus && !normalizedOrderStatus) {
    const error = new Error('Invalid order status');
    error.statusCode = 400;
    throw error;
  }

  if (paymentStatus && !normalizedPaymentStatus) {
    const error = new Error('Invalid payment status');
    error.statusCode = 400;
    throw error;
  }

  if (normalizedOrderStatus) {
    order.status = normalizedOrderStatus;
  }

  if (normalizedPaymentStatus) {
    order.payment.status = normalizedPaymentStatus;
  }

  const saved = await orderRepository.save(order);
  return toOrderResponse(saved);
};

module.exports = {
  createOrder,
  checkoutCartToOrder,
  createOrderPaymentIntent,
  markOrderPaid,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  toOrderResponse,
  normalizeOrderStatusToDb,
  normalizePaymentStatusToDb
};
