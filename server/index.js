import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import ordersRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import productsRoutes from './routes/products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded simaksi images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productsRoutes);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ Backend server berjalan di http://localhost:${PORT}`);
    console.log(`   Pastikan MySQL XAMPP sudah aktif!`);
});
