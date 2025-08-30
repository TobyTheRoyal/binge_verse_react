import { Router } from 'express';
import { MoviesService } from '../services/moviesService';

export const createMoviesRouter = (moviesService: MoviesService) => {
  const router = Router();

  router.get('/:tmdbId', async (req, res) => {
    const movie = await moviesService.findByTmdbId(req.params.tmdbId);
    if (!movie) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.json(movie);
  });

  return router;
};