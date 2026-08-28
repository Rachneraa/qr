/**
 * Google Review Link Helper & Parser
 * Otomatis membersihkan input (jika ada alamat yang ikut tersalin)
 * dan mengambil kode Place ID murni (ChIJ...).
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

  // 1. Ekstrak Place ID murni (ChIJ...) meskipun ada alamat/teks lain yang ikut tersalin
  const placeIdMatch = trimmed.match(/ChIJ[a-zA-Z0-9_-]{20,}/);
  if (placeIdMatch) {
    const cleanPlaceId = placeIdMatch[0];
    return {
      valid: true,
      url: `https://search.google.com/local/writereview?placeid=${cleanPlaceId}`,
      type: 'place_id'
    };
  }

  // 2. Direct writereview URL
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

  // 3. g.page review shortlink (Official Google Business review shortcut)
  if (trimmed.includes('g.page/')) {
    const url = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const reviewUrl = url.endsWith('/review') ? url : `${url.replace(/\/+$/, '')}/review`;
    return {
      valid: true,
      url: reviewUrl,
      type: 'gpage_review'
    };
  }

  // 4. Generic HTTPS link
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return {
      valid: true,
      url: trimmed,
      type: 'custom_url'
    };
  }

  return {
    valid: true,
    url: `https://search.google.com/local/writereview?placeid=${encodeURIComponent(trimmed.split('\n')[0].trim())}`,
    type: 'inferred_place_id'
  };
}
