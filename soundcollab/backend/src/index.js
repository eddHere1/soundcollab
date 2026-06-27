require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const pool = require('./config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const followRoutes = require('./routes/follows');
const friendRoutes = require('./routes/friends');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');
const collabRoutes = require('./routes/collab');
const beatRoutes = require('./routes/beats');
const opportunityRoutes = require('./routes/opportunities');
const chartsRoutes = require('./routes/charts');
const playlistRoutes = require('./routes/playlists');
const analyticsRoutes = require('./routes/analytics');
const groupRoutes = require('./routes/groups');

const app = express();
const PORT = process.env.PORT || 5000;

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', uploadDir)));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: pool.getDbMode() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/collab', collabRoutes);
app.use('/api/beats', beatRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/charts', chartsRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/groups', groupRoutes);

app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

async function start() {
  await pool.initDb();
  app.listen(PORT, () => {
    console.log(`SoundCollab API running on http://localhost:${PORT} [db: ${pool.getDbMode()}]`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
