// ship-it Marketing Site Interactive Logic

document.addEventListener('DOMContentLoaded', () => {
  initLifecycleTeaser();
  initSmoothScroll();
  initCopyButton();
});

/**
 * Initializes the 5-phase interactive lifecycle teaser in the hero section.
 * Automatically cycles through active phases with smooth micro-animations,
 * while allowing user hover/click to manually inspect any phase.
 */
function initLifecycleTeaser() {
  const cards = document.querySelectorAll('#hero-lifecycle-teaser .phase-card');
  const panels = document.querySelectorAll('#phase-visual-display .phase-detail-panel');
  const statusPill = document.getElementById('teaser-active-status');
  if (!cards.length) return;

  const phaseStatusLabels = {
    plan: 'Phase 01: Decision Map',
    spec: 'Phase 02: Audited Spec',
    tickets: 'Phase 03: Vertical Slices',
    implement: 'Phase 04: Red-Green Build',
    review: 'Phase 05: Two-Axis Review',
  };

  let currentIndex = 0;
  let isHovered = false;
  let pauseUntil = 0;

  const setActivePhase = (index) => {
    const activeCard = cards[index];
    const phaseKey = activeCard ? activeCard.getAttribute('data-phase') : 'plan';

    // Update cards
    cards.forEach((card, idx) => {
      if (idx === index) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    // Update visual detail panels
    panels.forEach(panel => {
      if (panel.getAttribute('data-phase-detail') === phaseKey) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    // Update status pill text
    if (statusPill && phaseStatusLabels[phaseKey]) {
      statusPill.textContent = phaseStatusLabels[phaseKey];
    }
  };

  // Initial active state
  setActivePhase(0);

  // Auto-cycle through phases every 3.2s when not hovered or temporarily paused
  setInterval(() => {
    if (!isHovered && Date.now() > pauseUntil) {
      currentIndex = (currentIndex + 1) % cards.length;
      setActivePhase(currentIndex);
    }
  }, 3200);

  // Manual hover/click interaction
  cards.forEach((card, idx) => {
    card.addEventListener('mouseenter', () => {
      isHovered = true;
      currentIndex = idx;
      setActivePhase(idx);
    });

    card.addEventListener('mouseleave', () => {
      isHovered = false;
    });

    card.addEventListener('click', () => {
      currentIndex = idx;
      setActivePhase(idx);
      // Pause auto-cycle for 6 seconds on user click so they can read
      pauseUntil = Date.now() + 6000;
    });
  });
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
