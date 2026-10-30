# The Adventure Book — Evergrove

Independent animated family-adventure-game prototype. The project has its own source repository and an existing Cloudflare Worker. Public availability and intended address require verification.

## Status — v0.2, public source / local-save demo

- Interactive 2.5D-style homebase with animation, weather-like ambient particles, day/night lighting and tap-to-walk adventurer.
- Working quest board, completion rewards, family XP and level, Adventure Tokens, scrapbook Chronicle, calendar, and customizable demonstration profiles.
- Responsive layout with mobile navigation; PWA shell and optional sounds.
- The `family-adventure-book` Cloudflare Worker has an active deployment from this repository's `main` branch. Its intended route, access policy, asset-by-asset parity and rollback procedure remain unverified.
- **No family accounts, invitations, shared game state, private media storage, photo backups, or cloud sync.** Saves are local to each browser and can disappear when browser data is cleared.

The public GitHub repository contains **only demonstration source code**. No passwords, API keys, real family photos, private contacts, or personal records should be committed. Public source code does **not** imply that the future family application must be public.

## Existing Cloudflare release path

Cloudflare Builds is connected to this repository and deploys changes from `main` to the existing `family-adventure-book` Worker using `npx wrangler deploy`. The build's existing watch-path configuration excludes root `README.md` changes. Other matching changes may deploy automatically, independently of the repository's GitHub Actions checks. Do not connect a second deployment mechanism or assume a successful test alone gates release.

The current build resolves Wrangler at build time and generates its configuration during deployment. The tool version, credential scope, route/access policy and rollback procedure need review. Track this work in [issue #11](https://github.com/anevum/family-adventure-book/issues/11).

The prototype is **not a private family portal**. `robots.txt` and `noindex` discourage search engines; they are NOT authentication. Do not upload actual family memories until server-side authentication, per-family data isolation, protected media storage and backups are implemented. See `docs/SECURITY.md`.

## Continuing development

- `public/index.html`: markup, world SVG
- `public/assets/style.css`: layout and animation
- `public/assets/app.js`: prototype interactions, local save
- `docs/`: game design and production planning
- `tests/`: source checks

The source in this repository is available under the [Apache License 2.0](LICENSE). Names and branding are not licensed as trademarks. No connection to ANEVUM's production repositories is required.
