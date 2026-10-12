# Evergrove — ANEVUM first creator showcase candidate

Session: ANEVUM.WEB.BUILD.2026-10-12.006.EVERGROVE-PUBLIC-SHOWCASE
Status: source and CI candidate; not deployed, licensed, or submitted to the ANEVUM community.

## Why this project
The existing Evergrove prototype contains a hand-crafted walkable storybook world, illustrated homebase, quests, XP, tokens, badges, sample Chronicle, calendar, and mobile controls. Reuse it rather than starting another game. The private family-app roadmap and its personal media requirements stay separate.

## Build and inspect
Run `node tests/check-release.mjs` to validate the original family prototype.
Run `node tests/check-showcase.mjs` to build and validate the public-safe `dist-showcase/` directory.
Run `node scripts/build-showcase.mjs` for a fresh standalone static build; open it through a local static web server for proper script loading. The GitHub Actions source-smoke job also attaches a downloadable, unhosted `evergrove-anevum-showcase` build artifact for owner review.

The original `public/` directory remains unchanged. Never point an unauthorized Cloudflare or ANEVUM production release at that personal-demo output.

## Public-demo privacy and gameplay
- Only imaginary adventurers and fictional example quests/memories are seeded. Users may move through the world, view existing stories, navigate quests and calendars, finish sample quests, earn fictional XP and badges, toggle light/sound, and reset their progress.
- Session state uses a dedicated `sessionStorage` key. It cannot access the family prototype's `localStorage` namespace; no server stores this progress. Browser-tab restore can retain session state, so Reset remains available.
- New personal quests, memories, photo uploads, names/crew editing, calendar-event creation and downloaded family backups are blocked in the generated application. Quest completion shows a generated, data-free form.
- No PWA installation or service worker in the showcase build. No analytics, accounts, remote data fetching, real family photographs or third-party media.
- Security headers include noindex, no outbound connections, no forms, no framing, and no unsafe external resources. All content is public static files. This is not a private family portal.
- A visible ANEVUM banner distinguishes the playable mock data from the real Creator V1 platform, with a plain link back to anevum.com.

## Project submission
`showcase/anevum-submission-draft.json` is a nonpublishing manifest for the Creator V1 project-draft flow: title, slug, description, category games, source URL, free-to-play scope. Its `demoUrl`, `license`, AI contribution and human contribution values intentionally remain unset.

Public GitHub source **does not imply an open-source license or permission to reuse it**. The repository has no open-source license. Free-to-play does not establish code licensing. Owner must approve copyright/licensing, disclosures, screenshots and demo host before any real submission or publication.

## Release gates and owner decisions
1. Exact-head GitHub source build and privacy tests pass. Cloudflare automatic preview build is currently not set up; failure there does not mean GitHub source tests failed.
2. Review actual mobile 320/390 and desktop 1024/1440 interaction, contrast/keyboard focus, reduced motion, reset, and quest completion. CI source assertions do not prove visual acceptance.
3. Confirm brand naming, demo artwork ownership and audience/age/privacy guidelines. No false claim that private family accounts or cloud sync exist.
4. Owner approves license/copyright wording and accurate AI/human contribution disclosure.
5. Only then configure a protected review preview, approve a public demo address and use an authenticated creator account to create a genuine draft. Use Studio review before public publishing; stage member A/staff/member B privacy acceptance remains independent.

References: https://github.com/anevum/anevum-web/issues/325 (V1 engineering), https://github.com/anevum/anevum-web/issues/329 (publishing), https://github.com/anevum/anevum-web/pull/339 (current creator-platform source).

V5/RHEN historical archive and ANEVUM production database are not part of this repo or this release candidate.

## Local browser regression evidence
A dedicated CI browser job uses headless Chromium to render the isolated generated output at 390px and 1440px. It captures original world and sample-quest screenshots, checks no horizontal overflow, confirms personal-memory forms stay blocked, completes a fictional quest, validates session-only XP and private storage isolation, and fails on browser exceptions or external network requests. CI screenshots are owner-review evidence, **not** a substitute for human mobile/desktop approval or trademark/licensing sign-off. The branch's source CI runs once per PR update rather than duplicating push and PR jobs to conserve compute.
