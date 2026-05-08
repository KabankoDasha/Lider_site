const pool = require('../db');

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      name VARCHAR(100) NOT NULL,
      course VARCHAR(150),
      text TEXT NOT NULL,
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      status VARCHAR(20) DEFAULT 'published',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  await pool.query(query);
};

const Review = {
  // Создание отзыва (userId может быть null для анонимного)
  async create(name, course, text, rating, userId = null) {
    const result = await pool.query(
      `INSERT INTO reviews (name, course, text, rating, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, course, text, rating, status, user_id, created_at`,
      [name, course, text, rating, userId]
    );
    return result.rows[0];
  },

  // Получение всех опубликованных отзывов (публичная страница)
  async findAllPublished() {
    const result = await pool.query(
      'SELECT id, name, course, text, rating, created_at FROM reviews WHERE status = $1 ORDER BY created_at DESC',
      ['published']
    );
    return result.rows;
  },

  // Получение отзывов конкретного пользователя (личный кабинет)
  async findByUserId(userId) {
    const result = await pool.query(
      'SELECT id, name, course, text, rating, status, created_at FROM reviews WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  },

  // Удаление отзыва (только свой)
  async delete(id, userId) {
    const result = await pool.query(
      'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    return result.rows[0];
  }
};

module.exports = { createTable, Review };