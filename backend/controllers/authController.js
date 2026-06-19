const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const { EmailVerification } = require('../models/emailVerification');
const nodemailer = require('nodemailer');

// Настройка Nodemailer для Yandex
const transporter = nodemailer.createTransport({
  host: 'smtp.yandex.ru',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS 
  }
});

// Генерация 6-значного кода
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.register = async (req, res) => {
  const { name, surname = '', email, password, phone = '' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Заполните все поля' });
  }

  try {
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create(name, email, hashedPassword, 'user', surname, phone);

    // Генерируем и сохраняем код
    const code = generateVerificationCode();
    await EmailVerification.create(user.id, code);

    // Отправляем письмо
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Подтверждение регистрации на сайте Автошкола Лидер',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D90D26;">Подтверждение регистрации</h2>
          <p>Здравствуйте, ${name}!</p>
          <p>Спасибо за регистрацию на сайте <strong>Автошкола Лидер</strong>.</p>
          <p>Для подтверждения вашего email введите следующий код:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 10px; font-weight: bold; border-radius: 8px;">
            ${code}
          </div>
          <p style="color: #888; font-size: 14px;">Код действителен в течение 15 минут.</p>
          <p style="margin-top: 20px;">Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.</p>
          <hr style="border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">© Автошкола Лидер</p>
        </div>
      `
    });

    // Возвращаем user_id для подтверждения
    res.status(201).json({
      success: true,
      userId: user.id,
      message: 'Код подтверждения отправлен на вашу почту'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера при регистрации' });
  }
};

// Подтверждение email
exports.verifyEmail = async (req, res) => {
  const { userId, code } = req.body;

  if (!userId || !code) {
    return res.status(400).json({ message: 'Необходимы userId и код' });
  }

  try {
    const verification = await EmailVerification.verifyCode(userId, code);
    if (!verification) {
      return res.status(400).json({ message: 'Неверный или просроченный код' });
    }

    // Подтверждаем пользователя
    const user = await User.verifyUser(userId);
    await EmailVerification.deleteByUserId(userId);

    // Генерируем токен для входа
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера при подтверждении' });
  }
};

// Повторная отправка кода
exports.resendCode = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'Не передан userId' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Удаляем старый код
    await EmailVerification.deleteByUserId(userId);

    // Генерируем новый код
    const code = generateVerificationCode();
    await EmailVerification.create(userId, code);

    // Отправляем письмо
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Новый код подтверждения – Автошкола Лидер',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D90D26;">Новый код подтверждения</h2>
          <p>Здравствуйте, ${user.name}!</p>
          <p>Вы запросили повторную отправку кода подтверждения.</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 10px; font-weight: bold; border-radius: 8px;">
            ${code}
          </div>
          <p style="color: #888; font-size: 14px;">Код действителен в течение 15 минут.</p>
        </div>
      `
    });

    res.json({ success: true, message: 'Код отправлен повторно' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка при повторной отправке кода' });
  }
};

// Логин (без изменений)
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Заполните все поля' });
  }

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    // Проверяем, подтверждён ли email
    if (!user.is_verified) {
      return res.status(403).json({ 
        message: 'Подтвердите email. Проверьте почту или запросите новый код.',
        needVerification: true,
        userId: user.id
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};