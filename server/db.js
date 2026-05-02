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
                image_url     TEXT,
                category      VARCHAR(50)  NOT NULL DEFAULT 'basic',
                price_per_day DECIMAL(15,2) NOT NULL DEFAULT 0,
                stock         INT          NOT NULL DEFAULT 0,
                is_active     TINYINT(1)   NOT NULL DEFAULT 1,
                created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        const [prodCols] = await conn.execute('SHOW COLUMNS FROM products');
        if (!prodCols.map(c => c.Field).includes('image_url')) {
            await conn.execute(`ALTER TABLE products ADD COLUMN image_url TEXT AFTER emoji`);
            console.log('[DB] ✅ Kolom image_url ditambahkan pada products');
        }
        if (!prodCols.map(c => c.Field).includes('sizes')) {
            await conn.execute(`ALTER TABLE products ADD COLUMN sizes TEXT AFTER description`);
            console.log('[DB] ✅ Kolom sizes ditambahkan pada products');
        }

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
        if (!orderCols.map(c => c.Field).includes('delivery_method')) {
            await conn.execute(`ALTER TABLE orders ADD COLUMN delivery_method ENUM('pickup', 'delivery') NOT NULL DEFAULT 'pickup' AFTER status`);
            console.log('[DB] ✅ Kolom delivery_method ditambahkan pada orders');
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

        // Seed Products if empty
        const [existingProducts] = await conn.execute("SELECT id FROM products LIMIT 1");
        if (existingProducts.length === 0) {
            console.log('[DB] 📦 Seeding products dan packages...');
            const seedProducts = [
              // Tents
              { id: "tent-2-basic", name: "Tenda Dome 2P Standard", category: "shelter", price_per_day: 35000, emoji: "⛺", description: "Tenda dome ringan untuk 2 orang, cocok cuaca bersahabat." },
              { id: "tent-4-standard", name: "Tenda Dome 4P", category: "shelter", price_per_day: 60000, emoji: "⛺", description: "Tenda 4 orang, double layer, tahan gerimis." },
              { id: "tent-6-storm", name: "Tenda Anti Badai 6P", category: "shelter", price_per_day: 120000, emoji: "🏕️", description: "Frame aluminium 4 musim, tahan angin kencang & badai." },
              { id: "flysheet", name: "Flysheet 3x4m", category: "shelter", price_per_day: 15000, emoji: "🟦", description: "Atap tambahan untuk area masak/santai." },
              // Sleep
              { id: "sb-basic", name: "Sleeping Bag Polar", category: "sleep", price_per_day: 15000, emoji: "🛏️", description: "Comfort 15°C. Untuk gunung di bawah 2500m." },
              { id: "sb-standard", name: "Sleeping Bag Hollow Fiber", category: "sleep", price_per_day: 25000, emoji: "🛌", description: "Comfort 5°C. Cukup untuk Grade II-III." },
              { id: "sb-down", name: "Sleeping Bag Bulu Angsa", category: "sleep", price_per_day: 50000, emoji: "🪶", description: "Comfort -5°C. Wajib untuk gunung dingin/alpine." },
              { id: "thermal", name: "Baselayer Thermal Set", category: "apparel", price_per_day: 20000, emoji: "🧥", description: "Pakaian dalam thermal, tahan dingin ekstrem." },
              { id: "matras", name: "Matras Aluminium Foil", category: "sleep", price_per_day: 8000, emoji: "🟫", description: "Alas tidur, isolasi panas tubuh." },
              // Cooking
              { id: "stove", name: "Kompor Portable + Gas", category: "cooking", price_per_day: 15000, emoji: "🔥", description: "Kompor lipat hemat gas." },
              { id: "nesting", name: "Nesting Set 4P", category: "cooking", price_per_day: 12000, emoji: "🥘", description: "Set panci, gelas, sendok untuk 4 orang." },
              { id: "water-filter", name: "Water Filter Portable", category: "safety", price_per_day: 25000, emoji: "💧", description: "Filter air sungai/danau menjadi layak minum." },
              // Navigation & Lighting
              { id: "headlamp", name: "Headlamp 300 Lumen", category: "lighting", price_per_day: 10000, emoji: "🔦", description: "Lampu kepala wajib untuk summit attack." },
              { id: "gps", name: "GPS + Peta Topografi", category: "navigation", price_per_day: 40000, emoji: "🧭", description: "GPS handheld, esensial di hutan lebat/jalur tidak jelas." },
              // Safety
              { id: "first-aid", name: "First Aid Kit Lengkap", category: "safety", price_per_day: 15000, emoji: "🩹", description: "P3K lengkap termasuk obat ketinggian." },
              { id: "gas-mask", name: "Masker Anti Gas Vulkanik", category: "safety", price_per_day: 20000, emoji: "😷", description: "Masker N95+ filter gas SO₂. Wajib gunung aktif." },
              { id: "rain-gear", name: "Jas Hujan Setelan", category: "apparel", price_per_day: 12000, emoji: "🧥", description: "Jaket + celana waterproof." },
              { id: "trekking-pole", name: "Trekking Pole Sepasang", category: "safety", price_per_day: 18000, emoji: "🥾", description: "Bantu jalur scree & turunan curam." },
              { id: "gaiter", name: "Gaiter (Pelindung Kaki)", category: "apparel", price_per_day: 10000, emoji: "🦵", description: "Cegah pasir/kerikil masuk sepatu." },
              { id: "gloves", name: "Sarung Tangan Thermal", category: "apparel", price_per_day: 8000, emoji: "🧤", description: "Lindungi tangan dari dingin & gesekan." },
              // Carry
              { id: "carrier-60", name: "Carrier 60L", category: "carry", price_per_day: 35000, emoji: "🎒", description: "Tas gunung kapasitas 60L untuk pendakian 2-3 hari." },
              { id: "carrier-80", name: "Carrier 80L", category: "carry", price_per_day: 50000, emoji: "🎒", description: "Untuk ekspedisi panjang 4+ hari." },
              // Packages
              { id: "pkg-2", name: "Paket Camping 2 Orang", category: "package", price_per_day: 90000, emoji: "🏕️", description: "Hemat untuk pasangan/duo pendaki di gunung ringan." },
              { id: "pkg-4", name: "Paket Camping 4 Orang", category: "package", price_per_day: 175000, emoji: "🏕️", description: "Lengkap untuk grup 4 orang, gunung Grade II-III." },
              { id: "pkg-5", name: "Paket Camping 5 Orang", category: "package", price_per_day: 220000, emoji: "🏕️", description: "Grup 5 orang dengan tenda anti badai. Cocok Grade III-IV." }
            ];

            for (const p of seedProducts) {
                await conn.execute(
                    'INSERT INTO products (id, name, description, emoji, category, price_per_day, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [p.id, p.name, p.description, p.emoji, p.category, p.price_per_day, 10] // default stock 10
                );
            }
            console.log('[DB] ✅ 25 Produk & Paket default berhasil ditambahkan (Stok 10)');
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
