import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User';
import Vehicle from './src/models/Vehicle';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kpp_control';

async function initializeDatabase() {
  try {
    // Підключення до MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Підключено до MongoDB');

    // Очистка існуючих даних (опціонально)
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    console.log('🗑️ Очищено існуючі дані');

    // Створення тестових користувачів
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');

    const users = [
      {
        username: 'kpp_officer',
        password: await bcrypt.hash('password123', saltRounds),
        role: 'kpp_officer',
        fullName: 'Іван Петрович Коваленко'
      },
      {
        username: 'unit_officer', 
        password: await bcrypt.hash('password123', saltRounds),
        role: 'unit_officer',
        fullName: 'Сергій Іванович Мельник'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('👥 Створено тестових користувачів:');
    createdUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.role}) - ${user.fullName}`);
    });

    // Створення тестових автомобілів
    const unitOfficer = createdUsers.find(u => u.role === 'unit_officer');
    
    if (unitOfficer) {
      // Автомобіль з постійним доступом
      const permanentVehicle = new Vehicle({
        licensePlate: 'AA1234BB',
        brand: 'Toyota',
        vehicleModel: 'Camry',
        owner: 'Олександр Олександрович Сидоренко',
        accessType: 'permanent',
        createdBy: unitOfficer._id
      });

      // Автомобіль з тимчасовим доступом на 24 години
      const temp24hVehicle = new Vehicle({
        licensePlate: 'BC5678DE',
        brand: 'BMW',
        vehicleModel: 'X5',
        owner: 'Марія Петрівна Іваненко',
        accessType: 'temporary_24h',
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // +24 години
        createdBy: unitOfficer._id
      });

      // Автомобіль з кастомним тимчасовим доступом
      const tempCustomVehicle = new Vehicle({
        licensePlate: 'FG9012HI',
        brand: 'Mercedes-Benz',
        vehicleModel: 'C-Class',
        owner: 'Дмитро Андрійович Петренко',
        accessType: 'temporary_custom',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 днів
        createdBy: unitOfficer._id
      });

      await Promise.all([
        permanentVehicle.save(),
        temp24hVehicle.save(),  
        tempCustomVehicle.save()
      ]);

      console.log('🚗 Створено тестові автомобілі:');
      console.log(`   - ${permanentVehicle.licensePlate} (${permanentVehicle.owner}) - Постійний доступ`);
      console.log(`   - ${temp24hVehicle.licensePlate} (${temp24hVehicle.owner}) - 24 години`);
      console.log(`   - ${tempCustomVehicle.licensePlate} (${tempCustomVehicle.owner}) - До ${tempCustomVehicle.validUntil?.toLocaleDateString('uk-UA')}`);
    }

    console.log('\n🎉 База даних успішно ініціалізована!');
    console.log('\n📋 Дані для входу:');
    console.log('┌─────────────────┬──────────────┬──────────────────────────────┐');
    console.log('│ Логін           │ Пароль       │ Роль                         │');
    console.log('├─────────────────┼──────────────┼──────────────────────────────┤');
    console.log('│ kpp_officer     │ password123  │ Черговий КПП                 │');
    console.log('│ unit_officer    │ password123  │ Черговий інституту           │');
    console.log('└─────────────────┴──────────────┴──────────────────────────────┘');

  } catch (error) {
    console.error('❌ Помилка ініціалізації бази даних:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Відключено від MongoDB');
    process.exit(0);
  }
}

// Запуск ініціалізації
initializeDatabase();