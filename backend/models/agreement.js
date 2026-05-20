const pool = require('../db');

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS agreements (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      course VARCHAR(255) DEFAULT 'Автомобиль с МКПП — категория «B»',
      full_name VARCHAR(255),
      birth_date VARCHAR(50),
      birth_place VARCHAR(255),
      passport_series VARCHAR(20),
      passport_number VARCHAR(20),
      passport_issued_by TEXT,
      passport_issued_date VARCHAR(50),
      registration_address TEXT,
      phone VARCHAR(30),
      workplace VARCHAR(255),
      status VARCHAR(20) DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  await pool.query(query);
};

const Agreement = {
  async findByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM agreements WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    return result.rows[0];
  },

  async createOrUpdate(userId, data) {
    const existing = await this.findByUserId(userId);
    if (existing) {
      const result = await pool.query(
        `UPDATE agreements SET
           course = $1, full_name = $2, birth_date = $3, birth_place = $4,
           passport_series = $5, passport_number = $6, passport_issued_by = $7,
           passport_issued_date = $8, registration_address = $9, phone = $10,
           workplace = $11, status = $12
         WHERE id = $13 RETURNING *`,
        [data.course, data.full_name, data.birth_date, data.birth_place,
         data.passport_series, data.passport_number, data.passport_issued_by,
         data.passport_issued_date, data.registration_address, data.phone,
         data.workplace, data.status, existing.id]
      );
      return result.rows[0];
    } else {
      const result = await pool.query(
        `INSERT INTO agreements (user_id, course, full_name, birth_date, birth_place,
         passport_series, passport_number, passport_issued_by, passport_issued_date,
         registration_address, phone, workplace, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         RETURNING *`,
        [userId, data.course, data.full_name, data.birth_date, data.birth_place,
         data.passport_series, data.passport_number, data.passport_issued_by,
         data.passport_issued_date, data.registration_address, data.phone,
         data.workplace, data.status]
      );
      return result.rows[0];
    }
  },

  async findAllAdmin() {
    const result = await pool.query(`
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM agreements a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
    `);
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM agreements WHERE id = $1', [id]);
    return result.rows[0];
  },

  async updateCourse(id, course) {
    const result = await pool.query(
      'UPDATE agreements SET course = $1 WHERE id = $2 RETURNING *',
      [course, id]
    );
    return result.rows[0];
  }
};

module.exports = { createTable, Agreement };