const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Реєстрація нового користувача (тільки для адміністратора)
router.post('/register', async (req, res) => {
  try {
    const { username, password, role, fullName } = req.body;

    // Валідація вхідних даних
    if (!username || !password || !role || !fullName) {
      return res.status(400).json({ 
        error: "Всі поля є обов'язковими",
        required: ['username', 'password', 'role', 'fullName']
      });
    }

    // Перевірка чи користувач вже існує
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'Користувач з таким логіном вже існує' });
    }

    // Хешування пароля
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Створення нового користувача
    const newUser = new User({
      username,
      password: hashedPassword,
      role,
      fullName
    });

    await newUser.save();

    res.status(201).json({
      message: 'Користувач успішно створений',
      user: {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role,
        fullName: newUser.fullName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error && error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Помилка валідації',
        details: Object.values(error.errors || {}).map((err) => err.message)
      });
    }
    res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
});

// Вхід користувача
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt for username:', username);

    // Валідація вхідних даних
    if (!username || !password) {
      return res.status(400).json({ 
        error: "Логін та пароль є обов'язковими" 
      });
    }

    // Перевірка довжини логіна та пароля
    if (username.length < 3) {
      return res.status(400).json({ 
        error: 'Логін повинен містити принаймні 3 символи' 
      });
    }

    if (password.length < 4) {
      return res.status(400).json({ 
        error: 'Пароль повинен містити принаймні 4 символи' 
      });
    }

    // Перевірка підключення до бази даних
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'База даних недоступна. Спробуйте пізніше.' 
      });
    }

    // Пошук користувача (регістр не важливий)
    const user = await User.findOne({ 
      username: { $regex: new RegExp(`^${username.trim()}$`, 'i') }
    });
    if (!user) {
      return res.status(401).json({ 
        error: 'Неправильний логін. Перевірте правильність написання.' 
      });
    }

    // Перевірка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Неправильний пароль. Перевірте правильність написання.' 
      });
    }

    console.log('Login successful for username:', username, 'role:', user.role);

    // Створення JWT токену
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Успішний вхід',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        fullName: user.fullName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error && error.name === 'MongoError') {
      return res.status(503).json({ 
        error: 'Проблеми з підключенням до бази даних. Спробуйте пізніше.' 
      });
    }
    if (error && error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Некоректні дані для входу' });
    }
    res.status(500).json({ 
      error: 'Внутрішня помилка сервера. Зверніться до адміністратора.' 
    });
  }
});

module.exports = router;
