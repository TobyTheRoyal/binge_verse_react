import { ContentService, Content } from './contentService';

export class MoviesService {
  constructor(private contentService: ContentService) {}

  async findByTmdbId(tmdbId: string): Promise<Content | undefined> {
    const lists = [
      await this.contentService.getTrending(),
      await this.contentService.getTopRated(),
      await this.contentService.getNewReleases(),
    ];
    let cached: Content | undefined;
    for (const list of lists) {
      const found = list.find(c => c.tmdbId === tmdbId);
      if (found) {
        cached = found;
        break;
      }
    }
    const details = await this.contentService.getContentDetails(tmdbId, 'movie');

    if (details && cached) {
      return { ...cached, ...details };
    }

    return details ?? cached;
  }
  
  async listTrendingMovies(page: number, filters: any): Promise<Content[]> {
    let movies = await this.contentService.fetchTrendingMovies(page);

    if (!filters || Object.keys(filters).length === 0) {
      return movies;
    }

    const { genres, releaseYear, imdbRating, rtRating, providers } = filters;

    // Fetch additional details if genre or provider filters are requested
    if ((genres && genres.length) || (providers && providers.length)) {
      movies = await Promise.all(
        movies.map(async m => {
          const details = await this.contentService.getContentDetails(m.tmdbId, 'movie');
          return details ? { ...m, ...details } : m;
        })
      );
    }

    return movies.filter(m => {
      if (genres && genres.length) {
        if (!m.genres || !genres.every((g: string) => m.genres!.includes(g))) {
          return false;
        }
      }

      if (releaseYear && m.releaseYear !== releaseYear) {
        return false;
      }

      if (imdbRating && (m.imdbRating ?? 0) < imdbRating) {
        return false;
      }

      if (rtRating && (m.rtRating ?? 0) < rtRating) {
        return false;
      }

      if (providers && providers.length) {
        if (!m.providers || !providers.every((p: string) => m.providers!.includes(p))) {
          return false;
        }
      }

      return true;
    });
  }
}