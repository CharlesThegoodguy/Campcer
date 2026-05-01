# Campcer - Sistem Pemesanan Camping Ground

Sistem berbasis web untuk pemesanan camping ground dengan fitur otentikasi, dashboard admin, dan manajemen reservasi.

## 🚀 Cara Menjalankan Proyek

### Prasyarat
- Node.js 16.x atau lebih baru
- MySQL / XAMPP (database 'campcer' sudah dibuat)

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd ../
npm install
```

### 2. Konfigurasi Environment

Buat file `.env` di root project dengan konfigurasi berikut:

```env
# Backend
VITE_API_URL=http://localhost:5000

# JWT Secret (pastikan sama dengan di server/index.js)
JWT_SECRET=campcer_super_secret_key_123

# Database MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=campcer
```

### 3. Jalankan Backend

```bash
cd server
npm run dev
```

Backend akan berjalan di http://localhost:5000

### 4. Jalankan Frontend

```bash
cd ..
npm run dev
```

Frontend akan berjalan di http://localhost:8080

## 📚 Database

Pastikan database 'campcer_react' sudah dibuat di MySQL:

```sql
CREATE DATABASE IF NOT EXISTS campcer_react;
USE campcer_react;
```

## 👥 Akun User Demo

### Admin
- **Email**: [admin@camcer.com]`
- **Password**: password123

### User
- **Email**: [user@campcer.com]`
- **Password**: password123

## 📂 Struktur Proyek

```
Campcer/
├── Campcer/              # Frontend (Vite + React)
│   ├── src/
│   ├── vite.config.js
│   └── package.json
├── server/               # Backend (Express + MySQL)
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── index.js
│   └── package.json
└── .env                  # Environment variables
```

## 🛠️ Technology Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)

## 💡 Tips

- Jika terjadi error saat startup, pastikan XAMPP MySQL sudah aktif
- Periksa kembali konfigurasi di file `.env`
- Pastikan port 5000 (backend) dan 8080 (frontend) tidak digunakan aplikasi lain
