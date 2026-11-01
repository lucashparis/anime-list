export interface AnimeCover {
  small: string;
  large: string;
}

export interface Anime {
  id: number;
  title: string | null;
  cover: AnimeCover | null;
  coverColor: string | null;
  score: number | null;
  genres: string[];
  url: string | null;
}

export interface AnimePage {
  animes: Anime[];
  hasNextPage: boolean;
}
