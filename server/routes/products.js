import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET /api/products - Public route untuk katalog
router.get('/', async (req, res) => {
    try {
        const [products] = await db.execute('SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC');
        res.json({ products });
    } catch (err) {
        console.error('[PRODUCTS ERROR]', err.message);
        res.status(500).json({ error: 'Gagal mengambil data produk' });
    }
});

export default router;
