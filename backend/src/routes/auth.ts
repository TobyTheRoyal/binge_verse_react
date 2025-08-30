import { Router } from 'express';
import { AuthService } from '../services/authService';

export const createAuthRouter = (authService: AuthService) => {
  const router = Router();

  router.post('/register', async (req, res) => {
    try {
      const token = await authService.register(req.body);
      res.json(token);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const token = await authService.login(req.body);
      res.json(token);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  return router;
};