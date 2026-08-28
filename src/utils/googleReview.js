/**
 * Google Review Link Helper & Parser
 * Mengarahkan langsung ke Google Review / Google Maps resmi tanpa melalui Google Search.
 */

export function sanitizeTagId(rawId) {
  if (!rawId) return '';
  return rawId.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
}

export async function parseAndNormalizeGoogleReviewUrl(input, businessName = '') {
  if (!input || typeof input !== 'string') {
    return { valid: false, error: 'URL atau link Google Review tidak boleh kosong' };
  }

  const trimmed = input.trim();

  // 1. Direct Place ID (e.g., ChIJN1t_tDeuEmsRUsoyG83frY4)
  if (/^ChIJ[a-zA-Z0-9_-]{20,}$/.test(trimmed)) {
    return {
      valid: true,
      url: `https://search.google.com/local/writereview?placeid=${trimmed}`,
      type: 'place_id'
    };
  }

  // 2. Direct writereview URL (Official Google Review popup link)
  if (trimmed.includes('search.google.com/local/writereview')) {
    try {
      const parsed = new URL(trimmed);
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

  // 4. Google Maps link (maps.app.goo.gl, goo.gl/maps, google.com/maps)
  if (trimmed.includes('maps.app.goo.gl') || trimmed.includes('goo.gl/maps') || trimmed.includes('google.com/maps')) {
    const fullUrl = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    return {
      valid: true,
      url: fullUrl,
      type: 'maps_direct'
    };
  }

  // 5. Generic HTTPS link
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return {
      valid: true,
      url: trimmed,
      type: 'custom_url'
    };
  }

  // 6. Fallback if plain text
  return {
    valid: true,
    url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`,
    type: 'maps_search_query'
  };
}
