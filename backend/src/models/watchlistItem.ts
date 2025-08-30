import { Schema, model, Document } from 'mongoose';

export interface WatchlistItemDocument extends Document {
  userId: string;
  tmdbId: string;
}

const WatchlistItemSchema = new Schema<WatchlistItemDocument>({
  userId: { type: String, required: true },
  tmdbId: { type: String, required: true },
});

export const WatchlistItemModel = model<WatchlistItemDocument>('WatchlistItem', WatchlistItemSchema);