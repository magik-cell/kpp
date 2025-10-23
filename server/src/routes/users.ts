import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Отримання всіх користувачів (тільки для адміністратора)
router.get('/', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let query: any = {};

    // Пошук за іменем користувача або повним іменем
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password') // Виключаємо пароль з результату
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    // Перетворюємо _id в id для клієнта
    const formattedUsers = users.map((user: any) => ({
      id: user._id.toString(),
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    res.json({
      users: formattedUsers,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        hasNext: skip + limitNum < total,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Помилка отримання користувачів:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Створення нового користувача (тільки для адміністратора)
router.post('/', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const { username, password, fullName, role } = req.body;

    // Валідація вхідних даних
    if (!username || !password || !fullName || !role) {
      return res.status(400).json({ error: 'Всі поля обов\'язкові' });
    }

    if (!['admin', 'unit_officer', 'kpp_officer'].includes(role)) {
      return res.status(400).json({ error: 'Неправильна роль користувача' });
    }

    // Перевірка на унікальність username
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Користувач з таким іменем вже існує' });
    }

    // Хешування паролю
    const hashedPassword = await bcrypt.hash(password, 10);

    // Створення користувача
    const newUser = new User({
      username,
      password: hashedPassword,
      fullName,
      role,
      createdBy: (req.user as any)!._id
    });

    await newUser.save();

    // Повертаємо користувача без паролю
    const userResponse = {
      id: newUser._id.toString(),
      username: newUser.username,
      fullName: newUser.fullName,
      role: newUser.role,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    };

    res.status(201).json({
      message: 'Користувача успішно створено',
      user: userResponse
    });
  } catch (error) {
    console.error('Помилка створення користувача:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Редагування користувача (тільки для адміністратора)
router.put('/:id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { username, fullName, role, password } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Користувача не знайдено' });
    }

    // Перевірка на унікальність username (якщо змінюється)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({ error: 'Користувач з таким іменем вже існує' });
      }
    }

    // Оновлюємо поля
    if (username) user.username = username;
    if (fullName) user.fullName = fullName;
    if (role && ['admin', 'unit_officer', 'kpp_officer'].includes(role)) {
      user.role = role;
    }

    // Якщо вказано новий пароль
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    user.updatedAt = new Date();
    await user.save();

    // Повертаємо користувача без паролю
    const userResponse = {
      id: user._id.toString(),
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      message: 'Користувача успішно оновлено',
      user: userResponse
    });
  } catch (error) {
    console.error('Помилка редагування користувача:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// Видалення користувача (тільки для адміністратора)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Перевірка валідності ID
    if (!id || id === 'undefined') {
      return res.status(400).json({ error: 'Неправильний ID користувача' });
    }

    // Перевіряємо, щоб адміністратор не видалив сам себе
    if ((req.user as any)!._id.toString() === id) {
      return res.status(400).json({ error: 'Ви не можете видалити свій власний аккаунт' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Користувача не знайдено' });
    }

    await User.findByIdAndDelete(id);

    res.json({ message: 'Користювача успішно видалено' });
  } catch (error) {
    console.error('Помилка видалення користувача:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

export default router;