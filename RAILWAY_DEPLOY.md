# 🚀 Деплой проекту КПП Control на Railway

## 📋 Передумови

1. **GitHub репозиторій** - ваш код має бути завантажений на GitHub
2. **Акаунт Railway** - зареєструйтесь на [railway.app](https://railway.app)
3. **MongoDB Atlas** (опціонально) - для продакшн бази даних

## 🎯 Крок 1: Підготовка GitHub репозиторію

```bash
# 1. Ініціалізуйте git репозиторій (якщо ще не зроблено)
git init
git add .
git commit -m "Initial commit - готовий для Railway"

# 2. Створіть репозиторій на GitHub і завантажте код
git remote add origin https://github.com/your-username/my_kyrsova.git
git push -u origin main
```

## 🚂 Крок 2: Створення проекту на Railway

1. **Перейдіть на [railway.app](https://railway.app)**
2. **Натисніть "Start a New Project"**
3. **Виберіть "Deploy from GitHub repo"**
4. **Оберіть ваш репозиторій `my_kyrsova`**

## 🛠️ Крок 3: Налаштування змінних середовища

У Railway Dashboard:

1. **Перейдіть до Settings > Environment**
2. **Додайте наступні змінні:**

### 🔑 Обов'язкові змінні:
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_generate_new_one_please
MONGODB_URI=${{MongoDB.DATABASE_URL}}
```

### 🌍 Опціональні змінні:
```env
CORS_ORIGIN=${{RAILWAY_PUBLIC_DOMAIN}}
BCRYPT_ROUNDS=12
JWT_EXPIRY=24h
LOG_LEVEL=info
```

## 🗄️ Крок 4: Додавання MongoDB

### Варіант А: Railway MongoDB (Рекомендовано)
1. **У Railway Dashboard натисніть "Add Service"**
2. **Виберіть "MongoDB"**
3. **Railway автоматично створить `${{MongoDB.DATABASE_URL}}`**

### Варіант Б: MongoDB Atlas (Безкоштовний)
1. **Створіть акаунт на [mongodb.com](https://www.mongodb.com/atlas)**
2. **Створіть безкоштовний кластер (512MB)**
3. **Отримайте connection string**
4. **Встановіть `MONGODB_URI` вручну**

## 🔄 Крок 5: Міграція даних (Опціонально)

Якщо у вас є існуючі дані:

```bash
# 1. Експортуйте з локальної бази
mongodump --db kpp_control --out ./backup

# 2. Імпортуйте в Railway/Atlas
mongorestore --uri "your_production_mongodb_uri" ./backup/kpp_control
```

## 🚀 Крок 6: Деплой і тестування

1. **Railway автоматично почне деплой**
2. **Слідкуйте за процесом у вкладці "Deployments"**
3. **Після успішного деплою отримаєте URL вигляду:**
   ```
   https://your-app-name.railway.app
   ```

## ✅ Крок 7: Перевірка функціональності

### Тестуємо API endpoints:
```bash
# Health check
curl https://your-app.railway.app/health

# API health check  
curl https://your-app.railway.app/api/health

# Авторизація (створіть тестового користувача)
curl -X POST https://your-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test_user", "password":"test123"}'
```

### Перевіряємо веб-інтерфейс:
1. **Відкрийте браузер**
2. **Перейдіть на ваш Railway URL**  
3. **Протестуйте login/logout**
4. **Перевірте всі основні функції**

## 🛡️ Крок 8: Безпека і продакшн налаштування

### Оновіть змінні безпеки:
```env
# Згенеруйте новий JWT secret
JWT_SECRET=$(openssl rand -base64 64)

# Встановіть строгіші налаштування
BCRYPT_ROUNDS=12
NODE_ENV=production
```

### Налаштуйте домен (опціонально):
1. **У Railway Settings > Domains**
2. **Додайте custom domain**
3. **Налаштуйте DNS записи**

## 🔧 Корисні команди Railway CLI

```bash
# Встановіть Railway CLI
npm install -g @railway/cli

# Авторизуйтесь
railway login

# Перегляд логів
railway logs

# Підключення до бази даних
railway connect

# Локальний запуск з продакшн змінними
railway run npm run dev
```

## 🐛 Troubleshooting

### Проблема: Build fails
**Рішення:**
- Перевірте `package.json` scripts
- Переконайтесь що `NODE_VERSION >= 18`
- Перегляньте build logs

### Проблема: Database connection error  
**Рішення:**
- Перевірте `MONGODB_URI`
- Переконайтесь що MongoDB service запущений
- Перегляньте network policies

### Проблема: 502/503 errors
**Рішення:**
- Перевірте чи сервер слухає правильний `PORT`
- Переконайтесь що health check працює
- Перегляньте application logs

## 📞 Підтримка

- **Railway Documentation:** [docs.railway.app](https://docs.railway.app)
- **Railway Discord:** [railway.app/discord](https://railway.app/discord)
- **GitHub Issues:** Створіть issue у вашому репозиторії

---

## 🎉 Готово!

Ваш проект КПП Control тепер доступний в інтернеті! 

**Основний URL:** `https://your-app.railway.app`
**API Base:** `https://your-app.railway.app/api`

Не забудьте поділитись посиланням і протестувати всі функції! 🚗✅