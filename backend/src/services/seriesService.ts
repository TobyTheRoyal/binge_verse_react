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
    return undefined;
  }

  async listSeries(page: number, _filters: any): Promise<Content[]> {
    const all = await this.contentService.getTrendingSeries();
    const pageSize = 20;
    const start = (page - 1) * pageSize;
    return all.slice(start, start + pageSize);
  }
}