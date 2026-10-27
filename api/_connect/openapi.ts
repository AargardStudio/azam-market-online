import { SCOPES, WEBHOOK_EVENTS } from './lib.js';

// Hand-maintained OpenAPI 3.0 description of /api/connect/v1. Served at /api/connect/v1/openapi.json.
export function openApiSpec(version: string) {
  const sec = [{ bearerAuth: [] }];
  const listParams = [
    { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
    { name: 'offset', in: 'query', schema: { type: 'integer', minimum: 0 } },
  ];
  const op = (summary: string, scope: string, extra: any = {}) => ({
    summary, security: sec, 'x-required-scope': scope,
    responses: { '200': { description: 'OK' }, '401': { description: 'Invalid key' }, '403': { description: 'Missing scope' }, '429': { description: 'Rate limited' } },
    ...extra,
  });
  const jsonBody = (props: Record<string, any>, required: string[] = []) => ({
    requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: props, required } } } },
  });
  return {
    openapi: '3.0.3',
    info: {
      title: 'Aargard Connect — Azam Market Online admin API',
      version,
      description: 'Admin-level API for operating the Azam Market Online marketplace. Keys are issued by the platform operator. Test keys are read-only. Aargard Connect Core is not deployed; no cross-app interoperability is claimed.',
    },
    servers: [{ url: '/api/connect/v1' }],
    components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', description: 'amo_live_... or amo_test_...' } } },
    'x-scopes': SCOPES,
    'x-webhook-events': WEBHOOK_EVENTS,
    'x-webhook-signature': 'Header X-Aargard-Signature = "sha256=" + HMAC_SHA256(secret, X-Aargard-Timestamp + "." + rawBody). Reject timestamps older than 5 minutes.',
    paths: {
      '/health': { get: { summary: 'Liveness check (no auth)', responses: { '200': { description: 'OK' } } } },
      '/capabilities': { get: op('Key details, scopes and what this API does not offer', 'any valid key') },
      '/stats': { get: op('Marketplace statistics', 'marketplace:read') },
      '/vendors': { get: op('List shops', 'vendors:read', { parameters: [...listParams, { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'active', 'suspended'] } }, { name: 'market_id', in: 'query', schema: { type: 'string' } }, { name: 'tier_id', in: 'query', schema: { type: 'string' } }, { name: 'subscription_status', in: 'query', schema: { type: 'string' } }] }) },
      '/vendors/{idOrSlug}': {
        get: op('Get a shop', 'vendors:read'),
        patch: op('Edit a shop (whitelisted fields)', 'vendors:write', jsonBody({ shop_name: { type: 'string' }, status: { type: 'string' }, tier_id: { type: 'string' }, is_verified: { type: 'boolean' }, is_featured: { type: 'boolean' } })),
      },
      '/vendors/{idOrSlug}/approve': { post: op('Set shop active', 'vendors:write') },
      '/vendors/{idOrSlug}/suspend': { post: op('Suspend a shop', 'vendors:write') },
      '/vendors/{idOrSlug}/reinstate': { post: op('Reactivate a suspended shop', 'vendors:write') },
      '/vendors/{idOrSlug}/extend-trial': { post: op('Extend the free trial', 'vendors:write', jsonBody({ days: { type: 'integer', minimum: 1, maximum: 365 } }, ['days'])) },
      '/products': {
        get: op('List products', 'products:read', { parameters: [...listParams, { name: 'vendor_id', in: 'query', schema: { type: 'string' } }, { name: 'active', in: 'query', schema: { type: 'boolean' } }] }),
        post: op('Create a product', 'products:write', jsonBody({ vendor_id: { type: 'string' }, name: { type: 'string' }, description: { type: 'string' }, fabric_type: { type: 'string' }, price_range: { type: 'string' }, moq: { type: 'string' }, image_url: { type: 'string' } }, ['vendor_id', 'name'])),
      },
      '/products/{id}': { get: op('Get a product', 'products:read'), patch: op('Update a product (set is_active=false to hide)', 'products:write') },
      '/categories': { get: op('List categories', 'catalog:read'), post: op('Create a category', 'catalog:write', jsonBody({ name: { type: 'string' }, icon: { type: 'string' } }, ['name'])) },
      '/markets': { get: op('List markets', 'catalog:read'), post: op('Create a market', 'catalog:write', jsonBody({ name: { type: 'string' }, city: { type: 'string' } }, ['name', 'city'])) },
      '/tiers': { get: op('List subscription tiers', 'catalog:read') },
      '/tiers/{id}': { patch: op('Change a tier', 'tiers:write') },
      '/inquiries': { get: op('Buyer inquiry events', 'inquiries:read', { parameters: [{ name: 'vendor_id', in: 'query', schema: { type: 'string' } }, { name: 'type', in: 'query', schema: { type: 'string' } }, { name: 'since', in: 'query', schema: { type: 'string', format: 'date-time' } }, ...listParams] }) },
    },
  };
}
