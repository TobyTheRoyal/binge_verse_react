import { WatchlistItemModel, WatchlistItemDocument } from '../models/watchlistItem';

  export class WatchlistService {
  async addToWatchlist(userId: string, tmdbId: string): Promise<WatchlistItemDocument> {
    const existing = await WatchlistItemModel.findOne({ userId, tmdbId }).exec();
    if (existing) {
      return existing;
    }
    const item = new WatchlistItemModel({ userId, tmdbId });
    return item.save();
  }

  async getWatchlist(userId: string): Promise<WatchlistItemDocument[]> {
    return WatchlistItemModel.find({ userId }).exec();
  }

  async removeFromWatchlist(userId: string, tmdbId: string): Promise<void> {
    await WatchlistItemModel.deleteOne({ userId, tmdbId }).exec();
  }
}