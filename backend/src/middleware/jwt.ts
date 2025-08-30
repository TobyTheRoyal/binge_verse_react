import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user';

export const jwtAuth = (): RequestHandler => async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    if (!(req as any).user) {
      const user = await UserModel.findById(payload.sub).exec();
      if (!user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      (req as any).user = user;
    }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
};