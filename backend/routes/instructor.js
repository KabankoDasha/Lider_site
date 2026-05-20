const router = require('express').Router();
const { Instructor, InstructorRating } = require('../models/instructor');
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

// Получить оценку текущего пользователя для инструктора
router.get('/:id/user-rating', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const rating = await InstructorRating.getUserRating(req.user.id, id);
    res.json({ rating: rating || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Оценить инструктора
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Оценка должна быть от 1 до 5' });
    }

    const instructor = await Instructor.findById(id);
    if (!instructor) return res.status(404).json({ message: 'Инструктор не найден' });

    await InstructorRating.createOrUpdate(req.user.id, id, rating);
    const updatedInstructor = await Instructor.findById(id);
    res.json({
      rating: updatedInstructor.rating,
      votes_count: updatedInstructor.votes_count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Админские маршруты (без изменений)
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
    const instructor = await Instructor.findById(req.params.id);
    if (!instructor) return res.status(404).json({ message: 'Инструктор не найден' });

    const oldPhoto = instructor.photo;
    const updated = await Instructor.update(req.params.id, req.body);

    if (req.body.photo && oldPhoto && req.body.photo !== oldPhoto) {
      const fs = require('fs');
      const path = require('path');
      const oldPhotoPath = path.join(__dirname, '..', 'public', 'photos', oldPhoto);
      fs.unlink(oldPhotoPath, (err) => {
        if (err) console.error('Ошибка удаления старого фото:', err);
      });
    }
    res.json(updated);
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