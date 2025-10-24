# ✅ Чек-лист налаштування на Render

## Проблема: 404 помилка на Render (локально працює)

### Виправлено в коді:
- ✅ `client/.env`: REACT_APP_API_URL тепер має `/api` в кінці
- ✅ `server/.env`: Atlas URI доповнено назвою БД `kpp_control`
- ✅ `render.yaml`: виправлено `autoDeploy`, додано NODE_ENV=production

---

## 🔧 ЩО ПОТРІБНО ЗРОБИТИ НА RENDER (ОБОВ'ЯЗКОВО!)

### 1️⃣ Сервер (Web Service) - my-kyrsova-2

**Render Dashboard → my-kyrsova-2 → Settings → Environment**

Додайте/перевірте ці змінні:

```bash
MONGODB_URI=mongodb+srv://sasha:Password123@cluster0.pzthh8n.mongodb.net/kpp_control?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_2024
BCRYPT_ROUNDS=10
NODE_ENV=production
```

**⚠️ ВАЖЛИВО:** 
- Якщо ці змінні вже є — **ПЕРЕВІРТЕ, що MONGODB_URI містить `/kpp_control`** перед `?`
- Якщо немає — додайте їх

**Після зміни змінних:**
- Manual Deploy → **Clear build cache & deploy**

---

### 2️⃣ Клієнт (Static Site)

**Render Dashboard → ваш Static Site → Settings → Environment**

Додайте/перевірте цю змінну:

```bash
REACT_APP_API_URL=https://my-kyrsova-2.onrender.com/api
```

**⚠️ ВАЖЛИВО:** URL має закінчуватися на `/api`!

**Після зміни:**
- Manual Deploy → **Clear build cache & deploy**

---

## 🔍 Перевірка після деплою

### Перевірка сервера:
1. Відкрийте: https://my-kyrsova-2.onrender.com/health
2. Має бути:
   ```json
   {
     "status": "OK",
     "database": "Connected"
   }
   ```
3. Якщо `database: "Disconnected"` — перевірте MONGODB_URI

### Перевірка клієнта:
1. Відкрийте ваш сайт клієнта
2. F12 → Network → спробуйте авторизацію
3. Запити мають йти на: `https://my-kyrsova-2.onrender.com/api/auth/login`
4. Статус має бути **200** (успішно) або **401** (неправильний пароль)
5. Якщо **404** — REACT_APP_API_URL неправильний або не пересобрали

---

## 📋 MongoDB Atlas - Перевірка

**Atlas Dashboard → Network Access:**
- Має бути IP: `0.0.0.0/0` (Allow access from anywhere)

**Atlas Dashboard → Database Access:**
- Користувач: `sasha`
- Пароль: `Password123`
- Роль: "Read and write to any database" (мінімум)

**Connection String (перевірте!):**
```
mongodb+srv://sasha:Password123@cluster0.pzthh8n.mongodb.net/kpp_control?retryWrites=true&w=majority
```

---

## 🚨 Типові помилки

### ❌ 404 при авторизації
**Причина:** REACT_APP_API_URL неправильний або не має `/api`
**Рішення:** 
1. Перевірте змінну на Render Static Site
2. Має бути: `https://my-kyrsova-2.onrender.com/api`
3. Clear build cache & deploy

### ❌ ECONNREFUSED 127.0.0.1:27017
**Причина:** MONGODB_URI на сервері вказує на localhost замість Atlas
**Рішення:**
1. Додайте MONGODB_URI на Render Web Service
2. Clear build cache & deploy

### ❌ Authentication failed (MongoDB)
**Причина:** Неправильний пароль або username
**Рішення:**
1. Перевірте Database Access в Atlas
2. Створіть нового користувача з простим паролем (без спецсимволів)
3. Оновіть MONGODB_URI

### ❌ database: "Disconnected" в /health
**Причина:** MONGODB_URI неправильний або Atlas не дозволяє доступ
**Рішення:**
1. Перевірте MONGODB_URI (має бути `/kpp_control` перед `?`)
2. Додайте 0.0.0.0/0 в Atlas Network Access
3. Перевірте, що користувач існує

---

## 📝 Після виправлення

1. Закомітьте зміни:
   ```bash
   git add .
   git commit -m "Fix: Виправлено API URL та Atlas URI для Render"
   git push
   ```

2. На Render (обидва сервіси):
   - Перевірте Environment Variables
   - Clear build cache & deploy
   - Перевірте логи деплою

3. Тест:
   - Відкрийте /health → database: "Connected"
   - Спробуйте авторизацію → має працювати

---

## 💡 Для локальної розробки

Щоб локально працювати з локальною БД, а на Render — з Atlas:

**Варіант 1:** Використовувати різні .env файли
- `server/.env` — для локальної розробки (localhost)
- Render Environment Variables — для production (Atlas)

**Варіант 2:** Тимчасово змінювати .env
- Для локальної роботи: `MONGODB_URI=mongodb://localhost:27017/kpp_control`
- Для тестування з Atlas: використовуйте Atlas URI

**⚠️ Важливо:** Файл `.env` не комітиться в git (є в .gitignore), тому локальні зміни не вплинуть на Render.
