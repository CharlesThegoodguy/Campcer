import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Multer config for both simaksi and payment proofs
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = file.fieldname === 'payment_proof' ? 'payment' : 'simaksi';
        const dir = path.join(process.cwd(), 'server', 'uploads', type);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const prefix = file.fieldname === 'payment_proof' ? 'payment' : 'simaksi';
        cb(null, `${prefix}-${Date.now()}${ext}`);
    }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

// GET /api/orders/me - Get current user's orders
router.get('/me', verifyToken, async (req, res) => {
    try {
        const [orders] = await db.execute(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        
        // Fetch items for each order
        for (let order of orders) {
            const [items] = await db.execute(
                'SELECT * FROM order_items WHERE order_id = ?',
                [order.id]
            );
            order.items = items;
        }

        res.json({ orders });
    } catch (err) {
        console.error('[GET ORDERS ME ERROR]', err.message);
        res.status(500).json({ error: 'Gagal mengambil data pesanan' });
    }
});

// PATCH /api/orders/:id/payment - Upload payment proof
router.patch('/:id/payment', verifyToken, upload.single('payment_proof'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Tidak ada file yang diunggah' });
        }

        const payment_proof_url = `/uploads/payment/${req.file.filename}`;
        
        const [result] = await db.execute(
            'UPDATE orders SET payment_proof_url = ? WHERE id = ? AND user_id = ?',
            [payment_proof_url, req.params.id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pesanan tidak ditemukan atau bukan milik Anda' });
        }

        res.json({ message: 'Bukti pembayaran berhasil diunggah', payment_proof_url });
    } catch (err) {
        console.error('[PAYMENT UPLOAD ERROR]', err.message);
        res.status(500).json({ error: 'Gagal mengunggah bukti pembayaran' });
    }
});

// POST /api/orders - Checkout baru
router.post('/', verifyToken, upload.single('simaksi'), async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { mountain_name, days, people, total_price, notes, items, delivery_method } = req.body;
        const parsedItems = JSON.parse(items || '[]');

        // Cek Stok terlebih dahulu
        for (const item of parsedItems) {
            const baseName = item.product_name.replace(/ \(Size: .*\)$/, '');
            const sizeMatch = item.product_name.match(/ \(Size: (.*)\)$/);
            const selectedSize = sizeMatch ? sizeMatch[1] : null;

            const [productRows] = await connection.execute(
                'SELECT id, stock, name, sizes FROM products WHERE name = ? LIMIT 1',
                [baseName]
            );
            
            if (productRows.length === 0) {
                throw new Error(`Produk ${baseName} tidak ditemukan dalam sistem.`);
            }

            const product = productRows[0];
            
            if (selectedSize && product.sizes) {
                let sizesList = [];
                try { sizesList = JSON.parse(product.sizes); } catch {}
                const sizeObj = sizesList.find(s => s.size === selectedSize);
                
                if (!sizeObj) {
                    throw new Error(`Ukuran ${selectedSize} untuk produk ${baseName} tidak tersedia.`);
                }
                if (sizeObj.stock < item.quantity) {
                    throw new Error(`Stok ukuran ${selectedSize} tidak mencukupi. Tersisa: ${sizeObj.stock}`);
                }
                
                // Kurangi stok di dalam JSON sizes
                sizeObj.stock -= item.quantity;
                await connection.execute(
                    'UPDATE products SET sizes = ? WHERE id = ?',
                    [JSON.stringify(sizesList), product.id]
                );
            } else {
                if (product.stock < item.quantity) {
                    throw new Error(`Stok ${baseName} tidak mencukupi. Tersisa: ${product.stock}`);
                }

                // Kurangi stok utama
                await connection.execute(
                    'UPDATE products SET stock = stock - ? WHERE id = ?',
                    [item.quantity, product.id]
                );
            }
        }

        const simaksi_url = req.file ? `/uploads/simaksi/${req.file.filename}` : null;
        const orderId = generateId();

        await connection.execute(
            `INSERT INTO orders (id, user_id, mountain_name, days, people, total_price, simaksi_url, notes, status, delivery_method)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
            [orderId, req.user.id, mountain_name, parseInt(days), parseInt(people), parseFloat(total_price), simaksi_url, notes || '', delivery_method || 'pickup']
        );

        for (const item of parsedItems) {
            await connection.execute(
                `INSERT INTO order_items (order_id, product_name, quantity, price_per_day, days) VALUES (?, ?, ?, ?, ?)`,
                [orderId, item.product_name, item.quantity, item.price_per_day, item.days]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Pesanan berhasil dibuat', orderId });
    } catch (err) {
        await connection.rollback();
        console.error('[ORDER ERROR]', err.message);
        res.status(400).json({ error: err.message });
    } finally {
        connection.release();
    }
});

export default router;
