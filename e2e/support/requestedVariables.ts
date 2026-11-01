import type { Route } from '@playwright/test';
import * as z from 'zod/mini';

const requestSchema = z.object({ variables: z.record(z.string(), z.unknown()) });

export function requestedVariables(route: Route) {
  return requestSchema.parse(route.request().postDataJSON()).variables;
}
