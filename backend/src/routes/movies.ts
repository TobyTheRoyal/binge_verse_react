import { Router, Request, Response } from 'express';
import { MoviesService } from '../services/moviesService';

export const createMoviesRouter = (moviesService: MoviesService) => {
  const router = Router();

  router.get('/', async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string, 10) || 1;
    let filters: any = {};
    if (typeof req.query.filters === 'string') {
      try {
        filters = JSON.parse(req.query.filters as string);
      } catch {
        // ignore parse errors
      }
    }
    const movies = await moviesService.listTrendingMovies(page, filters);
    res.json(movies);
  });

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