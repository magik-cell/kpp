const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const entryRoutes = require('./routes/entries');
const userRoutes = require('./routes/users');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kpp_control';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'Connected' : 'Disconnected';
    res.json({ 
      status: 'OK', 
      message: 'КПП Control Server is running',
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Server error',
      timestamp: new Date().toISOString()
    });
  }
});

// API Health check
app.get('/api/health', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'Connected' : 'Disconnected';
    res.json({ 
      status: 'OK', 
      message: 'КПП Control API is running',
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Щось пішло не так!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Маршрут не знайдено' });
});

// Connect to MongoDB and start server
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Підключено до MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server запущено на порту ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 API Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((error) => {
    console.warn('⚠️  Попередження: Не вдалося підключитися до MongoDB:', error.message);
    console.log('🔄 Запускаю сервер без бази даних (тестовий режим)');
    app.listen(PORT, () => {
      console.log(`🚀 Server запущено на порту ${PORT} (без БД)`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 API Health check: http://localhost:${PORT}/api/health`);
      console.log('💡 Для повної функціональності потрібно підключення до MongoDB');
    });
  });

module.exports = app;
