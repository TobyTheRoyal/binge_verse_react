import { Schema, model, Document, Types } from 'mongoose';
import { CastMemberDocument, CastMemberSchema } from './castMember';

export interface ContentDocument extends Document {
  cacheKey: string;
  tmdbId: string;
  type: 'movie' | 'tv';
  title: string;
  releaseYear?: number;
  poster?: string;
  imdbRating?: number;
  rtRating?: number;
  language?: string;
  genres?: string[];
  providers?: string[];
  overview?: string;
  cast?: Types.DocumentArray<CastMemberDocument>;
  lastSyncedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const ContentSchema = new Schema<ContentDocument>({
  cacheKey: { type: String, required: true, unique: true, index: true },
  tmdbId: { type: String, required: true, index: true },
  type: { type: String, required: true, enum: ['movie', 'tv'], index: true },
  title: { type: String, required: true },
  releaseYear: { type: Number },
  poster: { type: String },
  imdbRating: { type: Number },
  rtRating: { type: Number },
  language: { type: String },
  genres: [{ type: String }],
  providers: [{ type: String }],
  overview: { type: String },
  cast: [CastMemberSchema],
  lastSyncedAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

ContentSchema.index({ tmdbId: 1, type: 1 }, { unique: true });

export const ContentModel = model<ContentDocument>('Content', ContentSchema);
