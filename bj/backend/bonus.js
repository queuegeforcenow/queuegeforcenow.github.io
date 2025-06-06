// backend/bonus.js

const express = require('express');
const router = express.Router();
const { getRank } = require('./rank');
const db = require('./db');

// 管理者だけが発行できるシンプルなパスワード（運用時はもっと厳重に）
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'supersecret';

// ボーナスリンクの発行（管理者用）
router.post('/issue', async (req, res) => {
  const { secret } = req.body;
  if (secret !== ADMIN_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    // ボーナス発行用のユニークなトークンを作成
    const token = Math.random().toString(36).substring(2, 12);

    // DBにトークンを保存（未使用状態）
    await db.query('INSERT INTO vip_bonus_links (token, used) VALUES ($1, false)', [token]);

    // 生成したリンクURL（例：/vip/claim?token=xxxx）
    const url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/vip/claim?token=${token}`;

    res.json({ token, url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ボーナス受け取り処理（ユーザーがリンクを踏む）
router.post('/claim', async (req, res) => {
  const { userId, token } = req.body;
  if (!userId || !token) {
    return res.status(400).json({ error: 'Missing userId or token' });
  }

  try {
    // トークンの存在と未使用チェック
    const result = await db.query('SELECT used FROM vip_bonus_links WHERE token = $1', [token]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid token' });
    }
    if (result.rows[0].used) {
      return res.status(400).json({ error: 'Token already used' });
    }

    // ユーザーの累計掛け金を取得
    const userResult = await db.query('SELECT total_bet, balance FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }
    const user = userResult.rows[0];

    // ランクを判定
    const rank = getRank(user.total_bet);

    // ボーナス額を取得
    const bonusAmount = rank.bonus;

    if (bonusAmount <= 0) {
      return res.status(400).json({ error: 'No bonus for your rank' });
    }

    // ユーザーの残高を更新（ボーナス追加）
    const newBalance = parseInt(user.balance) + bonusAmount;
    await db.query('UPDATE users SET balance = $1 WHERE id = $2', [newBalance, userId]);

    // トークンを使用済みに更新
    await db.query('UPDATE vip_bonus_links SET used = true, used_by = $1, used_at = NOW() WHERE token = $2', [userId, token]);

    // レスポンスにボーナス額とランクを返す
    res.json({
      message: `Successfully claimed VIP bonus! Rank: ${rank.name}, Bonus: ${bonusAmount} yen.`,
      rank: rank.name,
      bonus: bonusAmount,
      balance: newBalance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
