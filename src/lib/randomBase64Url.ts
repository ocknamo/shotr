/**
 * Get random base64url.
 * @param digit number
 * @returns base64url string
 */
export function getRandomBase64Url(digit: number = 4): string {
  const arrayView = new Uint8Array(digit);
  crypto.getRandomValues(arrayView);

  const str = String.fromCharCode.apply(
    null,
    crypto.getRandomValues(arrayView),
  );
  const base64 = btoa(str);
  const base64url = base642base64url(base64);

  return base64url.slice(0, digit);
}

/**
 * Convert to base64 to base64url.
 * @param base64
 * @returns base64url string
 */
function base642base64url(base64: string): string {
  return base64.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}
