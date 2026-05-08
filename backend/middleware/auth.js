const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Токен обычно приходит в заголовке Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Нет доступа (токен не предоставлен)' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;   // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Токен недействителен или истёк' });
  }
};