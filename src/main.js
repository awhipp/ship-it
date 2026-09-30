// ship-it Marketing Site Interactive Logic

document.addEventListener('DOMContentLoaded', () => {
  initLifecycleTeaser();
  initSmoothScroll();
});

/**
 * Initializes the 5-phase interactive lifecycle teaser in the hero section.
 * Automatically cycles through active phases with smooth micro-animations,
 * while allowing user hover/click to manually inspect any phase.
 */
function initLifecycleTeaser() {
  const cards = document.querySelectorAll('#hero-lifecycle-teaser .phase-card');
  if (!cards.length) return;

  let currentIndex = 0;
  let isHovered = false;

  const setActivePhase = (index) => {
    cards.forEach((card, idx) => {
      if (idx === index) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  };

  // Initial active state
  setActivePhase(0);

  // Auto-cycle through phases every 2.8s when not hovered
  const intervalId = setInterval(() => {
    if (!isHovered) {
      currentIndex = (currentIndex + 1) % cards.length;
      setActivePhase(currentIndex);
    }
  }, 2800);

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
    });
  });
}

/**
 * Handles smooth scrolling with offset for sticky header navigation.
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 80;
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
