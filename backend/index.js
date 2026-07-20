const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');
const rawBody = require('./middleware/rawBody');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(morgan('combined'));

const { router: paymentsRouter, webhookRouter } = require('./modules/payments/payments.route');

app.use('/api/payments/webhook', rawBody, webhookRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', require('./modules/auth/auth.route'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/payments', paymentsRouter);
app.use('/api/marks', require('./modules/academics/marks.route'));
app.use('/api/timetable', require('./modules/academics/timetable.route'));
app.use('/api/teacher', require('./modules/academics/teacher.route'));
app.use('/api/transport', require('./modules/transport/transport.routes'));
app.use('/api/reports', require('./modules/reports/reports.route'));
app.use('/api/notices', require('./modules/notices/notices.route'));

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Thomson School ERP API' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports = app;