import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user';

export const jwtAuth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      if (!(req as any).user) {
        const user = await UserModel.findById(payload.sub).exec();
        if (!user) {
          return res.status(401).json({ message: 'Unauthorized' });
        }
        (req as any).user = user;
        }
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
};