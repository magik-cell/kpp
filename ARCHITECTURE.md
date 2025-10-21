# 🏗️ Архітектура системи

## Загальна структура

```
KPP Control System
├── Frontend (React + TypeScript)
├── Backend (Node.js + Express + TypeScript) 
├── Database (MongoDB)
└── Authentication (JWT)
```

## 🎯 Основні компоненти

### Frontend Architecture
```
client/src/
├── components/          # React компоненти
│   ├── LoginPage.tsx    # Сторінка входу
│   ├── Header.tsx       # Заголовок додатку
│   ├── KppOfficerDashboard.tsx      # Панель чергового КПП
│   └── UnitOfficerDashboard.tsx     # Панель чергового частини
├── services/            # API сервіси
│   └── api.ts          # HTTP клієнт з Axios
├── types/              # TypeScript типи
│   └── index.ts        # Інтерфейси та типи
├── styles/             # SCSS стилі
│   └── App.scss        # Головні стилі
└── App.tsx             # Головний компонент
```

### Backend Architecture
```
server/src/
├── models/             # MongoDB моделі
│   ├── User.ts         # Модель користувача
│   ├── Vehicle.ts      # Модель автомобіля
│   └── Entry.ts        # Модель запису проїзду
├── routes/             # Express маршрути
│   ├── auth.ts         # Аутентифікація
│   ├── vehicles.ts     # Управління автомобілями
│   └── entries.ts      # Записи проїздів
├── middleware/         # Middleware функції
│   └── auth.ts         # JWT аутентифікація
└── index.ts           # Головний серверний файл
```

## 🔐 Система безпеки

### Аутентифікація
- JWT токени з терміном дії 24 години
- Хешування паролів bcrypt (10 rounds)
- Middleware для перевірки токенів
- Перевірка ролей на рівні маршрутів

### Авторизація
```typescript
// Ролі користувачів
type UserRole = 'kpp_officer' | 'unit_officer';

// Доступ до маршрутів
- kpp_officer: перевірка авто, відмітка проїздів
- unit_officer: управління списком авто, перегляд статистики
```

## 📊 База даних

### MongoDB Collections

#### Users
```javascript
{
  _id: ObjectId,
  username: String (unique),
  password: String (hashed),
  role: 'kpp_officer' | 'unit_officer',
  fullName: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Vehicles  
```javascript
{
  _id: ObjectId,
  licensePlate: String (unique, uppercase),
  brand: String,
  model: String,
  owner: String,
  accessType: 'permanent' | 'temporary_24h' | 'temporary_custom',
  validUntil: Date (optional),
  isActive: Boolean,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

#### Entries
```javascript
{
  _id: ObjectId,
  vehicle: ObjectId (ref: Vehicle),
  licensePlate: String,
  entryTime: Date,
  exitTime: Date,
  status: 'entered' | 'exited',
  processedBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 Потік даних

### Сценарій 1: Проїзд автомобіля через КПП
```
1. Черговий КПП вводить номер авто
2. GET /api/vehicles/check/:plate
3. Сервер перевіряє базу даних та валідність
4. Повертає інформацію про дозвіл
5. При дозволі - кнопка "Відмітити проїзд"
6. POST /api/entries/toggle/:plate  
7. Створює/оновлює запис Entry
8. Повертає підтвердження
```

### Сценарій 2: Управління автомобілями
```
1. Черговий частини відкриває список
2. GET /api/vehicles (з пагінацією)
3. Можливість: додати/редагувати/видалити
4. POST/PUT/DELETE /api/vehicles/:id
5. Валідація та збереження в MongoDB
6. Оновлення списку
```

## 🎨 UI/UX

### Дизайн система
- Кольорова схема: Зелені відтінки (військова тематика)
- Адаптивний дизайн (mobile-first)
- SCSS з BEM методологією
- Мікроанімації та transitions

### Компонентна архітектура
```
App
├── Header (authenticated users)
├── Router
│   ├── LoginPage (public)
│   ├── KppOfficerDashboard (role: kpp_officer)
│   └── UnitOfficerDashboard (role: unit_officer)
└── Global Styles
```

## 🚀 Деплой та продакшн

### Build процес
```bash
# Backend
cd server && npm run build  # TypeScript → JavaScript

# Frontend  
cd client && npm run build  # React → static files
```

### Environment Variables
```env
# Development
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kpp_control
JWT_SECRET=development_secret

# Production
NODE_ENV=production  
PORT=80
MONGODB_URI=mongodb://production-server/kpp_control
JWT_SECRET=strong_production_secret
```

## 📈 Можливості розширення

### Функціонал
- [ ] Звіти та аналітика
- [ ] Експорт даних (Excel/PDF)
- [ ] Email/SMS сповіщення
- [ ] Інтеграція з камерами
- [ ] Мобільний додаток
- [ ] Система гостьових пропусків

### Технічне
- [ ] Redis для кешування
- [ ] WebSocket для real-time
- [ ] Docker контейнеризація  
- [ ] Nginx reverse proxy
- [ ] CI/CD pipeline
- [ ] Моніторинг та логування

## 🧪 Тестування

### Типи тестів
- Unit tests (Jest)
- Integration tests (Supertest)
- E2E tests (Cypress)
- Load testing (Artillery)

### Test Coverage
```bash
# Backend tests
cd server && npm test

# Frontend tests  
cd client && npm test
```

## 📊 Метрики та моніторинг

### KPI системи
- Час відгуку API (<200ms)
- Доступність системи (99.9%)
- Кількість проїздів за день
- Помилки автентифікації
- Користувачі онлайн

### Логування
```javascript
// Winston logger
const levels = {
  error: 0,    // Критичні помилки
  warn: 1,     // Попередження  
  info: 2,     // Інформація
  debug: 3     // Налагодження
};
```

Ця архітектура забезпечує масштабованість, безпеку та зручність використання системи контролю КПП.