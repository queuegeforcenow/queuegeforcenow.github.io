const express = require('express');
const session = require('express-session');
const db = require('./db');
const path = require('path');
require('dotenv').config();

app.use('/bj', express.static(path.join(__dirname, 'bj/public')));


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.post('/signup', async (req, res) => {
  const { user_id, password, username } = req.body;
  try {
    const userResult = await db.query(
      'INSERT INTO users (user_id, password) VALUES ($1, $2) RETURNING id',
      [user_id, password]
    );
    const userId = userResult.rows[0].id;
    await db.query(
      'INSERT INTO profiles (id, username) VALUES ($1, $2)',
      [userId, username]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: '登録エラー: ' + err.message });
  }
});

app.post('/login', async (req, res) => {
  const { user_id, password } = req.body;
  try {
    const result = await db.query(
      'SELECT id FROM users WHERE user_id = $1 AND password = $2',
      [user_id, password]
    );
    if (result.rows.length === 0) {
      return res.json({ success: false, message: '認証失敗' });
    }
    req.session.userId = result.rows[0].id;
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'ログインエラー' });
  }
});

app.get('/profile', async (req, res) => {
  if (!req.session.userId) {
    return res.json({ loggedIn: false });
  }
  const result = await db.query(
    'SELECT username FROM profiles WHERE id = $1',
    [req.session.userId]
  );
  res.json({ loggedIn: true, username: result.rows[0]?.username });
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
