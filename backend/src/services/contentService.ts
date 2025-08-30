export interface Content {
  tmdbId: string;
  title: string;
}

export class ContentService {
  private cacheTrending: Content[] = [];
  private cacheTopRated: Content[] = [];
  private cacheNewReleases: Content[] = [];
  private updatingHome = false;

  async updateHomeCaches() {
    if (this.updatingHome) return;
    this.updatingHome = true;
    try {
      // Placeholder implementation - real implementation would call external APIs
      this.cacheTrending = [{ tmdbId: '1', title: 'Trending Example' }];
      this.cacheTopRated = [{ tmdbId: '2', title: 'Top Rated Example' }];
      this.cacheNewReleases = [{ tmdbId: '3', title: 'New Release Example' }];
    } finally {
      this.updatingHome = false;
    }
  }

  async getTrending(): Promise<Content[]> {
    if (this.cacheTrending.length === 0) {
      await this.updateHomeCaches();
    }
    return this.cacheTrending;
  }

  async getTopRated(): Promise<Content[]> {
    if (this.cacheTopRated.length === 0) {
      await this.updateHomeCaches();
    }
    return this.cacheTopRated;
  }

  async getNewReleases(): Promise<Content[]> {
    if (this.cacheNewReleases.length === 0) {
      await this.updateHomeCaches();
    }
    return this.cacheNewReleases;
  }
}