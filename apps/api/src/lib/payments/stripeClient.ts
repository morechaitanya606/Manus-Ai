import Stripe from 'stripe';
import { env } from '../../config/env.js';

const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY)
  : null;

export async function createPaymentIntent(input: {
  amountInMinor: number;
  currency: string;
  metadata: Record<string, string>;
  idempotencyKey: string;
}): Promise<{ id: string; clientSecret: string | null; mode: 'stripe' | 'mock' }> {
  if (!stripe) {
    return {
      id: `mock_pi_${Date.now()}`,
      clientSecret: 'mock_client_secret',
      mode: 'mock'
    };
  }

  const intent = await stripe.paymentIntents.create(
    {
      amount: input.amountInMinor,
      currency: input.currency,
      metadata: input.metadata,
      automatic_payment_methods: {
        enabled: true
      }
    },
    {
      idempotencyKey: input.idempotencyKey
    }
  );

  return {
    id: intent.id,
    clientSecret: intent.client_secret,
    mode: 'stripe'
  };
}

export function getStripeClient(): Stripe | null {
  return stripe;
}
