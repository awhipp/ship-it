// ship-it Marketing Site Interactive Logic

document.addEventListener('DOMContentLoaded', () => {
  initExplorerTabs();
  initSmoothScroll();
  initCopyButton();
});

/**
 * Initializes the Interactive 5-Phase Lifecycle Explorer.
 * Supports accessible tab switching, keyboard arrow navigation, and smooth panel transitions.
 */
function initExplorerTabs() {
  const tabs = Array.from(document.querySelectorAll('[data-explorer-tab]'));
  const panels = Array.from(document.querySelectorAll('[data-explorer-panel]'));
  if (!tabs.length || !panels.length) return;

  const activatePhase = (phaseKey) => {
    tabs.forEach(tab => {
      const isMatch = tab.getAttribute('data-explorer-tab') === phaseKey;
      tab.classList.toggle('active', isMatch);
      tab.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      tab.setAttribute('tabindex', isMatch ? '0' : '-1');
    });

    panels.forEach(panel => {
      const isMatch = panel.getAttribute('data-explorer-panel') === phaseKey;
      panel.classList.toggle('active', isMatch);
    });
  };

  // Click handler
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const phase = tab.getAttribute('data-explorer-tab');
      activatePhase(phase);
    });

    // Keyboard navigation (ARIA tablist pattern)
    tab.addEventListener('keydown', (e) => {
      const currentIndex = tabs.indexOf(tab);
      let targetIndex = -1;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        targetIndex = (currentIndex + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        targetIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        targetIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        targetIndex = tabs.length - 1;
      }

      if (targetIndex !== -1) {
        tabs[targetIndex].focus();
        const phase = tabs[targetIndex].getAttribute('data-explorer-tab');
        activatePhase(phase);
      }
    });
  });

  // Ensure initial active phase
  activatePhase('plan');
}



/**
 * Handles smooth scrolling with offset for sticky header navigation.
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 70;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Copies the quickstart installation command to clipboard with visual confirmation.
 */
function initCopyButton() {
  const copyBtn = document.getElementById('btn-copy-install');
  const cmdEl = document.getElementById('cmd-install');
  if (!copyBtn || !cmdEl) return;

  copyBtn.addEventListener('click', async () => {
    const textToCopy = cmdEl.textContent.trim();
    try {
      await navigator.clipboard.writeText(textToCopy);
      const textSpan = copyBtn.querySelector('.copy-text');
      const originalText = textSpan ? textSpan.textContent : 'Copy';

      copyBtn.classList.add('copied');
      if (textSpan) textSpan.textContent = 'Copied!';

      setTimeout(() => {
        copyBtn.classList.remove('copied');
        if (textSpan) textSpan.textContent = originalText;
      }, 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      const textSpan = copyBtn.querySelector('.copy-text');
      if (textSpan) textSpan.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        if (textSpan) textSpan.textContent = 'Copy';
      }, 2000);
    }
  });
}
