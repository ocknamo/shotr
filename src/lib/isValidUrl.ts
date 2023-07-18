export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
  } catch (error) {
    return false;
  }

  return true;
}
