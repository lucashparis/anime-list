import { test as base, type Route } from '@playwright/test';
import { animeCatalogResponse } from '../../src/test/animeCatalogFixture';

export const ANILIST_ENDPOINT = 'https://graphql.anilist.co/';
const COVER_ROUTE = 'https://s4.anilist.co/**';
const COVER_COLORS = ['#ffffff', '#3b6fb5', '#f1a143', '#2f7d4f'];
const CORS_HEADERS = { 'access-control-allow-origin': '*' };

function coverSvg(url: string) {
  const id = Number(/fixture-(\d+)/.exec(url)?.[1] ?? 0);
  const fill = COVER_COLORS[id % COVER_COLORS.length] ?? '#ffffff';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="460" height="650"><rect width="460" height="650" fill="${fill}"/><circle cx="230" cy="420" r="150" fill="#1a1a1a"/></svg>`;
}

export function fulfillCatalog(route: Route) {
  return route.fulfill({ headers: CORS_HEADERS, json: animeCatalogResponse });
}

export function fulfillAnilist(route: Route, response: { status?: number; json?: unknown }) {
  return route.fulfill({ headers: CORS_HEADERS, ...response });
}

export const test = base.extend<{ mockedAnilist: undefined }>({
  mockedAnilist: [
    async ({ context }, use) => {
      await context.route(ANILIST_ENDPOINT, fulfillCatalog);
      await context.route(COVER_ROUTE, (route) =>
        route.fulfill({
          contentType: 'image/svg+xml',
          body: coverSvg(route.request().url()),
        }),
      );
      await use(undefined);
    },
    { auto: true },
  ],
});
