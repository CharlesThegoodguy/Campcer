import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'campcer_super_secret_key_123';
const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { email, password, full_name, phone } = req.body;
    if (!email || !password || !phone) {
        return res.status(400).json({ error: 'Email, password, dan no telepon wajib diisi' });
    }
    try {
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email sudah terdaftar' });
        }
        const id = generateId();
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute(
            'INSERT INTO users (id, email, password_hash, full_name, phone) VALUES (?, ?, ?, ?, ?)',
            [id, email, hashedPassword, full_name || '', phone]
        );
        res.status(201).json({ message: 'Akun berhasil dibuat', user: { id, email, full_name, phone } });
    } catch (err) {
        console.error('[REGISTER ERROR]', err.message);
        res.status(500).json({ error: 'Terjadi kesalahan: ' + err.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email dan password wajib diisi' });
    }
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Email atau password salah' });
        }
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Email atau password salah' });
        }
        
        const role = user.role || 'user';
        
        const token = jwt.sign(
            { id: user.id, email: user.email, role, full_name: user.full_name || '' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        res.json({ message: 'Login berhasil', token, user: { id: user.id, email: user.email, role, full_name: user.full_name || '', phone: user.phone || '' } });
    } catch (err) {
        console.error('[LOGIN ERROR]', err.message);
        res.status(500).json({ error: 'Terjadi kesalahan: ' + err.message });
    }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, email, full_name, phone, role, created_at FROM users WHERE id = ?', [req.user.id]
        );
        if (users.length === 0) return res.status(404).json({ error: 'User tidak ditemukan' });
        res.json({ user: users[0] });
    } catch (err) {
        console.error('[ME ERROR]', err.message);
        res.status(500).json({ error: 'Terjadi kesalahan: ' + err.message });
    }
});

// PATCH /api/auth/profile
router.patch('/profile', verifyToken, async (req, res) => {
    const { full_name, phone, password } = req.body;
    try {
        let updateQuery = 'UPDATE users SET full_name = ?, phone = ?';
        let queryParams = [full_name || '', phone || ''];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateQuery += ', password_hash = ?';
            queryParams.push(hashedPassword);
        }

        updateQuery += ' WHERE id = ?';
        queryParams.push(req.user.id);

        await db.execute(updateQuery, queryParams);
        
        res.json({ message: 'Profil berhasil diperbarui' });
    } catch (err) {
        console.error('[PROFILE UPDATE ERROR]', err.message);
        res.status(500).json({ error: 'Gagal memperbarui profil: ' + err.message });
    }
});

export default router;
