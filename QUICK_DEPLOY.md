# ⚡ Швидкий старт - Railway деплой

## 📦 Готовність до деплою

Ваш проект **готовий для деплою на Railway**! ✅

### 📋 Що було підготовлено:

- ✅ **railway.json** - конфігурація Railway
- ✅ **Dockerfile** - мультистейдж збірка для продакшену  
- ✅ **Production server** - віддача статичних файлів React
- ✅ **.env.example** файли для всіх сервісів
- ✅ **Package.json** оптимізовано для Railway
- ✅ **Автоматична ініціалізація користувачів**
- ✅ **Повна інструкція деплою**

---

## 🚀 Швидкий деплой (5 хвилин)

### 1. **GitHub**
```bash
git add .
git commit -m "Ready for Railway deploy"
git push origin main
```

### 2. **Railway**
1. Йдіть на [railway.app](https://railway.app)
2. "Deploy from GitHub" → оберіть ваш репозиторій
3. Додайте змінну: `JWT_SECRET=ваш_секретний_ключ`
4. Додайте MongoDB service
5. Готово! 🎉

---

## 📖 Детальна інструкція

Дивіться файл **[RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)** для повної покрокової інструкції.

---

## 🔐 Дефолтні користувачі

Після деплою автоматично створяться користувачі:

| Роль | Логін | Пароль |
|------|-------|---------|
| Admin | `admin` | `admin123` |
| Unit Officer | `unit_officer` | `unit123` |  
| KPP Officer | `kpp_officer` | `kpp123` |

> ⚠️ **Важливо**: Змініть паролі після першого входу!

---

## 🌐 Після деплою

Ваш додаток буде доступний на:
```
https://your-app-name.railway.app
```

### Тестування:
- **Health check**: `https://your-app.railway.app/health`
- **API**: `https://your-app.railway.app/api/health`  
- **Login**: `https://your-app.railway.app/` (використайте дефолтних користувачів)

---

**Готово! Ваш КПП Control System запущений в хмарі! 🚗☁️**