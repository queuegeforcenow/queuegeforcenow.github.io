// backend/models/user.js
const db = require('../db');

const createUserIfNotExists = async (userId) => {
  const result = await db.query(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    await db.query(
      'INSERT INTO users (id, total_bet, rank, last_bonus_at) VALUES ($1, $2, $3, $4)',
      [userId, 0, 'なし', null]
    );
  }
};

const updateTotalBet = async (userId, amount) => {
  await createUserIfNotExists(userId);
  await db.query(
    'UPDATE users SET total_bet = total_bet + $1 WHERE id = $2',
    [amount, userId]
  );
};

const getUser = async (userId) => {
  await createUserIfNotExists(userId);
  const res = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  return res.rows[0];
};

const updateRank = async (userId, newRank) => {
  await db.query(
    'UPDATE users SET rank = $1 WHERE id = $2',
    [newRank, userId]
  );
};

const updateLastBonusTime = async (userId, time) => {
  await db.query(
    'UPDATE users SET last_bonus_at = $1 WHERE id = $2',
    [time, userId]
  );
};

module.exports = {
  createUserIfNotExists,
  updateTotalBet,
  getUser,
  updateRank,
  updateLastBonusTime,
};
