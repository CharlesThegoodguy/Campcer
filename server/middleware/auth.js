import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'campcer_super_secret_key_123';

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ error: 'Token tidak ada' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ error: 'Token tidak ada' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token tidak valid atau kadaluarsa' });
        req.user = decoded;
        next();
    });
};

export const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Akses Admin diperlukan' });
    }
};
