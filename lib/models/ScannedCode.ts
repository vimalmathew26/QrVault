// lib/models/ScannedCode.ts
import mongoose, { Schema, Document, models, model } from 'mongoose';

// Interface for type safety
export interface IScannedCode extends Document {
  data: string;
  note?: string;
  scannedAt: Date;
}

const ScannedCodeSchema: Schema = new Schema({
  data: {
    type: String,
    required: [true, 'Data is required.'],
  },
  note: {
    type: String,
    trim: true,
  },
  scannedAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent model overwrite in development hot-reloading
const ScannedCode = models.ScannedCode || model<IScannedCode>('ScannedCode', ScannedCodeSchema);

export default ScannedCode;