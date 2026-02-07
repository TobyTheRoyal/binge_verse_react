import { RatingModel, RatingDocument } from '../models/rating';
import { ContentService, Content } from './contentService';

export class RatingsService {
  constructor(private readonly contentService: ContentService = new ContentService()) {}

  async setRating(
    userId: string,
    tmdbId: string,
    rating: number,
    contentType: 'movie' | 'tv'
  ): Promise<RatingDocument> {
    const doc = await RatingModel.findOneAndUpdate(
      { userId, tmdbId },
      { rating, contentType },
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
  async getRatingsMap(
    userId: string,
    tmdbIds: string[],
  ): Promise<Record<string, number>> {
    const docs = await RatingModel.find({
      userId,
      tmdbId: { $in: tmdbIds },
    }).exec();
    const map: Record<string, number> = {};
    for (const doc of docs) {
      map[doc.tmdbId] = doc.rating;
    }
    return map;
  }
  
  async getUserRatedContent(
    userId: string
  ): Promise<(Content & { rating: number })[]> {
    const docs = await RatingModel.find({ userId }).exec();
    const results: (Content & { rating: number })[] = [];

    for (const doc of docs) {
      const content = await this.contentService.getContentDetails(
        doc.tmdbId,
        doc.contentType as 'movie' | 'tv'
      );
      if (content) {
        results.push({ ...content, rating: doc.rating });
      }
    }

    return results;
  }
}
