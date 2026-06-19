const pool = require('../db');

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS email_verifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code VARCHAR(6) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  await pool.query(query);
};

const EmailVerification = {
  async create(userId, code) {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 минут
    const result = await pool.query(
      `INSERT INTO email_verifications (user_id, code, expires_at)
       VALUES ($1, $2, $3) RETURNING *`,
      [userId, code, expiresAt]
    );
    return result.rows[0];
  },

  async findByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM email_verifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    return result.rows[0];
  },

  async deleteByUserId(userId) {
    await pool.query('DELETE FROM email_verifications WHERE user_id = $1', [userId]);
  },

  async verifyCode(userId, code) {
    const result = await pool.query(
      `SELECT * FROM email_verifications 
       WHERE user_id = $1 AND code = $2 AND expires_at > NOW()`,
      [userId, code]
    );
    return result.rows[0] || null;
  },

  // Удалить просроченные коды (для очистки)
  async deleteExpired() {
    await pool.query('DELETE FROM email_verifications WHERE expires_at < NOW()');
  }
};

module.exports = { createTable, EmailVerification };