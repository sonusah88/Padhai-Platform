import crypto from 'crypto';

export interface GenerateSignatureOptions {
  meetingNumber: string | number;
  role: 0 | 1; // 0 = attendee (student), 1 = host (teacher)
  sdkKey?: string;
  sdkSecret?: string;
}

export interface SignatureResponse {
  signature: string;
  sdkKey: string;
  meetingNumber: string;
  role: 0 | 1;
  iat: number;
  exp: number;
}

/**
 * Generates HMAC-SHA256 JWT signature for Zoom Meeting SDK (Web)
 * According to Zoom Meeting SDK specs:
 * Header: { "alg": "HS256", "typ": "JWT" }
 * Payload: { "sdkKey": key, "mn": meetingNumber, "role": role, "iat": iat, "exp": exp, "tokenExp": tokenExp }
 */
export function generateZoomSignature(options: GenerateSignatureOptions): SignatureResponse {
  const sdkKey = options.sdkKey || process.env.ZOOM_MEETING_SDK_KEY || process.env.NEXT_PUBLIC_ZOOM_SDK_KEY || 'DEMO_ZOOM_SDK_KEY';
  const sdkSecret = options.sdkSecret || process.env.ZOOM_MEETING_SDK_SECRET || 'DEMO_ZOOM_SDK_SECRET';
  
  const meetingNumber = String(options.meetingNumber).replace(/\s+/g, '');
  const role = options.role;

  const iat = Math.floor(Date.now() / 1000) - 30; // 30 seconds in past to account for clock skew
  const exp = iat + 60 * 60 * 2; // 2 hours expiration
  const tokenExp = exp;

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const payload = {
    sdkKey,
    mn: meetingNumber,
    role,
    iat,
    exp,
    tokenExp,
  };

  const base64UrlEncode = (obj: Record<string, unknown> | string): string => {
    const str = typeof obj === 'string' ? obj : JSON.stringify(obj);
    return Buffer.from(str)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(payload);

  const signatureHash = crypto
    .createHmac('sha256', sdkSecret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const signature = `${encodedHeader}.${encodedPayload}.${signatureHash}`;

  return {
    signature,
    sdkKey,
    meetingNumber,
    role,
    iat,
    exp,
  };
}
