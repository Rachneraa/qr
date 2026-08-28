/**
 * Google Review Link Helper & Parser
 * Mengubah berbagai format input (Place ID, Maps URL, atau direct link)
 * menjadi direct Google Review URL yang langsung memunculkan pop-up rating bintang 5.
 */

export function sanitizeTagId(rawId) {
  if (!rawId) return '';
  return rawId.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
}

export function parseAndNormalizeGoogleReviewUrl(input) {
  if (!input || typeof input !== 'string') {
    return { valid: false, error: 'URL atau Place ID tidak boleh kosong' };
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

  // 3. Google Maps link with place_id or query
  if (trimmed.includes('google.com/maps') || trimmed.includes('maps.google.com') || trimmed.includes('maps.app.goo.gl') || trimmed.includes('g.page')) {
    try {
      const parsed = new URL(trimmed);
      
      // Check if place_id query param exists
      const placeId = parsed.searchParams.get('place_id') || parsed.searchParams.get('placeid');
      if (placeId) {
        return {
          valid: true,
          url: `https://search.google.com/local/writereview?placeid=${placeId}`,
          type: 'place_id_extracted'
        };
      }

      // Check for /place/ or /reviews endpoint
      return {
        valid: true,
        url: parsed.toString(),
        type: 'maps_url'
      };
    } catch {
      return { valid: false, error: 'Format URL Google Maps tidak valid' };
    }
  }

  // 4. Any generic valid HTTPS URL
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    try {
      const parsed = new URL(trimmed);
      return {
        valid: true,
        url: parsed.toString(),
        type: 'custom_url'
      };
    } catch {
      return { valid: false, error: 'Format URL tidak valid' };
    }
  }

  return {
    valid: false,
    error: 'Masukkan URL Google Maps / Review yang valid atau Place ID'
  };
}
