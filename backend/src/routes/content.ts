import { Router } from 'express';
import { ContentService } from '../services/contentService';

export const createContentRouter = (contentService: ContentService) => {
  const router = Router();

  router.get('/trending', async (req, res) => {
    res.json(await contentService.getTrending());
  });

  router.get('/top-rated', async (req, res) => {
    res.json(await contentService.getTopRated());
  });

  router.get('/new-releases', async (req, res) => {
    res.json(await contentService.getNewReleases());
  });

  router.get('/genres', async (_req, res) => {
    res.json(await contentService.getGenres());
  });

  router.post('/search', async (req, res) => {
    const { query } = req.body;
    if (typeof query !== 'string' || query.trim() === '') {
      res.status(400).json({ message: 'Query is required' });
      return;
    }
    try {
      const results = await contentService.searchTmdb(query);
      res.json(results);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  return router;
};