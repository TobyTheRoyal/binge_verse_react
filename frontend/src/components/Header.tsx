import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import styles from './Header.module.scss';
import { useAuth } from '../hooks/useAuth';
import { searchTmdb } from '../api/contentApi';
import type { Content } from '../types/content';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn: checkLoggedIn, logout } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(checkLoggedIn());
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Content[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoggedIn(checkLoggedIn());
    const handleStorage = () => setIsLoggedIn(checkLoggedIn());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [checkLoggedIn]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        searchTmdb(searchQuery).then(setSuggestions);
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(target)) {
        clearSuggestions();
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
    setIsDropdownOpen(false);
    setIsLoggedIn(false);
  };

  const selectSuggestion = (item: Content) => {
    if (item.type === 'movie') {
      navigate(`/movies/${item.tmdbId}`);
    } else {
      navigate(`/series/${item.tmdbId}`);
    }
    clearSuggestions();
    setSearchQuery('');
  };

  const clearSuggestions = () => setSuggestions([]);

  return (
    <><header>
          <nav>
              <Link to="/">Home</Link> | <Link to="/watchlist">Watchlist</Link>
          </nav>
      </header><div className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
              <div className={styles.topBar}>
                  <Link className={styles.logoLink} to="/">
                      BINGE VERSE
                  </Link>
                  <div className={styles.searchContainer} ref={searchRef}>
                      <input
                          className={styles.searchBar}
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder="Search movies or series..."
                          onFocus={() => {
                              if (suggestions.length === 0) {
                                  clearSuggestions();
                              }
                          } } />
                      <svg
                          className={styles.searchIcon}
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                      >
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      {suggestions.length > 0 && (
                          <div className={styles.autocompleteList}>
                              {suggestions.map(m => (
                                  <div
                                      key={m.tmdbId}
                                      className={styles.suggestionItem}
                                      onClick={() => selectSuggestion(m)}
                                  >
                                      <img
                                          className={styles.suggestionPoster}
                                          src={m.poster || 'https://placehold.co/40x60'}
                                          alt={m.title} />
                                      <div className={styles.suggestionText}>
                                          <div className={styles.suggestionTitle}>{m.title}</div>
                                          <div className={styles.suggestionYear}>{m.releaseYear}</div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>

                  <div className={styles.userOptions}>
                      {isLoggedIn ? (
                          <>
                              <Link className={styles.userLink} to="/watchlist">
                                  <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                  >
                                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                  </svg>
                                  Watchlist
                              </Link>
                              <Link className={styles.userLink} to="/history">
                                  <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                  >
                                      <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
                                  </svg>
                                  History
                              </Link>
                              <div className={styles.profileDropdown} ref={dropdownRef}>
                                  <button
                                      className={styles.profileBtn}
                                      onClick={() => setIsDropdownOpen(o => !o)}
                                  >
                                      <svg
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                      >
                                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                          <circle cx="12" cy="7" r="4"></circle>
                                      </svg>
                                  </button>
                                  <ul
                                      className={`${styles.dropdownMenu} ${isDropdownOpen ? styles.show : ''}`}
                                  >
                                      <li>
                                          <Link to="/profile">
                                              <span className={styles.menuIcon}>👤</span> Profile
                                          </Link>
                                      </li>
                                      <li>
                                          <button onClick={handleLogout}>
                                              <span className={styles.menuIcon}>🚪</span> Sign Out
                                          </button>
                                      </li>
                                  </ul>
                              </div>
                          </>
                      ) : (
                          <>
                              <Link className={`${styles.authLink} ${styles.guestLink}`} to="/auth/login">
                                  Sign In
                              </Link>
                              <Link className={`${styles.authLink} ${styles.signupLink}`} to="/auth/register">
                                  Sign Up
                              </Link>
                          </>
                      )}
                  </div>
              </div>
              <div className={styles.categoryBar}>
                  <ul className={styles.categoryLinks}>
                      <li>
                          <NavLink
                              to="/for-you"
                              className={({ isActive }) => (isActive ? styles.active : undefined)}
                          >
                              For You
                          </NavLink>
                      </li>
                      <li>
                          <NavLink
                              to="/movies"
                              className={({ isActive }) => (isActive ? styles.active : undefined)}
                          >
                              Movies
                          </NavLink>
                      </li>
                      <li>
                          <NavLink
                              to="/series"
                              className={({ isActive }) => (isActive ? styles.active : undefined)}
                          >
                              Series
                          </NavLink>
                      </li>
                      <li>
                          <NavLink
                              to="/new"
                              className={({ isActive }) => (isActive ? styles.active : undefined)}
                          >
                              New
                          </NavLink>
                      </li>
                  </ul>
              </div>
          </div></>
  );
};

export default Header;