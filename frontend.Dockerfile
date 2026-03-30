# ================================
# Frontend Dockerfile (Next.js)
# ================================
FROM node:20-alpine AS development

WORKDIR /app

# Cài dependencies (dùng npm install vì không có package-lock.json)
COPY package.json ./
RUN npm install

# Copy source code (bỏ qua next.config.ts nếu có)
COPY . .
# Xóa next.config.ts (Next.js 14 chỉ hỗ trợ .js hoặc .mjs)
RUN rm -f next.config.ts

ENV HOSTNAME=0.0.0.0
EXPOSE 3000
CMD ["npm", "run", "dev"]


# ================================
# Stage: Build Production
# ================================
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# Build Next.js
RUN npm run build


# ================================
# Stage: Production
# ================================
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/public ./public

ENV HOSTNAME=0.0.0.0

EXPOSE 3000

CMD ["npm", "run", "start"]

