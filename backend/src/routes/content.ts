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

  return router;
};