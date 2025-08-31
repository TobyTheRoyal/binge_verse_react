import { WatchlistModel, WatchlistDocument } from '../models/watchlist';

  export class WatchlistService {
  async addToWatchlist(userId: string, tmdbId: string): Promise<WatchlistDocument> {
    const existing = await WatchlistModel.findOne({ userId, tmdbId }).exec();
    if (existing) {
      return existing;
    }
    const item = new WatchlistModel({ userId, tmdbId });
    return item.save();
  }

  async getWatchlist(userId: string): Promise<WatchlistDocument[]> {
    return WatchlistModel.find({ userId }).exec();
  }

  async removeFromWatchlist(userId: string, tmdbId: string): Promise<void> {
    await WatchlistModel.deleteOne({ userId, tmdbId }).exec();
  }
}