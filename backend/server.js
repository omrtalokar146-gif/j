import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import gamesRoutes from './routes/gamesRoutes.js';

dotenv.config();
const app = express();

// Check for required environment variables and warn if missing
const requiredEnv = ['JWT_SECRET', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingEnv = requiredEnv.filter((k) => !process.env[k]);
if (missingEnv.length > 0) {
  console.warn('\n*** WARNING: Missing environment variables: ' + missingEnv.join(', ') + ' ***\n');
  console.warn('Set these in your Render (or hosting) service environment settings.');
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/games', gamesRoutes);

// Safe config endpoint (does not expose secrets)
app.get('/api/config', (req, res) => {
  const cloudinaryConfigured = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
  res.json({ ok: true, cloudinaryConfigured });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'NEXUS Backend' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`NEXUS backend running on port ${PORT}`);
});
