import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
  params: any;
  query: any;
  body: any;
  headers: any;
}

// Middleware для перевірки JWT токену
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Токен доступу відсутній' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Користувач не знайдений' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({ 
      error: 'Недійсний токен', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Middleware для перевірки ролі
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Користувач не автентифікований' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Недостатньо прав доступу',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};