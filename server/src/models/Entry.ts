import mongoose, { Document, Schema } from 'mongoose';

export interface IEntry extends Document {
  vehicle: mongoose.Types.ObjectId;
  licensePlate: string;
  entryTime?: Date;
  exitTime?: Date;
  status: 'entered' | 'exited';
  processedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EntrySchema: Schema = new Schema({
  vehicle: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  licensePlate: {
    type: String,
    required: true,
    uppercase: true
  },
  entryTime: {
    type: Date,
    default: null
  },
  exitTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: {
      values: ['entered', 'exited'],
      message: 'Статус повинен бути entered або exited'
    },
    required: true,
    default: 'exited'
  },
  processedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
EntrySchema.index({ vehicle: 1, createdAt: -1 });
EntrySchema.index({ licensePlate: 1, createdAt: -1 });
EntrySchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IEntry>('Entry', EntrySchema);