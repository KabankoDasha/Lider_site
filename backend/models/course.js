const pool = require('../db');

const createTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      duration VARCHAR(100),
      distance_price VARCHAR(50),
      distance_old_price VARCHAR(50),
      fulltime_price VARCHAR(50),
      fulltime_old_price VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
};

const Course = {
  async findAll() {
    const res = await pool.query('SELECT * FROM courses ORDER BY id');
    return res.rows;
  },
  async create(data) {
    const { name, duration, distancePrice, distanceOld, fulltimePrice, fulltimeOld } = data;
    const res = await pool.query(
      `INSERT INTO courses (name, duration, distance_price, distance_old_price, fulltime_price, fulltime_old_price)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, duration, distancePrice, distanceOld, fulltimePrice, fulltimeOld]
    );
    return res.rows[0];
  },
  async update(id, data) {
    const { name, duration, distancePrice, distanceOld, fulltimePrice, fulltimeOld } = data;
    const res = await pool.query(
      `UPDATE courses SET name=$1, duration=$2, distance_price=$3, distance_old_price=$4, fulltime_price=$5, fulltime_old_price=$6
       WHERE id=$7 RETURNING *`,
      [name, duration, distancePrice, distanceOld, fulltimePrice, fulltimeOld, id]
    );
    return res.rows[0];
  },
  async delete(id) {
    const res = await pool.query('DELETE FROM courses WHERE id=$1 RETURNING *', [id]);
    return res.rows[0];
  }
};

module.exports = { createTable, Course };