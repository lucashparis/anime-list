import { readFileSync } from 'node:fs';
import * as z from 'zod/mini';
import { describe, expect, it } from 'vitest';

const configSchema = z.object({
  headers: z.array(
    z.object({
      source: z.string(),
      headers: z.array(z.object({ key: z.string(), value: z.string() })),
    }),
  ),
});

function loadHeaders() {
  const raw: unknown = JSON.parse(readFileSync('vercel.json', 'utf8'));
  const [rule] = configSchema.parse(raw).headers;
  if (!rule) throw new Error('vercel.json has no header rule');
  return { source: rule.source, byKey: new Map(rule.headers.map((h) => [h.key, h.value])) };
}

function policy() {
  const csp = loadHeaders().byKey.get('Content-Security-Policy') ?? '';
  return new Map(
    csp.split(';').map((directive) => {
      const [name = '', ...sources] = directive.trim().split(/\s+/);
      return [name, sources];
    }),
  );
}

describe('vercel.json', () => {
  it('applies the 6 security headers to every route', () => {
    const { source, byKey } = loadHeaders();
    expect(source).toBe('/(.*)');
    expect([...byKey.keys()].sort()).toEqual([
      'Content-Security-Policy',
      'Permissions-Policy',
      'Referrer-Policy',
      'Strict-Transport-Security',
      'X-Content-Type-Options',
      'X-Frame-Options',
    ]);
  });

  it('caches the hashed assets for a year without touching the other routes', () => {
    const raw: unknown = JSON.parse(readFileSync('vercel.json', 'utf8'));
    const rules = configSchema.parse(raw).headers;
    const assets = rules.find((rule) => rule.source === '/assets/(.*)');
    expect(assets?.headers).toEqual([
      { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
    ]);
    expect(rules.filter((rule) => rule.source === '/(.*)')).toHaveLength(1);
  });

  it('keeps the policy strict', () => {
    const sources = [...policy().values()].flat();
    expect(sources).not.toContain("'unsafe-inline'");
    expect(sources).not.toContain("'unsafe-eval'");
    expect(sources).not.toContain('*');
    expect(sources).not.toContain('data:');
  });

  it('allows only the app and AniList origins', () => {
    const csp = policy();
    expect(csp.get('default-src')).toEqual(["'self'"]);
    expect(csp.get('script-src')).toEqual(["'self'"]);
    expect(csp.get('connect-src')).toEqual(["'self'", 'https://graphql.anilist.co']);
    expect(csp.get('img-src')).toEqual(["'self'", 'https://s4.anilist.co']);
    expect(csp.get('frame-ancestors')).toEqual(["'none'"]);
    expect(csp.get('object-src')).toEqual(["'none'"]);
  });

  it('does not preload HSTS or cover subdomains', () => {
    const hsts = loadHeaders().byKey.get('Strict-Transport-Security') ?? '';
    expect(hsts).toBe('max-age=63072000');
  });
});
