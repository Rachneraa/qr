import worker from '../src/worker.js';

export const config = {
  runtime: 'edge'
};

// Global in-memory fallback store for Vercel Edge runtime testing
const globalMemoryStore = globalThis.__REVIEW_KV_STORE__ || new Map();
globalThis.__REVIEW_KV_STORE__ = globalMemoryStore;

export default async function handler(request) {
  // Upstash Redis / Vercel KV adapter
  const kvRestUrl = process?.env?.KV_REST_API_URL || process?.env?.UPSTASH_REDIS_REST_URL;
  const kvRestToken = process?.env?.KV_REST_API_TOKEN || process?.env?.UPSTASH_REDIS_REST_TOKEN;

  const env = {
    ADMIN_PASSWORD: process?.env?.ADMIN_PASSWORD,
    REVIEW_TAGS: {
      get: async (key, opts) => {
        if (kvRestUrl && kvRestToken) {
          try {
            const res = await fetch(`${kvRestUrl}/get/${encodeURIComponent(key)}`, {
              headers: { Authorization: `Bearer ${kvRestToken}` }
            });
            const data = await res.json();
            if (!data.result) return null;
            return opts?.type === 'json' ? JSON.parse(data.result) : data.result;
          } catch (e) {
            console.error('Upstash GET error:', e);
          }
        }
        const val = globalMemoryStore.get(key);
        if (!val) return null;
        return opts?.type === 'json' ? JSON.parse(val) : val;
      },
      put: async (key, val) => {
        if (kvRestUrl && kvRestToken) {
          try {
            await fetch(`${kvRestUrl}/set/${encodeURIComponent(key)}`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${kvRestToken}`,
                'Content-Type': 'text/plain'
              },
              body: typeof val === 'string' ? val : JSON.stringify(val)
            });
          } catch (e) {
            console.error('Upstash SET error:', e);
          }
        }
        globalMemoryStore.set(key, typeof val === 'string' ? val : JSON.stringify(val));
      }
    }
  };

  return worker.fetch(request, env);
}
