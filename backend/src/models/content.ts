import { Schema, model, Document, Types } from 'mongoose';
import { CastMemberDocument, CastMemberSchema } from './castMember';

export interface ContentDocument extends Document {
  tmdbId: string;
  type: string;
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
}

const ContentSchema = new Schema<ContentDocument>({
  tmdbId: { type: String, required: true, unique: true },
  type: { type: String, required: true },
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
});

export const ContentModel = model<ContentDocument>('Content', ContentSchema);