export interface AnimeCover {
  small: string;
  large: string;
}

export interface Anime {
  id: number;
  title: string | null;
  cover: AnimeCover | null;
  score: number | null;
  genres: string[];
}

export interface AnimePage {
  animes: Anime[];
  hasNextPage: boolean;
}
