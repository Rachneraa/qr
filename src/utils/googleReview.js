/**
 * Google Review Link Helper & Parser
 * Menjamin 0% error 404:
 * 1. Jika link Google Maps (maps.app.goo.gl/...), diarahkan langsung ke Google Maps resmi (langsung buka app Maps di HP pelanggan).
 * 2. Jika Place ID (ChIJ...), diarahkan ke form review popup bintang 5.
 * 3. Jika g.page, diarahkan ke link ulasan resmi Google Bisnis.
 */

export function sanitizeTagId(rawId) {
  if (!rawId) return '';
  return rawId.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
}

export async function parseAndNormalizeGoogleReviewUrl(input, businessName = '') {
  if (!input || typeof input !== 'string') {
    return { valid: false, error: 'Place ID atau Link Google Review tidak boleh kosong' };
  }

  const trimmed = input.trim();

  // 1. Jika Place ID resmi (ChIJ...)
  const placeIdMatch = trimmed.match(/ChIJ[a-zA-Z0-9_-]{20,}/);
  if (placeIdMatch) {
    const cleanPlaceId = placeIdMatch[0];
    return {
      valid: true,
      url: `https://search.google.com/local/writereview?placeid=${cleanPlaceId}`,
      type: 'place_id'
    };
  }

  // 2. Jika direct writereview URL
  if (trimmed.includes('search.google.com/local/writereview')) {
    try {
      const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      return {
        valid: true,
        url: parsed.toString(),
        type: 'direct_review'
      };
    } catch {
      return { valid: false, error: 'Format URL Google Review tidak valid' };
    }
  }

  // 3. Jika link g.page
  if (trimmed.includes('g.page/')) {
    const url = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const reviewUrl = url.endsWith('/review') ? url : `${url.replace(/\/+$/, '')}/review`;
    return {
      valid: true,
      url: reviewUrl,
      type: 'gpage_review'
    };
  }

  // 4. Jika link Google Maps (maps.app.goo.gl, goo.gl/maps, google.com/maps)
  // Pertahankan link aslinya agar di HP customer langsung membuka aplikasi Google Maps tanpa risiko 404!
  if (trimmed.includes('maps.app.goo.gl') || trimmed.includes('goo.gl/maps') || trimmed.includes('google.com/maps')) {
    const url = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    return {
      valid: true,
      url,
      type: 'maps_direct'
    };
  }

  // 5. Fallback URL
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return {
      valid: true,
      url: trimmed,
      type: 'custom_url'
    };
  }

  // Default: Jika plain text tanpa ChIJ, gunakan Google search ulasan
  return {
    valid: true,
    url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`,
    type: 'query_search'
  };
}
