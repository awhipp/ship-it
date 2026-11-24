# ship-it marketing site

Source for https://awhipp.github.io/ship-it/ (Vite, React 19, Tailwind CSS).

The skill itself, its docs, and releases live on [`main`](https://github.com/awhipp/ship-it). This branch only holds the site.

## Develop

```bash
npm ci
npm run dev      # http://localhost:3000
npm test         # vitest; builds dist/ first if missing
npm run build    # outputs dist/
```

## Deploy

Pushing to `gh-pages` runs `.github/workflows/deploy.yml`, which builds and publishes `dist/` to GitHub Pages.

## Keeping it accurate

- Copy must match `main`'s README and `skills/ship-it/SKILL.md`: install command, directives, prerequisites, phases, gates.
- The release badge is live (shields.io), so no version bump is needed per release.
- `public/og-image.png` is rendered from `og/og-image.svg`. Re-render after editing the SVG:
  `chrome --headless=new --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 --screenshot=public/og-image.png file:///<repo>/og/og-image.svg`
