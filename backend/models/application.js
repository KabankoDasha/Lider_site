const pool = require('../db');

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      course VARCHAR(150),
      comment TEXT,
      status VARCHAR(20) DEFAULT 'processing',
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  await pool.query(query);
};

const Application = {
  async create(name, phone, course = '', comment = '', userId = null) {
    const result = await pool.query(
      `INSERT INTO applications (name, phone, course, comment, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, phone, course, comment, status, user_id, created_at`,
      [name, phone, course, comment, userId]
    );
    return result.rows[0];
  },

  async findAll(userId = null) {
    let query = 'SELECT * FROM applications';
    const params = [];
    if (userId) {
      query += ' WHERE user_id = $1';
      params.push(userId);
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    return result.rows;
  },

  async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  },

  async delete(id, userId) {
    const result = await pool.query(
        'DELETE FROM applications WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
    );
    return result.rows[0];
  }
};

module.exports = { createTable, Application };