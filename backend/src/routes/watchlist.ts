import { Router } from 'express';
import { WatchlistService } from '../services/watchlistService';
import { jwtAuth } from '../middleware/jwt';
import { UsersService } from '../services/usersService';

export const createWatchlistRouter = (
  watchlistService: WatchlistService,
  usersService: UsersService,
) => {
  const router = Router();
  const auth = jwtAuth(usersService);

  router.use(auth);

  router.get('/', (req, res) => {
    const user = (req as any).user;
    res.json(watchlistService.getWatchlist(user.id));
  });

  router.post('/', (req, res) => {
    const user = (req as any).user;
    const { tmdbId } = req.body;
    res.json(watchlistService.addToWatchlist(user.id, tmdbId));
  });

  router.delete('/:tmdbId', (req, res) => {
    const user = (req as any).user;
    watchlistService.removeFromWatchlist(user.id, req.params.tmdbId);
    res.status(204).end();
  });

  return router;
};