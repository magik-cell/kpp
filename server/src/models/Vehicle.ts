import mongoose, { Document, Schema } from 'mongoose';

export interface IVehicle extends Document {
  licensePlate: string;
  brand: string;
  vehicleModel: string;
  owner: string;
  accessType: 'temporary_24h' | 'temporary_custom' | 'permanent';
  validUntil?: Date;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema: Schema = new Schema({
  licensePlate: {
    type: String,
    required: [true, 'Номер авто є обов\'язковим'],
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
      validator: function(this: IVehicle, value: Date) {
        // Якщо автомобіль неактивний, пропускаємо валідацію
        if (!this.isActive) {
          return true;
        }
        
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

// Index for faster searches
VehicleSchema.index({ licensePlate: 1 });
VehicleSchema.index({ owner: 'text' });

export default mongoose.model<IVehicle>('Vehicle', VehicleSchema);