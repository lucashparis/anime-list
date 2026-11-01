import { http, HttpResponse } from 'msw';
import * as z from 'zod/mini';
import { describe, expect, it } from 'vitest';
import { ApiError, requestGraphql } from '@/shared/api/graphqlClient';
import { ANILIST_ENDPOINT } from '@/test/anilistHandlers';
import { server } from '@/test/server';

const dataSchema = z.object({ value: z.number() });

function request() {
  return requestGraphql(
    { query: 'query Test { value }', variables: {}, signal: new AbortController().signal },
    dataSchema,
  );
}

function respondWith(response: () => Response) {
  server.use(http.post(ANILIST_ENDPOINT, response));
}

async function requestError() {
  return request().catch((error: unknown) => error);
}

describe('requestGraphql', () => {
  it('returns the validated data', async () => {
    respondWith(() => HttpResponse.json({ data: { value: 1 } }));
    await expect(request()).resolves.toEqual({ value: 1 });
  });

  it('reports a network failure', async () => {
    respondWith(() => HttpResponse.error());
    const error = await requestError();
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind: 'network', status: null });
  });

  it('reports an HTTP failure with its status', async () => {
    respondWith(() => HttpResponse.json({ errors: [{ message: 'bad' }] }, { status: 429 }));
    await expect(requestError()).resolves.toMatchObject({ kind: 'http', status: 429 });
  });

  it('reports GraphQL errors sent with status 200', async () => {
    respondWith(() => HttpResponse.json({ data: null, errors: [{ message: 'bad' }] }));
    await expect(requestError()).resolves.toMatchObject({ kind: 'graphql', status: 200 });
  });

  it('reports data outside the schema', async () => {
    respondWith(() => HttpResponse.json({ data: { value: 'one' } }));
    await expect(requestError()).resolves.toMatchObject({ kind: 'schema' });
  });

  it('reports a body that is not JSON', async () => {
    respondWith(() => new HttpResponse('<html></html>', { status: 200 }));
    await expect(requestError()).resolves.toMatchObject({ kind: 'schema' });
  });
});
