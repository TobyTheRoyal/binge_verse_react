import { Router, Request, Response } from 'express';
import { MoviesService } from '../services/moviesService';

export const createMoviesRouter = (moviesService: MoviesService) => {
  const router = Router();

  router.get(
    '/:tmdbId',
    async (req: Request, res: Response): Promise<void> => {
      const movie = await moviesService.findByTmdbId(req.params.tmdbId);
      if (!movie) {
        res.status(404).json({ message: 'Not found' });
        return;
      }
      res.json(movie);
    },
  );

  return router;
};