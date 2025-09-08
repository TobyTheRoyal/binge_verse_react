import { ContentService, Content } from './contentService';

export class SeriesService {
  constructor(private contentService: ContentService) {}

  async findByTmdbId(tmdbId: string): Promise<Content | undefined> {
    const lists = [
      await this.contentService.getTrendingSeries(),
      await this.contentService.getTopRatedSeries(),
    ];
    for (const list of lists) {
      const found = list.find(c => c.tmdbId === tmdbId);
      if (found) return found;
    }
    const content = await this.contentService.getContentDetails(tmdbId, 'tv');
    return content ?? undefined;
  }

  async listTrendingSeries(page: number, _filters: any): Promise<Content[]> {
    return this.contentService.fetchTrendingSeries(page);
  }
}