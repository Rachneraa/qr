/**
 * Google Review Link Helper & Parser
 * Mengonversi berbagai format input (Place ID, Maps shortlink, Maps URL, atau direct link)
 * menjadi DIRECT Google Review Popup URL yang langsung memunculkan pop-up rating bintang 5.
 */

export function sanitizeTagId(rawId) {
  if (!rawId) return '';
  return rawId.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
}

export async function parseAndNormalizeGoogleReviewUrl(input, businessName = '') {
  if (!input || typeof input !== 'string') {
    return { valid: false, error: 'URL atau Place ID tidak boleh kosong' };
  }

  const trimmed = input.trim();
  const safeName = businessName ? encodeURIComponent(businessName.trim()) : 'Review';

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
  if (trimmed.includes('g.page/') && trimmed.includes('/review')) {
    return {
      valid: true,
      url: trimmed.startsWith('http') ? trimmed : `https://${trimmed}`,
      type: 'gpage_review'
    };
  }

  // 4. Shortlink Maps (maps.app.goo.gl) - Resolve redirect to extract FTID / CID
  if (trimmed.includes('maps.app.goo.gl') || trimmed.includes('goo.gl/maps')) {
    try {
      const targetUrl = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
      const response = await fetch(targetUrl, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      const finalUrl = response.url || targetUrl;
      const parsed = new URL(finalUrl);

      // Check for ftid parameter (e.g., 0x2e68e5002afc3117:0x6bb81bafbdc97636)
      const ftid = parsed.searchParams.get('ftid');
      if (ftid) {
        // Direct Review Popup Parameter in Google Search (&lrd=FTID,3)
        return {
          valid: true,
          url: `https://www.google.com/search?q=${safeName}&lrd=${ftid},3`,
          type: 'ftid_direct_review'
        };
      }

      // Check for place_id parameter
      const placeId = parsed.searchParams.get('place_id') || parsed.searchParams.get('placeid');
      if (placeId) {
        return {
          valid: true,
          url: `https://search.google.com/local/writereview?placeid=${placeId}`,
          type: 'place_id'
        };
      }

      // Fallback with search query
      const query = parsed.searchParams.get('q') || businessName;
      return {
        valid: true,
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}+reviews`,
        type: 'resolved_query_review'
      };
    } catch (e) {
      console.warn('Failed to resolve maps shortlink, using direct search fallback:', e);
      return {
        valid: true,
        url: `https://www.google.com/search?q=${safeName}+reviews`,
        type: 'query_fallback'
      };
    }
  }

  // 5. Standard google.com/maps link with ftid
  if (trimmed.includes('google.com/maps')) {
    try {
      const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      const ftid = parsed.searchParams.get('ftid');
      if (ftid) {
        return {
          valid: true,
          url: `https://www.google.com/search?q=${safeName}&lrd=${ftid},3`,
          type: 'ftid_direct_review'
        };
      }
      const placeId = parsed.searchParams.get('place_id') || parsed.searchParams.get('placeid');
      if (placeId) {
        return {
          valid: true,
          url: `https://search.google.com/local/writereview?placeid=${placeId}`,
          type: 'place_id'
        };
      }
    } catch {}
  }

  // 6. Generic valid HTTPS URL
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return {
      valid: true,
      url: trimmed,
      type: 'custom_url'
    };
  }

  // 7. Plain Business Name query
  return {
    valid: true,
    url: `https://www.google.com/search?q=${encodeURIComponent(trimmed)}+reviews`,
    type: 'search_query'
  };
}
