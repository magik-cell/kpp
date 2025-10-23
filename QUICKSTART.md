# ⚡ Швидкий старт - Локальна розробка

## 📋 Передумови

- **Node.js 16+** 
- **MongoDB** (локально встановлена)
- **Git**
- **NPM**

## 🚀 Швидкий запуск (3 хвилини)

### 1. Встановлення залежностей
```bash
# Встановлюємо всі залежності для сервера та клієнта
npm run install-all
```

### 2. Налаштування середовища
```bash
# Копіюємо приклади конфігурації
cp .env.example .env
cp server/.env.example server/.env  
cp client/.env.example client/.env
```

### 3. Запуск MongoDB
```bash
# Переконайтеся що MongoDB запущена локально
# Windows: запустіть MongoDB service
# або запустіть mongod в окремому терміналі
```

### 4. Ініціалізація бази даних
```bash
# Створення початкових користувачів
cd server
npm run init-db
cd ..
```

### 5. Запуск проекту
```bash
# Запуск сервера (http://localhost:5000) та клієнта (http://localhost:3000)
npm run dev
```

## 👤 Дефолтні користувачі

| Роль | Логін | Пароль |
|------|-------|---------|
| Admin | `admin` | `admin123` |
| Unit Officer | `unit_officer` | `unit123` |
| KPP Officer | `kpp_officer` | `kpp123` |

## 🔧 Додаткові команди

```bash
# Запуск тільки сервера
npm run start-server

# Запуск тільки клієнта
npm run start-client

# Збірка проекту
npm run build
```

---

**Готово! КПП Control System запущена локально! 🚗💻**
