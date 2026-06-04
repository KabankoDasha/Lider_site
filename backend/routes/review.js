const router = require('express').Router();
const { Review } = require('../models/review');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const pool = require('../db');

// Публичные опубликованные отзывы
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.findAllPublished();
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Отзывы текущего пользователя
router.get('/my', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const reviews = await Review.findByUserId(userId);
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Добавление отзыва (авторизованные)
router.post('/', auth, async (req, res) => {
  try {
    const { name, course, text, rating } = req.body;
    if (!name || !text || !rating) {
      return res.status(400).json({ message: 'Заполните обязательные поля (имя, текст, оценка)' });
    }
    const userId = req.user.id;
    const review = await Review.create(name, course, text, rating, userId);
    res.status(201).json({ message: 'Отзыв добавлен', review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удаление своего отзыва
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const deleted = await Review.delete(id, userId);
    if (!deleted) return res.status(404).json({ message: 'Отзыв не найден или нет прав' });
    res.json({ message: 'Отзыв удалён' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Админские маршруты
// Все отзывы для модерации
router.get('/admin', auth, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, u.name AS user_name, u.email AS user_email
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.status = 'pending'
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Изменить статус отзыва 
router.put('/admin/:id', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;   
    const result = await pool.query(
      'UPDATE reviews SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Отзыв не найден' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удалить отзыв (админ)
router.delete('/admin/:id', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM reviews WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Отзыв не найден' });
    }
    res.json({ message: 'Отзыв удалён' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;