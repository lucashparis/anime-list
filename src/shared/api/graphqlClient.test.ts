import { delay, http, HttpResponse } from 'msw';
import * as z from 'zod/mini';
import { describe, expect, it, vi } from 'vitest';
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

function respondWith(response: () => Response | Promise<Response>) {
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

  it('reports a timeout when the API does not answer in time', async () => {
    respondWith(async () => {
      await delay('infinite');
      return HttpResponse.json({ data: { value: 1 } });
    });
    const error = await requestGraphql(
      {
        query: 'query Test { value }',
        variables: {},
        signal: new AbortController().signal,
        timeoutMs: 20,
      },
      dataSchema,
    ).catch((failure: unknown) => failure);
    expect(error).toMatchObject({ kind: 'timeout', status: null });
  });

  it('reports a timeout while the body is still arriving', async () => {
    const response = new Response('{}');
    vi.spyOn(response, 'json').mockImplementation(
      () =>
        new Promise((_, reject) => {
          setTimeout(() => {
            reject(new DOMException('aborted', 'AbortError'));
          }, 40);
        }),
    );
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(response);
    const error = await requestGraphql(
      {
        query: 'query Test { value }',
        variables: {},
        signal: new AbortController().signal,
        timeoutMs: 10,
      },
      dataSchema,
    ).catch((failure: unknown) => failure);
    vi.restoreAllMocks();
    expect(error).toMatchObject({ kind: 'timeout' });
  });

  it('reports a cancellation as a network failure, not a timeout', async () => {
    respondWith(async () => {
      await delay('infinite');
      return HttpResponse.json({ data: { value: 1 } });
    });
    const controller = new AbortController();
    const pending = requestGraphql(
      { query: 'query Test { value }', variables: {}, signal: controller.signal },
      dataSchema,
    ).catch((failure: unknown) => failure);
    controller.abort();
    await expect(pending).resolves.toMatchObject({ kind: 'network' });
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
