// src/paiement/gateways/stripe.gateway.ts
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService }      from '@nestjs/config';
import Stripe                 from 'stripe';

type StripeClient = InstanceType<typeof Stripe>;
type StripeEvent = ReturnType<StripeClient['webhooks']['constructEvent']>;
type StripeSession = Awaited<ReturnType<StripeClient['checkout']['sessions']['retrieve']>>;
type StripePaymentIntent = Awaited<ReturnType<StripeClient['paymentIntents']['retrieve']>>;

@Injectable()
export class StripeGateway {

  private stripe?: StripeClient;
  private readonly logger = new Logger(StripeGateway.name);

  constructor(private readonly config: ConfigService) {}

  private getStripe(): StripeClient {
    if (this.stripe) {
      return this.stripe;
    }

    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new ServiceUnavailableException(
        'Stripe is not configured. Set STRIPE_SECRET_KEY in backend/.env.',
      );
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2026-04-22.dahlia',
    });

    return this.stripe;
  }

  // ── Create checkout session ─────────────────────────────────────────────
  async createCheckoutSession(
    montant:      number,
    devise:       string,
    reference:    string,
    id_paiement:  number,
    filmTitle:    string,
  ): Promise<{ sessionId: string; url: string }> {

    const session = await this.getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      mode:                 'payment',
      line_items: [
        {
          price_data: {
            currency:     devise.toLowerCase(),
            unit_amount:  Math.round(montant * 100), // Stripe uses cents
            product_data: {
              name:        `CinePass — ${filmTitle}`,
              description: `Réservation ${reference}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        id_paiement: id_paiement.toString(),
        reference,
      },
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/paiement/succes?reference=${reference}`,
      cancel_url:  `${process.env.FRONTEND_URL || 'http://localhost:5173'}/paiement/annule?reference=${reference}`,
    });

    this.logger.log(`✅ Stripe session created : ${session.id}`);

    return {
      sessionId: session.id,
      url:       session.url,
    };
  }

  async createPaymentIntent(
    montant: number,
    devise: string,
    reference: string,
    id_paiement: number,
    filmTitle: string,
  ): Promise<{ paymentIntentId: string; clientSecret: string }> {
    const intent = await this.getStripe().paymentIntents.create({
      amount: Math.round(montant * 100),
      currency: devise.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      description: `CinePass - ${filmTitle} - Reservation ${reference}`,
      metadata: {
        id_paiement: id_paiement.toString(),
        reference,
      },
    });

    this.logger.log(`Stripe PaymentIntent created : ${intent.id}`);

    return {
      paymentIntentId: intent.id,
      clientSecret: intent.client_secret,
    };
  }

  async getPaymentIntent(paymentIntentId: string): Promise<StripePaymentIntent> {
    return this.getStripe().paymentIntents.retrieve(paymentIntentId);
  }

  // ── Verify webhook signature ────────────────────────────────────────────
  verifyWebhook(
    payload:   Buffer,
    signature: string,
  ): StripeEvent {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new ServiceUnavailableException(
        'Stripe webhooks are not configured. Set STRIPE_WEBHOOK_SECRET in backend/.env.',
      );
    }

    return this.getStripe().webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }

  // ── Retrieve session ────────────────────────────────────────────────────
  async getSession(sessionId: string): Promise<StripeSession> {
    return this.getStripe().checkout.sessions.retrieve(sessionId);
  }
}
