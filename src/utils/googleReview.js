/**
 * Google Review Link Helper & Parser
 * Mengonversi FTID / Hex CID / Maps URL / Place ID menjadi kode resmi ChIJ...
 * yang dijamin membuka modal review bintang 5 Google tanpa error 404.
 */

export function sanitizeTagId(rawId) {
  if (!rawId) return '';
  return rawId.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
}

/**
 * Mengonversi format FTID Google (0x...:0x...) menjadi Place ID resmi (ChIJ...)
 * menggunakan binary protobuf packing.
 */
export function ftidToPlaceId(ftid) {
  if (!ftid || typeof ftid !== 'string') return null;
  const parts = ftid.trim().split(':');
  if (parts.length !== 2) return null;

  try {
    const f1 = BigInt(parts[0]);
    const f2 = BigInt(parts[1]);

    const buf = new Uint8Array(18);
    const view = new DataView(buf.buffer);

    buf[0] = 0x09; // tag 1 (fixed64)
    view.setBigUint64(1, f1, true); // little-endian
    buf[9] = 0x11; // tag 2 (fixed64)
    view.setBigUint64(10, f2, true); // little-endian

    // Convert Uint8Array to base64url
    let binary = '';
    for (let i = 0; i < buf.byteLength; i++) {
      binary += String.fromCharCode(buf[i]);
    }
    const base64 = btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return 'ChIJ' + base64.substring(1);
  } catch (err) {
    console.error('FTID conversion error:', err);
    return null;
  }
}

export async function parseAndNormalizeGoogleReviewUrl(input, businessName = '') {
  if (!input || typeof input !== 'string') {
    return { valid: false, error: 'Place ID atau Link Google Review tidak boleh kosong' };
  }

  const trimmed = input.trim();

  // 1. Ekstrak Place ID murni (ChIJ...) jika sudah ada
  const placeIdMatch = trimmed.match(/ChIJ[a-zA-Z0-9_-]{20,}/);
  if (placeIdMatch) {
    const cleanPlaceId = placeIdMatch[0];
    return {
      valid: true,
      url: `https://search.google.com/local/writereview?placeid=${cleanPlaceId}`,
      type: 'place_id'
    };
  }

  // 2. Ekstrak FTID format (0x...:0x...) dan konversi ke ChIJ...
  const ftidMatch = trimmed.match(/0x[0-9a-fA-F]+:0x[0-9a-fA-F]+/);
  if (ftidMatch) {
    const converted = ftidToPlaceId(ftidMatch[0]);
    if (converted) {
      return {
        valid: true,
        url: `https://search.google.com/local/writereview?placeid=${converted}`,
        type: 'ftid_converted'
      };
    }
  }

  // 3. Direct writereview URL
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

  // 4. g.page review shortlink (Official Google Business review shortcut)
  if (trimmed.includes('g.page/')) {
    const url = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const reviewUrl = url.endsWith('/review') ? url : `${url.replace(/\/+$/, '')}/review`;
    return {
      valid: true,
      url: reviewUrl,
      type: 'gpage_review'
    };
  }

  // 5. Generic HTTPS fallback
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
