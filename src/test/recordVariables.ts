import { http, HttpResponse } from 'msw';
import * as z from 'zod/mini';
import { ANILIST_ENDPOINT } from './anilistHandlers';
import { animeCatalogResponse } from './animeCatalogFixture';
import { server } from './server';

const requestSchema = z.object({ variables: z.record(z.string(), z.unknown()) });

export function recordVariables() {
  const recorded: Record<string, unknown>[] = [];
  server.use(
    http.post(ANILIST_ENDPOINT, async ({ request }) => {
      recorded.push(requestSchema.parse(await request.json()).variables);
      return HttpResponse.json(animeCatalogResponse);
    }),
  );
  return recorded;
}
