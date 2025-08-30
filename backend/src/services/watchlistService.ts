export class WatchlistService {
  private watchlists = new Map<number, string[]>();

  addToWatchlist(userId: number, tmdbId: string) {
    const list = this.watchlists.get(userId) || [];
    if (!list.includes(tmdbId)) {
      list.push(tmdbId);
      this.watchlists.set(userId, list);
    }
    return { userId, tmdbId };
  }

  getWatchlist(userId: number): string[] {
    return this.watchlists.get(userId) || [];
  }

  removeFromWatchlist(userId: number, tmdbId: string) {
    const list = this.watchlists.get(userId) || [];
    const filtered = list.filter(id => id !== tmdbId);
    this.watchlists.set(userId, filtered);
  }
}