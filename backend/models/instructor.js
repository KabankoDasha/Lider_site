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
      votes_count INTEGER DEFAULT 0,
      category VARCHAR(100) NOT NULL DEFAULT 'Инструктор по вождению',
      photo VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  await pool.query(query);
};

const createRatingsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS instructor_ratings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      instructor_id INTEGER REFERENCES instructors(id) ON DELETE CASCADE,
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, instructor_id)
    );
  `;
  await pool.query(query);
};

const Instructor = {
  async findAll() {
    const result = await pool.query('SELECT * FROM instructors ORDER BY id');
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM instructors WHERE id = $1', [id]);
    return result.rows[0];
  },

  async create({ name, experience, car, education, rating, category, photo = null }) {
    const result = await pool.query(
      `INSERT INTO instructors (name, experience, car, education, rating, votes_count, category, photo)
       VALUES ($1, $2, $3, $4, $5, 0, $6, $7)
       RETURNING *`,
      [name, experience, car, education, rating, category, photo]
    );
    return result.rows[0];
  },

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

  async delete(id) {
    const result = await pool.query('DELETE FROM instructors WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  // Добавьте этот метод в объект Instructor, если его ещё нет
  async updateStats(instructorId, newRating, oldRating = null) {
    const instructor = await this.findById(instructorId);
    if (!instructor) throw new Error('Инструктор не найден');

    let newAvg, newCount;
    if (oldRating !== null) {
      // Пользователь меняет свою оценку
      const oldSum = instructor.rating * instructor.votes_count;
      const newSum = oldSum - oldRating + newRating;
      newCount = instructor.votes_count;
      newAvg = newSum / newCount;
    } else {
      // Новая оценка
      const oldSum = instructor.rating * instructor.votes_count;
      const newSum = oldSum + newRating;
      newCount = instructor.votes_count + 1;
      newAvg = newSum / newCount;
    }

    await pool.query(
      `UPDATE instructors SET rating = $1, votes_count = $2 WHERE id = $3`,
      [newAvg, newCount, instructorId]
    );
    return { rating: newAvg, votes_count: newCount };
  },
};

const InstructorRating = {
  async createOrUpdate(userId, instructorId, newRating) {
    // Получаем старую оценку пользователя, если она есть
    const existing = await pool.query(
      'SELECT rating FROM instructor_ratings WHERE user_id = $1 AND instructor_id = $2',
      [userId, instructorId]
    );
    const oldRating = existing.rows.length ? existing.rows[0].rating : null;

    // Вставляем/обновляем запись в таблицу рейтингов
    await pool.query(
      `INSERT INTO instructor_ratings (user_id, instructor_id, rating)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, instructor_id) DO UPDATE SET rating = $3`,
      [userId, instructorId, newRating]
    );

    // Обновляем статистику инструктора
    const updated = await Instructor.updateStats(instructorId, newRating, oldRating);
    return updated;
  },

  async getUserRating(userId, instructorId) {
    const res = await pool.query(
      'SELECT rating FROM instructor_ratings WHERE user_id = $1 AND instructor_id = $2',
      [userId, instructorId]
    );
    return res.rows[0] ? res.rows[0].rating : null;
  }
};

module.exports = { createTable, createRatingsTable, Instructor, InstructorRating };