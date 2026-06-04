const router = require('express').Router();
const multer = require('multer');
const fs = require('fs');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { Document } = require('../models/documents');
const puppeteer = require('puppeteer');
const path = require('path');

// Проверяем, что папка существует
const uploadDir = path.join(__dirname, '..', 'uploads', 'documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Недопустимый формат файла'));
    }
  }
});

// Загрузка документа (авторизованный пользователь)
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const { type } = req.body;
    if (!['passport', 'snils', 'medical'].includes(type)) {
      return res.status(400).json({ message: 'Неверный тип документа' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' });
    }

    // Проверяем, существует ли документ такого типа у пользователя
    const existing = await Document.findByUserIdAndType(req.user.id, type);
    if (existing) {
      // Обновляем запись и удаляем старый файл
      const doc = await Document.updateByUserIdAndType(
        req.user.id,
        type,
        req.file.path,
        req.file.originalname
      );
      return res.json({ message: 'Документ обновлён', doc });
    }

    // Иначе создаём новый
    const doc = await Document.create(
      req.user.id,
      type,
      req.file.path,
      req.file.originalname
    );
    res.json({ message: 'Документ загружен', doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка загрузки' });
  }
});

// Получить документы текущего пользователя
router.get('/my', auth, async (req, res) => {
  try {
    const docs = await Document.findByUserId(req.user.id);
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Проверка наличия документов пользователя (для админа)
router.get('/check/:userId', auth, adminOnly, async (req, res) => {
  try {
    const docs = await Document.findByUserId(req.params.userId);
    const types = docs.map(d => d.type);
    res.json({
      hasPassport: types.includes('passport'),
      hasSnils: types.includes('snils'),
      hasMedical: types.includes('medical')
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Отдача файла (доступ владельцу или админу)
router.get('/file/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Документ не найден' });

    if (req.user.role !== 'admin' && doc.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Доступ запрещён' });
    }

    const ext = path.extname(doc.file_path).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.pdf': 'application/pdf',
    };
    res.type(mimeTypes[ext] || 'application/octet-stream');

    if (req.query.download === '1') {
      // Скачивание с оригинальным именем файла
      res.download(doc.file_path, doc.original_name);
    } else {
      // Отображение в браузере
      res.sendFile(doc.file_path);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Массовая проверка документов для админа 
router.post('/bulk-check', auth, adminOnly, async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!Array.isArray(userIds)) return res.status(400).json({ message: 'userIds должен быть массивом' });
    const docs = await Document.findByUserIds(userIds);
    const map = {};
    userIds.forEach(uid => map[uid] = {});
    docs.forEach(doc => {
      if (!map[doc.user_id]) map[doc.user_id] = {};
      map[doc.user_id][doc.type] = true;
    });
    res.json(map);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Генерация PDF с изображением документа
async function generatePdfFromImage(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
    const base64 = fs.readFileSync(filePath).toString('base64');
    const dataUri = `data:${mime};base64,${base64}`;

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Документ</title></head>
<body style="margin:0; display:flex; justify-content:center; align-items:center; height:100vh;">
    <img src="${dataUri}" style="max-width:100%; max-height:100%; object-fit:contain;" />
</body>
</html>`;

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    return pdfBuffer;
}

// Маршрут для получения PDF документа пользователя по типу
router.get('/user/:userId/:type/pdf', auth, adminOnly, async (req, res) => {
    try {
        const { userId, type } = req.params;
        if (!['passport', 'snils', 'medical'].includes(type)) {
            return res.status(400).json({ message: 'Неверный тип документа' });
        }

        const doc = (await Document.findByUserId(userId)).find(d => d.type === type);
        if (!doc) return res.status(404).json({ message: 'Документ не найден' });

        const ext = path.extname(doc.file_path).toLowerCase();
        if (ext === '.pdf') {
            // Если уже PDF – просто отдаём его
            res.type('application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="' + doc.original_name + '"');
            res.sendFile(doc.file_path);
        } else {
            // Изображение – конвертируем в PDF
            const pdfBuffer = await generatePdfFromImage(doc.file_path);
            res.type('application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="' + path.parse(doc.original_name).name + '.pdf' + '"');
            res.send(pdfBuffer);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка генерации PDF' });
    }
});

// Получить документ по типу для текущего пользователя
router.get('/my/:type', auth, async (req, res) => {
  const { type } = req.params;
  if (!['passport', 'snils', 'medical'].includes(type)) {
    return res.status(400).json({ message: 'Неверный тип документа' });
  }
  const doc = await Document.findByUserIdAndType(req.user.id, type);
  if (!doc) return res.status(404).json({ message: 'Документ не найден' });

  const ext = path.extname(doc.file_path).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.pdf': 'application/pdf',
  };
  res.type(mimeTypes[ext] || 'application/octet-stream');
  res.sendFile(doc.file_path);
});

module.exports = router;