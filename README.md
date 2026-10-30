# The Adventure Book — Evergrove

Independent animated family-adventure-game prototype. The project has its own source repository; its production hosting and intended address still require verification.

## Status — v0.2, public source / local-save demo

- Interactive 2.5D-style homebase with animation, weather-like ambient particles, day/night lighting and tap-to-walk adventurer.
- Working quest board, completion rewards, family XP and level, Adventure Tokens, scrapbook Chronicle, calendar, and customizable demonstration profiles.
- Responsive layout with mobile navigation; PWA shell and optional sounds.
- A Cloudflare Worker named `family-adventure-book` exists with an active deployment. Its source revision, intended route, access policy, and relationship to this repository have not been verified.
- **No family accounts, invitations, shared game state, private media storage, photo backups, or cloud sync.** Saves are local to each browser and can disappear when browser data is cleared.

The public GitHub repository contains **only demonstration source code**. No passwords, API keys, real family photos, private contacts, or personal records should be committed. Public source code does **not** imply that the future family application must be public.

## Proposed Cloudflare Pages setup

- Connect this repo: `anevum/family-adventure-book`
- Production branch: `main`
- Framework preset: **None**
- Root directory: repository root
- Build command: blank
- Build output directory: `public`
- Custom domain (after initial Pages deployment): `adventurebook.anevum.com`

These are proposed settings, not evidence of a connected deployment. Before connecting Git or changing a route, identify the existing Worker's source, route, access policy, release owner, and rollback path. Avoid enabling competing deployers. The `public` directory is the intended static output.

The prototype is **not a private family portal**. `robots.txt` and `noindex` discourage search engines; they are NOT authentication. Do not upload actual family memories until server-side authentication, per-family data isolation, protected media storage and backups are implemented. See `docs/SECURITY.md`.

## Continuing development

- `public/index.html`: markup, world SVG
- `public/assets/style.css`: layout and animation
- `public/assets/app.js`: prototype interactions, local save
- `docs/`: game design and production planning
- `tests/`: source checks

The source in this repository is available under the [Apache License 2.0](LICENSE). Names and branding are not licensed as trademarks. No connection to ANEVUM's production repositories is required.
