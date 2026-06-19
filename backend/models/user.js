const pool = require('../db');

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      surname VARCHAR(100) DEFAULT '',
      email VARCHAR(100) UNIQUE NOT NULL,
      phone VARCHAR(20) DEFAULT '',
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      is_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  await pool.query(query);
};

const User = {
  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },
  async create(name, email, password, role = 'user', surname = '', phone = '') {
    const result = await pool.query(
      `INSERT INTO users (name, surname, email, phone, password, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, surname, email, phone, role, created_at`,
      [name, surname, email, phone, password, role]
    );
    return result.rows[0];
  },
  async findById(id) {
    const result = await pool.query(
      'SELECT id, name, surname, email, phone, role, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },
  async updateProfile(id, { name, surname, email, phone }) {
    const result = await pool.query(
      `UPDATE users SET name = $1, surname = $2, email = $3, phone = $4
       WHERE id = $5
       RETURNING id, name, surname, email, phone, role, created_at`,
      [name, surname, email, phone, id]
    );
    return result.rows[0];
  },
  async updatePassword(id, newPassword) {
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [newPassword, id]);
  },
  async verifyUser(id) {
    const result = await pool.query(
      'UPDATE users SET is_verified = TRUE WHERE id = $1 RETURNING id, name, surname, email, phone, role, is_verified, created_at',
      [id]
    );
    return result.rows[0];
  }
};

module.exports = { createTable, User };   