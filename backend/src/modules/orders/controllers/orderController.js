const asyncHandler = require('express-async-handler');
const {
  createOrder: createOrderService,
  checkoutCartToOrder: checkoutCartToOrderService,
  createOrderPaymentIntent: createOrderPaymentIntentService,
  markOrderPaid: markOrderPaidService,
  getMyOrders: getMyOrdersService,
  getAllOrders: getAllOrdersService,
  updateOrderStatus: updateOrderStatusService
} = require('../services/orderService');
const { logAuditEvent } = require('../../audit/services/auditService');

const mapServiceErrorToResponse = (res, error) => {
  if (error?.statusCode) {
    res.status(error.statusCode);
  }
};

const createOrder = asyncHandler(async (req, res) => {
  try {
    const order = await createOrderService({
      userId: req.user._id,
      body: req.body
    });

    await logAuditEvent({
      req,
      action: 'order.create',
      resourceType: 'order',
      resourceId: order?._id,
      metadata: { totalAmount: order?.totalAmount }
    });

    res.status(201).json(order);
  } catch (error) {
    await logAuditEvent({
      req,
      action: 'order.create',
      resourceType: 'order',
      status: 'failure',
      metadata: { error: error.message }
    });
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

const checkoutCart = asyncHandler(async (req, res) => {
  try {
    const order = await checkoutCartToOrderService({
      userId: req.user._id,
      body: req.body
    });

    await logAuditEvent({
      req,
      action: 'order.checkout',
      resourceType: 'order',
      resourceId: order?._id,
      metadata: { totalAmount: order?.totalAmount }
    });

    res.status(201).json(order);
  } catch (error) {
    await logAuditEvent({
      req,
      action: 'order.checkout',
      resourceType: 'order',
      status: 'failure',
      metadata: { error: error.message }
    });
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

const createOrderPaymentIntent = asyncHandler(async (req, res) => {
  try {
    const intent = await createOrderPaymentIntentService({
      amount: req.body.amount,
      userId: req.user._id
    });

    res.json(intent);
  } catch (error) {
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

const markOrderPaid = asyncHandler(async (req, res) => {
  try {
    const order = await markOrderPaidService({
      orderId: req.params.id,
      actor: req.user,
      paymentReference: req.body.paymentReference
    });

    await logAuditEvent({
      req,
      action: 'order.payment.mark-paid',
      resourceType: 'order',
      resourceId: req.params.id,
      metadata: { paymentReference: req.body.paymentReference || '' }
    });

    res.json(order);
  } catch (error) {
    await logAuditEvent({
      req,
      action: 'order.payment.mark-paid',
      resourceType: 'order',
      resourceId: req.params.id,
      status: 'failure',
      metadata: { error: error.message }
    });
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

const getMyOrders = asyncHandler(async (req, res) => {
  try {
    const result = await getMyOrdersService(req.user._id, req.query);
    res.json(result);
  } catch (error) {
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const result = await getAllOrdersService(req.query);
    res.json(result);
  } catch (error) {
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  try {
    const order = await updateOrderStatusService({
      orderId: req.params.id,
      orderStatus: req.body.orderStatus,
      paymentStatus: req.body.paymentStatus
    });

    await logAuditEvent({
      req,
      action: 'order.status.update',
      resourceType: 'order',
      resourceId: req.params.id,
      metadata: {
        orderStatus: req.body.orderStatus,
        paymentStatus: req.body.paymentStatus
      }
    });

    res.json(order);
  } catch (error) {
    await logAuditEvent({
      req,
      action: 'order.status.update',
      resourceType: 'order',
      resourceId: req.params.id,
      status: 'failure',
      metadata: { error: error.message }
    });
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

module.exports = {
  createOrder,
  checkoutCart,
  createOrderPaymentIntent,
  markOrderPaid,
  getMyOrders,
  getAllOrders,
  updateOrderStatus
};
