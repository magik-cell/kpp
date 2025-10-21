import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();

// Реєстрація нового користувача (тільки для адміністратора)
router.post('/register', async (req, res) => {
  try {
    const { username, password, role, fullName } = req.body;

    // Валідація вхідних даних
    if (!username || !password || !role || !fullName) {
      return res.status(400).json({ 
        error: 'Всі поля є обов\'язковими',
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
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Помилка валідації',
        details: Object.values(error.errors).map((err: any) => err.message)
      });
    }

    res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
});

// Вхід користувача
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Логін та пароль є обов\'язковими' 
      });
    }

    // Пошук користувача
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Неправильний логін або пароль' });
    }

    // Перевірка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неправильний логін або пароль' });
    }

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
    res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
});

export default router;