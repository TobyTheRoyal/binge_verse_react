import { Schema, model, Document } from 'mongoose';

export interface CastMemberDocument extends Document {
  tmdbId: number;
  name: string;
  character: string;
  profilePathUrl: string;
}

export const CastMemberSchema = new Schema<CastMemberDocument>({
  tmdbId: { type: Number, required: true },
  name: { type: String, required: true },
  character: { type: String, required: true },
  profilePathUrl: { type: String, required: true },
});

export const CastMemberModel = model<CastMemberDocument>('CastMember', CastMemberSchema);