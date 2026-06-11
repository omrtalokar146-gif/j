import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import gamesRoutes from './routes/gamesRoutes.js';
import metricsRoutes from './routes/metricsRoutes.js';

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

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
app.use('/api/metrics', metricsRoutes);

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
const server = createServer(app);

let liveConnections = 0;
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  liveConnections += 1;
  io.emit('liveConnections', liveConnections);

  socket.on('disconnect', () => {
    liveConnections = Math.max(0, liveConnections - 1);
    io.emit('liveConnections', liveConnections);
  });
});

server.listen(PORT, () => {
  console.log(`NEXUS backend running on port ${PORT}`);
});
