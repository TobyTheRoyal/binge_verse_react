import { RatingModel, RatingDocument } from '../models/rating';

  export class RatingsService {
  async setRating(userId: string, tmdbId: string, rating: number): Promise<RatingDocument> {
    const doc = await RatingModel.findOneAndUpdate(
      { userId, tmdbId },
      { rating },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).exec();
    return doc;
  }

  async getRating(userId: string, tmdbId: string): Promise<number | undefined> {
    const doc = await RatingModel.findOne({ userId, tmdbId }).exec();
    return doc?.rating;
  }

  async getUserRatings(userId: string): Promise<RatingDocument[]> {
    const docs = await RatingModel.find({ userId }).exec();
    return docs;
  }
}