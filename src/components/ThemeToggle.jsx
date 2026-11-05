import React, { useState, useEffect } from 'react';

export const THEME_STORAGE_KEY = 'ship-it-theme';

export function getStoredTheme() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
    }
  } catch {
    // SecurityError or restricted environment fallback to light
  }
  return 'light';
}

export function applyTheme(theme) {
  if (typeof document !== 'undefined' && document.documentElement) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}

export function ThemeToggle({ theme: propTheme, onToggle }) {
  const [theme, setTheme] = useState(() => (propTheme !== undefined ? propTheme : getStoredTheme()));

  useEffect(() => {
    if (propTheme !== undefined) {
      setTheme(propTheme);
    }
  }, [propTheme]);

  const handleToggle = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    applyTheme(nextTheme);

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      }
    } catch {
      // Gracefully catch SecurityError or storage quota issues
    }

    if (onToggle) {
      onToggle(nextTheme);
    }
  };

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      id="theme-toggle-btn"
      onClick={handleToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
    >
      {isDark ? (
        <svg
          className="w-5 h-5 text-amber-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5 text-slate-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}
