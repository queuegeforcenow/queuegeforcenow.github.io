// backend/models/user.js

const db = require('../db');

class User {
  // ユーザーをIDで取得
  static async findById(id) {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  // ユーザーをメールで取得（認証用）
  static async findByEmail(email) {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  // ユーザーを作成（登録）
  static async create({ email, passwordHash }) {
    const result = await db.query(
      'INSERT INTO users (email, password_hash, balance, total_bet) VALUES ($1, $2, 0, 0) RETURNING *',
      [email, passwordHash]
    );
    return result.rows[0];
  }

  // ユーザーの残高を更新
  static async updateBalance(id, newBalance) {
    await db.query('UPDATE users SET balance = $1 WHERE id = $2', [newBalance, id]);
  }

  // ユーザーの累計掛け金を更新（増加）
  static async increaseTotalBet(id, amount) {
    await db.query('UPDATE users SET total_bet = total_bet + $1 WHERE id = $2', [amount, id]);
  }

  // ユーザー情報を更新（汎用）
  static async update(id, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return;

    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = keys.map(k => fields[k]);

    await db.query(`UPDATE users SET ${setClause} WHERE id = $${keys.length + 1}`, [...values, id]);
  }
}

module.exports = User;
