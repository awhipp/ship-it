import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';
import { getStoredTheme, applyTheme } from './components/ThemeToggle.jsx';
import './styles/main.css';

export async function initMarketingApp(doc = document, win = window) {
  const initialTheme = getStoredTheme();
  applyTheme(initialTheme);

  const rootEl = doc.getElementById('root');
  if (rootEl && !rootEl.dataset.mounted) {
    rootEl.dataset.mounted = 'true';
    const root = createRoot(rootEl);
    if (globalThis.IS_REACT_ACT_ENVIRONMENT) {
      await act(async () => {
        root.render(<App />);
      });
    } else {
      root.render(<App />);
    }
    return root;
  }
  return null;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initMarketingApp(document, window);
    });
  } else {
    initMarketingApp(document, window);
  }
}
