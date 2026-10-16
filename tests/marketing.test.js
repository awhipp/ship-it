import { describe, it, expect, beforeAll, vi } from 'vitest';
import { act } from 'react';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { JSDOM } from 'jsdom';

const ROOT_DIR = path.resolve(__dirname, '..');

describe('Marketing Site Architecture & Domains', () => {
  let dom;
  let document;
  let window;

  beforeAll(async () => {
    const htmlPath = path.join(ROOT_DIR, 'index.html');
    expect(fs.existsSync(htmlPath), 'index.html must exist').toBe(true);
    const html = fs.readFileSync(htmlPath, 'utf8');

    dom = new JSDOM(html, { url: 'http://localhost:3000/' });
    document = dom.window.document;
    window = dom.window;

    globalThis.window = window;
    globalThis.document = document;

    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    };

    Object.defineProperty(window.navigator, 'clipboard', {
      value: mockClipboard,
      configurable: true,
      writable: true,
    });

    Object.defineProperty(globalThis, 'navigator', {
      value: window.navigator,
      configurable: true,
      writable: true,
    });

    globalThis.HTMLElement = window.HTMLElement;
    globalThis.Element = window.Element;
    globalThis.Node = window.Node;
    globalThis.Event = window.Event;
    globalThis.MouseEvent = window.MouseEvent;
    globalThis.KeyboardEvent = window.KeyboardEvent;
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;

    const mainEntryPath = path.join(ROOT_DIR, 'src/main.jsx');
    if (fs.existsSync(mainEntryPath)) {
      const mainModule = await import('../src/main.jsx');
      if (typeof mainModule.initMarketingApp === 'function') {
        await mainModule.initMarketingApp(document, window);
      }
    }
  });

  // =========================================================================
  // DOMAIN: Infrastructure & Deployment Pipeline
  // =========================================================================
  describe('Domain: Infrastructure & Deployment Pipeline', () => {
    it('should configure package.json with React 19 and @vitejs/plugin-react without Mermaid dependencies', () => {
      const pkgPath = path.join(ROOT_DIR, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

      expect(pkg.dependencies?.react).toBe('^19.0.0');
      expect(pkg.dependencies?.['react-dom']).toBe('^19.0.0');
      expect(pkg.devDependencies?.['@vitejs/plugin-react']).toBe('^4.3.4');
      expect(pkg.dependencies?.mermaid).toBeUndefined();
      expect(pkg.devDependencies?.mermaid).toBeUndefined();
    });

    it('should configure Vite with react() plugin, relative base path "./", dist outDir, and assets assetsDir', async () => {
      const configPath = path.join(ROOT_DIR, 'vite.config.js');
      expect(fs.existsSync(configPath), 'vite.config.js must exist').toBe(true);

      const configModule = await import(configPath);
      const config = configModule.default;
      expect(config.base).toBe('./');
      expect(config.build.outDir).toBe('dist');
      expect(config.build.assetsDir).toBe('assets');
      expect(Array.isArray(config.plugins)).toBe(true);
      expect(config.plugins.length).toBeGreaterThan(0);
    });

    it('should configure GitHub Pages CI/CD workflow targeting gh-pages with appropriate permissions', () => {
      const workflowPath = path.join(ROOT_DIR, '.github/workflows/deploy.yml');
      expect(fs.existsSync(workflowPath), '.github/workflows/deploy.yml must exist').toBe(true);

      const content = fs.readFileSync(workflowPath, 'utf8');
      const doc = yaml.load(content);

      // Verify branch trigger
      expect(doc.on.push.branches).toContain('gh-pages');

      // Verify deployment permissions
      expect(doc.permissions.pages).toBe('write');
      expect(doc.permissions['id-token']).toBe('write');

      // Verify build and deploy actions
      const steps = doc.jobs.deploy.steps.map(s => s.run || s.uses);
      expect(steps.some(s => s && s.includes('npm run build'))).toBe(true);
      expect(steps.some(s => s && s.includes('actions/deploy-pages'))).toBe(true);
    });
  });

  // =========================================================================
  // DOMAIN: Document Metadata & Semantic Layout
  // =========================================================================
  describe('Domain: Document Metadata & Semantic Layout', () => {
    it('should contain developer-focused page title, SEO meta tags, Open Graph, and Twitter metadata', () => {
      expect(document.title).toBe('ship-it | Structured Lifecycle Automation for Software Teams');
      const metaDesc = document.querySelector('meta[name="description"]');
      expect(metaDesc).not.toBeNull();
      expect(metaDesc.getAttribute('content').length).toBeGreaterThan(20);

      // Open Graph & Social Cards
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDesc = document.querySelector('meta[property="og:description"]');
      const ogType = document.querySelector('meta[property="og:type"]');
      const twitterCard = document.querySelector('meta[name="twitter:card"]');
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');

      expect(ogTitle?.getAttribute('content')).toBe('ship-it | Structured Lifecycle Automation for Software Teams');
      expect(ogDesc?.getAttribute('content')).toBe(
        'Keep developers in control. Coordinate feature delivery across GitHub issues using phase gates, fresh-session validation, and two-axis code reviews.'
      );
      expect(ogType, 'og:type meta tag must exist').not.toBeNull();
      expect(twitterCard, 'twitter:card meta tag must exist').not.toBeNull();
      expect(twitterTitle?.getAttribute('content')).toBe('ship-it | Structured Lifecycle Automation for Software Teams');
    });

    it('should configure a valid favicon link referencing an existing asset', () => {
      const faviconLink = document.querySelector('link[rel~="icon"]');
      expect(faviconLink, 'Favicon link must exist in head').not.toBeNull();
      const href = faviconLink.getAttribute('href');
      expect(href).toMatch(/favicon\.(svg|ico|png)/i);

      const cleanHref = href.replace(/^\.\//, '');
      const faviconPath = path.join(ROOT_DIR, cleanHref);
      expect(fs.existsSync(faviconPath), `Favicon asset must exist at ${faviconPath}`).toBe(true);
    });

    it('should structure content within semantic header, main, and footer landmarks', () => {
      expect(document.querySelector('header')).not.toBeNull();
      expect(document.querySelector('main')).not.toBeNull();
      expect(document.querySelector('footer')).not.toBeNull();
    });

    it('should retain the site header containing brand icon, title, repository link, and navigation', () => {
      const header = document.querySelector('header#main-header');
      expect(header, 'Site header must exist').not.toBeNull();

      const brandLogo = header.querySelector('#brand-logo-link');
      expect(brandLogo, 'Brand logo link must exist').not.toBeNull();
      expect(brandLogo.querySelector('.brand-icon'), 'Brand icon must exist').not.toBeNull();
      expect(brandLogo.querySelector('.brand-text')?.textContent.trim()).toBe('ship-it');

      const ghLink = header.querySelector('#nav-github-link');
      expect(ghLink, 'Repository link must exist').not.toBeNull();
      expect(ghLink.getAttribute('href')).toContain('github.com/awhipp/ship-it');
    });

    it('should arrange primary sections in sequential semantic order: Problem -> Solution -> Getting Started', () => {
      const main = document.querySelector('main');
      const sections = Array.from(main.querySelectorAll(':scope > section'));
      const sectionIds = sections.map(s => s.getAttribute('id'));

      expect(sectionIds).toEqual(['problem', 'solution', 'getting-started']);
    });

    it('should assert the presence of #problem, #solution, and #getting-started', () => {
      expect(document.querySelector('#problem'), '#problem section must exist').not.toBeNull();
      expect(document.querySelector('#solution'), '#solution section must exist').not.toBeNull();
      expect(document.querySelector('#getting-started'), '#getting-started section must exist').not.toBeNull();
    });

    it('should assert the absence of #sdlc-comparison and #architecture-deep-dive', () => {
      expect(document.querySelector('#sdlc-comparison'), '#sdlc-comparison must not exist').toBeNull();
      expect(document.querySelector('#architecture-deep-dive'), '#architecture-deep-dive must not exist').toBeNull();
    });

    it('should guarantee unique IDs across all interactive elements', () => {
      const interactiveEls = document.querySelectorAll('a, button, input, select');
      const ids = new Set();
      interactiveEls.forEach(el => {
        const id = el.getAttribute('id');
        if (id) {
          expect(ids.has(id), `Duplicate ID found: ${id}`).toBe(false);
          ids.add(id);
        }
      });
    });

    it('should synchronize gh-pages README.md with root README.md', () => {
      const readmePath = path.join(ROOT_DIR, 'README.md');
      const readme = fs.readFileSync(readmePath, 'utf8');
      expect(readme).toContain('**Disciplined feature delivery for engineering teams.**');
      expect(readme).toContain('### Map vs. Spec');
      expect(readme).toContain('Phase exit / Boundary halt');
      expect(readme).toContain('View Boundary 1: Map Lifecycle Diagram');
      expect(readme).toContain('View Boundary 2: Spec & Ticket Definition Diagram');
      expect(readme).toContain('View Boundary 3: Ticket Loop & PR Close-Out Diagram');
      expect(readme).toContain('pragmatic, domain-aligned verification');
      expect(readme).toContain('ad-hoc test harness prohibition');
      expect(readme).toContain('Spec #34');
      expect(readme).toContain('Spec #36');
    });

    it('should exclude Mermaid diagram blocks from the marketing site application', () => {
      const htmlPath = path.join(ROOT_DIR, 'index.html');
      const html = fs.readFileSync(htmlPath, 'utf8');
      expect(html).not.toMatch(/mermaid/i);
    });
  });

  // =========================================================================
  // DOMAIN: Problem Statement & Navigation (#problem)
  // =========================================================================
  describe('Domain: Problem Statement & Navigation (#problem)', () => {
    it('should render a single h1 element preserving "driver\'s seat"', () => {
      const h1s = document.querySelectorAll('h1');
      expect(h1s.length).toBe(1);
      expect(h1s[0].textContent.replace(/\s+/g, ' ').trim()).toMatch(/driver's seat/i);
    });

    it('should render concise problem statement in #problem explaining unguided AI workflows, context degradation, and sprawling pull requests', () => {
      const problemSection = document.querySelector('#problem');
      expect(problemSection, '#problem section must exist').not.toBeNull();

      const text = problemSection.textContent;
      expect(text).toMatch(/unguided ai workflows/i);
      expect(text).toMatch(/context degradation/i);
      expect(text).toMatch(/sprawling pull requests/i);
    });

    it('should update smooth-scrolling navigation to target the three new section identifiers', () => {
      const scrollTargets = ['#problem', '#solution', '#getting-started'];
      scrollTargets.forEach(targetId => {
        const targetEl = document.querySelector(targetId);
        expect(targetEl, `Section with identifier ${targetId} must exist`).not.toBeNull();
      });

      window.scrollTo = vi.fn();

      const navLinks = document.querySelectorAll('a[href^="#"]');
      const validSectionLinks = Array.from(navLinks).filter(a => scrollTargets.includes(a.getAttribute('href')));
      expect(validSectionLinks.length).toBeGreaterThanOrEqual(3);

      validSectionLinks.forEach(link => {
        const href = link.getAttribute('href');
        const targetEl = document.querySelector(href);
        targetEl.getBoundingClientRect = () => ({ top: 300, bottom: 500, left: 0, right: 0, width: 800, height: 200 });
        link.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
        expect(window.scrollTo).toHaveBeenCalled();
      });
    });
  });

  // =========================================================================
  // DOMAIN: Interactive Flow Visualizer (#solution)
  // =========================================================================
  describe('Domain: Interactive Flow Visualizer (#solution)', () => {
    it('should mount FlowVisualizer inside #flow-visualizer-root within #solution', () => {
      const section = document.querySelector('#solution');
      expect(section, '#solution must exist').not.toBeNull();

      const root = section.querySelector('#flow-visualizer-root');
      expect(root, '#flow-visualizer-root must exist inside #solution').not.toBeNull();
      expect(root.children.length).toBeGreaterThan(0);
    });

    it('should render interactive step selectors for Boundary 1, Boundary 2, and Boundary 3 with accessible attributes and keyboard navigation', () => {
      const root = document.querySelector('#flow-visualizer-root');
      const tablist = root.querySelector('[role="tablist"]');
      expect(tablist, 'Flow selector tablist must exist').not.toBeNull();
      expect(tablist.getAttribute('aria-label')).toBe('Lifecycle Boundaries');

      const boundaryTabs = root.querySelectorAll('[role="tab"]');
      expect(boundaryTabs.length).toBe(3);

      const b1 = root.querySelector('#btn-boundary-1');
      const b2 = root.querySelector('#btn-boundary-2');
      const b3 = root.querySelector('#btn-boundary-3');

      expect(b1, 'Boundary 1 button must exist').not.toBeNull();
      expect(b2, 'Boundary 2 button must exist').not.toBeNull();
      expect(b3, 'Boundary 3 button must exist').not.toBeNull();

      expect(b1.textContent).toContain('Boundary 1');
      expect(b1.textContent).toContain('Mapping');
      expect(b2.textContent).toContain('Boundary 2');
      expect(b2.textContent).toContain('Definition');
      expect(b3.textContent).toContain('Boundary 3');
      expect(b3.textContent).toContain('Execution');

      // Boundary 1 is active by default
      expect(b1.getAttribute('aria-selected')).toBe('true');
      expect(b2.getAttribute('aria-selected')).toBe('false');
      expect(b3.getAttribute('aria-selected')).toBe('false');

      // Test keyboard navigation: ArrowRight from B1 moves to B2
      act(() => {
        b1.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      });
      expect(b2.getAttribute('aria-selected')).toBe('true');
      expect(b1.getAttribute('aria-selected')).toBe('false');

      // ArrowRight from B2 moves to B3
      act(() => {
        b2.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      });
      expect(b3.getAttribute('aria-selected')).toBe('true');

      // ArrowRight wraps to B1
      act(() => {
        b3.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      });
      expect(b1.getAttribute('aria-selected')).toBe('true');

      // ArrowLeft wraps to B3
      act(() => {
        b1.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      });
      expect(b3.getAttribute('aria-selected')).toBe('true');
    });

    it('should update the single inspection panel upon selecting any boundary step to display its Goal, Deliverables, and Exit Gate', () => {
      const root = document.querySelector('#flow-visualizer-root');
      const b1 = root.querySelector('#btn-boundary-1');
      const b2 = root.querySelector('#btn-boundary-2');
      const b3 = root.querySelector('#btn-boundary-3');
      const inspector = root.querySelector('#flow-visualizer-inspector');

      expect(inspector, 'Single inspection panel #flow-visualizer-inspector must exist').not.toBeNull();
      expect(inspector.getAttribute('role')).toBe('tabpanel');

      // --- Boundary 1: Mapping ---
      act(() => {
        b1.click();
      });
      expect(b1.getAttribute('aria-selected')).toBe('true');
      const textB1 = inspector.textContent;
      expect(textB1).toContain('Goal');
      expect(textB1).toContain('Deliverables');
      expect(textB1).toContain('Exit Gate');
      expect(textB1).toMatch(/architectural fog/i);
      expect(textB1).toMatch(/decision tickets/i);
      expect(textB1).toMatch(/decisions settle/i);

      // --- Boundary 2: Definition ---
      act(() => {
        b2.click();
      });
      expect(b2.getAttribute('aria-selected')).toBe('true');
      const textB2 = inspector.textContent;
      expect(textB2).toContain('Goal');
      expect(textB2).toContain('Deliverables');
      expect(textB2).toContain('Exit Gate');
      expect(textB2).toMatch(/specifications/i);
      expect(textB2).toMatch(/tracer-bullet tickets/i);
      expect(textB2).toMatch(/fresh context/i);
      expect(textB2).toMatch(/approval/i);

      // --- Boundary 3: Execution ---
      act(() => {
        b3.click();
      });
      expect(b3.getAttribute('aria-selected')).toBe('true');
      const textB3 = inspector.textContent;
      expect(textB3).toContain('Goal');
      expect(textB3).toContain('Deliverables');
      expect(textB3).toContain('Exit Gate');
      expect(textB3).toMatch(/fixed points/i);
      expect(textB3).toMatch(/two-axis reviews/i);
      expect(textB3).toMatch(/pull request close-out/i);
    });

    it('should confirm the absence of nested sub-cards, modal pills, and secondary steppers', () => {
      const root = document.querySelector('#flow-visualizer-root');

      // Purged elements
      const subCards = root.querySelectorAll('[data-decision-ticket], .decision-subcard, .decision-subcards-bar');
      expect(subCards.length).toBe(0);

      const modalPills = root.querySelectorAll('.modal-pill, .status-pill');
      expect(modalPills.length).toBe(0);

      const secondarySteppers = root.querySelectorAll('.flow-stepper-track, [data-stepper-stage]');
      expect(secondarySteppers.length).toBe(0);
    });
  });

  // =========================================================================
  // DOMAIN: Obsolete Sections Removal (#sdlc-comparison, #architecture-deep-dive, terminal simulator)
  // =========================================================================
  describe('Domain: Obsolete Sections Removal', () => {
    it('should assert the complete absence of #sdlc-comparison in DOM and styles', () => {
      const comparisonSection = document.querySelector('#sdlc-comparison');
      expect(comparisonSection, '#sdlc-comparison must not exist in DOM').toBeNull();

      const bentoCards = document.querySelectorAll('.bento-value-card, .bento-value-grid');
      expect(bentoCards.length).toBe(0);

      const cssPath = path.join(ROOT_DIR, 'src/styles/main.css');
      const css = fs.readFileSync(cssPath, 'utf8');
      expect(css).not.toContain('.sdlc-comparison-section');
      expect(css).not.toContain('.bento-value-grid');
      expect(css).not.toContain('.bento-value-card');
    });

    it('should assert the complete absence of #architecture-deep-dive in DOM and styles', () => {
      const deepDiveSection = document.querySelector('#architecture-deep-dive');
      expect(deepDiveSection, '#architecture-deep-dive must not exist in DOM').toBeNull();

      const deepDiveCards = document.querySelectorAll('.deep-dive-card, .deep-dive-grid');
      expect(deepDiveCards.length).toBe(0);

      const cssPath = path.join(ROOT_DIR, 'src/styles/main.css');
      const css = fs.readFileSync(cssPath, 'utf8');
      expect(css).not.toContain('.architecture-deep-dive-section');
      expect(css).not.toContain('.deep-dive-grid');
      expect(css).not.toContain('.deep-dive-card');
    });

    it('should assert the complete absence of the interactive terminal simulator in DOM, styles, and scripts', () => {
      const terminalEl = document.querySelector('#terminal-interactive, #terminal-quickstart, #terminal-screen');
      expect(terminalEl, 'Terminal simulator elements must not exist in DOM').toBeNull();

      const simButtons = document.querySelectorAll('button[data-sim-step], .terminal-sim-tabs');
      expect(simButtons.length).toBe(0);

      const cssPath = path.join(ROOT_DIR, 'src/styles/main.css');
      const css = fs.readFileSync(cssPath, 'utf8');
      expect(css).not.toContain('.terminal-interactive-wrapper');
      expect(css).not.toContain('.terminal-sim-tabs');
      expect(css).not.toContain('.sim-tab-btn');

      const scriptPath = path.join(ROOT_DIR, 'src/main.jsx');
      const script = fs.readFileSync(scriptPath, 'utf8');
      expect(script).not.toContain('initCliTerminalSimulation');
      expect(script).not.toContain('SIM_CONTENT');
    });

    it('should confirm no markup, styles, or scripts from obsolete comparison, deep-dive, or terminal simulator remain in active codebase', () => {
      const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
      const mainCss = fs.readFileSync(path.join(ROOT_DIR, 'src/styles/main.css'), 'utf8');
      const mainJsx = fs.readFileSync(path.join(ROOT_DIR, 'src/main.jsx'), 'utf8');

      const obsoletePatterns = [
        'sdlc-comparison',
        'bento-value',
        'architecture-deep-dive',
        'deep-dive-grid',
        'deep-dive-card',
        'terminal-interactive',
        'terminal-sim',
        'initCliTerminalSimulation',
      ];

      for (const pattern of obsoletePatterns) {
        expect(indexHtml, `index.html should not contain ${pattern}`).not.toContain(pattern);
        expect(mainCss, `main.css should not contain ${pattern}`).not.toContain(pattern);
        expect(mainJsx, `main.jsx should not contain ${pattern}`).not.toContain(pattern);
      }
    });
  });

  // =========================================================================
  // DOMAIN: Getting Started & Installation (#getting-started)
  // =========================================================================
  describe('Domain: Getting Started & Installation (#getting-started)', () => {
    it('should render minimal installation and usage instructions in #getting-started alongside copyable install command', () => {
      const gettingStarted = document.querySelector('#getting-started');
      expect(gettingStarted, '#getting-started section must exist').not.toBeNull();

      const installCommand = gettingStarted.querySelector('#cmd-install');
      expect(installCommand, '#cmd-install must exist inside #getting-started').not.toBeNull();
      expect(installCommand.textContent.trim()).toBe('npx skills install awhipp/ship-it');

      const copyBtn = gettingStarted.querySelector('#btn-copy-install');
      expect(copyBtn, '#btn-copy-install must exist inside #getting-started').not.toBeNull();

      const text = gettingStarted.textContent;
      expect(text).toMatch(/npx skills install awhipp\/ship-it/);
      expect(text).toMatch(/\/ship-it/);
    });

    it('should copy the install command to the clipboard and display visual feedback', async () => {
      const copyBtn = document.querySelector('#btn-copy-install');
      const installCmd = document.querySelector('#cmd-install');
      expect(copyBtn, '#btn-copy-install must exist').not.toBeNull();
      expect(installCmd, '#cmd-install must exist').not.toBeNull();

      let copiedText = '';
      navigator.clipboard.writeText = vi.fn(async (text) => {
        copiedText = text;
      });

      await act(async () => {
        copyBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(installCmd.textContent.trim());
      expect(copiedText).toBe('npx skills install awhipp/ship-it');
      expect(copyBtn.classList.contains('copied')).toBe(true);
    });
  });

  // =========================================================================
  // DOMAIN: Design System & Responsive Layout
  // =========================================================================
  describe('Domain: Design System & Responsive Layout', () => {
    it('should define core design system tokens and dark mode palette in CSS', () => {
      const cssPath = path.join(ROOT_DIR, 'src/styles/main.css');
      expect(fs.existsSync(cssPath), 'src/styles/main.css must exist').toBe(true);

      const css = fs.readFileSync(cssPath, 'utf8');
      expect(css).toContain('--bg-primary');
      expect(css).toContain('--text-primary');
      expect(css).toContain('--accent-gradient');
      expect(css).toContain('.problem-section');
      expect(css).toContain('.solution-section');
      expect(css).toContain('.getting-started-section');
    });

    it('should define responsive media queries for tablet and mobile viewports', () => {
      const cssPath = path.join(ROOT_DIR, 'src/styles/main.css');
      const css = fs.readFileSync(cssPath, 'utf8');

      expect(css).toMatch(/@media[^{]*max-width:\s*768px/i);
      expect(css).toMatch(/@media[^{]*max-width:\s*400px/i);
    });
  });

  // =========================================================================
  // DOMAIN: Production Distribution Bundle
  // =========================================================================
  describe('Domain: Production Distribution Bundle', () => {
    it('should generate dist/index.html with relative asset references and no broken root-relative paths', () => {
      const distHtmlPath = path.join(ROOT_DIR, 'dist/index.html');
      expect(fs.existsSync(distHtmlPath), 'dist/index.html must exist').toBe(true);

      const html = fs.readFileSync(distHtmlPath, 'utf8');
      expect(html).toContain('src="./assets/');
      expect(html).toContain('href="./assets/');
      expect(html).not.toMatch(/src="\/assets\//);
      expect(html).not.toMatch(/href="\/assets\//);
    });

    it('should retain all core domain sections in the production distribution build and exclude obsolete sections', () => {
      const distHtmlPath = path.join(ROOT_DIR, 'dist/index.html');
      const html = fs.readFileSync(distHtmlPath, 'utf8');

      expect(html).toContain('id="problem"');
      expect(html).toContain('id="solution"');
      expect(html).toContain('id="getting-started"');
      expect(html).not.toContain('id="sdlc-comparison"');
      expect(html).not.toContain('id="architecture-deep-dive"');
      expect(html).not.toContain('id="terminal-interactive"');
    });
  });
});
