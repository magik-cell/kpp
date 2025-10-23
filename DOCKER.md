# 🐳 Docker Configuration для системи контролю КПП

## Швидкий старт

### Передумови
- Встановлений Docker Desktop
- Встановлений Docker Compose

### Запуск усіх сервісів одночасно

```bash
# Запуск усіх контейнерів у фоновому режимі
docker-compose up -d

# Або з виводом логів
docker-compose up
```

### Доступ до сервісів

- **Клієнтська частина (React)**: http://localhost:3000
- **Серверна частина (API)**: http://localhost:5000
- **База даних (PostgreSQL)**: localhost:5432

### Облікові записи за замовчуванням

- **Адміністратор**: `admin` / `admin123`
- **Офіцер КПП**: `kpp_officer` / `admin123`
- **Офіцер підрозділу**: `unit_officer` / `admin123`

## Архітектура Docker

### Контейнери

1. **kyrsova_client** - React додаток з Nginx
2. **kyrsova_server** - Node.js API сервер
3. **kyrsova_db** - PostgreSQL база даних

### Мережа
- Усі контейнери об'єднані в мережу `kyrsova_network`
- Внутрішній зв'язок між сервісами

### Томи
- `kyrsova_postgres_data` - зберігання даних БД
- `./server/uploads` - завантажені файли

## Команди для управління

### Базові команди
```bash
# Запуск усіх сервісів
docker-compose up -d

# Зупинка усіх сервісів
docker-compose down

# Зупинка з видаленням томів (втрата даних!)
docker-compose down -v

# Перебудова образів
docker-compose build

# Перезапуск конкретного сервісу
docker-compose restart server
```

### Перегляд логів
```bash
# Логи усіх сервісів
docker-compose logs

# Логи конкретного сервісу
docker-compose logs client
docker-compose logs server
docker-compose logs db

# Інтерактивні логи
docker-compose logs -f server
```

### Доступ до контейнерів
```bash
# Підключення до бази даних
docker-compose exec db psql -U kyrsova_user -d kyrsova_db

# Підключення до серверного контейнера
docker-compose exec server sh

# Підключення до клієнтського контейнера
docker-compose exec client sh
```

## Налаштування середовища

### Файл .env
Скопіюйте `.env.example` в `.env` та налаштуйте під свої потреби:

```bash
cp .env.example .env
```

### Зміна портів
Відредагуйте `docker-compose.yml` для зміни портів:

```yaml
services:
  client:
    ports:
      - "8080:80"  # Замість 3000:80
  
  server:
    ports:
      - "8000:5000"  # Замість 5000:5000
```

## Розробка

### Режим розробки
Для розробки можна використовувати volume mounting:

```yaml
# Додайте в docker-compose.yml для hot-reload
volumes:
  - ./client/src:/app/src
  - ./server/src:/app/src
```

### Налагодження
```bash
# Перегляд статусу контейнерів
docker-compose ps

# Перевірка health check
docker-compose exec server wget -qO- http://localhost:5000/health

# Моніторинг ресурсів
docker stats
```

## Проблеми та їх вирішення

### Порти зайняті
```bash
# Знайти процес що використовує порт
netstat -ano | findstr :3000

# Зупинити процес
taskkill /PID <PID> /F
```

### Проблеми з базою даних
```bash
# Перезапуск БД з очищенням
docker-compose down -v
docker-compose up db -d
```

### Очищення Docker
```bash
# Видалення невикористовуваних образів
docker system prune

# Видалення всіх контейнерів та образів проекту
docker-compose down --rmi all -v
```

## Продакшн

### Налаштування для продакшену
1. Змініть `JWT_SECRET` на безпечний ключ
2. Налаштуйте HTTPS
3. Використовуйте Docker Secrets для паролів
4. Налаштуйте backup для бази даних
5. Додайте моніторинг та логування

### Backup бази даних
```bash
# Створення backup
docker-compose exec db pg_dump -U kyrsova_user kyrsova_db > backup.sql

# Відновлення з backup
docker-compose exec -T db psql -U kyrsova_user kyrsova_db < backup.sql
```