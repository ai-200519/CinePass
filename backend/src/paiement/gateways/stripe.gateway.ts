// src/paiement/gateways/stripe.gateway.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService }      from '@nestjs/config';
import Stripe                 from 'stripe';

type StripeClient = InstanceType<typeof Stripe>;
type StripeEvent = ReturnType<StripeClient['webhooks']['constructEvent']>;
type StripeSession = Awaited<ReturnType<StripeClient['checkout']['sessions']['retrieve']>>;

@Injectable()
export class StripeGateway {

  private readonly stripe: StripeClient;
  private readonly logger = new Logger(StripeGateway.name);

  constructor(private readonly config: ConfigService) {
    this.stripe = new Stripe(
      this.config.get<string>('STRIPE_SECRET_KEY'),
      { apiVersion: '2026-04-22.dahlia' },
    );
  }

  // ── Create checkout session ─────────────────────────────────────────────
  async createCheckoutSession(
    montant:      number,
    devise:       string,
    reference:    string,
    id_paiement:  number,
    filmTitle:    string,
  ): Promise<{ sessionId: string; url: string }> {

    const session = await this.stripe.checkout.sessions.create({
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

  // ── Verify webhook signature ────────────────────────────────────────────
  verifyWebhook(
    payload:   Buffer,
    signature: string,
  ): StripeEvent {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  }

  // ── Retrieve session ────────────────────────────────────────────────────
  async getSession(sessionId: string): Promise<StripeSession> {
    return this.stripe.checkout.sessions.retrieve(sessionId);
  }
}