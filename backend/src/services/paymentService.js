const Stripe = require('stripe');
const logger = require('../config/logger');
const { CircuitBreaker } = require('../utils/circuitBreaker');

const isStripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY);
const stripe = isStripeEnabled ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const stripeCircuitBreaker = new CircuitBreaker({
  name: 'stripe.payment_intent',
  enabled: process.env.CIRCUIT_BREAKER_ENABLED === 'true',
  failureThreshold: Number(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD || 5),
  resetTimeoutMs: Number(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT_MS || 30000)
});

const createStripePaymentIntent = ({ amount, currency, metadata }) =>
  stripeCircuitBreaker.fire(() =>
    stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata
    })
  );

const createPaymentIntent = async ({ amount, currency = 'usd', metadata = {} }) => {
  if (!isStripeEnabled || process.env.PAYMENT_PROVIDER !== 'stripe') {
    return {
      provider: 'mock',
      clientSecret: `mock_secret_${Date.now()}`,
      reference: `mock_ref_${Date.now()}`
    };
  }

  const intent = await createStripePaymentIntent({
    amount,
    currency,
    metadata
  }).catch((error) => {
    logger.error('payment_intent_create_failed', {
      provider: 'stripe',
      error: error.message,
      circuit: stripeCircuitBreaker.getSnapshot()
    });
    throw error;
  });

  return {
    provider: 'stripe',
    clientSecret: intent.client_secret,
    reference: intent.id
  };
};

module.exports = {
  createPaymentIntent
};
