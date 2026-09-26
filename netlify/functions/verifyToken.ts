import crypto from "crypto";

/**
 * Verifies the validity of an HMAC-signed anti-replay token.
 * It checks the format, ensures the token hasn't expired, and validates 
 * the signature against the server's private secret to prevent unauthorized requests.
 *
 * @param token - The token string provided by the client header, format `expiry.signature`.
 * @param appSecret - The private server key used for HMAC validation.
 * @returns An object indicating whether the token is valid, and an error message if invalid.
 */
export function verifyToken(token: string | null, appSecret: string): { valid: boolean; error?: string } {
  if (!token) {
    return { valid: false, error: "Unauthorized: Missing token" };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false, error: "Unauthorized: Invalid token format" };
  }

  const [expiryStr, signature] = parts;
  if (!expiryStr || !signature) {
    return { valid: false, error: "Unauthorized: Invalid token format" };
  }

  const expiry = parseInt(expiryStr, 10);
  if (isNaN(expiry)) {
    return { valid: false, error: "Unauthorized: Invalid token format" };
  }

  if (Date.now() > expiry) {
    return { valid: false, error: "Unauthorized: Token expired" };
  }

  const expectedSignature = crypto.createHmac("sha256", appSecret).update(expiryStr).digest("hex");
  if (signature !== expectedSignature) {
    return { valid: false, error: "Unauthorized: Invalid signature" };
  }

  return { valid: true };
}
