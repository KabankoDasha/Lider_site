const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const { EmailVerification } = require('../models/emailVerification');
const nodemailer = require('nodemailer');

// Настройка Nodemailer 
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
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
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Подтверждение регистрации</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Montserrat', Arial, sans-serif;
                        background-color: #f5f5f5;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        padding: 20px;
                    }
                    .email-container {
                        max-width: 520px;
                        width: 100%;
                        background: #ffffff;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
                    }
                    .email-header {
                        background: linear-gradient(-41deg, #D90D26, #E94055, #D90D26);
                        padding: 30px 20px 25px;
                        text-align: center;
                    }
                    .email-header__title {
                        font-size: 24px;
                        font-weight: 600;
                        color: #ffffff;
                        letter-spacing: 0.5px;
                        margin: 0;
                    }
                    .email-body {
                        padding: 35px 35px 30px;
                    }
                    .email-greeting {
                        font-size: 18px;
                        font-weight: 500;
                        color: #1a1a1a;
                        margin-bottom: 12px;
                    }
                    .email-text {
                        font-size: 15px;
                        font-weight: 400;
                        color: #444444;
                        line-height: 1.6;
                        margin-bottom: 8px;
                    }
                    .email-text strong {
                        color: #1a1a1a;
                        font-weight: 600;
                    }
                    .code-wrapper {
                        margin: 25px 0 20px;
                        text-align: center;
                    }
                    .code-box {
                        display: inline-block;
                        padding: 18px 30px;
                        border: 2px solid #D90D26;
                        border-radius: 12px;
                        background: #fff;
                        min-width: 200px;
                    }
                    .code-box__code {
                        font-size: 34px;
                        font-weight: 700;
                        letter-spacing: 8px;
                        color: #D90D26;
                        font-family: 'Montserrat', monospace;
                    }
                    .email-hint {
                        font-size: 13px;
                        font-weight: 400;
                        color: #999999;
                        text-align: center;
                        margin-top: 5px;
                    }
                    .email-divider {
                        border: none;
                        border-top: 1px solid #eeeeee;
                        margin: 25px 0 20px;
                    }
                    .email-footer {
                        text-align: center;
                        font-size: 12px;
                        font-weight: 400;
                        color: #aaaaaa;
                        line-height: 1.6;
                    }
                    .email-footer a {
                        color: #D90D26;
                        text-decoration: none;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="email-header">
                        <h1 class="email-header__title">Автошкола Лидер</h1>
                    </div>
                    <div class="email-body">
                        <p class="email-greeting">Здравствуйте, ${name}!</p>
                        <p class="email-text">Спасибо за регистрацию на сайте <strong>«Автошкола Лидер»</strong>.</p>
                        <p class="email-text">Для подтверждения вашего email введите следующий код:</p>
                        
                        <div class="code-wrapper">
                            <div class="code-box">
                                <span class="code-box__code">${code}</span>
                            </div>
                        </div>
                        
                        <p class="email-hint">Код действителен в течение 15 минут</p>
                        
                        <hr class="email-divider">
                        
                        <p class="email-text" style="font-size:14px; color:#666;">
                            Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.
                        </p>
                        
                        <hr class="email-divider">
                        
                        <div class="email-footer">
                            <p>© Автошкола Лидер</p>
                            <p style="margin-top:4px;">
                                <a href="https://lider-avto74.ru">lider-avto74.ru</a>
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
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
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Новый код подтверждения</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Montserrat', Arial, sans-serif;
                        background-color: #f5f5f5;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        padding: 20px;
                    }
                    .email-container {
                        max-width: 520px;
                        width: 100%;
                        background: #ffffff;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
                    }
                    .email-header {
                        background: linear-gradient(-41deg, #D90D26, #E94055, #D90D26);
                        padding: 30px 20px 25px;
                        text-align: center;
                    }
                    .email-header__title {
                        font-size: 24px;
                        font-weight: 600;
                        color: #ffffff;
                        letter-spacing: 0.5px;
                        margin: 0;
                    }
                    .email-body {
                        padding: 35px 35px 30px;
                    }
                    .email-greeting {
                        font-size: 18px;
                        font-weight: 500;
                        color: #1a1a1a;
                        margin-bottom: 12px;
                    }
                    .email-text {
                        font-size: 15px;
                        font-weight: 400;
                        color: #444444;
                        line-height: 1.6;
                        margin-bottom: 8px;
                    }
                    .code-wrapper {
                        margin: 25px 0 20px;
                        text-align: center;
                    }
                    .code-box {
                        display: inline-block;
                        padding: 18px 30px;
                        border: 2px solid #D90D26;
                        border-radius: 12px;
                        background: #fff;
                        min-width: 200px;
                    }
                    .code-box__code {
                        font-size: 34px;
                        font-weight: 700;
                        letter-spacing: 8px;
                        color: #D90D26;
                        font-family: 'Montserrat', monospace;
                    }
                    .email-hint {
                        font-size: 13px;
                        font-weight: 400;
                        color: #999999;
                        text-align: center;
                        margin-top: 5px;
                    }
                    .email-divider {
                        border: none;
                        border-top: 1px solid #eeeeee;
                        margin: 25px 0 20px;
                    }
                    .email-footer {
                        text-align: center;
                        font-size: 12px;
                        font-weight: 400;
                        color: #aaaaaa;
                        line-height: 1.6;
                    }
                    .email-footer a {
                        color: #D90D26;
                        text-decoration: none;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="email-header">
                        <h1 class="email-header__title">Автошкола Лидер</h1>
                    </div>
                    <div class="email-body">
                        <p class="email-greeting">Здравствуйте, ${user.name}!</p>
                        <p class="email-text">Вы запросили повторную отправку кода подтверждения.</p>
                        
                        <div class="code-wrapper">
                            <div class="code-box">
                                <span class="code-box__code">${code}</span>
                            </div>
                        </div>
                        
                        <p class="email-hint">Код действителен в течение 15 минут</p>
                        
                        <hr class="email-divider">
                        
                        <div class="email-footer">
                            <p>© Автошкола Лидер</p>
                            <p style="margin-top:4px;">
                                <a href="https://lider-avto74.ru">lider-avto74.ru</a>
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
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