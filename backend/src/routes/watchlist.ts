import { Router } from 'express';
import { WatchlistService } from '../services/watchlistService';
import { jwtAuth } from '../middleware/jwt';


export const createWatchlistRouter = (
  watchlistService: WatchlistService,
  
) => {
  const router = Router();
  const auth = jwtAuth();

  router.use(auth);

  router.get('/', async (req, res) => {
    const user = (req as any).user;
    const list = await watchlistService.getWatchlist(user.id);
    res.json(list);
  });

  router.post('/', async (req, res) => {
    const user = (req as any).user;
    const { tmdbId } = req.body;
    const item = await watchlistService.addToWatchlist(user.id, tmdbId);
    res.status(201).json(item);
  });

  router.delete('/:tmdbId', async (req, res) => {
    const user = (req as any).user;
    await watchlistService.removeFromWatchlist(user.id, req.params.tmdbId);
    res.status(204).end();
  });

  return router;
};