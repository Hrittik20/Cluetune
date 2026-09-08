import type { ModeFilters } from "./types";

/** Empty genre/decade arrays mean "no constraint". */
export const DEFAULT_FILTERS: ModeFilters = {
  genres: [],
  decades: [],
  difficulty: [1, 3],
};
