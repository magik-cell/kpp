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
    console.log('🔑 Auth middleware called for:', req.method, req.url);
    const authHeader = req.headers['authorization'];
    console.log('📋 Auth header:', authHeader ? `${authHeader.substring(0, 20)}...` : 'MISSING');
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log('❌ Token missing');
      return res.status(401).json({ error: 'Токен доступу відсутній' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
    console.log('✅ Token decoded, userId:', decoded.userId);
    const user = await User.findById(decoded.userId);

    if (!user) {
      console.log('❌ User not found for userId:', decoded.userId);
      return res.status(401).json({ error: 'Користувач не знайдений' });
    }

    console.log('✅ User authenticated:', user.username, user.role);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
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