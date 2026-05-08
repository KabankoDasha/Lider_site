const router = require('express').Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Получить профиль текущего пользователя
router.get('/me', auth, async (req, res) => {
  try {
    const user = await require('../models/user').User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновить профиль
router.put('/me', auth, async (req, res) => {
  try {
    const { name, surname, email, phone, password, newPassword } = req.body;
    const userId = req.user.id;

    if (!name || !email) {
      return res.status(400).json({ message: 'Имя и email обязательны' });
    }

    // Если запрошена смена пароля
    if (password) {
      const currentUser = await require('../models/user').User.findById(userId);
      if (!currentUser) return res.status(404).json({ message: 'Пользователь не найден' });

      const isMatch = await bcrypt.compare(password, currentUser.password);
      if (!isMatch) return res.status(400).json({ message: 'Неверный текущий пароль' });
      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ message: 'Новый пароль должен быть минимум 8 символов' });
      }
      const hashed = await bcrypt.hash(newPassword, 10);
      await require('../models/user').User.updatePassword(userId, hashed);
    }

    const updatedUser = await require('../models/user').User.updateProfile(userId, {
      name, surname, email, phone
    });

    res.json({ user: updatedUser });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {  // уникальное ограничение email
      return res.status(400).json({ message: 'Этот email уже используется' });
    }
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;