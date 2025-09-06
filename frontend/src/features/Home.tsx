
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Content } from '../types/content';
import { getTrending, getTopRated, getNewReleases } from '../api/contentApi';
import { useWatchlist } from "../hooks/useWatchlist";
import { useRatings } from '../hooks/useRatings';
import { useAuth } from "../context/AuthContext";
import styles from './Home.module.scss';

interface Category {
  id: string;
  title: string;
  items: Content[];
  isLoading: boolean;
}

const Home: React.FC = () => {
    
  const navigate = useNavigate();
  const { loggedIn } = useAuth();

  const { getWatchlist, addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { fetchUserRatings, rateContent, getRating } = useRatings();

  const [categories, setCategories] = useState<Category[]>([
    { id: 'trending', title: 'Trending Now', items: [], isLoading: false },
    { id: 'top-rated', title: 'Top Rated', items: [], isLoading: false },
    { id: 'new-releases', title: 'New Releases', items: [], isLoading: false },
    { id: 'watchlist', title: 'My Watchlist', items: [], isLoading: false }
  ]);

  const placeholderItems = Array.from({ length: 5 });

  const [scrollLeftState, setScrollLeftState] = useState<Record<string, boolean>>({});
  const ratingInputRef = useRef<HTMLInputElement>(null);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [ratingScore, setRatingScore] = useState('');
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);

  const setLoading = (index: number, value: boolean) => {
    setCategories(prev => {
      const updated = [...prev];
      if (updated[index]) updated[index] = { ...updated[index], isLoading: value };
      return updated;
    });
  };

  const setItems = (index: number, items: Content[]) => {
    setCategories(prev => {
      const updated = [...prev];
      if (updated[index]) updated[index] = { ...updated[index], items, isLoading: false };
      return updated;
    });
  };

  const updateScrollState = (categoryId: string) => {
    const el = document.getElementById(categoryId);
    setScrollLeftState(prev => ({ ...prev, [categoryId]: !!el && el.scrollLeft > 0 }));
  };

  const canScrollLeft = (categoryId: string) => !!scrollLeftState[categoryId];

  const canScrollRight = (categoryId: string) => {
    const el = document.getElementById(categoryId);
    if (!el) return false;
    return el.scrollWidth - el.clientWidth - el.scrollLeft > 10;
  };

  const scrollLeft = (categoryId: string) => {
    const el = document.getElementById(categoryId);
    if (el) {
      el.scrollBy({ left: -300, behavior: 'smooth' });
      setTimeout(() => updateScrollState(categoryId), 350);
    }
  };

  const scrollRight = (categoryId: string) => {
    const el = document.getElementById(categoryId);
    if (el) {
      el.scrollBy({ left: 300, behavior: 'smooth' });
      setTimeout(() => updateScrollState(categoryId), 350);
    }
  };

  const loadPublicCategories = async () => {
    setLoading(0, true);
    try {
      const data = await getTrending();
      setItems(0, data);
    } catch (err: unknown) {
      console.error('Failed to load trending', err);
      setLoading(0, false);
    }

    setLoading(1, true);
    try {
      const data = await getTopRated();
      setItems(1, data);
    } catch (err: unknown) {
      console.error('Failed to load top rated', err);
      setLoading(1, false);
    }

    setLoading(2, true);
    try {
      const data = await getNewReleases();
      setItems(2, data);
    } catch (err: unknown) {
      console.error('Failed to load new releases', err);
      setLoading(2, false);
    }
  };

  const loadCategories = async () => {
    await loadPublicCategories();
    setLoading(3, true);
    try {
      const data = await getWatchlist();
      setItems(3, data as unknown as Content[]);
    } catch (err: unknown) {
      console.error('Failed to load watchlist', err);
      setLoading(3, false);
    }
  };

  useEffect(() => {
    fetchUserRatings().catch((err: unknown) => console.error('Failed to fetch ratings', err));
    if (loggedIn) {
      loadCategories();
    } else {
      loadPublicCategories();
    }
  }, [loggedIn]);

  useEffect(() => {
    categories.forEach(cat => updateScrollState(cat.id));
  }, [categories]);

  const toggleWatchlist = async (contentId: string, type: 'movie' | 'tv') => {
    if (!loggedIn) {
      navigate('/auth/login');
      return;
    }
    try {
      if (isInWatchlist(contentId)) {
        await removeFromWatchlist(contentId);
      } else {
        await addToWatchlist({ id: contentId, type });
      }
      const data = await getWatchlist();
      setItems(3, data as unknown as Content[]);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const startRating = (categoryId: string, contentId: string) => {
    if (!loggedIn) {
      navigate('/auth/login');
      return;
    }
    setSelectedCategoryId(categoryId);
    setSelectedContentId(contentId);
    setRatingScore('');
    setIsRatingSubmitted(false);
    setTimeout(() => ratingInputRef.current?.focus(), 0);
  };

  const stopRating = () => {
    setSelectedCategoryId(null);
    setSelectedContentId(null);
    setRatingScore('');
    setIsRatingSubmitted(false);
  };

  const submitRating = async (tmdbId: string) => {
    const score = parseFloat(ratingScore);
    if (isNaN(score) || score < 0 || score > 10) {
      console.error('Invalid rating');
      return;
    }
    if (!loggedIn) {
      navigate('/auth/login');
      return;
    }
    try {
      await rateContent(tmdbId, score);
      setIsRatingSubmitted(true);
      await fetchUserRatings();
      setTimeout(() => stopRating(), 500);
    } catch (err: unknown) {
      console.error('Failed to set rating', err);
    }
  };

  return (
    <div className={styles['homeContainer']}>
      <section className={styles['heroSection']}>
        <div className={styles['heroContent']}>
          <h1>Your personal streaming companion</h1>
          <p>rate, discover and keep track of what you love</p>
        </div>
      </section>

      {categories.map((category) => (
        <section key={category.id} className={styles['categorySection']}>
          <h2>{category.title}</h2>
          <div className={styles['sliderContainer']}>
            {canScrollLeft(category.id) && (
              <button
                className={`${styles['sliderArrow']} ${styles['leftArrow']}`}
                onClick={() => scrollLeft(category.id)}
              >
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.5 19.5L8.5 12.5L15.5 5.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}

            <div
              className={styles['scrollContainer']}
              id={category.id}
              onScroll={() => updateScrollState(category.id)}
            >
              <div className={styles['contentList']}>
                {category.items.length > 0 ? (
                  category.items.map(item => (
                    <Link
                      to={`/movies/${item.tmdbId}`}
                      key={item.tmdbId}
                      className={styles['contentCard']}
                      onMouseLeave={stopRating}
                      onClick={e => {
                        if (selectedContentId) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <div
                        className={styles['cardImage']}
                        style={{ backgroundImage: `url(${item.poster || 'https://placehold.co/200x300'})` }}
                      >
                        <button
                          className={styles['addBtn']}
                          onClick={e => {
                            e.preventDefault();
                            toggleWatchlist(item.tmdbId, item.type);
                          }}
                        >
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                            <path
                              d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                              fill={isInWatchlist(item.tmdbId) ? 'currentColor' : 'none'}
                            />
                          </svg>
                        </button>
                        <button
                          className={styles['ratingBtn']}
                          onClick={e => {
                            e.preventDefault();
                            startRating(category.id, item.tmdbId);
                          }}
                        >
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        </button>

                        {selectedCategoryId === category.id &&
                          selectedContentId === item.tmdbId &&
                          !isRatingSubmitted && (
                            <>
                              <div className={styles['ratingOverlay']} />
                              <div className={styles['ratingInputContainer']}>
                                <div className={styles['ratingCard']}>
                                  <button
                                    className={styles['closeBtn']}
                                    onClick={e => {
                                      e.preventDefault();
                                      stopRating();
                                    }}
                                  >
                                    ✕
                                  </button>
                                  <h3>Rate “{item.title}”</h3>
                                  <input
                                    ref={ratingInputRef}
                                    type="text"
                                    value={ratingScore}
                                    placeholder="0.0 – 10.0"
                                    className={styles['ratingInputField']}
                                    onChange={e => setRatingScore(e.target.value)}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        submitRating(item.tmdbId);
                                      }
                                    }}
                                  />
                                  <button
                                    className={styles['submitRatingBtn']}
                                    onClick={e => {
                                      e.preventDefault();
                                      submitRating(item.tmdbId);
                                    }}
                                  >
                                    Submit
                                  </button>
                                </div>
                              </div>
                            </>
                          )}

                        {getRating(item.tmdbId) != null && (
                          <div className={styles['ownRatingTag']}>
                            <span className={styles['starIcon']}>★</span>
                            {getRating(item.tmdbId)?.toFixed(1)}
                          </div>
                        )}
                      </div>

                      <p className={styles['cardTitle']}>
                        {item.title} ({item.releaseYear})
                      </p>

                      <div className={styles['ratingsContainer']}>
                        <div className={styles['imdbRating']}>
                          <img
                            src="/assets/images/imdb-logo.png"
                            alt="IMDb"
                            className={styles['ratingIcon']}
                          />
                          {item.imdbRating != null ? item.imdbRating.toFixed(1) : 'N/A'}
                        </div>
                        <div className={styles['rtRating']}>
                          <img
                            src="/assets/images/rt-logo-cf.png"
                            alt="Rotten Tomatoes"
                            className={styles['ratingIcon']}
                          />
                          {item.rtRating != null ? `${Math.round(item.rtRating)}%` : 'N/A'}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : category.isLoading ? (
                  <div className={styles['loadingPlaceholder']}>
                    {placeholderItems.map((_, i) => (
                      <div key={i} className={styles['skeletonCard']} />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {(category.id !== 'watchlist' || canScrollRight(category.id)) && (
              <button
                className={`${styles['sliderArrow']} ${styles['rightArrow']}`}
                onClick={() => scrollRight(category.id)}
              >
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.5 4.5L15.5 11.5L8.5 18.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </section>
      ))}
    </div>
  );
};
export default Home;