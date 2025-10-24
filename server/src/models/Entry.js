const mongoose = require('mongoose');

const { Schema } = mongoose;

const EntrySchema = new Schema({
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
  entryTime: { type: Date, default: null },
  exitTime: { type: Date, default: null },
  status: {
    type: String,
    enum: { values: ['entered', 'exited'], message: 'Статус повинен бути entered або exited' },
    required: true,
    default: 'exited'
  },
  processedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

EntrySchema.index({ vehicle: 1, createdAt: -1 });
EntrySchema.index({ licensePlate: 1, createdAt: -1 });
EntrySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Entry', EntrySchema);
