import { Schema, model, Document } from 'mongoose';

export interface WatchlistDocument extends Document {
  userId: string;
  tmdbId: string;
  type: 'movie' | 'tv';
  addedAt: Date;
  rating?: number;
}

const WatchlistSchema = new Schema<WatchlistDocument>({
  userId: { type: String, required: true },
  tmdbId: { type: String, required: true },
  type: { type: String, enum: ['movie', 'tv'], required: true },
  addedAt: { type: Date, default: Date.now },
  rating: { type: Number },
});

export const WatchlistModel = model<WatchlistDocument>('Watchlist', WatchlistSchema);