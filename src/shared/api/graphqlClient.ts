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

function rejectUnlessMalformed(error: unknown) {
  if (error instanceof SyntaxError) return null;
  throw error;
}

async function send({ query, variables, signal, timeoutMs = DEFAULT_TIMEOUT_MS }: GraphqlRequest) {
  const timeout = AbortSignal.timeout(timeoutMs);
  try {
    const response = await fetch(ANILIST_ENDPOINT, {
      method: 'POST',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.any([signal, timeout]),
    });
    const body: unknown = await response.json().catch(rejectUnlessMalformed);
    return { ok: response.ok, status: response.status, body };
  } catch {
    throw new ApiError(timeout.aborted ? 'timeout' : 'network');
  }
}

function readEnvelope(body: unknown, status: number) {
  const envelope = z.safeParse(envelopeSchema, body);
  if (!envelope.success) throw new ApiError('schema', status);
  return envelope.data;
}

export async function requestGraphql<TData>(
  request: GraphqlRequest,
  dataSchema: z.ZodMiniType<TData>,
): Promise<TData> {
  const { ok, status, body } = await send(request);
  if (!ok) throw new ApiError('http', status);

  const { data, errors } = readEnvelope(body, status);
  if (errors?.length) throw new ApiError('graphql', status);

  const parsed = z.safeParse(dataSchema, data);
  if (!parsed.success) throw new ApiError('schema', status);
  return parsed.data;
}
