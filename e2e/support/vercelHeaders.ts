import { readFileSync } from 'node:fs';
import * as z from 'zod/mini';

const configSchema = z.object({
  headers: z.array(
    z.object({
      source: z.string(),
      headers: z.array(z.object({ key: z.string(), value: z.string() })),
    }),
  ),
});

export function vercelHeaders() {
  const raw: unknown = JSON.parse(readFileSync('vercel.json', 'utf8'));
  const rules = configSchema.parse(raw).headers;
  const global = rules.filter((rule) => rule.source === '/(.*)');
  return Object.fromEntries(global.flatMap((rule) => rule.headers.map((h) => [h.key, h.value])));
}
