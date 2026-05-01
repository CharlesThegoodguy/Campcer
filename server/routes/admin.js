import express from 'express';
import db from '../db.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
router.use(verifyToken, requireAdmin);

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

// GET /api/admin/orders
router.get('/orders', async (req, res) => {
    try {
        const [orders] = await db.execute(`
            SELECT o.*, u.full_name as user_name, u.email as user_email, u.phone as user_phone
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `);
        res.json({ orders });
    } catch (err) {
        console.error('[ADMIN ORDERS ERROR]', err.message);
        res.status(500).json({ error: 'Gagal mengambil data pesanan' });
    }
});

// PATCH /api/admin/orders/:id/status
router.patch('/orders/:id/status', async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { status } = req.body;
        const orderId = req.params.id;

        // Get current status
        const [orderRows] = await connection.execute('SELECT status FROM orders WHERE id = ?', [orderId]);
        if (orderRows.length === 0) throw new Error('Pesanan tidak ditemukan');
        const currentStatus = orderRows[0].status;

        await connection.execute('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);

        // Restore stock if transitioning to returned or cancelled
        if ((status === 'returned' || status === 'cancelled') && (currentStatus !== 'returned' && currentStatus !== 'cancelled')) {
            const [items] = await connection.execute('SELECT product_name, quantity FROM order_items WHERE order_id = ?', [orderId]);
            for (const item of items) {
                await connection.execute(
                    'UPDATE products SET stock = stock + ? WHERE name = ?',
                    [item.quantity, item.product_name]
                );
            }
        }

        // Deduct stock again if transitioning FROM returned/cancelled to active/confirmed (optional safety)
        if ((currentStatus === 'returned' || currentStatus === 'cancelled') && (status !== 'returned' && status !== 'cancelled')) {
            const [items] = await connection.execute('SELECT product_name, quantity FROM order_items WHERE order_id = ?', [orderId]);
            for (const item of items) {
                await connection.execute(
                    'UPDATE products SET stock = stock - ? WHERE name = ?',
                    [item.quantity, item.product_name]
                );
            }
        }

        await connection.commit();
        res.json({ message: 'Status berhasil diperbarui' });
    } catch (err) {
        await connection.rollback();
        console.error('[ADMIN STATUS ERROR]', err.message);
        res.status(500).json({ error: 'Gagal update status' });
    } finally {
        connection.release();
    }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, email, full_name, created_at FROM users ORDER BY created_at DESC'
        );
        res.json({ users });
    } catch (err) {
        console.error('[ADMIN USERS ERROR]', err.message);
        res.status(500).json({ error: 'Gagal mengambil data users' });
    }
});

// GET /api/admin/products
router.get('/products', async (req, res) => {
    try {
        const [products] = await db.execute('SELECT * FROM products ORDER BY created_at DESC');
        res.json({ products });
    } catch (err) {
        console.error('[ADMIN PRODUCTS GET ERROR]', err.message);
        res.status(500).json({ error: 'Gagal mengambil data produk' });
    }
});

// POST /api/admin/products
router.post('/products', async (req, res) => {
    const { name, description, emoji, category, price_per_day, stock } = req.body;
    try {
        const id = generateId();
        await db.execute(
            'INSERT INTO products (id, name, description, emoji, category, price_per_day, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, name, description || '', emoji || '🏕️', category || 'basic', price_per_day, stock]
        );
        res.status(201).json({ message: 'Produk berhasil ditambahkan' });
    } catch (err) {
        console.error('[ADMIN PRODUCTS POST ERROR]', err.message);
        res.status(500).json({ error: 'Gagal menambahkan produk' });
    }
});

// PUT /api/admin/products/:id
router.put('/products/:id', async (req, res) => {
    const { name, description, emoji, category, price_per_day, stock } = req.body;
    try {
        await db.execute(
            'UPDATE products SET name=?, description=?, emoji=?, category=?, price_per_day=?, stock=? WHERE id=?',
            [name, description || '', emoji || '🏕️', category || 'basic', price_per_day, stock, req.params.id]
        );
        res.json({ message: 'Produk berhasil diperbarui' });
    } catch (err) {
        console.error('[ADMIN PRODUCTS PUT ERROR]', err.message);
        res.status(500).json({ error: 'Gagal memperbarui produk' });
    }
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Produk berhasil dihapus' });
    } catch (err) {
        console.error('[ADMIN PRODUCTS DELETE ERROR]', err.message);
        res.status(500).json({ error: 'Gagal menghapus produk' });
    }
});

export default router;
