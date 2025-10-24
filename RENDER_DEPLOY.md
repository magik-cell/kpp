# 🚀 Інструкція з розгортання на Render

## Крок 1: Створіть MongoDB Atlas кластер

1. Зареєструйтесь на https://www.mongodb.com/cloud/atlas/register
2. Створіть безкоштовний M0 кластер (регіон: AWS eu-central-1 / Frankfurt)
3. **Database Access**: Створіть користувача БД
   - Username: наприклад `admin`
   - Password: надійний пароль (без спецсимволів для простоти)
   - Role: Atlas admin або Read and write to any database
4. **Network Access**: Додайте IP `0.0.0.0/0` (Allow access from anywhere)
5. **Отримайте Connection String**:
   - Database → Connect → Connect your application → Node.js
   - Формат: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/kpp_control?retryWrites=true&w=majority`
   - Замініть `<username>`, `<password>` на свої дані
   - **Важливо**: Якщо пароль має спецсимволи `@ : / ? &`, закодуйте їх:
     - `@` → `%40`
     - `:` → `%3A`
     - `/` → `%2F`
     - `?` → `%3F`

## Крок 2: Розгорніть на Render

### Варіант A: Через Blueprint (рекомендовано)

1. На Render Dashboard: **New** → **Blueprint**
2. Підключіть репозиторій: `magik-cell/my_kyrsova`
3. Render прочитає `render.yaml` і створить обидва сервіси

### Варіант B: Вручну створити сервіси

#### Сервер (Web Service)
1. **New** → **Web Service**
2. Підключіть репозиторій
3. Налаштування:
   - **Name**: `kpp-control-server`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`

#### Клієнт (Static Site)
1. **New** → **Static Site**
2. Підключіть репозиторій
3. Налаштування:
   - **Name**: `kpp-control-client`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

## Крок 3: Налаштуйте змінні середовища

### Для сервера (Web Service)
Settings → Environment → Add Environment Variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/kpp_control?retryWrites=true&w=majority
JWT_SECRET=ваш_довгий_випадковий_секрет_мінімум_32_символи_12345678
BCRYPT_ROUNDS=10
NODE_ENV=production
```

**Після додавання змінних**: Manual Deploy → **Clear build cache & deploy**

### Для клієнта (Static Site)
Settings → Environment → Add Environment Variable:

```
REACT_APP_API_URL=https://kpp-control-server.onrender.com/api
```

**Важливо**: Замініть `kpp-control-server.onrender.com` на **фактичний URL** вашого сервера з Render.

**Після додавання**: Manual Deploy → **Clear build cache & deploy**

## Крок 4: Перевірте роботу

### Перевірка сервера
1. Відкрийте логи деплою сервера
2. Має з'явитися: `✅ Підключено до MongoDB`
3. Перевірте health endpoint:
   ```
   https://kpp-control-server.onrender.com/health
   ```
   Відповідь має містити:
   ```json
   {
     "status": "OK",
     "database": "Connected"
   }
   ```

### Перевірка клієнта
1. Відкрийте URL вашого клієнта: `https://kpp-control-client.onrender.com`
2. Відкрийте DevTools → Network
3. При спробі логіну мають йти запити на: `https://kpp-control-server.onrender.com/api/auth/login`
4. Статус має бути 200 (успішно) або 401 (неправильний пароль), але не 404 або CORS error

## Крок 5: Наповніть базу даних (опціонально)

### Варіант A: Імпорт з локальної БД
Якщо у вас є локальна MongoDB з даними:

1. **Експорт локальної БД**:
   ```powershell
   cd C:\Users\magik\Desktop\my_kyrsova
   # Переконайтесь, що MongoDB запущена локально
   Start-Service MongoDB
   node export-db.js
   ```

2. **Імпорт у Atlas**:
   ```powershell
   # Замініть ATLAS_URI на ваш реальний
   $env:MONGODB_URI="mongodb+srv://user:pass@cluster.net/kpp_control?..."
   node import-db.js
   ```

### Варіант B: Створити demo дані
Використайте init-db скрипт (локально підключившись до Atlas):

1. Тимчасово змініть `server/.env`:
   ```
   MONGODB_URI=ваш_Atlas_URI
   ```

2. Запустіть:
   ```powershell
   cd server
   node init-db.js
   ```

3. Верніть `server/.env` до localhost (для локальної розробки)

### Варіант C: Створіть адмін користувача вручну через mongosh
```bash
mongosh "mongodb+srv://user:pass@cluster.net/kpp_control"
```
```javascript
use kpp_control
db.users.insertOne({
  username: "admin",
  password: "$2b$10$...", // bcrypt хеш паролю
  role: "kpp_officer",
  firstName: "Адмін",
  lastName: "Системи"
})
```

## Типові помилки і рішення

### ❌ ECONNREFUSED 127.0.0.1:27017
**Причина**: Сервер на Render намагається підключитися до localhost замість Atlas.
**Рішення**: Перевірте, що `MONGODB_URI` встановлено в Render Environment Variables і зробіть Clear build cache & deploy.

### ❌ Invalid Host header (на клієнті)
**Причина**: Клієнт створено як Web Service замість Static Site.
**Рішення**: Видаліть і створіть як Static Site з правильними налаштуваннями.

### ❌ CORS error при запитах з клієнта
**Причина**: `REACT_APP_API_URL` не встановлено або неправильний.
**Рішення**: Додайте змінну в Static Site Environment і пересоберіть (Clear build cache & deploy).

### ❌ Authentication failed (MongoDB)
**Причина**: Неправильний username/password або спецсимволи не закодовані.
**Рішення**: Закодуйте спецсимволи в паролі (@ → %40, : → %3A) або створіть пароль без спецсимволів.

### ❌ IP not allowed
**Причина**: IP Render не додано в Atlas Network Access.
**Рішення**: Додайте `0.0.0.0/0` в Atlas → Network Access.

### ❌ 404 /favicon.ico
**Причина**: Не критична помилка, браузер шукає іконку.
**Рішення**: Вже виправлено — додано `favicon.svg`.

## Моніторинг і логи

- **Render Dashboard** → ваш сервіс → **Logs** — реалтайм логи
- **Render Dashboard** → ваш сервіс → **Metrics** — використання ресурсів
- **MongoDB Atlas** → **Metrics** — статистика БД

## Безпека (після успішного деплою)

1. **JWT_SECRET**: Згенеруйте сильний секрет (32+ символів)
2. **Atlas Network Access**: Якщо Render надасть статичний egress IP, обмежте доступ
3. **HTTPS**: Render автоматично додає SSL сертифікат
4. **CORS**: За потреби обмежте allowed origins у `server/src/index.js`

## Оновлення після змін у коді

1. Закомітьте зміни в GitHub:
   ```powershell
   git add .
   git commit -m "Опис змін"
   git push
   ```

2. На Render (якщо autoDeploy: true у render.yaml):
   - Автоматично розпочнеться деплой

3. Якщо autoDeploy вимкнено:
   - Manual Deploy → Deploy latest commit

## Контакти для підтримки

- Render Docs: https://render.com/docs
- MongoDB Atlas Docs: https://www.mongodb.com/docs/atlas/
- GitHub Issues: https://github.com/magik-cell/my_kyrsova/issues
