require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { createTable: createUsersTable } = require('./models/user');
const { createTable: createApplicationsTable } = require('./models/application');
const { createTable: createReviewsTable } = require('./models/review');
const { createTable: createCoursesTable } = require('./models/course');
const { createTable: createSalesTable } = require('./models/sale');
const { createTable: createInstructorsTable } = require('./models/instructor');

const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/application');
const reviewRoutes = require('./routes/review');
const courseRoutes = require('./routes/course');
const saleRoutes = require('./routes/sale');
const instructorRoutes = require('./routes/instructor');

const app = express();
app.use(cors());
app.use(express.json());

// Создание таблиц
(async () => {
  try {
    await createUsersTable();
    await createApplicationsTable();
    await createReviewsTable();
    await createCoursesTable();
    await createSalesTable();
    await createInstructorsTable();
    console.log('Все таблицы готовы');
  } catch (err) {
    console.error('Ошибка создания таблиц:', err);
  }
})();

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/instructors', instructorRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));