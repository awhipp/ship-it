import React from 'react';

export function Footer() {
  return (
    <footer className="site-footer mt-auto border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#060910] py-12 transition-colors" id="main-footer">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
          <div className="footer-brand max-w-md">
            <div className="flex items-center gap-3 text-lg font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-sky-500 text-white shadow-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="font-extrabold tracking-tight">ship-it</span>
            </div>
            <p className="footer-tagline text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Structured lifecycle automation that keeps developers in control. Coordinates planning, specifications, tests, and reviews directly on GitHub.
            </p>
          </div>

          <ul className="footer-links flex flex-col sm:flex-row gap-4 sm:gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
            <li>
              <a
                href="https://github.com/awhipp/ship-it"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link hover:text-slate-900 dark:hover:text-white transition-colors"
                id="footer-link-github"
              >
                GitHub Repository
              </a>
            </li>
            <li>
              <a
                href="https://github.com/awhipp/ship-it/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link hover:text-slate-900 dark:hover:text-white transition-colors"
                id="footer-link-issues"
              >
                GitHub Issues
              </a>
            </li>
            <li>
              <a
                href="https://github.com/awhipp/ship-it/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link hover:text-slate-900 dark:hover:text-white transition-colors"
                id="footer-link-license"
              >
                MIT License
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-bottom pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p className="footer-attribution">&copy; 2026 ship-it. Structured lifecycle automation on GitHub.</p>
          <p>Open Source on GitHub</p>
        </div>
      </div>
    </footer>
  );
}
