// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');
const authRoutes = require('./auth');
const bonusRoutes = require('./bonus');
const rankRoutes = require('./rank');
const path = require('path');


app.use('/bj', express.static(path.join(__dirname, 'bj/public')));


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ルーティング
app.use('/api/auth', authRoutes);
app.use('/api/bonus', bonusRoutes);
app.use('/api/rank', rankRoutes);

// ルート
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/../public/index.html');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
