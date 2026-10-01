# QA Stories - Baby Photography Portfolio & Booking System

Hệ thống Website Portfolio & Đặt lịch chụp ảnh cho Studio chuyên nghiệp.
Kiến trúc: **Monolith Full-Stack (Node.js Express + MySQL + React 18 + Tailwind CSS)**

---

## 📁 Cấu trúc thư mục

```
QAStories/
├── config/                  # Cấu hình kết nối MySQL pool & Mailer
│   ├── db.js
│   └── mailer.js
├── controllers/             # Bộ điều khiển xử lý logic nghiệp vụ
│   ├── contactController.js
│   └── uploadController.js
├── database/                # File khởi tạo và cấu trúc bảng MySQL
│   └── schema.sql
├── logs/                    # Thư mục lưu trữ log hệ thống (app.log, error.log)
├── middlewares/             # Middleware xác thực, upload file, bắt lỗi
│   ├── multer.js
│   └── errorHandler.js
├── models/                  # Data Models tương tác với MySQL
│   └── Booking.js
├── public/                  # Static file (React App Production Build & uploads)
│   ├── assets/
│   ├── index.html
│   └── uploads/
├── routes/                  # Định tuyến API
│   ├── index.js
│   ├── contact.js
│   └── upload.js
├── utils/                   # Tiện ích logger, helper
│   ├── logger.js
│   └── helpers.js
├── views/                   # Giao diện HTML dự phòng (404.html)
│   └── 404.html
├── client/                  # Source code React (dành cho phát triển)
├── .env                     # Biến môi trường
├── .env.example             # File mẫu biến môi trường
├── database detail.txt      # Chi tiết mô tả cấu trúc các bảng MySQL
├── ecosystem.config.js      # Cấu hình PM2 cho production deploy
├── package.json             # Root package.json
├── server.js                # Entry point chính chạy toàn bộ hệ thống
├── setup-db.bat             # Batch file khởi tạo MySQL trên Windows
├── setup-db.js              # Script khởi tạo database và các bảng
└── start.bat                # Batch file khởi động nhanh server trên Windows
```

---

## 🚀 Hướng dẫn cài đặt & Chạy dự án

### 1. Cài đặt thư viện
```bash
npm install
npm install --prefix client
```

### 2. Cấu hình biến môi trường (`.env`)
Sao chép `.env.example` thành `.env` và cập nhật thông số kết nối MySQL & Gmail:
```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=qastories

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
NOTIFY_EMAIL=admin@qastories.vn
```

### 3. Khởi tạo Cơ sở dữ liệu MySQL
- Trên Windows: Nhấp đúp vào file **`setup-db.bat`** (hoặc chạy lệnh `npm run setup:db`).

### 4. Phát triển (Development)
Chạy đồng thời cả Backend và Frontend Dev Server:
```bash
npm run dev
```
- Frontend React Hot-Reload: `http://localhost:5173`
- Backend API: `http://localhost:3001`

### 5. Build & Triển khai Production (Deploy)
Chỉ với 2 bước:
```bash
# 1. Build React UI vào thư mục public/
npm run build

# 2. Khởi chạy Server duy nhất
npm start
```
Hoặc trên Windows, bạn chỉ cần nhấp đúp vào **`start.bat`**.

---

## 🌐 Triển khai trên VPS / Cloud với PM2
```bash
npm run setup:db
npm run build
pm2 start ecosystem.config.js
pm2 save
```
