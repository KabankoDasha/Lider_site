const router = require('express').Router();
const { Sale } = require('../models/sale');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.get('/', async (req, res) => {
  try {
    const sales = await Sale.findAll();
    res.json(sales);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const sale = await Sale.create(req.body);
    res.status(201).json(sale);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const sale = await Sale.update(req.params.id, req.body);
    if (!sale) return res.status(404).json({ message: 'Акция не найдена' });
    res.json(sale);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const sale = await Sale.delete(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Акция не найдена' });
    res.json({ message: 'Акция удалена' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;