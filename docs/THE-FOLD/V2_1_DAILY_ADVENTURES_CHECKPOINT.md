# THE FOLD — V2.1 Daily Adventure Milestone

**Session:** ANEVUM.WEB.BUILD.2026-10-13.002.THE-FOLD-DAILY-ADVENTURES  
**Date:** October 13, 2026  
**Source:** draft [PR #7](https://github.com/anevum/family-adventure-book/pull/7) and [issue #6](https://github.com/anevum/family-adventure-book/issues/6).  
**Art direction:** The Living Atlas V2 is accepted by the owner as a **baseline for continued development**, not as final/unchangeable art or a public-release signoff.

## What changed
- Preserved the existing full-viewport, responsive illustrated world, custom 20-glyph sprite, sculpted HUD, game navigation and warm Adventure Book.
- Expanded the **Adventure Board** into an interactive **Today / Starter** switch while keeping the original seven once-only first chapters.
- Added three daily self-reported expeditions: **A Small Spark** (+20 XP), **A Shared Moment** (+25 XP), and **Follow Your Curiosity** (+25 XP). Each is a genuine activity prompt with two explicit checkboxes. Maximum normal daily awards: **70 local XP**. The activity can take place at home; GPS is not required.
- Once-per-template-per-local-day recording, so repeated clicks or reloads cannot grant duplicate daily rewards. Device-local clock and storage can be changed by the player; **none of this is secure or verified server XP**.
- Same Adventure Book for daily and starter activities, including optional editable notes, page controls (12 entries per page), full save export and reset. Notes and earned progress remain device-local.
- Additive compatible save-schema extension: existing `version:1` saves still load; new fields are `runs` and `dailySteps`. Daily log has an explicit **5,000-entry prototype ceiling**; it is not suitable as an unlimited production archive.
- Next-adventure HUD picks the remaining starter quest, then an available daily expedition, then the Adventure Book. Player progress includes daily totals and today's completions.

## Verification
- Source/game-rule tests cover starter progression, legacy save migration, daily rollover, duplicate award prevention, date validation, malicious/oversized notes, XP summation and malformed records.
- CI browser review tests **15 scenarios** over mobile, desktop and landscape: first-run intro, unobscured atlas, Today and Starter boards, daily claim and Adventure Book, and the Level 0 → Level 1 first quest flow.
- Headless Chromium review **freezes animations only for deterministic screenshots**; motion quality on actual devices is still unverified.
- The browser review checks the custom SVG sprite is fetchable as `image/svg+xml`, the referenced icon IDs exist, and primary HUD buttons fit within viewports.
- Downloadable CI artifacts include the static playable bundle and annotated screen-state PNGs. Refer to the most recent passing Actions run for the exact commit and artifacts; artifacts expire after 14 days.

## Explicit boundaries
No merge, production deployment, DNS, Cloudflare Access policy changes, Creator V1 submission, broker/RHEN modification, family personal data, account provisioning, simulated connected players, server-side XP verification, location streaming or GPS history.

The game's real vector tiles are still opt-in and provided externally via MapLibre/OpenFreeMap; browser headless screenshots capture the illustrated example world. **We have not yet validated actual iPhone Safari, real tile availability/cost/attribution, map fallback performance or security/privacy/age acceptance.**

## Next bounded implementation milestone
1. Owner review of the unobstructed world, first-run, Today/Starter board and chapter screenshots. The Living Atlas aesthetic may continue evolving.
2. Test map tile rendering, attribution, offline failure and foreground opt-in location on a real phone/browser without uploading personal location or persistent data.
3. Prepare a real **Cloudflare Access-protected Lab preview** only after host identity, direct preview routes, costs and security are verified under ANEVUM Lab [#349](https://github.com/anevum/anevum-web/issues/349).
4. After private gameplay acceptance, begin authenticated *adult two-person* party contracts, separate-account consent and server-backed once-only XP. No fake invited members and no background/minor GPS.

Do not create another detached redesign or restart an older Evergrove/Nearlore branch. Advance the accepted V2 world and validated local-play foundation.
