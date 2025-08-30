export class RatingsService {
  private ratings = new Map<string, number>();

  setRating(userId: number, tmdbId: string, rating: number) {
    this.ratings.set(`${userId}:${tmdbId}`, rating);
  }

  getRating(userId: number, tmdbId: string): number | undefined {
    return this.ratings.get(`${userId}:${tmdbId}`);
  }
}