import { Schema, model, Document } from 'mongoose';

export interface RatingDocument extends Document {
  userId: string;
  tmdbId: string;
  rating: number;
}

const RatingSchema = new Schema<RatingDocument>({
  userId: { type: String, required: true },
  tmdbId: { type: String, required: true },
  rating: { type: Number, required: true },
});

export const RatingModel = model<RatingDocument>('Rating', RatingSchema);