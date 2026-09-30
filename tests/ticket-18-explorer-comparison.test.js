import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const ROOT_DIR = path.resolve(__dirname, '..');

describe('Ticket #18: Interactive 5-Phase Lifecycle Explorer and SDLC Crisis Comparison', () => {
  let dom;
  let document;
  let window;

  beforeAll(() => {
    const htmlPath = path.join(ROOT_DIR, 'index.html');
    expect(fs.existsSync(htmlPath), 'index.html must exist').toBe(true);
    const html = fs.readFileSync(htmlPath, 'utf8');
    dom = new JSDOM(html, { runScripts: 'dangerously' });
    document = dom.window.document;
    window = dom.window;

    // Load and execute main.js in JSDOM
    const jsPath = path.join(ROOT_DIR, 'src/main.js');
    const jsCode = fs.readFileSync(jsPath, 'utf8');
    window.eval(jsCode);
    document.dispatchEvent(new window.Event('DOMContentLoaded'));
  });

  describe('SDLC Crisis vs The ship-it Solution Comparative Section', () => {
    it('should have a dedicated comparison section with semantic heading', () => {
      const section = document.querySelector('#sdlc-comparison');
      expect(section, 'Comparison section #sdlc-comparison must exist').not.toBeNull();
      const heading = section.querySelector('h2');
      expect(heading).not.toBeNull();
      expect(heading.textContent).toMatch(/Crisis|Drift|Solution|Method/i);
    });

    it('should contain side-by-side structured comparison cards for Unchecked AI Drift vs The ship-it Method', () => {
      const section = document.querySelector('#sdlc-comparison');
      const driftCard = section.querySelector('.comparison-card-drift, [data-comparison="drift"]');
      const solutionCard = section.querySelector('.comparison-card-solution, [data-comparison="solution"]');

      expect(driftCard, 'Unchecked AI Drift comparison card must exist').not.toBeNull();
      expect(solutionCard, 'The ship-it Method comparison card must exist').not.toBeNull();

      expect(driftCard.textContent).toMatch(/mega-PR|unreviewable|drift|chaos/i);
      expect(solutionCard.textContent).toMatch(/vertical slice|isolation|adversarial|agency/i);
    });

    it('should contrast key dimensions: diff scope, context hygiene, verification, and developer agency', () => {
      const section = document.querySelector('#sdlc-comparison');
      const text = section.textContent;

      // Dimension 1: Mega-PRs vs Vertical Slices
      expect(text).toMatch(/mega-pr/i);
      expect(text).toMatch(/vertical slice|tracer-bullet/i);

      // Dimension 2: Bloated context vs Context isolation
      expect(text).toMatch(/degraded.*reasoning|context.*bloat/i);
      expect(text).toMatch(/context.*isolation|fresh.*session/i);

      // Dimension 3: Unreviewable diffs vs Independent verification
      expect(text).toMatch(/unreviewable diff|rubber-stamp/i);
      expect(text).toMatch(/adversarial.*verification|two-axis/i);

      // Dimension 4: Lost control vs Full developer agency
      expect(text).toMatch(/lost.*control|hallucinated/i);
      expect(text).toMatch(/architectural control|human.*driver/i);
    });
  });

  describe('Interactive 5-Phase Lifecycle Explorer', () => {
    it('should have a dedicated lifecycle explorer section with semantic heading', () => {
      const section = document.querySelector('#lifecycle-explorer');
      expect(section, 'Lifecycle Explorer section #lifecycle-explorer must exist').not.toBeNull();
      const heading = section.querySelector('h2');
      expect(heading).not.toBeNull();
      expect(heading.textContent).toMatch(/Lifecycle|5-Phase|Explorer/i);
    });

    it('should have tabbed navigation controls for all 5 phases: Plan, Spec, Tickets, Implement, Review', () => {
      const navContainer = document.querySelector('#explorer-nav, [data-explorer-nav]');
      expect(navContainer, 'Explorer navigation container must exist').not.toBeNull();

      const phases = ['plan', 'spec', 'tickets', 'implement', 'review'];
      for (const phase of phases) {
        const btn = navContainer.querySelector(`[data-explorer-tab="${phase}"]`);
        expect(btn, `Tab button for phase "${phase}" must exist`).not.toBeNull();
      }
    });

    it('should provide detail panels for each phase detailing Purpose, Inputs, Outputs, Human Checkpoint, and Anti-Drift Guarantee', () => {
      const phases = ['plan', 'spec', 'tickets', 'implement', 'review'];
      for (const phase of phases) {
        const panel = document.querySelector(`[data-explorer-panel="${phase}"]`);
        expect(panel, `Detail panel for phase "${phase}" must exist`).not.toBeNull();

        const panelText = panel.textContent;
        expect(panelText).toMatch(/Purpose|Mission|What this step does/i);
        expect(panelText).toMatch(/Input/i);
        expect(panelText).toMatch(/Output/i);
        expect(panelText).toMatch(/Human.*Checkpoint|Review.*Checkpoint|Where you step in/i);
        expect(panelText).toMatch(/Anti-Drift|Guarantee|Keeping on track|Preventing Drift/i);
      }
    });

    it('should have unique IDs for all interactive elements in the comparison and explorer sections', () => {
      const container = document.querySelector('main');
      const interactiveEls = container.querySelectorAll('button, a, input, select');
      const ids = new Set();
      interactiveEls.forEach(el => {
        const id = el.getAttribute('id');
        if (id) {
          expect(ids.has(id), `Duplicate interactive ID found: ${id}`).toBe(false);
          ids.add(id);
        }
      });
    });

    it('should switch active tab and panel on user interaction', () => {
      const specTab = document.querySelector('#btn-tab-spec');
      const planTab = document.querySelector('#btn-tab-plan');
      const specPanel = document.querySelector('#panel-explorer-spec');
      const planPanel = document.querySelector('#panel-explorer-plan');

      expect(specTab).not.toBeNull();
      expect(specPanel).not.toBeNull();

      // Trigger click on spec tab
      specTab.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

      // Plan should now be inactive, spec active
      expect(specTab.classList.contains('active')).toBe(true);
      expect(specTab.getAttribute('aria-selected')).toBe('true');
      expect(specPanel.classList.contains('active')).toBe(true);

      expect(planTab.classList.contains('active')).toBe(false);
      expect(planTab.getAttribute('aria-selected')).toBe('false');
      expect(planPanel.classList.contains('active')).toBe(false);

      // Click back to plan tab
      planTab.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
      expect(planTab.classList.contains('active')).toBe(true);
      expect(planPanel.classList.contains('active')).toBe(true);
    });
  });

  describe('CSS & Responsive Layout Rules', () => {
    it('should include styles and responsive media queries for comparison and lifecycle explorer in main.css', () => {
      const cssPath = path.join(ROOT_DIR, 'src/styles/main.css');
      expect(fs.existsSync(cssPath)).toBe(true);
      const css = fs.readFileSync(cssPath, 'utf8');

      expect(css).toContain('.sdlc-comparison-section');
      expect(css).toContain('.lifecycle-explorer-section');
      expect(css).toContain('--color-drift');
      expect(css).toContain('--color-solution');

      // Mobile media query checks
      expect(css).toMatch(/@media[^{]*max-width:\s*768px/i);
      expect(css).toMatch(/@media[^{]*max-width:\s*400px/i);
    });
  });

  describe('Production Bundle Verification', () => {
    it('should include comparison and explorer sections in dist/index.html with relative asset paths', () => {
      const distHtmlPath = path.join(ROOT_DIR, 'dist/index.html');
      expect(fs.existsSync(distHtmlPath), 'dist/index.html must exist').toBe(true);

      const html = fs.readFileSync(distHtmlPath, 'utf8');
      expect(html).toContain('id="sdlc-comparison"');
      expect(html).toContain('id="lifecycle-explorer"');
      expect(html).toContain('src="./assets/');
      expect(html).not.toMatch(/src="\/assets\//);
    });
  });
});
