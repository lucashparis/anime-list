export const LONG_TITLE =
  'Tensei Shitara Yuusha no Tomodachi datta Ken: Isekai de Nonbiri Kurasu Hibi no Monogatari';

const COVER_ROOT = 'https://s4.anilist.co/file/anilistcdn/media/anime/cover';

function fixtureMedia(id: number, overrides: object = {}) {
  return {
    id,
    title: { romaji: `Fixture Anime ${String(id)}` },
    coverImage: {
      large: `${COVER_ROOT}/medium/fixture-${String(id)}.svg`,
      extraLarge: `${COVER_ROOT}/large/fixture-${String(id)}.svg`,
    },
    averageScore: 70,
    genres: ['Action', 'Drama'],
    ...overrides,
  };
}

const PAGE_SIZE = 12;

export function pagedCatalogResponse(page: number, hasNextPage: boolean) {
  const offset = (page - 1) * PAGE_SIZE;
  return {
    data: {
      Page: {
        pageInfo: { hasNextPage },
        media: Array.from({ length: PAGE_SIZE }, (_, index) => fixtureMedia(offset + index + 1)),
      },
    },
  };
}

export const animeCatalogResponse = {
  data: {
    Page: {
      pageInfo: { hasNextPage: true },
      media: [
        fixtureMedia(1, { averageScore: 49 }),
        fixtureMedia(2, { averageScore: 50 }),
        fixtureMedia(3, { averageScore: 80 }),
        fixtureMedia(4, { averageScore: 81 }),
        fixtureMedia(5, { averageScore: null }),
        fixtureMedia(6, { title: { romaji: LONG_TITLE } }),
        fixtureMedia(7, {
          genres: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Mystery'],
        }),
        fixtureMedia(8, { title: { romaji: null } }),
        fixtureMedia(9, { coverImage: { large: null, extraLarge: null } }),
        fixtureMedia(10, { genres: [] }),
        fixtureMedia(11, { genres: null }),
        fixtureMedia(12),
      ],
    },
  },
};
