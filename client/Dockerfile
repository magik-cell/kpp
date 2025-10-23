# Мульти-етапна збірка для React додатку
FROM node:18-alpine AS build

# Встановлюємо робочу директорію
WORKDIR /app

# Копіюємо package.json та package-lock.json
COPY package*.json ./

# Встановлюємо ВСІ залежності (включно з devDependencies для збірки)
RUN npm ci

# Копіюємо вихідний код
COPY . .

# Збираємо додаток для продакшену
RUN npm run build

# Очищуємо node_modules для зменшення розміру образу
RUN rm -rf node_modules

# Використовуємо nginx для сервування статичних файлів
FROM nginx:alpine

# Копіюємо зібраний додаток до nginx
COPY --from=build /app/build /usr/share/nginx/html

# Копіюємо конфігурацію nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Відкриваємо порт 80
EXPOSE 80

# Запускаємо nginx
CMD ["nginx", "-g", "daemon off;"]