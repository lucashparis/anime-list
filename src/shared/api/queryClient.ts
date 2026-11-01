import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/api/graphqlClient';

const STALE_TIME_MS = 5 * 60 * 1000;
const MAX_RETRIES = 2;
const FIRST_SERVER_ERROR_STATUS = 500;

function isTransient(error: unknown) {
  if (!(error instanceof ApiError)) return false;
  if (error.kind === 'network') return true;
  return error.kind === 'http' && (error.status ?? 0) >= FIRST_SERVER_ERROR_STATUS;
}

export function shouldRetry(failureCount: number, error: unknown) {
  return failureCount < MAX_RETRIES && isTransient(error);
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS,
        networkMode: 'always',
        refetchOnWindowFocus: false,
        retry: shouldRetry,
      },
    },
  });
}
