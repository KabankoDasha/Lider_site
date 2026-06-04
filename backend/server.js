require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { createTable: createUsersTable } = require('./models/user');
const { createTable: createApplicationsTable, createRepliesTable } = require('./models/application');
const { createTable: createReviewsTable } = require('./models/review');
const { createTable: createCoursesTable } = require('./models/course');
const { createTable: createSalesTable } = require('./models/sale');
const { createTable: createInstructorsTable, createRatingsTable } = require('./models/instructor');
const { createTable: createAgreementsTable } = require('./models/agreement');
const { createTable: createDocumentsTable } = require('./models/documents');

const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/application');
const reviewRoutes = require('./routes/review');
const courseRoutes = require('./routes/course');
const saleRoutes = require('./routes/sale');
const instructorRoutes = require('./routes/instructor');
const uploadRoutes = require('./routes/upload');
const agreementRoutes = require('./routes/agreement');
const documentsRouter = require('./routes/documents');

const app = express();
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(helmet());
app.use('/photos', express.static(path.join(__dirname, 'public', 'photos'), {
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/upload', uploadRoutes);
app.use('/api/agreements', agreementRoutes);
app.use('/api/documents', documentsRouter);

// Создание таблиц
(async () => {
  try {
    await createUsersTable();
    await createApplicationsTable();
    await createRepliesTable(); 
    await createReviewsTable();
    await createCoursesTable();
    await createSalesTable();
    await createInstructorsTable();
    await createRatingsTable(); 
    await createAgreementsTable();
    await createDocumentsTable();
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

// Отдача статических HTML-страниц
//app.use(express.static(path.join(__dirname, 'pages')));

// Обработка 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'pages', '404.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));