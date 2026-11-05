import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { Hero } from './components/Hero.jsx';
import { Footer } from './components/Footer.jsx';
import { getStoredTheme, applyTheme } from './components/ThemeToggle.jsx';

export function App() {
  const [theme, setTheme] = useState(() => getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 dark:bg-[#090d16] dark:text-slate-100 transition-colors duration-200">
      <Navbar theme={theme} onToggle={setTheme} />
      <main id="main-content" className="flex-1">
        <Hero />
        {/* Placeholder container for downstream stage stepper & content */}
        <div id="downstream-stages-placeholder" className="content-placeholder hidden" aria-hidden="true" />
      </main>
      <Footer />
    </div>
  );
}
