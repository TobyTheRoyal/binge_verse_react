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
  async listTrendingMovies(page: number, _filters: any): Promise<Content[]> {
    return this.contentService.fetchTrendingMovies(page);
  }
}