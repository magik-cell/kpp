const mongoose = require('mongoose');

const { Schema } = mongoose;

const VehicleSchema = new Schema({
  licensePlate: {
    type: String,
    required: [true, "Номер авто є обов'язковим"],
    unique: true,
    uppercase: true,
    match: [/^[АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ0-9]+$/, 'Номер авто може містити лише українські літери та цифри']
  },
  brand: {
    type: String,
    required: [true, 'Марка авто є обов\'язковою'],
    maxlength: [50, 'Марка не може містити більше 50 символів']
  },
  vehicleModel: {
    type: String,
    required: [true, 'Модель авто є обов\'язковою'],
    maxlength: [50, 'Модель не може містити більше 50 символів']
  },
  owner: {
    type: String,
    required: [true, 'Власник авто є обов\'язковим'],
    maxlength: [100, 'Ім\'я власника не може містити більше 100 символів']
  },
  accessType: {
    type: String,
    enum: {
      values: ['temporary_24h', 'temporary_custom', 'permanent'],
      message: 'Тип доступу повинен бути temporary_24h, temporary_custom або permanent'
    },
    required: true
  },
  validUntil: {
    type: Date,
    validate: {
      validator: function(value) {
        if (!this.isActive) return true;
        if (this.accessType === 'permanent') {
          return value === undefined || value === null;
        }
        return value !== undefined && value !== null && value > new Date();
      },
      message: 'Дата закінчення дії повинна бути в майбутньому для тимчасового доступу'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

VehicleSchema.index({ licensePlate: 1 });
VehicleSchema.index({ owner: 'text' });

module.exports = mongoose.model('Vehicle', VehicleSchema);
