const router = require('express').Router();
const { Application, ApplicationReply } = require('../models/application');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const pool = require('../db');   // для JOIN-запроса

// Создание заявки (публичный, с опциональной авторизацией)
router.post('/', async (req, res) => {
  try {
    const { name, phone, course, comment } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: 'Имя и телефон обязательны' });
    }

    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) { }
    }

    const application = await Application.create(name, phone, course, comment, userId);
    res.status(201).json({ message: 'Заявка принята', application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получение заявок текущего пользователя 
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const apps = await Application.findAll(userId);
    res.json(apps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Админский маршрут – все заявки с именем и телефоном пользователя
router.get('/admin', auth, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, u.name AS user_name, u.phone AS user_phone
      FROM applications a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Админское обновление статуса заявки
router.put('/admin/:id', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;   // 'processing', 'confirmed', 'rejected'
    if (!['processing', 'confirmed', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Недопустимый статус' });
    }
    const updated = await Application.updateStatus(id, status);
    if (!updated) return res.status(404).json({ message: 'Заявка не найдена' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удаление заявки 
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const deleted = await Application.delete(id, userId);
    if (!deleted) return res.status(404).json({ message: 'Заявка не найдена или нет прав' });
    res.json({ message: 'Заявка удалена' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создать ответ на заявку 
router.post('/:id/reply', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Текст ответа не может быть пустым' });
    }

    const application = await Application.findById(id);
    if (!application) return res.status(404).json({ message: 'Заявка не найдена' });

    const reply = await ApplicationReply.create(id, req.user.id, message.trim());
    res.status(201).json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить все ответы на заявку (доступ владельцу заявки или админу)
router.get('/:id/replies', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const application = await Application.findById(id);
    if (!application) return res.status(404).json({ message: 'Заявка не найдена' });

    // Доступ админ или владелец заявки (если user_id совпадает)
    if (userRole !== 'admin' && application.user_id !== userId) {
      return res.status(403).json({ message: 'Доступ запрещён' });
    }

    const replies = await ApplicationReply.findByApplicationId(id);
    res.json(replies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;