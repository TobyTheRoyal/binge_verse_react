import { ContentService, Content } from './contentService';

export interface SeriesFilters {
  genres?: string[];
  releaseYear?: number;
  releaseYearMin?: number;
  releaseYearMax?: number;
  imdbRating?: number;
  imdbRatingMin?: number;
  rtRating?: number;
  rtRatingMin?: number;
  providers?: string[];
}
export class SeriesService {
  constructor(private contentService: ContentService) {}

  async findByTmdbId(tmdbId: string): Promise<Content | undefined> {
    const lists = [
      await this.contentService.getTrendingSeries(),
      await this.contentService.getTopRatedSeries(),
    ];
    let cached: Content | undefined;
    for (const list of lists) {
      const found = list.find(c => c.tmdbId === tmdbId);
      if (found) {
        cached = found;
        break;
      }
    }
    const details = await this.contentService.getContentDetails(tmdbId, 'tv');

    if (details && cached) {
      return { ...cached, ...details };
    }

    return details ?? cached;
  }

  async listTrendingSeries(
    page: number,
    filters: SeriesFilters,
  ): Promise<Content[]> {
    let series = await this.contentService.fetchTrendingSeries(page);

    if (!filters || Object.keys(filters).length === 0) {
      return series;
    }

    const {
      genres,
      releaseYear,
      releaseYearMin,
      releaseYearMax,
      imdbRating,
      imdbRatingMin,
      rtRating,
      rtRatingMin,
      providers,
    } = filters;

    if ((genres && genres.length) || (providers && providers.length)) {
      series = await Promise.all(
        series.map(async s => {
          const details = await this.contentService.getContentDetails(s.tmdbId, 'tv');
          return details ? { ...s, ...details } : s;
        }),
      );
    }

    return series.filter(s => {
      if (genres && genres.length) {
        if (!s.genres || !genres.every(g => s.genres!.includes(g))) {
          return false;
        }
      }

      if (releaseYear && s.releaseYear !== releaseYear) {
        return false;
      }

      if (
        (typeof releaseYearMin === 'number' && s.releaseYear < releaseYearMin) ||
        (typeof releaseYearMax === 'number' && s.releaseYear > releaseYearMax)
      ) {
        return false;
      }

      const imdbThreshold = imdbRatingMin ?? imdbRating;
      if (imdbThreshold && (s.imdbRating ?? 0) < imdbThreshold) {
        return false;
      }

      const rtThreshold = rtRatingMin ?? rtRating;
      if (rtThreshold && (s.rtRating ?? 0) < rtThreshold) {
        return false;
      }

      if (providers && providers.length) {
        if (!s.providers || !providers.every(p => s.providers!.includes(p))) {
          return false;
        }
      }

      return true;
    });
  }
}