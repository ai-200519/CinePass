// In your backend (and later, in the staff app)
import * as crypto from 'crypto';

const MASTER_KEY = process.env.MASTER_SIGNING_KEY; // 32+ bytes, stored in secrets manager

function getSessionSecret(sessionId: string): string {
  // Deterministic, one-way derivation
  return crypto
    .createHmac('sha256', MASTER_KEY)
    .update(`session:${sessionId}`)
    .digest('hex');
}