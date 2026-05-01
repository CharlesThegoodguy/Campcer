import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'campcer',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Auto-migrate: pastikan semua tabel dan kolom ada saat server start
async function runMigrations() {
    const conn = await pool.getConnection();
    try {
        console.log('[DB] Menjalankan migrasi otomatis...');

        // Buat tabel users jika belum ada
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id           VARCHAR(36) PRIMARY KEY,
                email        VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL DEFAULT '',
                full_name    VARCHAR(255) NOT NULL DEFAULT '',
                phone        VARCHAR(50)  NOT NULL DEFAULT '',
                role         ENUM('admin','user') NOT NULL DEFAULT 'user',
                created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // Cek kolom yang ada di tabel users
        const [cols] = await conn.execute('SHOW COLUMNS FROM users');
        const colNames = cols.map(c => c.Field);

        // Tambah password_hash jika belum ada
        if (!colNames.includes('password_hash')) {
            await conn.execute(`ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT '' AFTER email`);
            console.log('[DB] ✅ Kolom password_hash ditambahkan');
        }
        // Tambah full_name jika belum ada
        if (!colNames.includes('full_name')) {
            await conn.execute(`ALTER TABLE users ADD COLUMN full_name VARCHAR(255) NOT NULL DEFAULT ''`);
            console.log('[DB] ✅ Kolom full_name ditambahkan');
        }
        // Tambah role jika belum ada
        if (!colNames.includes('role')) {
            await conn.execute(`ALTER TABLE users ADD COLUMN role ENUM('admin','user') NOT NULL DEFAULT 'user'`);
            console.log('[DB] ✅ Kolom role ditambahkan');
            // Migrasi role lama dari user_roles jika ada
            try {
                await conn.execute(`UPDATE users u JOIN user_roles ur ON u.id = ur.user_id SET u.role = ur.role`);
                console.log('[DB] ✅ Data role dimigrasi dari user_roles');
            } catch (e) {
                // Abaikan jika tabel user_roles tidak ada
            }
        }

        // Buat tabel products
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS products (
                id            VARCHAR(36) PRIMARY KEY,
                name          VARCHAR(255) NOT NULL,
                description   TEXT NOT NULL DEFAULT '',
                emoji         VARCHAR(10)  NOT NULL DEFAULT '🏕️',
                category      VARCHAR(50)  NOT NULL DEFAULT 'basic',
                price_per_day DECIMAL(15,2) NOT NULL DEFAULT 0,
                stock         INT          NOT NULL DEFAULT 0,
                is_active     TINYINT(1)   NOT NULL DEFAULT 1,
                created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // Buat tabel orders
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS orders (
                id            VARCHAR(36) PRIMARY KEY,
                user_id       VARCHAR(36) NOT NULL,
                mountain_name VARCHAR(255) NOT NULL,
                days          INT NOT NULL,
                people        INT NOT NULL,
                total_price   DECIMAL(15,2) NOT NULL DEFAULT 0,
                status        ENUM('pending','confirmed','active','returned','cancelled') NOT NULL DEFAULT 'pending',
                simaksi_url   TEXT,
                payment_proof_url TEXT,
                notes         TEXT NOT NULL DEFAULT '',
                created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // Pastikan kolom payment_proof_url ada (untuk migrasi tabel lama)
        const [orderCols] = await conn.execute('SHOW COLUMNS FROM orders');
        if (!orderCols.map(c => c.Field).includes('payment_proof_url')) {
            await conn.execute(`ALTER TABLE orders ADD COLUMN payment_proof_url TEXT AFTER simaksi_url`);
            console.log('[DB] ✅ Kolom payment_proof_url ditambahkan pada orders');
        }

        // Buat tabel order_items
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS order_items (
                id            INT AUTO_INCREMENT PRIMARY KEY,
                order_id      VARCHAR(36) NOT NULL,
                product_name  VARCHAR(255) NOT NULL,
                quantity      INT NOT NULL DEFAULT 1,
                price_per_day DECIMAL(15,2) NOT NULL DEFAULT 0,
                days          INT NOT NULL DEFAULT 1,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // Seed Akun Admin
        const [admins] = await conn.execute("SELECT id FROM users WHERE email = 'admin@campcer.com'");
        if (admins.length === 0) {
            // password: password123
            await conn.execute(`
                INSERT INTO users (id, email, password_hash, full_name, role)
                VALUES ('admin-campcer-001', 'admin@campcer.com', '$2b$10$i9hnAR4yQSZfXklOXLBbVOmM2ft/OSY40U7f.VLI3noCAzSj37fJa', 'Administrator', 'admin')
            `);
            console.log('[DB] ✅ Akun admin default dibuat (admin@campcer.com / password123)');
        }

        // Seed Akun User Biasa
        const [users] = await conn.execute("SELECT id FROM users WHERE email = 'user@campcer.com'");
        if (users.length === 0) {
            // password: password123
            await conn.execute(`
                INSERT INTO users (id, email, password_hash, full_name, role)
                VALUES ('user-campcer-002', 'user@campcer.com', '$2b$10$i9hnAR4yQSZfXklOXLBbVOmM2ft/OSY40U7f.VLI3noCAzSj37fJa', 'Demo User', 'user')
            `);
            console.log('[DB] ✅ Akun user demo dibuat (user@campcer.com / password123)');
        }

        console.log('[DB] ✅ Migrasi selesai - semua tabel siap');
    } catch (err) {
        console.error('[DB] ❌ Migrasi gagal:', err.message);
    } finally {
        conn.release();
    }
}

// Test koneksi dan jalankan migrasi saat startup
pool.getConnection()
    .then(async conn => {
        console.log('✅ Terhubung ke MySQL XAMPP');
        conn.release();
        await runMigrations();
    })
    .catch(err => {
        console.error('❌ Gagal terhubung ke MySQL:', err.message);
        console.error('   Pastikan XAMPP MySQL sudah aktif dan database "campcer" sudah dibuat!');
    });

export default pool;
