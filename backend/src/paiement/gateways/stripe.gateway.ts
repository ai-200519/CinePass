import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeGateway {
	private readonly stripe: any;

	constructor(private readonly configService: ConfigService) {
		const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
		if (!secretKey) {
			throw new BadRequestException('STRIPE_SECRET_KEY manquant');
		}

		this.stripe = new Stripe(secretKey);
	}

	async createCheckoutSession(params: {
		amount: number;
		currency: string;
		reservationId: number;
		reference: string;
	}) {
		const successUrl = this.configService.get<string>('STRIPE_SUCCESS_URL');
		const cancelUrl = this.configService.get<string>('STRIPE_CANCEL_URL');

		if (!successUrl || !cancelUrl) {
			throw new BadRequestException(
				'STRIPE_SUCCESS_URL ou STRIPE_CANCEL_URL manquant',
			);
		}

		return this.stripe.checkout.sessions.create({
			mode: 'payment',
			success_url: successUrl,
			cancel_url: cancelUrl,
			payment_method_types: ['card'],
			line_items: [
				{
					price_data: {
						currency: params.currency,
						unit_amount: params.amount,
						product_data: {
							name: 'Reservation CinePass',
							description: `Reference ${params.reference}`,
						},
					},
					quantity: 1,
				},
			],
			client_reference_id: String(params.reservationId),
			metadata: {
				reservationId: String(params.reservationId),
				reference: params.reference,
			},
		});
	}

	constructEvent(rawBody: Buffer, signature: string | string[]) {
		const webhookSecret = this.configService.get<string>(
			'STRIPE_WEBHOOK_SECRET',
		);
		if (!webhookSecret) {
			throw new BadRequestException('STRIPE_WEBHOOK_SECRET manquant');
		}

		const sig = Array.isArray(signature) ? signature[0] : signature;
		if (!sig) {
			throw new BadRequestException('Signature Stripe manquante');
		}

		return this.stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
	}
}
