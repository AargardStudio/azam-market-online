// Run: npx tsx tests/connect.test.ts   (no network or database needed)
import assert from 'node:assert/strict';
import { newApiKey, sha256, signPayload, assertPublicHttpsUrl, SCOPES } from '../api/_connect/lib';
import handler from '../api/connect';
import { openApiSpec } from '../api/_connect/openapi';

process.env.VITE_SUPABASE_URL = 'http://127.0.0.1:9';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'x';

const call = async (method: string, path: string, headers: any = {}) => {
  let code = 0, body: any; const h: any = {};
  const res: any = { setHeader: (k: string, v: string) => (h[k] = v), status: (c: number) => ({ json: (b: any) => { code = c; body = b; }, end: () => { code = c; } }) };
  await handler({ method, query: { path }, headers, body: {} }, res);
  return { code, body, h };
};

(async () => {
  const k = newApiKey('live');
  assert.match(k.raw, /^amo_live_[\w-]{32}$/); assert.equal(k.hash, sha256(k.raw)); assert.ok(!k.hash.includes(k.raw));
  assert.equal(signPayload('s', '1', '{}'), signPayload('s', '1', '{}')); assert.notEqual(signPayload('s', '1', '{}'), signPayload('t', '1', '{}'));
  for (const bad of ['http://example.com', 'https://localhost/x', 'https://127.0.0.1/x', 'https://10.0.0.5/x', 'https://169.254.169.254/x', 'https://[::1]/x', 'not a url'])
    await assert.rejects(() => assertPublicHttpsUrl(bad), bad);
  await assert.doesNotReject(() => assertPublicHttpsUrl('https://8.8.8.8/hook'));

  let r = await call('GET', 'health'); assert.equal(r.code, 200); assert.equal(r.body.status, 'ok');
  r = await call('GET', 'openapi.json'); assert.equal(r.code, 200); assert.ok(r.body.paths['/vendors']);
  r = await call('GET', 'vendors'); assert.equal(r.code, 401);
  r = await call('GET', 'vendors', { authorization: 'Bearer wrong' }); assert.equal(r.code, 401);
  assert.ok(r.body.request_id); assert.equal(r.h['Cache-Control'], 'no-store');
  r = await call('OPTIONS', 'vendors'); assert.equal(r.code, 204);
  assert.ok(Object.keys(openApiSpec('x')['x-scopes']).length === Object.keys(SCOPES).length);
  console.log('connect tests passed');
})().catch((e) => { console.error(e); process.exit(1); });
