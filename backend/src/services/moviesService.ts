import { ContentService, Content } from './contentService';

export class MoviesService {
  constructor(private contentService: ContentService) {}

  async findByTmdbId(tmdbId: string): Promise<Content | undefined> {
    const lists = [
      await this.contentService.getTrending(),
      await this.contentService.getTopRated(),
      await this.contentService.getNewReleases(),
    ];
    for (const list of lists) {
      const found = list.find(c => c.tmdbId === tmdbId);
      if (found) return found;
    }
    return undefined;
  }
}