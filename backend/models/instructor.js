const pool = require('../db');

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS instructors (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      experience VARCHAR(100),
      car VARCHAR(100),
      education VARCHAR(100),
      rating NUMERIC(3,1) DEFAULT 0,
      category VARCHAR(100) NOT NULL DEFAULT 'Инструктор по вождению',
      photo VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  await pool.query(query);
};

const Instructor = {
  // Получить всех инструкторов
  async findAll() {
    const result = await pool.query('SELECT * FROM instructors ORDER BY id');
    return result.rows;
  },

  // Получить одного по id
  async findById(id) {
    const result = await pool.query('SELECT * FROM instructors WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Создать инструктора
  async create({ name, experience, car, education, rating, category, photo = null }) {
    const result = await pool.query(
      `INSERT INTO instructors (name, experience, car, education, rating, category, photo)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, experience, car, education, rating, category, photo]
    );
    return result.rows[0];
  },

  // Обновить инструктора
  async update(id, { name, experience, car, education, rating, category, photo }) {
    const result = await pool.query(
      `UPDATE instructors
       SET name = $1, experience = $2, car = $3, education = $4,
           rating = $5, category = $6, photo = COALESCE($7, photo)
       WHERE id = $8
       RETURNING *`,
      [name, experience, car, education, rating, category, photo, id]
    );
    return result.rows[0];
  },

  // Удалить инструктора
  async delete(id) {
    const result = await pool.query('DELETE FROM instructors WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = { createTable, Instructor };