// src/api/endpoint/Stripe.ts
import { ep } from '../core/ApiEndpoint';

export const Stripe = {
  CreateCheckoutSession: ep('POST', 'stripe', 'create-checkout-session'),
  CancelSubscription:    ep('POST', 'stripe', 'cancel-subscription'), // nếu sau này dùng
} as const;
