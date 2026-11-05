import React from 'react';
import { ThemeToggle } from './ThemeToggle.jsx';

export function Navbar({ theme, onToggle }) {
  return (
    <header className="site-header sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-[#090d16]/90 transition-colors" id="main-header">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <nav className="flex items-center justify-between h-16" aria-label="Main Navigation">
          <a
            href="#"
            className="brand-link flex items-center gap-3 text-lg font-bold tracking-tight text-slate-900 dark:text-white"
            id="brand-logo-link"
            aria-label="ship-it Home"
          >
            <div className="brand-icon flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-sky-500 text-white shadow-sm">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="brand-text font-extrabold tracking-tight">ship-it</span>
          </a>

          <div className="nav-actions flex items-center gap-4">
            <a
              href="https://github.com/awhipp/ship-it"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              id="nav-github-link"
              aria-label="View ship-it on GitHub"
            >
              <svg
                className="w-4 h-4 fill-current"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>GitHub</span>
            </a>
            <ThemeToggle theme={theme} onToggle={onToggle} />
          </div>
        </nav>
      </div>
    </header>
  );
}
