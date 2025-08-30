import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UsersService } from '../services/usersService';

export const jwtAuth = (usersService: UsersService) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      usersService.findById(payload.sub).then(user => {
        if (!user) {
          return res.status(401).json({ message: 'Unauthorized' });
        }
        (req as any).user = user;
        next();
      });
    } catch (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
};