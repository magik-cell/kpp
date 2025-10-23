# Використовуємо Node.js 18 Alpine для меншого розміру образу
FROM node:18-alpine

# Встановлюємо робочу директорію
WORKDIR /app

# Встановлюємо залежності системи для SQLite (якщо потрібно)
RUN apk add --no-cache python3 make g++

# Копіюємо package.json та package-lock.json
COPY package*.json ./

# Встановлюємо ВСІ залежності для збірки
RUN npm ci

# Копіюємо TypeScript конфігурацію
COPY tsconfig.json ./

# Копіюємо вихідний код
COPY src/ ./src/
COPY init-db.ts ./

# Компілюємо TypeScript
RUN npm run build

# Очищуємо devDependencies після збірки
RUN npm ci --only=production && npm cache clean --force

# Створюємо користувача для безпеки
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Змінюємо власника файлів
USER nextjs

# Відкриваємо порт 5000
EXPOSE 5000

# Встановлюємо змінні середовища
ENV NODE_ENV=production

# Команда для запуску
CMD ["npm", "start"]