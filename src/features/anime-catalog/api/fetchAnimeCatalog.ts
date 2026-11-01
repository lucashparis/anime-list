import * as z from 'zod/mini';
import type { Anime, AnimeCover, AnimePage } from '@/features/anime-catalog/model/anime';
import { requestGraphql } from '@/shared/api/graphqlClient';

const PAGE_SIZE = 12;

const ANIME_CATALOG_QUERY = `
  query AnimeCatalog($page: Int!, $perPage: Int!) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage
      }
      media(type: ANIME, isAdult: false, sort: [POPULARITY_DESC]) {
        id
        title {
          romaji
        }
        coverImage {
          large
          extraLarge
        }
        averageScore
        genres
      }
    }
  }
`;

const mediaSchema = z.object({
  id: z.number(),
  title: z.object({ romaji: z.nullable(z.string()) }),
  coverImage: z.object({
    large: z.nullable(z.string()),
    extraLarge: z.nullable(z.string()),
  }),
  averageScore: z.nullable(z.number()),
  genres: z.nullable(z.array(z.string())),
});

const animeCatalogSchema = z.object({
  Page: z.object({
    pageInfo: z.object({ hasNextPage: z.boolean() }),
    media: z.array(mediaSchema),
  }),
});

type Media = z.infer<typeof mediaSchema>;

function toCover({ large, extraLarge }: Media['coverImage']): AnimeCover | null {
  const small = large ?? extraLarge;
  const bigger = extraLarge ?? large;
  if (small === null || bigger === null) return null;
  return { small, large: bigger };
}

function toAnime(media: Media): Anime {
  return {
    id: media.id,
    title: media.title.romaji,
    cover: toCover(media.coverImage),
    score: media.averageScore,
    genres: media.genres ?? [],
  };
}

export async function fetchAnimeCatalog(signal: AbortSignal): Promise<AnimePage> {
  const { Page } = await requestGraphql(
    { query: ANIME_CATALOG_QUERY, variables: { page: 1, perPage: PAGE_SIZE }, signal },
    animeCatalogSchema,
  );
  return { animes: Page.media.map(toAnime), hasNextPage: Page.pageInfo.hasNextPage };
}
