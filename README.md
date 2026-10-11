# The Adventure Book — Evergrove

Independent animated family-adventure-game prototype. **No ANEVUM or RHEN application code or infrastructure is shared.** The intended address is `adventurebook.anevum.com`, pending Cloudflare setup.

## Status — v0.2, public source / local-save demo

- Interactive 2.5D-style homebase with animation, weather-like ambient particles, day/night lighting and tap-to-walk adventurer.
- Working quest board, completion rewards, family XP and level, Adventure Tokens, scrapbook Chronicle, calendar, and customizable demonstration profiles.
- Responsive layout with mobile navigation; PWA shell and optional sounds.
- **Not yet deployed to Cloudflare.**
- **No family accounts, invitations, shared game state, private media storage, photo backups, or cloud sync.** Saves are local to each browser and can disappear when browser data is cleared.

The public GitHub repository contains **only demonstration source code**. No passwords, API keys, real family photos, private contacts, or personal records should be committed. Public source code does **not** imply that the future family application must be public.

## Cloudflare Pages setup

- Connect this repo: `anevum/family-adventure-book`
- Production branch: `main`
- Framework preset: **None**
- Root directory: repository root
- Build command: blank
- Build output directory: `public`
- Custom domain (after initial Pages deployment): `adventurebook.anevum.com`

Publishing `main` after Git integration is configured can deploy automatically; Cloudflare plan limits still apply. The `public` directory is intentionally the only static deployment output.

The prototype is **not a private family portal**. `robots.txt` and `noindex` discourage search engines; they are NOT authentication. Do not upload actual family memories until server-side authentication, per-family data isolation, protected media storage and backups are implemented. See `docs/SECURITY.md`.

## Continuing development

- `public/index.html`: markup, world SVG
- `public/assets/style.css`: layout and animation
- `public/assets/app.js`: prototype interactions, local save
- `docs/`: game design and production planning
- `tests/`: source checks

The repository is public but has **no open-source license granted** at this stage. No connection to ANEVUM's production repositories is required.
