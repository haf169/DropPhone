<div align="center">

# 📱 DROPPHONE

### *The World's Most Realistic Phone Prank App*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-6-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com/)

**Troll bạn bè bằng cách giả vờ làm rơi điện thoại — điện thoại sẽ hét lên!** 💥

</div>

---

## 🎬 Tổng quan

**DropPhone** là một ứng dụng prank (trêu đùa) sử dụng cảm biến gia tốc kế của điện thoại để phát các âm thanh hài hước khi:
- 📱 **Điện thoại rơi tự do** → phát tiếng hét kinh hoàng
- 👋 **Bị đập/tát mạnh** → phát tiếng "BONK!" vui nhộn

Thiết kế theo phong cách **Neo-Brutalism / Comic Book** — đậm chất năng lượng cao, màu sắc rực rỡ.

---

## ✨ Tính năng

| Tính năng | Mô tả |
|---|---|
| 🎯 **ARM / DISARM** | Bật/tắt cảm biến bằng 1 nút |
| 🍂 **Free-Fall Detection** | Phát hiện rơi tự do qua gia tốc kế |
| 👋 **Impact Detection** | Phát hiện va đập / bị tát |
| 🎵 **Sound Library** | Thay đổi âm thanh phản ứng |
| ⚡ **Sensitivity Control** | Điều chỉnh độ nhạy (Low / Medium / High) |
| 🏆 **Hall of Shame** | Bảng xếp hạng top người hay làm rơi điện thoại |
| 📊 **Your Stats** | Xem thống kê của thiết bị bạn |
| 🌐 **PWA + Mobile** | Chạy trên browser và Android/iOS qua Capacitor |

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** + TypeScript — UI framework
- **Capacitor 6** — Đóng gói thành native app (Android/iOS)
- **Vanilla CSS** — Neo-Brutalism design system (không dùng Tailwind)
- **DeviceMotionEvent API** — Đọc cảm biến gia tốc kế
- **Web Audio API** — Phát âm thanh

### Backend
- **NestJS 10** — REST API framework
- **TypeORM** — ORM kết nối PostgreSQL
- **PostgreSQL 16** — Lưu leaderboard & âm thanh
- **Multer** — Upload file âm thanh
- **Docker** — Containerization

---

## 🚀 Chạy Local (Development)

### Yêu cầu
- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Cách 1: Docker Compose (Cách đơn giản nhất)

```bash
# Clone repo
git clone https://github.com/your-username/dropphone.git
cd dropphone

# Copy env file
cp .env.example .env

# Chạy tất cả services
docker compose up --build -d
```

Sau đó mở:
| Service | URL |
|---|---|
| 🌐 Frontend | http://localhost:3000 |
| ⚙️ Backend API | http://localhost:3001/api |
| 🗄️ DB Admin (Adminer) | http://localhost:8080 |

### Cách 2: Chạy từng service riêng

```bash
# 1. Chạy database và backend qua Docker
docker compose up db api -d

# 2. Chạy frontend local
cd frontend
npm install
npm run dev
```

Frontend sẽ tự kết nối đến backend tại `http://localhost:3001`.

---

## 📁 Cấu trúc Project

```
DropPhone/
├── 📂 backend/                  # NestJS API
│   └── src/
│       ├── sounds/              # Module quản lý âm thanh
│       ├── leaderboard/         # Module bảng xếp hạng
│       ├── app.module.ts        # Root module
│       └── main.ts              # Entry point
│
├── 📂 frontend/                 # Next.js App
│   └── src/
│       ├── app/
│       │   ├── page.tsx         # Home: ARM button + sensors
│       │   ├── layout.tsx       # Root layout
│       │   └── globals.css      # Neo-Brutalism design system
│       ├── components/
│       │   ├── SplashScreen.tsx # Màn hình intro
│       │   ├── BottomNav.tsx    # Navigation bar
│       │   ├── SettingsPage.tsx # Cài đặt âm thanh & độ nhạy
│       │   └── LeaderboardPage.tsx # Hall of Shame
│       └── lib/
│           ├── api.ts           # API client (fetch NestJS)
│           └── useMotion.ts     # Hook cảm biến gia tốc kế
│
├── backend.Dockerfile
├── frontend.Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## 🔌 API Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/sounds` | Danh sách âm thanh |
| `POST` | `/api/sounds/upload` | Upload âm thanh mới |
| `DELETE` | `/api/sounds/:id` | Xóa âm thanh |
| `POST` | `/api/report-drop` | Báo cáo sự kiện rơi/tát |
| `GET` | `/api/leaderboard` | Top 10 Hall of Shame |
| `GET` | `/api/stats?deviceId=xxx` | Thống kê thiết bị |

---

## 📱 Build Mobile App (Android)

```bash
cd frontend

# Cài Capacitor CLI
npm install -g @capacitor/cli

# Sửa IP LAN trong capacitor.config.ts và .env
# Ví dụ: NEXT_PUBLIC_API_URL=http://192.168.1.100:3001/api

# Build và sync
npm run build
npx cap sync

# Chạy trên Android
npx cap run android
```

> ⚠️ **Lưu ý:** Khi test trên điện thoại thật, cần thay `localhost` thành **IP LAN** của máy tính trong `.env` và `capacitor.config.ts`.

---

## ⚙️ Biến môi trường

Sao chép `.env.example` thành `.env`:

```env
# Database
DB_HOST=db
DB_PORT=5432
DB_USERNAME=dropphone_user
DB_PASSWORD=your_password
DB_DATABASE=dropphone

# API
PORT=3001
NODE_ENV=development

# Frontend (IP LAN khi test mobile)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 🎨 Design System

DropPhone sử dụng phong cách **"High-Octane Neo-Brutalism"** độc đáo:

- **Font:** Plus Jakarta Sans + Be Vietnam Pro
- **Màu chính:** Vàng `#FFEB3B` · Cam `#FFC791` · Xanh nhạt `#EBF9FF`
- **Border:** 3-4px solid đen, hard drop shadow
- **Animation:** Slide-up, pulse, loading dots

---

## 🤝 Đóng góp

1. Fork repo
2. Tạo branch: `git checkout -b feature/ten-tinh-nang`
3. Commit: `git commit -m 'feat: thêm tính năng xyz'`
4. Push: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request

---

## ⚠️ Disclaimer

> DropPhone là ứng dụng **PRANK** thuần túy. **Không thực sự làm rơi điện thoại.** Chúng tôi không chịu trách nhiệm về bất kỳ thiệt hại nào. Hãy sử dụng có trách nhiệm!
>
> 🛡️ **LIABILITY SHIELD: ACTIVE**

---

<div align="center">

Made with 💛 and a lot of *THUD!*

**v2.4.0 — CODENAME: THUD**

</div>
