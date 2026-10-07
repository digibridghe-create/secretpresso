/**
 * Centralized image resolution utility for SECRETpresso.
 * Ensures robust image loading across products, categories, sections, banners, and cart items
 * with fallback handling for missing, invalid, or empty image URLs.
 */
export function resolveImage(
  url?: string | null,
  fallback: string = '/uploads/hero_latte_collectible_1791216830274.jpg'
): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return fallback;
  }
  const trimmed = url.trim();
  // Support blob or data URIs during active session, or absolute/relative server paths
  return trimmed;
}
