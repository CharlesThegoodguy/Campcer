import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(process.cwd(), 'server', 'uploads', 'simaksi');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `simaksi-${Date.now()}${ext}`);
    }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

// POST /api/orders - Checkout baru
router.post('/', verifyToken, upload.single('simaksi'), async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { mountain_name, days, people, total_price, notes, items } = req.body;
        const simaksi_url = req.file ? `/uploads/simaksi/${req.file.filename}` : null;
        const orderId = generateId();

        await connection.execute(
            `INSERT INTO orders (id, user_id, mountain_name, days, people, total_price, simaksi_url, notes, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [orderId, req.user.id, mountain_name, parseInt(days), parseInt(people), parseFloat(total_price), simaksi_url, notes || '']
        );

        const parsedItems = JSON.parse(items || '[]');
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
        res.status(500).json({ error: 'Gagal membuat pesanan: ' + err.message });
    } finally {
        connection.release();
    }
});

export default router;
