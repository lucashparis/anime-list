import { ApiError } from '@/shared/api/graphqlClient';

const RATE_LIMIT_STATUS = 429;

export function catalogErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === RATE_LIMIT_STATUS) {
    return 'Muitas consultas em pouco tempo. Aguarde um minuto e tente de novo.';
  }
  return 'Não foi possível carregar o catálogo.';
}
