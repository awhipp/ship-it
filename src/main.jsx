import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { FlowVisualizer } from './components/FlowVisualizer.jsx';

export async function initMarketingApp(doc = document, win = window) {
  const rootEl = doc.getElementById('flow-visualizer-root');
  if (rootEl && !rootEl.dataset.mounted) {
    rootEl.dataset.mounted = 'true';
    const root = createRoot(rootEl);
    if (globalThis.IS_REACT_ACT_ENVIRONMENT) {
      await act(async () => {
        root.render(<FlowVisualizer />);
      });
    } else {
      root.render(<FlowVisualizer />);
    }
  }

  initSmoothScroll(doc, win);
  initCopyButtons(doc);
}

function initSmoothScroll(doc, win) {
  const scrollTargets = new Set(['#problem', '#solution', '#getting-started']);
  doc.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !scrollTargets.has(targetId)) return;

      const targetEl = doc.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 70;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + (win.pageYOffset || 0) - headerOffset;

        win.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    });
  });
}

function initCopyButtons(doc) {
  const fallbackCopy = (text) => {
    const textarea = doc.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    doc.body.appendChild(textarea);
    textarea.select();
    try {
      doc.execCommand('copy');
    } catch {
      // Ignore fallback error
    }
    doc.body.removeChild(textarea);
  };

  const setupCopy = (btnId, cmdId) => {
    const btn = doc.getElementById(btnId);
    const cmd = doc.getElementById(cmdId);
    if (!btn || !cmd) return;

    btn.addEventListener('click', async () => {
      const textToCopy = cmd.textContent.trim();
      const textSpan = btn.querySelector('.copy-text');
      const originalText = textSpan ? textSpan.textContent : 'Copy';

      const showCopied = () => {
        btn.classList.add('copied');
        if (textSpan) textSpan.textContent = 'Copied!';
        setTimeout(() => {
          btn.classList.remove('copied');
          if (textSpan) textSpan.textContent = originalText;
        }, 2000);
      };

      try {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          await navigator.clipboard.writeText(textToCopy);
          showCopied();
        } else {
          fallbackCopy(textToCopy);
          showCopied();
        }
      } catch {
        fallbackCopy(textToCopy);
        showCopied();
      }
    });
  };

  setupCopy('btn-copy-install', 'cmd-install');
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
