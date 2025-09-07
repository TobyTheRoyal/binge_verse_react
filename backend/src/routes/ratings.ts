import { Router } from 'express';
import { RatingsService } from '../services/ratingsService';
import { jwtAuth } from '../middleware/jwt';

export const createRatingsRouter = (
  ratingsService: RatingsService,
) => {
  const router = Router();
  const auth = jwtAuth();

  router.use(auth);

  router.post('/', async (req, res): Promise<void> => {
    const user = (req as any).user;
    const { tmdbId, rating } = req.body;
    if (typeof rating !== 'number' || rating < 0 || rating > 10) {
      res.status(400).json({ message: 'Rating must be between 0 and 10' });
      return;
    }
    await ratingsService.setRating(user.id, tmdbId, rating);
    res.status(204).end();
  });

  router.get('/', async (req, res) => {
    const user = (req as any).user;
    const list = await ratingsService.getUserRatedContent(user.id);
    res.json(list);
  });

  router.get('/:tmdbId', async (req, res) => {
    const user = (req as any).user;
    const rating = await ratingsService.getRating(user.id, req.params.tmdbId);
    res.json({ rating });
  });

  return router;
};