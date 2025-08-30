import { Router } from 'express';
import { RatingsService } from '../services/ratingsService';
import { jwtAuth } from '../middleware/jwt';

export const createRatingsRouter = (
  ratingsService: RatingsService,
) => {
  const router = Router();
  const auth = jwtAuth();

  router.use(auth);

  router.post('/', async (req, res) => {
    const user = (req as any).user;
    const { tmdbId, rating } = req.body;
    if (typeof rating !== 'number' || rating < 0 || rating > 10) {
      return res.status(400).json({ message: 'Rating must be between 0 and 10' });
    }
    await ratingsService.setRating(user.id, tmdbId, rating);
    res.status(204).end();
  });

  router.get('/:tmdbId', async (req, res) => {
    const user = (req as any).user;
    const rating = await ratingsService.getRating(user.id, req.params.tmdbId);
    res.json({ rating });
  });

  return router;
};