// backend/auth.js

const express = require('express');
const router = express.Router();
const { createUserIfNotExists } = require('./models/user');

// 認証ミドルウェア（全てのリクエストで userId を確認）
const authenticate = async (req, res, next) => {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({ error: 'ユーザーIDが必要です (x-user-id ヘッダー)' });
  }

  req.userId = userId;

  try {
    await createUserIfNotExists(userId);
    next();
  } catch (err) {
    console.error('認証エラー:', err);
    res.status(500).json({ error: '内部サーバーエラー' });
  }
};

module.exports = authenticate;
