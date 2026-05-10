const pool = require('../db');

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS user_documents (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(20) NOT NULL CHECK (type IN ('passport', 'snils', 'medical')),
      file_path VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  await pool.query(query);
};

const Document = {
  async create(userId, type, filePath, originalName) {
    const result = await pool.query(
      `INSERT INTO user_documents (user_id, type, file_path, original_name)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, type, filePath, originalName]
    );
    return result.rows[0];
  },

  async findByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM user_documents WHERE user_id = $1 ORDER BY created_at',
      [userId]
    );
    return result.rows;
  },

  async findByUserIds(userIds) {
    if (!userIds.length) return [];
    const result = await pool.query(
      'SELECT * FROM user_documents WHERE user_id = ANY($1)',
      [userIds]
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM user_documents WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async updateByUserIdAndType(userId, type, filePath, originalName) {
    // Удаляем старый файл с диска
    const oldDoc = await this.findByUserIdAndType(userId, type);
    if (oldDoc) {
        const fs = require('fs');
        if (fs.existsSync(oldDoc.file_path)) {
            fs.unlinkSync(oldDoc.file_path);
        }
    }

    const result = await pool.query(
        `UPDATE user_documents 
         SET file_path = $1, original_name = $2, created_at = NOW()
         WHERE user_id = $3 AND type = $4
         RETURNING *`,
        [filePath, originalName, userId, type]
    );

    if (result.rows.length === 0) {
        // Если нечего обновлять, создаём новую запись
        return await this.create(userId, type, filePath, originalName);
    }
    return result.rows[0];
  },

  async findByUserIdAndType(userId, type) {
    const result = await pool.query(
        'SELECT * FROM user_documents WHERE user_id = $1 AND type = $2',
        [userId, type]
    );
    return result.rows[0];
  }
};

module.exports = { createTable, Document };