import { ContentService, Content } from './contentService';

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

  async listTrendingSeries(page: number, _filters: any): Promise<Content[]> {
    return this.contentService.fetchTrendingSeries(page);
  }
}