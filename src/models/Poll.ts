import { Schema, model, Document, Types } from 'mongoose';

interface IVote {
  userId: Types.ObjectId;
  optionIndex: number;
}

interface IOption {
  location: string;
  latitude: number;
  longitude: number;
  aiScore: number;
  votes: number;
}

export interface IPoll extends Document {
  roomId: Types.ObjectId;
  options: IOption[];
  aiExplanation: string;
  votes: IVote[]; // NEW: track each vote's user and choice
  createdAt: Date;
}

const voteSchema = new Schema<IVote>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  optionIndex: { type: Number, required: true }
}, { _id: false });

const optionSchema = new Schema<IOption>({
  location: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  aiScore: { type: Number, required: true },
  votes: { type: Number, default: 0 }
}, { _id: false });

const pollSchema = new Schema<IPoll>({
  roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  options: [optionSchema],
  aiExplanation: { type: String },
  votes: [voteSchema], // NEW: per-user vote list
  createdAt: { type: Date, default: Date.now },
});

export default model<IPoll>('Poll', pollSchema);
