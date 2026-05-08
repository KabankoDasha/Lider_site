const router = require('express').Router();
const { Instructor } = require('../models/instructor');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.get('/', async (req, res) => {
  try {
    const instructors = await Instructor.findAll();
    res.json(instructors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const instructor = await Instructor.create(req.body);
    res.status(201).json(instructor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const instructor = await Instructor.update(req.params.id, req.body);
    if (!instructor) return res.status(404).json({ message: 'Инструктор не найден' });
    res.json(instructor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const instructor = await Instructor.delete(req.params.id);
    if (!instructor) return res.status(404).json({ message: 'Инструктор не найден' });
    res.json({ message: 'Инструктор удалён' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;