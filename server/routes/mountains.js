import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET /api/mountains - Public route untuk data gunung
router.get('/', async (req, res) => {
    try {
        const [mountains] = await db.execute('SELECT * FROM mountains ORDER BY name ASC');
        
        // Parsing JSON back to array/object if needed
        const parsedMountains = mountains.map(m => ({
            ...m,
            conditions: m.conditions ? JSON.parse(m.conditions) : []
        }));

        res.json({ mountains: parsedMountains });
    } catch (err) {
        console.error('[MOUNTAINS ERROR]', err.message);
        res.status(500).json({ error: 'Gagal mengambil data gunung' });
    }
});

export default router;
