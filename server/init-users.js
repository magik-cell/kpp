// Скрипт ініціалізації користувачів для Railway
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kpp_control';

// Дефолтні користувачі для продакшну
const defaultUsers = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    fullName: 'Системний Адміністратор'
  },
  {
    username: 'unit_officer',
    password: 'unit123',
    role: 'unit_officer',
    fullName: 'Черговий Підрозділу'
  },
  {
    username: 'kpp_officer',
    password: 'kpp123',
    role: 'kpp_officer',
    fullName: 'Черговий КПП'
  }
];

async function initializeUsers() {
  try {
    console.log('🔌 Підключення до MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Підключено до MongoDB');

    // Перевіряємо чи вже є користувачі
    const existingUsers = await User.countDocuments();
    
    if (existingUsers > 0) {
      console.log(`ℹ️  Знайдено ${existingUsers} користувачів. Ініціалізація пропущена.`);
      return;
    }

    console.log('👥 Створення дефолтних користувачів...');

    for (const userData of defaultUsers) {
      // Хешуємо пароль
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      // Створюємо користувача
      const user = new User({
        username: userData.username,
        password: hashedPassword,
        role: userData.role,
        fullName: userData.fullName,
        isActive: true
      });

      await user.save();
      console.log(`✅ Створено користувача: ${userData.username} (${userData.role})`);
    }

    console.log('🎉 Ініціалізація користувачів завершена!');
    console.log('');
    console.log('📋 Дані для входу:');
    defaultUsers.forEach(user => {
      console.log(`   ${user.role}: ${user.username} / ${user.password}`);
    });

  } catch (error) {
    console.error('❌ Помилка ініціалізації:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Відключено від MongoDB');
  }
}

// Запускаємо тільки якщо викликано безпосередньо
if (process.env.INIT_USERS === 'true') {
  initializeUsers();
}

export { initializeUsers };