-- ============================================================
-- FIX: Jalankan script ini di phpMyAdmin jika tabel sudah ada
-- Pilih database "campcer" dulu, lalu import/jalankan query ini
-- ============================================================

USE campcer;

-- Cek dan tambah kolom yang mungkin belum ada
-- Jika kolom "password_hash" belum ada, tambahkan
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NOT NULL DEFAULT '' AFTER email,
  ADD COLUMN IF NOT EXISTS full_name VARCHAR(255) NOT NULL DEFAULT '' AFTER password_hash,
  ADD COLUMN IF NOT EXISTS phone VARCHAR(50) NOT NULL DEFAULT '' AFTER full_name,
  ADD COLUMN IF NOT EXISTS role ENUM('admin','user') NOT NULL DEFAULT 'user' AFTER phone;

-- Update admin default jika sudah ada
UPDATE users SET role = 'admin' WHERE email = 'admin@campcer.com';

-- Jika tabel user_roles lama masih ada, kita bisa abaikan atau hapus
DROP TABLE IF EXISTS user_roles;

-- Buat tabel products jika belum ada
CREATE TABLE IF NOT EXISTS products (
    id          VARCHAR(36) PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    emoji       VARCHAR(10) NOT NULL DEFAULT '🏕️',
    category    VARCHAR(50) NOT NULL DEFAULT 'basic',
    price_per_day DECIMAL(15, 2) NOT NULL DEFAULT 0,
    stock       INT NOT NULL DEFAULT 0,
    is_active   TINYINT(1) NOT NULL DEFAULT 1,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Buat tabel orders jika belum ada
CREATE TABLE IF NOT EXISTS orders (
    id            VARCHAR(36) PRIMARY KEY,
    user_id       VARCHAR(36) NOT NULL,
    mountain_name VARCHAR(255) NOT NULL,
    days          INT NOT NULL,
    people        INT NOT NULL,
    total_price   DECIMAL(15, 2) NOT NULL DEFAULT 0,
    status        ENUM('pending', 'confirmed', 'active', 'returned', 'cancelled') NOT NULL DEFAULT 'pending',
    simaksi_url   TEXT,
    payment_proof_url TEXT,
    notes         TEXT NOT NULL DEFAULT '',
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Buat tabel order_items jika belum ada
CREATE TABLE IF NOT EXISTS order_items (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    order_id      VARCHAR(36) NOT NULL,
    product_name  VARCHAR(255) NOT NULL,
    quantity      INT NOT NULL DEFAULT 1,
    price_per_day DECIMAL(15, 2) NOT NULL DEFAULT 0,
    days          INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Admin default (password: password123)
INSERT INTO users (id, email, password_hash, full_name, role)
VALUES ('admin-campcer-001', 'admin@campcer.com', '$2b$10$i9hnAR4yQSZfXklOXLBbVOmM2ft/OSY40U7f.VLI3noCAzSj37fJa', 'Administrator', 'admin')
ON DUPLICATE KEY UPDATE role = 'admin', password_hash = '$2b$10$i9hnAR4yQSZfXklOXLBbVOmM2ft/OSY40U7f.VLI3noCAzSj37fJa';

-- User default (password: password123)
INSERT INTO users (id, email, password_hash, full_name, role)
VALUES ('user-campcer-002', 'user@campcer.com', '$2b$10$i9hnAR4yQSZfXklOXLBbVOmM2ft/OSY40U7f.VLI3noCAzSj37fJa', 'Demo User', 'user')
ON DUPLICATE KEY UPDATE role = 'user', password_hash = '$2b$10$i9hnAR4yQSZfXklOXLBbVOmM2ft/OSY40U7f.VLI3noCAzSj37fJa';
