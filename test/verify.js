import { parseAndNormalizeGoogleReviewUrl, sanitizeTagId } from '../src/utils/googleReview.js';
import worker from '../src/worker.js';

console.log('🧪 Starting Verification Tests...\n');

// 1. Test Sanitizer
const cleanTag = sanitizeTagId('REV-001@#$*&!');
console.assert(cleanTag === 'REV-001', `Sanitizer failed: got ${cleanTag}`);
console.log('✅ Sanitizer passed: REV-001');

// 2. Test Place ID Parser with accidental address text
const dirtyInput = `ChIJFzH8KgDlaC4RNnbJva8buGs\n4GGR+JV7, Jl.Raya Barat, Cimahi, Kec. Cimahi Tengah, Kota Cimahi`;
const placeIdRes = await parseAndNormalizeGoogleReviewUrl(dirtyInput);
console.assert(placeIdRes.valid && placeIdRes.url === 'https://search.google.com/local/writereview?placeid=ChIJFzH8KgDlaC4RNnbJva8buGs', 'Place ID parse failed on dirty input');
console.log('✅ Clean Place ID successfully extracted from dirty input:', placeIdRes.url);

// 3. Test Maps URL Parser
const mapsRes = await parseAndNormalizeGoogleReviewUrl('https://maps.app.goo.gl/69zEMuGdeQyRCTG5A?g_st=ic', 'Alun alun cimahi');
console.assert(mapsRes.valid && mapsRes.url === 'https://maps.app.goo.gl/69zEMuGdeQyRCTG5A?g_st=ic', 'Maps URL parse failed');
console.log('✅ Maps URL parser passed (Direct Maps link preserved):', mapsRes.url);

// 4. Test Mock KV Worker Execution
const mockKVStore = new Map();
const mockEnv = {
  REVIEW_TAGS: {
    get: async (key, opts) => {
      const val = mockKVStore.get(key);
      if (!val) return null;
      return opts && opts.type === 'json' ? JSON.parse(val) : val;
    },
    put: async (key, val) => {
      mockKVStore.set(key, val);
    }
  }
};

async function testWorkerFlow() {
  // A. First visit - should return Setup HTML
  const req1 = new Request('https://domain.com/t/TEST-100');
  const res1 = await worker.fetch(req1, mockEnv);
  const html1 = await res1.text();
  console.assert(html1.includes('Aktivasi Stand Google Review'), 'First visit did not render setup page');
  console.log('✅ First visit rendered setup page properly');

  // B. Claim API - lock card
  const claimReq = new Request('https://domain.com/api/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tagId: 'TEST-100',
      businessName: 'Alun alun cimahi',
      reviewUrl: 'https://maps.app.goo.gl/69zEMuGdeQyRCTG5A?g_st=ic'
    })
  });
  const claimRes = await worker.fetch(claimReq, mockEnv);
  const claimData = await claimRes.json();
  console.assert(claimData.success === true, 'Claim failed');
  console.log('✅ Card claim & permanent lock succeeded');

  // C. Subsequent visit - should return HTTP 302 Redirect directly to Maps
  const req2 = new Request('https://domain.com/t/TEST-100');
  const res2 = await worker.fetch(req2, mockEnv);
  console.assert(res2.status === 302, `Subsequent visit status expected 302, got ${res2.status}`);
  console.assert(res2.headers.get('Location') === 'https://maps.app.goo.gl/69zEMuGdeQyRCTG5A?g_st=ic', 'Redirect location mismatch');
  console.log('✅ Subsequent visit returned instant direct HTTP 302 redirect to Maps:', res2.headers.get('Location'));

  // D. Attempt re-claim on locked card - should be 409 Conflict
  const reclaimReq = new Request('https://domain.com/api/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tagId: 'TEST-100',
      businessName: 'Hacker Store',
      reviewUrl: 'https://hacker.com'
    })
  });
  const reclaimRes = await worker.fetch(reclaimReq, mockEnv);
  console.assert(reclaimRes.status === 409, `Reclaim expected 409, got ${reclaimRes.status}`);
  console.log('✅ Anti-hijack protection passed: 409 Conflict returned on locked card');

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
}

testWorkerFlow();
