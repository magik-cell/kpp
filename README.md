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
- **React 18** з JavaScript
- **React Router** для маршрутизації
- **SCSS** препроцесор для стилів
- **Axios** для HTTP запитів
- Адаптивний дизайн

### Backend:
- **Node.js** з Express
- **JavaScript** для типізації
- **MongoDB** з Mongoose ODM
- **JWT** аутентифікація
- **bcryptjs** для хешування паролів



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

## 🔧 Скрипти

### Сервер:
- `npm run dev` - Запуск в режимі розробки
- `npm run build` - Збірка TypeScript
- `npm start` - Запуск продакшн версії

### Клієнт:
- `npm start` - Запуск dev сервера
- `npm run build` - Збірка для продакшену
- `npm test` - Запуск тестів


### Розробник проекту 
```bash
Харавюк Олександр Валерійович
```
