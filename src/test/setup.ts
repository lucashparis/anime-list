import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, expect } from 'vitest';
import { server } from './server';

let unhandledRequests = 0;

beforeAll(() => {
  server.listen({
    onUnhandledFrame({ defaults }) {
      unhandledRequests += 1;
      defaults.error();
    },
  });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  const requestsWithoutHandler = unhandledRequests;
  unhandledRequests = 0;
  expect(requestsWithoutHandler, 'requests without an MSW handler').toBe(0);
});

afterAll(() => {
  server.close();
});
