export type JwtPayload = {
  sub?: number;
  email?: string;
  nom?: string;
  prenom?: string;
  role?: string;
  id_cinema?: number | null;
  iat?: number;
  exp?: number;
};

function base64UrlToBase64(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (base64.length % 4)) % 4;
  return base64 + '='.repeat(padLength);
}

export function decodeJwtPayload(token: string | null): JwtPayload | null {
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  if (typeof atob !== 'function') return null;

  try {
    const payloadPart = base64UrlToBase64(parts[1]);

    // atob is available in browsers (Vite target).
    const decoded = atob(payloadPart);

    const json = decodeURIComponent(
      decoded
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );

    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}
