// lib/models/GeneratedCode.ts
import mongoose, { Schema, Document, models, model } from 'mongoose';

// Interface for type safety
export interface IGeneratedCode extends Document {
  data: string;
  label?: string;
  foregroundColor: string;
  backgroundColor: string;
  createdAt: Date;
}

const GeneratedCodeSchema: Schema = new Schema({
  data: {
    type: String,
    required: [true, 'Data is required.'],
  },
  label: {
    type: String,
    trim: true,
  },
  foregroundColor: {
    type: String,
    default: '#000000',
  },
  backgroundColor: {
    type: String,
    default: '#FFFFFF',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent model overwrite in development hot-reloading
const GeneratedCode = models.GeneratedCode || model<IGeneratedCode>('GeneratedCode', GeneratedCodeSchema);

export default GeneratedCode;