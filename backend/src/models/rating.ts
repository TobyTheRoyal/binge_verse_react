import { Schema, model, Document } from 'mongoose';

export interface RatingDocument extends Document {
  userId: string;
  tmdbId: string;
  contentType: 'movie' | 'tv';
  rating: number;
}

const RatingSchema = new Schema<RatingDocument>({
  userId: { type: String, required: true },
  tmdbId: { type: String, required: true },
  contentType: { type: String, enum: ['movie', 'tv'], required: true },
  rating: { type: Number, required: true },
});

export const RatingModel = model<RatingDocument>('Rating', RatingSchema);