const pool = require('../db');

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS sales (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      discount VARCHAR(50),
      validity VARCHAR(150),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  await pool.query(query);
};

const Sale = {
  // Получить все акции
  async findAll() {
    const result = await pool.query('SELECT * FROM sales ORDER BY id');
    return result.rows;
  },

  // Получить одну по id
  async findById(id) {
    const result = await pool.query('SELECT * FROM sales WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Создать акцию
  async create({ name, discount, validity }) {
    const result = await pool.query(
      `INSERT INTO sales (name, discount, validity)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, discount, validity]
    );
    return result.rows[0];
  },

  // Обновить акцию
  async update(id, { name, discount, validity }) {
    const result = await pool.query(
      `UPDATE sales
       SET name = $1, discount = $2, validity = $3
       WHERE id = $4
       RETURNING *`,
      [name, discount, validity, id]
    );
    return result.rows[0];
  },

  // Удалить акцию
  async delete(id) {
    const result = await pool.query('DELETE FROM sales WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = { createTable, Sale };