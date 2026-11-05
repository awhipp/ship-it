import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { act } from 'react';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { JSDOM } from 'jsdom';

const ROOT_DIR = path.resolve(__dirname, '..');

describe('Marketing Site Architecture & Shell', () => {
  let dom;
  let document;
  let window;
  let mainModule;
  let mockClipboard;

  const setupDomEnvironment = async (storedTheme = null) => {
    const htmlPath = path.join(ROOT_DIR, 'index.html');
    expect(fs.existsSync(htmlPath), 'index.html must exist').toBe(true);
    const html = fs.readFileSync(htmlPath, 'utf8');

    dom = new JSDOM(html, { url: 'http://localhost:3000/' });
    document = dom.window.document;
    window = dom.window;

    globalThis.window = window;
    globalThis.document = document;

    mockClipboard = {
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

    if (storedTheme) {
      window.localStorage.setItem('ship-it-theme', storedTheme);
    } else {
      window.localStorage.clear();
    }

    globalThis.HTMLElement = window.HTMLElement;
    globalThis.Element = window.Element;
    globalThis.Node = window.Node;
    globalThis.Event = window.Event;
    globalThis.MouseEvent = window.MouseEvent;
    globalThis.KeyboardEvent = window.KeyboardEvent;
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;

    const distHtmlPath = path.join(ROOT_DIR, 'dist/index.html');
    if (!fs.existsSync(distHtmlPath)) {
      const { execSync } = await import('node:child_process');
      execSync('npx vite build', { cwd: ROOT_DIR, stdio: 'ignore' });
    }

    mainModule = await import('../src/main.jsx');
    if (typeof mainModule.initMarketingApp === 'function') {
      await mainModule.initMarketingApp(document, window);
    }
  };

  beforeAll(async () => {
    await setupDomEnvironment();
  });

  // =========================================================================
  // DOMAIN: Infrastructure & Tooling Pipeline
  // =========================================================================
  describe('Domain: Infrastructure & Tooling Pipeline', () => {
    it('should configure package.json with React 19, Tailwind CSS, PostCSS, and Autoprefixer without Mermaid', () => {
      const pkgPath = path.join(ROOT_DIR, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

      expect(pkg.dependencies?.react).toBe('^19.0.0');
      expect(pkg.dependencies?.['react-dom']).toBe('^19.0.0');
      expect(pkg.devDependencies?.['@vitejs/plugin-react']).toBe('^4.3.4');
      expect(pkg.devDependencies?.tailwindcss).toBeDefined();
      expect(pkg.devDependencies?.postcss).toBeDefined();
      expect(pkg.devDependencies?.autoprefixer).toBeDefined();
      expect(pkg.dependencies?.mermaid).toBeUndefined();
      expect(pkg.devDependencies?.mermaid).toBeUndefined();
    });

    it('should configure PostCSS with tailwindcss and autoprefixer plugins', async () => {
      const postcssPath = path.join(ROOT_DIR, 'postcss.config.js');
      expect(fs.existsSync(postcssPath), 'postcss.config.js must exist').toBe(true);

      const postcssModule = await import(postcssPath);
      const config = postcssModule.default;
      expect(config.plugins).toBeDefined();
      expect(config.plugins.tailwindcss).toBeDefined();
      expect(config.plugins.autoprefixer).toBeDefined();
    });

    it('should configure Tailwind CSS with class dark mode and content scan paths', async () => {
      const tailwindPath = path.join(ROOT_DIR, 'tailwind.config.js');
      expect(fs.existsSync(tailwindPath), 'tailwind.config.js must exist').toBe(true);

      const tailwindModule = await import(tailwindPath);
      const config = tailwindModule.default;
      expect(config.darkMode).toBe('class');
      expect(Array.isArray(config.content)).toBe(true);
      expect(config.content.some((p) => p.includes('index.html'))).toBe(true);
      expect(config.content.some((p) => p.includes('src'))).toBe(true);
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

      expect(doc.on.push.branches).toContain('gh-pages');
      expect(doc.permissions.pages).toBe('write');
      expect(doc.permissions['id-token']).toBe('write');

      const steps = doc.jobs.deploy.steps.map((s) => s.run || s.uses);
      expect(steps.some((s) => s && s.includes('npm run build'))).toBe(true);
      expect(steps.some((s) => s && s.includes('actions/deploy-pages'))).toBe(true);
    });
  });

  // =========================================================================
  // DOMAIN: Document Shell & Metadata (index.html)
  // =========================================================================
  describe('Domain: Document Shell & Metadata (index.html)', () => {
    it('should contain developer-focused page title, SEO meta tags, Open Graph, and Twitter metadata', () => {
      expect(document.title).toBe('ship-it | Structured Lifecycle Automation for Software Teams');
      const metaDesc = document.querySelector('meta[name="description"]');
      expect(metaDesc).not.toBeNull();
      expect(metaDesc.getAttribute('content').length).toBeGreaterThan(20);

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

    it('should configure Google Fonts preconnect and stylesheet links for Plus Jakarta Sans and JetBrains Mono', () => {
      const fontLink = document.querySelector('link[rel="stylesheet"][href*="fonts.googleapis.com"]');
      expect(fontLink, 'Google Fonts stylesheet must be linked').not.toBeNull();
      const href = fontLink.getAttribute('href');
      expect(href).toContain('JetBrains+Mono');
      expect(href).toContain('Plus+Jakarta+Sans');
    });

    it('should host clean container #root and exclude legacy static HTML sections from index.html', () => {
      const htmlPath = path.join(ROOT_DIR, 'index.html');
      const rawHtml = fs.readFileSync(htmlPath, 'utf8');

      expect(rawHtml).toContain('<div id="root"></div>');
      expect(rawHtml).not.toContain('<section class="problem-section"');
      expect(rawHtml).not.toContain('<section class="solution-section"');
      expect(rawHtml).not.toContain('<section class="getting-started-section"');
      expect(rawHtml).not.toContain('id="flow-visualizer-root"');
    });
  });

  // =========================================================================
  // DOMAIN: Application Shell & Root Mounting
  // =========================================================================
  describe('Domain: Application Shell & Root Mounting', () => {
    it('should mount the React 19 application into container #root via initMarketingApp', () => {
      const rootEl = document.getElementById('root');
      expect(rootEl, '#root container must exist').not.toBeNull();
      expect(rootEl.children.length).toBeGreaterThan(0);
      expect(rootEl.dataset.mounted).toBe('true');
    });

    it('should structure content within semantic header, main, and footer landmarks', () => {
      const header = document.querySelector('header.site-header');
      const main = document.querySelector('main#main-content');
      const footer = document.querySelector('footer.site-footer');

      expect(header, 'header.site-header landmark must exist').not.toBeNull();
      expect(main, 'main#main-content landmark must exist').not.toBeNull();
      expect(footer, 'footer.site-footer landmark must exist').not.toBeNull();
    });

    it('should guarantee unique IDs across all interactive elements', () => {
      const interactiveEls = document.querySelectorAll('a, button, input, select');
      const ids = new Set();
      interactiveEls.forEach((el) => {
        const id = el.getAttribute('id');
        if (id) {
          expect(ids.has(id), `Duplicate ID found: ${id}`).toBe(false);
          ids.add(id);
        }
      });
    });
  });

  // =========================================================================
  // DOMAIN: Theme System & Dual-Theme Persistence
  // =========================================================================
  describe('Domain: Theme System & Dual-Theme Persistence', () => {
    it('should initialize ThemeMode to "light" by default when localStorage has no stored preference', async () => {
      const { getStoredTheme, applyTheme } = await import('../src/components/ThemeToggle.jsx');
      window.localStorage.clear();

      const theme = getStoredTheme();
      expect(theme).toBe('light');

      applyTheme(theme);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should initialize ThemeMode to "light" when localStorage throws a SecurityError', async () => {
      const { getStoredTheme } = await import('../src/components/ThemeToggle.jsx');

      const originalGetItem = window.localStorage.getItem;
      window.localStorage.getItem = () => {
        throw new DOMException('Access denied', 'SecurityError');
      };

      try {
        const theme = getStoredTheme();
        expect(theme).toBe('light');
      } finally {
        window.localStorage.getItem = originalGetItem;
      }
    });

    it('should toggle the "dark" class on document.documentElement and persist to localStorage when clicking ThemeToggle', async () => {
      const themeToggleBtn = document.getElementById('theme-toggle-btn');
      expect(themeToggleBtn, '#theme-toggle-btn must exist in DOM').not.toBeNull();

      // Ensure starting in light mode
      window.localStorage.removeItem('ship-it-theme');
      document.documentElement.classList.remove('dark');

      // Click to toggle to dark
      await act(async () => {
        themeToggleBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
      });

      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(window.localStorage.getItem('ship-it-theme')).toBe('dark');

      // Click to toggle back to light
      await act(async () => {
        themeToggleBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
      });

      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(window.localStorage.getItem('ship-it-theme')).toBe('light');
    });

    it('should read stored "dark" preference when initialized with persisted theme', async () => {
      const { getStoredTheme, applyTheme } = await import('../src/components/ThemeToggle.jsx');
      window.localStorage.setItem('ship-it-theme', 'dark');

      const theme = getStoredTheme();
      expect(theme).toBe('dark');

      applyTheme(theme);
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      // Clean up back to light
      applyTheme('light');
      window.localStorage.removeItem('ship-it-theme');
    });
  });

  // =========================================================================
  // DOMAIN: Navigation Landmark (Navbar)
  // =========================================================================
  describe('Domain: Navigation Landmark (Navbar)', () => {
    it('should render the brand logo and GitHub repository link inside the <nav> landmark of Navbar', () => {
      const nav = document.querySelector('header.site-header nav');
      expect(nav, '<nav> landmark must exist inside header').not.toBeNull();

      const brandLogo = nav.querySelector('#brand-logo-link');
      expect(brandLogo, 'Brand logo link must exist inside <nav>').not.toBeNull();
      expect(brandLogo.querySelector('.brand-icon'), 'Brand icon must exist').not.toBeNull();
      expect(brandLogo.querySelector('.brand-text')?.textContent.trim()).toBe('ship-it');

      const ghLink = nav.querySelector('#nav-github-link');
      expect(ghLink, 'Repository link must exist inside <nav>').not.toBeNull();
      expect(ghLink.getAttribute('href')).toBe('https://github.com/awhipp/ship-it');
      expect(ghLink.getAttribute('target')).toBe('_blank');
      expect(ghLink.getAttribute('rel')).toContain('noopener');
      expect(ghLink.getAttribute('rel')).toContain('noreferrer');
    });

    it('should render the theme toggle button inside the <nav> landmark', () => {
      const nav = document.querySelector('header.site-header nav');
      const toggle = nav.querySelector('#theme-toggle-btn');
      expect(toggle, '#theme-toggle-btn must exist inside <nav>').not.toBeNull();
    });
  });

  // =========================================================================
  // DOMAIN: Hero Presentation & Clipboard Copy (Hero)
  // =========================================================================
  describe('Domain: Hero Presentation & Clipboard Copy (Hero)', () => {
    it('should render the hero section within <section id="hero"> with headline and value proposition', () => {
      const hero = document.querySelector('section#hero.hero-section');
      expect(hero, 'section#hero.hero-section must exist').not.toBeNull();

      const h1 = hero.querySelector('h1#hero-title');
      expect(h1, 'h1#hero-title must exist inside hero').not.toBeNull();
      expect(h1.textContent).toMatch(/driver's seat/i);

      const valueProp = hero.textContent;
      expect(valueProp).toMatch(/structured lifecycle automation/i);
    });

    it('should render the install command "npx skills install awhipp/ship-it" inside hero', () => {
      const cmdEl = document.querySelector('#hero #cmd-install');
      expect(cmdEl, '#cmd-install must exist inside hero').not.toBeNull();
      expect(cmdEl.textContent.trim()).toBe('npx skills install awhipp/ship-it');
    });

    it('should copy the install command to the clipboard and display visual feedback', async () => {
      const copyBtn = document.querySelector('#hero #btn-copy-install');
      const cmdEl = document.querySelector('#hero #cmd-install');
      expect(copyBtn, '#btn-copy-install must exist inside hero').not.toBeNull();

      let copiedText = '';
      navigator.clipboard.writeText = vi.fn(async (text) => {
        copiedText = text;
      });

      await act(async () => {
        copyBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(cmdEl.textContent.trim());
      expect(copiedText).toBe('npx skills install awhipp/ship-it');
      expect(copyBtn.classList.contains('copied')).toBe(true);
      expect(copyBtn.querySelector('.copy-text')?.textContent.trim()).toBe('Copied!');
    });

    it('should catch clipboard write failures gracefully without unhandled runtime exceptions', async () => {
      const copyBtn = document.querySelector('#hero #btn-copy-install');
      expect(copyBtn).not.toBeNull();

      navigator.clipboard.writeText = vi.fn().mockRejectedValue(new Error('Clipboard permission denied'));

      // Clicking must not throw an unhandled exception
      await expect(
        act(async () => {
          copyBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
        })
      ).resolves.not.toThrow();
    });
  });

  // =========================================================================
  // DOMAIN: Footer Landmarks & Metadata (Footer)
  // =========================================================================
  describe('Domain: Footer Landmarks & Metadata (Footer)', () => {
    it('should render repository links, GitHub Issues link, MIT license link, and attribution inside the <footer> landmark', () => {
      const footer = document.querySelector('footer.site-footer');
      expect(footer, 'footer.site-footer must exist').not.toBeNull();

      const ghLink = footer.querySelector('#footer-link-github');
      expect(ghLink, '#footer-link-github must exist').not.toBeNull();
      expect(ghLink.getAttribute('href')).toBe('https://github.com/awhipp/ship-it');

      const issuesLink = footer.querySelector('#footer-link-issues');
      expect(issuesLink, '#footer-link-issues must exist').not.toBeNull();
      expect(issuesLink.getAttribute('href')).toBe('https://github.com/awhipp/ship-it/issues');

      const licenseLink = footer.querySelector('#footer-link-license');
      expect(licenseLink, '#footer-link-license must exist').not.toBeNull();
      expect(licenseLink.getAttribute('href')).toBe('https://github.com/awhipp/ship-it/blob/main/LICENSE');

      const attribution = footer.querySelector('.footer-attribution');
      expect(attribution, '.footer-attribution must exist').not.toBeNull();
      expect(attribution.textContent).toContain('2026 ship-it');
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

    it('should contain the application mount root #root in dist/index.html and exclude legacy static content', () => {
      const distHtmlPath = path.join(ROOT_DIR, 'dist/index.html');
      const html = fs.readFileSync(distHtmlPath, 'utf8');

      expect(html).toContain('id="root"');
      expect(html).not.toContain('id="problem"');
      expect(html).not.toContain('id="solution"');
      expect(html).not.toContain('id="getting-started"');
      expect(html).not.toContain('id="sdlc-comparison"');
      expect(html).not.toContain('id="architecture-deep-dive"');
      expect(html).not.toContain('id="terminal-interactive"');
    });
  });
});
