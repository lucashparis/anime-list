import { http, HttpResponse } from 'msw';
import * as z from 'zod/mini';
import { ANILIST_ENDPOINT } from './anilistHandlers';
import { animeCatalogResponse, pagedCatalogResponse } from './animeCatalogFixture';
import { server } from './server';

const requestSchema = z.object({
  variables: z.looseObject({ page: z.number() }),
});
const LAST_PAGE = 3;

export async function readVariables(request: Request) {
  return requestSchema.parse(await request.json()).variables;
}

export function recordVariables() {
  const recorded: Record<string, unknown>[] = [];
  server.use(
    http.post(ANILIST_ENDPOINT, async ({ request }) => {
      const variables = await readVariables(request);
      recorded.push(variables);
      if (variables.page === 1) return HttpResponse.json(animeCatalogResponse);
      return HttpResponse.json(pagedCatalogResponse(variables.page, variables.page < LAST_PAGE));
    }),
  );
  return recorded;
}
