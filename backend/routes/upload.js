const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// Папка для сохранения
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'public', 'photos'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Загрузка одного фото (защищённый маршрут)
router.post('/photo', auth, adminOnly, upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Файл не загружен' });
  }
  res.json({ filename: req.file.filename });
});

module.exports = router;