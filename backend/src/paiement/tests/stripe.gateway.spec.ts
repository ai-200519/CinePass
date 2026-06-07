import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripeGateway } from '../gateways/stripe.gateway';

describe('StripeGateway', () => {
  it('can be constructed when Stripe is not configured', () => {
    const config = { get: jest.fn().mockReturnValue(undefined) };

    expect(
      () => new StripeGateway(config as unknown as ConfigService),
    ).not.toThrow();
  });

  it('reports a clear error when a Stripe operation is requested without an API key', async () => {
    const config = { get: jest.fn().mockReturnValue(undefined) };
    const gateway = new StripeGateway(config as unknown as ConfigService);

    await expect(gateway.getSession('cs_test_123')).rejects.toThrow(
      ServiceUnavailableException,
    );
    await expect(gateway.getSession('cs_test_123')).rejects.toThrow(
      'Set STRIPE_SECRET_KEY in backend/.env',
    );
  });

  it('reports a clear error when the webhook secret is missing', () => {
    const config = {
      get: jest.fn((key: string) =>
        key === 'STRIPE_SECRET_KEY' ? 'sk_test_placeholder' : undefined,
      ),
    };
    const gateway = new StripeGateway(config as unknown as ConfigService);

    expect(() =>
      gateway.verifyWebhook(Buffer.from('{}'), 'test-signature'),
    ).toThrow('Set STRIPE_WEBHOOK_SECRET in backend/.env');
  });
});
