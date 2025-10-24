const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, "Логін є обов'язковим"],
    unique: true,
    minlength: [3, 'Логін повинен містити мінімум 3 символи'],
    maxlength: [20, 'Логін не може містити більше 20 символів']
  },
  password: {
    type: String,
    required: [true, "Пароль є обов'язковим"],
    minlength: [6, 'Пароль повинен містити мінімум 6 символів']
  },
  role: {
    type: String,
    enum: {
      values: ['kpp_officer', 'unit_officer', 'admin'],
      message: 'Роль повинна бути kpp_officer, unit_officer або admin'
    },
    required: true
  },
  fullName: {
    type: String,
    required: [true, "Повне ім'я є обов'язковим"],
    maxlength: [100, "Повне ім'я не може містити більше 100 символів"]
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
