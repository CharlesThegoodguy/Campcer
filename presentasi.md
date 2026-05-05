---
marp: true
theme: default
paginate: true
backgroundColor: #ffffff
---

# Presentasi Sertifikasi BNSP: Project Campcer 🏕️
**Sistem Penyewaan Alat Camping & Trekking Terintegrasi**

Disusun oleh: [Nama Anda]
Peran: Full-stack Developer / System Engineer

---

## 📌 Latar Belakang & Tujuan Sistem
**Campcer** adalah platform web base yang dirancang untuk mempermudah para pendaki dan pecinta alam dalam menyewa peralatan camping. 

**Tujuan Utama:**
- Mendigitalkan proses penyewaan alat outdoor dari sistem manual menjadi sistem terpadu.
- Menyediakan fitur **Trip Planner** yang secara cerdas merekomendasikan perlengkapan berdasarkan tujuan gunung, durasi, dan jumlah peserta.
- Mempermudah Admin dalam mengelola inventaris (stok), manajemen pesanan, dan verifikasi dokumen penting seperti SIMAKSI dan Bukti Pembayaran.

---

## 🛠️ Arsitektur & Teknologi Sistem (Tech Stack)
Sistem ini menggunakan arsitektur modern berbasis **Client-Server** dengan pemisahan antara Frontend dan Backend.

### 1. Frontend (User Interface)
- **Framework:** React.js 18 & TypeScript
- **Build Tool:** Vite (untuk performa build yang sangat cepat)
- **Styling:** Tailwind CSS & komponen UI dari **shadcn/ui** (Radix UI)
- **Routing:** React Router DOM
- **State Management:** React Context API (untuk Cart & Auth) & Local Storage
- **Validasi Form:** React Hook Form & Zod

### 2. Backend (API & Server)
- **Environment:** Node.js
- **Framework:** Express.js
- **Security:** JWT (JSON Web Token) & Bcrypt (Password Hashing)
- **File Handling:** Multer (untuk upload gambar SIMAKSI & Bukti Pembayaran)

### 3. Database
- **RDBMS:** MySQL (XAMPP Local Server)
- **Koneksi:** Package `mysql2`

---

## 🗄️ Struktur Database (Relational Schema)
Sistem menggunakan database relasional `campcer` dengan tabel utama:

1. **`users`**: Menyimpan data pengguna dan admin, terenkripsi (`password_hash`), info kontak (`phone`), dan *Role-Based Access* (`role: admin/user`).
2. **`products`**: Menyimpan master data barang sewa, deskripsi, harga per hari, ketersediaan stok (`stock`), dan status aktif.
3. **`orders`**: Menyimpan data transaksi pesanan (ID User, tujuan gunung, durasi sewa, total harga, status pesanan, dan link file SIMAKSI/Pembayaran).
4. **`order_items`**: Menyimpan relasi *many-to-many* antara pesanan dan produk beserta kuantitas alat yang disewa.

---

## 👤 Fitur Utama: Sisi Pengguna (Frontend User)

1. **Autentikasi Aman:** Pendaftaran dan Login menggunakan JWT Token.
2. **Trip Planner (Rekomendasi Cerdas):** Pengguna memasukkan nama Gunung, Jumlah Hari, dan Jumlah Peserta. Sistem akan secara otomatis mengkalkulasi dan merekomendasikan perlengkapan yang dibutuhkan.
3. **Katalog Interaktif & Keranjang (Cart):** Pengguna dapat memilih produk satuan maupun paket, merubah kuantitas, dengan keranjang belanja (*floating cart widget*) yang menyimpan sesi.
4. **Checkout & Upload File:** Alur checkout dengan opsi upload dokumen perizinan pendakian (SIMAKSI) dan pengaturan durasi hari sewa.
5. **Dashboard "Pesanan Saya":** Pengguna dapat melacak status pesanan secara real-time, melihat total tagihan, dan mengunggah **Bukti Pembayaran transfer**.
6. **Profil Pengguna:** Manajemen kontak dan opsi perubahan data profil.

---

## 👨‍💻 Fitur Utama: Sisi Admin (Backend & Dashboard Admin)

1. **Manajemen Produk & Inventaris (CRUD):** 
   - Menambahkan barang baru atau Paket Bundling.
   - Mengatur Harga, Deskripsi, dan Gambar.
   - **Validasi Stok:** Sistem otomatis mengecek dan menolak pesanan jika barang melebihi kapasitas inventaris database.
2. **Manajemen Transaksi (Order Workflow):**
   - Melihat detail pesanan masuk.
   - Verifikasi dokumen (Melihat Bukti Transfer & SIMAKSI).
   - Mengubah alur status pesanan: `Pending` ➔ `Confirmed` (Dibayar) ➔ `Active` (Sedang Disewa) ➔ `Returned` (Dikembalikan).
3. **Manajemen Pengguna:** Memantau seluruh pengguna terdaftar, merubah data user jika diperlukan, dan melihat histori pemesanan.

---

## 🔒 Sistem Keamanan & Business Logic

Untuk menjamin kelancaran dan keamanan aplikasi, Campcer mengimplementasikan:

1. **Proteksi Route & Middleware:** 
   - Endpoint Admin hanya bisa diakses oleh token dengan *role* 'admin'.
   - Pengguna tidak login tidak bisa mengakses halaman Checkout.
2. **Validasi Stok (Anti-Overselling):** Sistem melakukan validasi ke database saat pengguna melakukan penambahan ke keranjang maupun saat checkout untuk memastikan stok fisik tersedia.
3. **Enkripsi Kata Sandi:** Tidak ada password fisik yang disimpan di database, semua di-*hash* menggunakan protokol Bcrypt.
4. **Static File Serving:** Gambar sensitif seperti KTP/SIMAKSI dan Bukti Transfer disimpan di server lokal direktori `uploads/` secara terstruktur dan diakses via URL statis yang dilayani oleh Express.

---

## 🔄 Alur Proses Aplikasi (User Journey)

1. **Registrasi/Login:** Pengguna membuat akun.
2. **Pilih Alat / Trip Planner:** Pengguna memilih metode rekomendasi otomatis atau milih manual di Katalog.
3. **Checkout:** Mengonfirmasi isi keranjang, menetapkan durasi (hari), dan mengunggah SIMAKSI (opsional).
4. **Pembayaran:** Pengguna diarahkan ke Dashboard Pesanan untuk mengunggah Bukti Pembayaran Manual.
5. **Verifikasi:** Admin memeriksa pesanan di Dashboard Admin dan mengonfirmasi validitas pembayaran.
6. **Penyewaan:** Status pesanan menjadi *Active* saat alat diambil/diantar.
7. **Pengembalian:** Admin mengubah status menjadi *Returned*, stok alat di database otomatis diperbarui/dilepas untuk pengguna selanjutnya.

---

# Terima Kasih! ⛺
**Siap untuk Sesi Tanya Jawab.**
