# ================================
# Stage 1: Development (Hot-reload)
# ================================
FROM node:20-alpine AS development

WORKDIR /app

# Cài dependencies trước (cache layer)
COPY package*.json ./
RUN npm ci

# Copy toàn bộ source
COPY . .

# Tạo thư mục uploads
RUN mkdir -p uploads

EXPOSE 3001

CMD ["npm", "run", "start:dev"]


# ================================
# Stage 2: Build
# ================================
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# Chỉ giữ production dependencies
RUN npm ci --only=production && npm cache clean --force


# ================================
# Stage 3: Production
# ================================
FROM node:20-alpine AS production

WORKDIR /app

# Copy từ stage build
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./

# Tạo thư mục uploads
RUN mkdir -p uploads

# Chạy với user non-root để bảo mật
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
RUN chown -R nestjs:nodejs /app/uploads
USER nestjs

EXPOSE 3001

CMD ["node", "dist/main"]
