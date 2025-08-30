import { Router } from 'express';
import { UsersService } from '../services/usersService';
import { jwtAuth } from '../middleware/jwt';

export const createUsersRouter = (usersService: UsersService) => {
  const router = Router();
  const auth = jwtAuth();

  router.get('/me', auth, (req, res) => {
    res.json((req as any).user);
  });

  router.get('/:id', async (req, res) => {
    const user = await usersService.findById(parseInt(req.params.id, 10));
    if (!user) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.json(user);
  });

  return router;
};