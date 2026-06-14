const router = require('express').Router();
const { Course } = require('../models/course');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// Публичное получение всех курсов (можно без авторизации)
router.get('/', async (req, res) => {
  try {
    const courses = await Course.findAll();
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Публичное получение одного курса по ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Курс не найден' });
    }
    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Админские защищённые маршруты
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const course = await Course.update(req.params.id, req.body);
    if (!course) return res.status(404).json({ message: 'Курс не найден' });
    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const course = await Course.delete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Курс не найден' });
    res.json({ message: 'Курс удалён' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;