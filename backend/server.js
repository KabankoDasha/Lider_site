require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

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
const uploadRoutes = require('./routes/upload');

const app = express();
app.use(cors({ origin: 'http://localhost:5500' }));
app.use(express.json());
app.use(helmet());
app.use('/photos', express.static(path.join(__dirname, 'public', 'photos')));
app.use('/api/upload', uploadRoutes);

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