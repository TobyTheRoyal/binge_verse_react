
import { WatchlistModel, WatchlistDocument } from '../models/watchlist';
import { MoviesService } from './moviesService';
import { ContentService, Content } from './contentService';

export type WatchlistItem = Content & { rating?: number };

export class WatchlistService {
   private moviesService: MoviesService;

  constructor(contentService: ContentService) {
    this.moviesService = new MoviesService(contentService);
  }

  async addToWatchlist(
    userId: string,
    tmdbId: string,
    type: 'movie' | 'tv',
  ): Promise<WatchlistDocument> {
    const existing = await WatchlistModel.findOne({ userId, tmdbId, type }).exec();
    if (existing) {
      return existing;
    }
    const item = new WatchlistModel({ userId, tmdbId, type});
    return item.save();
  }

  async getWatchlist(userId: string): Promise<WatchlistItem[]> {
    const docs = await WatchlistModel.find({ userId }).exec();
    const items = await Promise.all(
      docs.map(
        async (doc): Promise<WatchlistItem | null> => {
          const content = await this.moviesService.findByTmdbId(doc.tmdbId);
          return content
            ? { ...content, ...(doc.rating != null && { rating: doc.rating }) }
            : null;
        }
      )
    );
    return items.filter((i): i is WatchlistItem => i !== null);
  }

  async removeFromWatchlist(userId: string, tmdbId: string): Promise<void> {
    await WatchlistModel.deleteOne({ userId, tmdbId }).exec();
  }
}