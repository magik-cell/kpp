// MongoDB initialization script
// Цей файл виконується при першому запуску MongoDB контейнера

// Створюємо базу даних
db = db.getSiblingDB('kpp_control');

// Створюємо користувача для бази даних
db.createUser({
  user: 'kpp_user',
  pwd: 'kpp_password',
  roles: [
    {
      role: 'readWrite',
      db: 'kpp_control'
    }
  ]
});

// Створюємо початкові колекції з валідацією
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'password', 'role'],
      properties: {
        username: {
          bsonType: 'string',
          description: 'Username must be a string and is required'
        },
        password: {
          bsonType: 'string',
          description: 'Password must be a string and is required'
        },
        role: {
          bsonType: 'string',
          enum: ['admin', 'kpp_officer', 'unit_officer'],
          description: 'Role must be one of admin, kpp_officer, unit_officer'
        },
        fullName: {
          bsonType: 'string',
          description: 'Full name must be a string'
        },
        unit: {
          bsonType: 'string',
          description: 'Unit must be a string'
        }
      }
    }
  }
});

db.createCollection('vehicles', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['vehicleNumber', 'vehicleType', 'unit'],
      properties: {
        vehicleNumber: {
          bsonType: 'string',
          description: 'Vehicle number must be a string and is required'
        },
        vehicleType: {
          bsonType: 'string',
          description: 'Vehicle type must be a string and is required'
        },
        unit: {
          bsonType: 'string',
          description: 'Unit must be a string and is required'
        },
        driverName: {
          bsonType: 'string',
          description: 'Driver name must be a string'
        },
        status: {
          bsonType: 'string',
          enum: ['active', 'inactive', 'maintenance'],
          description: 'Status must be one of active, inactive, maintenance'
        }
      }
    }
  }
});

db.createCollection('entries');

// Створюємо індекси для оптимізації
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.vehicles.createIndex({ vehicleNumber: 1 }, { unique: true });
db.vehicles.createIndex({ unit: 1 });
db.entries.createIndex({ vehicleId: 1 });
db.entries.createIndex({ timestamp: -1 });
db.entries.createIndex({ entryType: 1 });

// Вставляємо тестові дані
// Пароль для всіх користувачів: admin123 (хеш)
const hashedPassword = '$2b$10$K7L/8Y75bPVh1sBvyB1rTuHQZj/X8v7/mY9n3jE5LkMjH2N4vY8xW';

db.users.insertMany([
  {
    username: 'admin',
    password: hashedPassword,
    role: 'admin',
    fullName: 'Системний адміністратор',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'kpp_officer',
    password: hashedPassword,
    role: 'kpp_officer',
    fullName: 'Сержант Іванов',
    unit: 'КПП-1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'unit_officer',
    password: hashedPassword,
    role: 'unit_officer',
    fullName: 'Лейтенант Петренко',
    unit: '1-ша рота',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Отримуємо unit_officer для створення автомобілів
const unitOfficer = db.users.findOne({username: 'unit_officer'});

db.vehicles.insertMany([
  {
    licensePlate: 'АБВГ123',
    brand: 'БТР',
    vehicleModel: 'БТР-80',
    owner: 'Старший сержант Сидоренко',
    accessType: 'permanent',
    isActive: true,
    createdBy: unitOfficer._id,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    licensePlate: 'ДЕЖЗ456',
    brand: 'БМП',
    vehicleModel: 'БМП-2',
    owner: 'Сержант Коваленко',
    accessType: 'permanent',
    isActive: true,
    createdBy: unitOfficer._id,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    licensePlate: 'ИЙКЛ789',
    brand: 'Урал',
    vehicleModel: 'Урал-4320',
    owner: 'Молодший сержант Шевченко',
    accessType: 'permanent',
    isActive: true,
    createdBy: unitOfficer._id,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('✅ MongoDB база даних успішно ініціалізована!');
print('👤 Створені тестові користувачі:');
print('   - admin/admin123 (адміністратор)');
print('   - kpp_officer/admin123 (офіцер КПП)');
print('   - unit_officer/admin123 (офіцер підрозділу)');
print('🚗 Додані тестові транспортні засоби');