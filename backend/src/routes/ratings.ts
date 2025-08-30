import { Router } from 'express';
import { RatingsService } from '../services/ratingsService';
import { jwtAuth } from '../middleware/jwt';
import { UsersService } from '../services/usersService';

export const createRatingsRouter = (
  ratingsService: RatingsService,
  usersService: UsersService,
) => {
  const router = Router();
  const auth = jwtAuth(usersService);

  router.use(auth);

  router.post('/', (req, res) => {
    const user = (req as any).user;
    const { tmdbId, rating } = req.body;
    ratingsService.setRating(user.id, tmdbId, rating);
    res.status(204).end();
  });

  router.get('/:tmdbId', (req, res) => {
    const user = (req as any).user;
    const rating = ratingsService.getRating(user.id, req.params.tmdbId);
    res.json({ rating });
  });

  return router;
};