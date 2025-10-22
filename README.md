# Система контролю транспортних засобів через КПП

Веб-додаток для контролю проїзду автомобілів через контрольно-пропускний пункт (КПП) з двома ролями користувачів.

## 🚀 Особливості

### Для Чергового КПП:
- Перевірка автомобілів за номером
- Відмітка про в'їзд/виїзд транспорту  
- Перегляд статистики автомобілів на territory
- Валідація дозволів та термінів дії

### Для Чергового інституту:
- Управління списком дозволених автомобілів
- Додавання/редагування/видалення записів про авто
- Налаштування типів доступу (постійний, 24 години, до дати)
- Пошук за номером або власником
- Перегляд історії проїздів

## 🛠 Технології

### Frontend:
- **React 18** з TypeScript
- **React Router** для маршрутизації
- **SCSS** препроцесор для стилів
- **Axios** для HTTP запитів
- Адаптивний дизайн

### Backend:
- **Node.js** з Express
- **TypeScript** для типізації
- **MongoDB** з Mongoose ODM
- **JWT** аутентифікація
- **bcryptjs** для хешування паролів

## 📁 Структура проекту

```
Kyrsach/
├── client/                 # React фронтенд
│   ├── public/
│   ├── src/
│   │   ├── components/     # React компоненти  
│   │   ├── services/       # API сервіси
│   │   ├── styles/         # SCSS стилі
│   │   └── types/          # TypeScript типи
│   └── package.json
├── server/                 # Node.js бекенд
│   ├── src/
│   │   ├── models/         # MongoDB моделі
│   │   ├── routes/         # Express маршрути
│   │   ├── middleware/     # Middleware функції
│   │   └── index.ts        # Головний серверний файл
│   └── package.json
└── README.md
```

## 🚀 Запуск проекту

### Передумови
- Node.js 16+ 
- MongoDB 4.4+
- npm або yarn

### 1. Клонування та встановлення залежностей

```bash
# Перейти в папку проекту
cd Kyrsach

# Встановити залежності сервера
cd server
npm install

# Встановити залежності клієнта  
cd ../client
npm install
```

### 2. Налаштування середовища

Створити файл `.env` в папці `server` (уже створений):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kpp_control
JWT_SECRET=your_jwt_secret_key_here_change_in_production
DB_NAME=kpp_control
BCRYPT_ROUNDS=10
```

### 3. Запуск MongoDB

Переконайтеся, що MongoDB запущена:
```bash
# Windows
net start MongoDB

# macOS/Linux  
sudo systemctl start mongod
# або
brew services start mongodb-community
```

### 4. Запуск додатку

**Термінал 1 - Backend:**
```bash
cd server
npm run dev
```

**Термінал 2 - Frontend:**
```bash  
cd client
npm start
```

Додаток буде доступний за адресою: http://localhost:3000

## 👥 Користувачі за замовчуванням

Для тестування створіть користувачів через POST `/api/auth/register`:

### Черговий КПП:
```json
{
  "username": "kpp_officer",
  "password": "password123",
  "role": "kpp_officer", 
  "fullName": "Іван Петрович КПП"
}
```

### Черговий інституту:
```json
{
  "username": "unit_officer",
  "password": "password123",
  "role": "unit_officer",
  "fullName": "Сергій Іванович Частина"
}
```

## 📖 API Документація

### Аутентифікація
- `POST /api/auth/login` - Вхід в систему
- `POST /api/auth/register` - Реєстрація нового користувача

### Автомобілі  
- `GET /api/vehicles` - Список всіх автомобілів (unit_officer)
- `GET /api/vehicles/check/:licensePlate` - Перевірка авто за номером
- `POST /api/vehicles` - Додавання нового авто (unit_officer)
- `PUT /api/vehicles/:id` - Редагування авто (unit_officer)
- `DELETE /api/vehicles/:id` - Видалення авто (unit_officer)

### Записи проїздів
- `POST /api/entries/toggle/:licensePlate` - В'їзд/виїзд авто (kpp_officer)
- `GET /api/entries/history/:licensePlate` - Історія проїздів
- `GET /api/entries` - Всі записи проїздів (unit_officer)
- `GET /api/entries/stats/current` - Статистика поточних авто

## 🔧 Скрипти

### Сервер:
- `npm run dev` - Запуск в режимі розробки
- `npm run build` - Збірка TypeScript
- `npm start` - Запуск продакшн версії

### Клієнт:
- `npm start` - Запуск dev сервера
- `npm run build` - Збірка для продакшену
- `npm test` - Запуск тестів

## 🎨 Функціонал

### Ролі користувачів:
1. **kpp_officer** (Черговий КПП) - контроль проїзду
2. **unit_officer** (Черговий інституту) - управління списком авто

### Типи доступу:
- **permanent** - Постійний доступ
- **temporary_24h** - Тимчасовий на 24 години  
- **temporary_custom** - Тимчасовий до вказаної дати

### Безпека:
- JWT токени для аутентифікації
- Хешування паролів bcrypt
- Перевірка ролей на рівні маршрутів
- Валідація даних Mongoose

## 📱 Адаптивність

Додаток повністю адаптивний та працює на:
- 💻 Десктопах 
- 📱 Планшетах
- 📱 Мобільних пристроях

## 🤝 Розробка

Проект створено як курсова робота для демонстрації навичок:
- Fullstack розробки
- React з TypeScript
- Node.js/Express API
- MongoDB бази даних
- SCSS препроцесорів
- Адаптивного дизайну

## 📄 Ліцензія

Цей проект створено в навчальних цілях.