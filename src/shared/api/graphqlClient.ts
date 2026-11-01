import * as z from 'zod/mini';

const ANILIST_ENDPOINT = 'https://graphql.anilist.co';

const DEFAULT_TIMEOUT_MS = 10_000;

export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'graphql' | 'schema';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | null;

  constructor(kind: ApiErrorKind, status: number | null = null) {
    super(`AniList request failed: ${kind}`);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

export interface GraphqlRequest {
  query: string;
  variables: Record<string, unknown>;
  signal: AbortSignal;
  timeoutMs?: number;
}

const envelopeSchema = z.object({
  data: z.unknown(),
  errors: z.nullish(z.array(z.unknown())),
});

async function send({ query, variables, signal, timeoutMs = DEFAULT_TIMEOUT_MS }: GraphqlRequest) {
  const timeout = AbortSignal.timeout(timeoutMs);
  try {
    return await fetch(ANILIST_ENDPOINT, {
      method: 'POST',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.any([signal, timeout]),
    });
  } catch {
    throw new ApiError(timeout.aborted ? 'timeout' : 'network');
  }
}

async function readEnvelope(response: Response) {
  const body: unknown = await response.json().catch(() => null);
  const envelope = z.safeParse(envelopeSchema, body);
  if (!envelope.success) throw new ApiError('schema', response.status);
  return envelope.data;
}

export async function requestGraphql<TData>(
  request: GraphqlRequest,
  dataSchema: z.ZodMiniType<TData>,
): Promise<TData> {
  const response = await send(request);
  if (!response.ok) throw new ApiError('http', response.status);

  const { data, errors } = await readEnvelope(response);
  if (errors?.length) throw new ApiError('graphql', response.status);

  const parsed = z.safeParse(dataSchema, data);
  if (!parsed.success) throw new ApiError('schema', response.status);
  return parsed.data;
}
