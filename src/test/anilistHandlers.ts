import { http, HttpResponse } from 'msw';
import { animeCatalogResponse } from './animeCatalogFixture';

export const ANILIST_ENDPOINT = 'https://graphql.anilist.co';

export const anilistCatalogHandler = http.post(ANILIST_ENDPOINT, () =>
  HttpResponse.json(animeCatalogResponse),
);
