# Campcer Project Scope & To-Do

Berikut adalah ruang lingkup (scope) pengerjaan project **Campcer** (Sistem Penyewaan Alat Camping & Trekking). Dokumen ini melacak apa saja yang **sudah selesai dikerjakan** dan apa yang **belum / akan dikerjakan**.

---

## ✅ SUDAH DIKERJAKAN (COMPLETED)

### 1. Sistem Inti & Database
- [x] Migrasi penuh dari Supabase (PostgreSQL BaaS) ke **Lokal MySQL (XAMPP)**.
- [x] Membuat arsitektur Backend menggunakan **Node.js & Express.js**.
- [x] Auto-migration database saat server menyala (Tabel: `users`, `products`, `orders`, `order_items`).
- [x] Menyederhanakan relasi tabel dengan memindahkan kolom `role` langsung ke tabel `users`.
- [x] Konfigurasi _environment variables_ (`.env`) yang berfungsi otomatis.

### 2. Autentikasi & Keamanan (Backend + Frontend)
- [x] Implementasi Register dan Login menggunakan **JWT (JSON Web Token)** dan **Bcrypt** (hashing password).
- [x] Perlindungan route menggunakan *Middleware* (hanya user login yang bisa checkout, hanya admin yang bisa akses API admin).
- [x] Endpoint `/api/auth/me` untuk mengecek sesi user yang sedang aktif.
- [x] Sinkronisasi `useAuth` hook di React untuk menggunakan fetch ke backend Express.

### 3. Fitur Frontend Utama (User-facing)
- [x] Desain halaman Beranda modern (Hero, How It Works, dll).
- [x] Fitur **Trip Planner / Rekomendasi Alat** berdasarkan gunung, durasi, dan jumlah peserta (Risk Engine logic).
- [x] Pembuatan halaman Checkout khusus Trip Planner (dengan kewajiban upload bukti SIMAKSI).
- [x] Menghapus library `@supabase/supabase-js` secara total dari frontend.

### 4. Fitur Katalog & Keranjang Belanja
- [x] Endpoint publik `GET /api/products` untuk menampilkan alat aktif dari database.
- [x] Mengubah halaman Katalog agar mengambil data *real* dari database.
- [x] Fitur **Cart Context** (State management keranjang belanja yang persisten di `localStorage`).
- [x] Fitur penambahan item ke keranjang (+ Keranjang) dan penyesuaian kuantitas.
- [x] **Cart Widget** (tombol melayang) yang interaktif.
- [x] Halaman **Cart Checkout** khusus untuk penyewaan alat satuan dengan input *durasi hari* dan upload SIMAKSI yang bersifat **Opsional**.

### 5. Pengelolaan File (Upload)
- [x] Implementasi **Multer** di backend untuk menerima file foto SIMAKSI.
- [x] Konfigurasi backend untuk melayani (_serve_) file statis dari folder `server/uploads/simaksi`.

---

## ⏳ BELUM DIKERJAKAN (TODO / PENDING)

### 1. Fitur Admin (Dashboard)
- [x] **Manajemen Produk (CRUD)**: Fungsionalitas di UI Admin untuk menambah barang baru, mengedit harga/deskripsi, dan menghapus barang.
- [x] **Manajemen Pesanan**: Fungsionalitas bagi Admin untuk mengubah status pesanan (`pending` ➔ `confirmed` ➔ `active` ➔ `returned`).
- [x] **Manajemen Pengguna**: Admin bisa melihat detail pengguna dan riwayat transaksi mereka.

### 2. Fitur Pengguna (Riwayat Transaksi)
- [x] **Halaman "Pesanan Saya"**: Membuat halaman di mana pengguna biasa bisa melihat status pesanan mereka (apakah sudah dikonfirmasi, sedang aktif, atau sudah selesai).
- [x] **Profil Pengguna**: Halaman untuk mengganti password atau mengedit informasi kontak (no telepon).

### 3. Paket Bundling (Packages)
- [x] Saat ini daftar Paket Bundling (Paket Hemat) di Katalog masih di-hardcode dari frontend (`src/data/equipment.ts`). Harus dipindahkan ke database (mungkin butuh tabel `packages` atau kategori khusus di `products`) agar bisa diedit oleh Admin.

### 4. Sistem Pembayaran (Payment Gateway)
- [x] Integrasi metode pembayaran otomatis (seperti Midtrans/Xendit) **atau** membuat alur upload bukti transfer manual jika ingin tetap sederhana. Saat ini pembayaran masih diasumsikan "konfirmasi manual via Admin/WhatsApp".

### 5. UI/UX & Validasi Tambahan
- [x] Validasi stok barang: Memastikan pengguna tidak bisa menyewa barang yang kuantitasnya melebihi stok yang ada di database.
- [x] Pengecekan ketersediaan tanggal: Memastikan barang tidak di-double booking pada tanggal yang sama. (Fitur lanjutan).

---
*Catatan: Dokumen ini dibuat otomatis pada tanggal 1 Mei 2026. Tandai checkbox `[ ]` menjadi `[x]` saat Anda sudah menyelesaikan tugas tersebut.*
