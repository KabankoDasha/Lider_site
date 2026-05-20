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

const createRepliesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS application_replies (
      id SERIAL PRIMARY KEY,
      application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
      admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      message TEXT NOT NULL,
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
      let query = `
          SELECT a.*, 
          EXISTS(SELECT 1 FROM application_replies WHERE application_id = a.id) as has_replies
          FROM applications a
      `;
      const params = [];
      if (userId) {
          query += ' WHERE a.user_id = $1';
          params.push(userId);
      }
      query += ' ORDER BY a.created_at DESC';
      const result = await pool.query(query, params);
      return result.rows;
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
    return result.rows[0];
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

const ApplicationReply = {
  async create(applicationId, adminId, message) {
    const result = await pool.query(
      `INSERT INTO application_replies (application_id, admin_id, message)
       VALUES ($1, $2, $3) RETURNING *`,
      [applicationId, adminId, message]
    );
    return result.rows[0];
  },
  async findByApplicationId(applicationId) {
    const result = await pool.query(
      `SELECT r.*, u.name as admin_name 
       FROM application_replies r
       LEFT JOIN users u ON r.admin_id = u.id
       WHERE r.application_id = $1
       ORDER BY r.created_at ASC`,
      [applicationId]
    );
    return result.rows;
  }
};

module.exports = { createTable, createRepliesTable, Application, ApplicationReply };