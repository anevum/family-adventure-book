# NEARLORE — Architecture, safety, delivery, and release plan

**Status:** Engineering proposal, October 12, 2026. No production deployment, account permission change, route, database, or live tracking enabled by this spec. See `01_PRODUCT_VISION_AND_BRAND.md` and `02_GAME_DESIGN.md`.

## 1. Architecture decision

**Web-first, map-native, privacy-first.** Source hosted on GitHub. Cloudflare for app hosting and APIs. Preserve ANEVUM's existing Creator V1 infrastructure and the private Lab separation.

```text
Browser PWA (desktop/mobile)
  ├── Game shell (React/TS/Vite or lean framework)
  │     ├── MapLibre vector map + licensed tile provider
  │     ├── Avatar/quest/discovery animation layer
  │     ├── One-screen HUD, party sheets, Chronicle overlays
  │     └── Local offline non-sensitive progress cache
  ├── Foreground browser geolocation, permission on explicit action
  └── HTTPS authenticated game API
          ├── Identity bridge or independent secured game sessions
          ├── Party membership and authorization
          ├── Quest state machine + XP/achievement ledger
          ├── Chronicle / consent rules
          ├── Cloudflare D1: durable non-location game data
          ├── R2: optional private media, only after privacy approval
          └── [Later] Durable Object: short-lived party presence WebSockets

Private development: lab.anevum.com (Access-gated owner workspace)
Public project: ANEVUM Creator V1 listing -> external hosted game link
RHEN and Transcosmic: separate Lab projects, never shared game storage
```

**Map choice:** MapLibre GL JS (open source) provides customizable GPU-accelerated map styles. Use licensed OSM-derived vector tile coverage from a suitable provider or self-hosted option after evaluating pricing. **Do not** serve public game traffic through the volunteer OpenStreetMap Foundation standard tile server as an assumed free CDN. Follow attribution and tile-provider caching, privacy, access and billing rules. No map tile vendor can be chosen solely by an unaudited price estimate.

**Spatial scope:** Early alpha can use a fictional/demo map area with real map tiles, opt-in foreground GPS and opt-in manually placed quests. Avoid routing, geocoding/search, automatic geofence computation and high-rate telemetry initially.

**Real-time presence:** Optional P1 using Durable Objects/WebSocket Hibernation (cost-dependent) rather than constantly polling precise coordinates into D1. Presence is ephemeral and **never** the truth source for XP. Web foreground location and browser suspension do not provide the native background behavior of Life360.

## 2. Data model boundaries

Relational tables (minimal conceptual shape; names subject to implementation):
- `game_accounts(id, auth_subject, display_name, age_gate_state, created_at)`
- `parties(id, owner_id, name, privacy, created_at)`
- `party_members(id, party_id, account_id, role, status, joined_at)` with unique active membership constraints
- `party_invites(id, party_id, inviter_id, hashed_token, expires_at, redeemed_at)`
- `quest_templates(id, publisher_id, category, version, moderation_state, steps_json, xp_policy_version)`
- `quest_runs(id, quest_id, party_id?, owner_id, state, created_at, completed_at)`
- `quest_participants(run_id, account_id, consent_at, participation_status)`
- `quest_step_completions(id, run_id, account_id, step_id, completed_at)`
- `xp_ledger(id, account_id, run_id, event_type, xp_delta, policy_version, idempotency_key UNIQUE, created_at)`
- `achievement_awards(id, account_id, achievement_id, source_event, unique(account_id, achievement_id))`
- `chronicle_entries(id, owner_id, run_id?, title, body, visibility, created_at, deleted_at)`
- `chronicle_shares(entry_id, party_id, approved_by_owner_at, revoked_at)`
- `consent_events(id, account_id, consent_type, recipient_scope, mode, expires_at, revoked_at)` (**no coordinates**)
- `privacy_audit(id, subject_id, action, actor_id, created_at)` (no raw GPS, secrets or personal media contents)

**Absent by design:** background location history table, home/school tracking table, public exact-coordinate feed, broker credentials, imported phone contacts, saleable advertising identifiers.

Transient party presence payload can include `member_id`, approved precision, transformed approximate or short-lived exact location, timestamp and session id **only while active**. Never write it to ordinary access logs or durable game-account tables. Enforce sender grant and recipient-party membership on every publish/read, not only in the UI.

**Data lifecycle** (policy proposal; formal review required):
- Web presence: stop streaming at session end; stale presence expires in <=5 minutes; no precise track history.
- Consent-session metadata: short bounded retention for security/accountability; exact retention set in a reviewed policy before release.
- XP: durable event ledger with reversal entries; deleting an account follows privacy/compliance rules.
- Chronicle: private until user chooses otherwise; own export and deletion.
- Media: disabled in P0; if introduced, strip EXIF, validate malware/content and control signed URL lifespan.

## 3. Permission model

| Operation | Guest demo | Signed-in player | Party member | Party administrator |
|---|---|---|---|---|
| Pan map / see template quests | Yes | Yes | Yes | Yes |
| Save own local chapter | Device only | Own account | Own account | Own account |
| Earn server-side XP | No | Own account | Own account | Own account |
| Invite party member | No | Create own party | Policy-dependent | Yes |
| View party member presence | No | No by default | **Only separately consented sharing** | Same consent rule |
| Share own location | Local preview only | Explicit opt-in session | Explicit opt-in session | Explicit opt-in session |
| Read another's private story | No | No | No, unless shared | No, unless shared |
| Modify someone else's XP/location | No | No | No | No |
| Approve public user-made quest | No | No | No | Trusted moderator only |

**Never use party administration as location-consent override.** Ensure private story and precise presence reads cannot be achieved by swapping an ID, editing a client flag, replaying invitations or modifying group roles.

## 4. API draft (HTTP same-origin)

- `GET /api/v1/game/bootstrap` — session capabilities, published template list, safe map config, own account progress.
- `POST /api/v1/game/guest-session` — optional isolated guest state with no private party access; alternatively purely local prototype.
- `POST /api/v1/game/parties` — authenticated, rate-limited new party.
- `POST /api/v1/game/parties/:id/invites` — short TTL, hashed invite token, abuse throttling.
- `POST /api/v1/game/parties/:id/join` — explicit user acceptance, subject-to-age gate.
- `GET /api/v1/game/parties/:id` — server-side membership and visibility checks.
- `POST /api/v1/game/quests/:id/runs` — create one run within authorized context.
- `POST /api/v1/game/runs/:id/steps/:stepId` — accept owner/consenting participant action.
- `POST /api/v1/game/runs/:id/complete` — atomic completion + idempotent XP/achievement ledger transaction.
- `GET /api/v1/game/progression` — own derived level, XP history and badges.
- `GET/POST/PATCH/DELETE /api/v1/game/chronicle` — own chapter resources, controlled shares and deletion.
- `POST /api/v1/game/presence/sessions` (P1) — recipient list, precision, expiry; independent device consent.
- `DELETE /api/v1/game/presence/sessions/:id` (P1) — immediate server-side revoke and broadcast.
- `GET /api/v1/game/privacy/export`, `DELETE /api/v1/game/account` — reviewed data rights flow.
- `POST /api/v1/game/report` — harassment, unsafe quest, impersonation, safety reports.

Session cookies HttpOnly/Secure/SameSite, CSRF protections for writes, strict origin/CORS, rate limits, scoped server authorization, request schema validation and security headers are required. Separate sensitive auth audit logs from product analytics; no exact coordinate logging.

**Atomic completion invariant:** quest run moves from eligible state to COMPLETE exactly once; the ledger uses a unique idempotency key / run + subject + event type and is written in the same transactional operation as the state transition. Network retries return the existing award result, not a new one. Cross-member rewards require distinct participant consent.

## 5. Key safety threats and controls

| Threat | Required control |
|---|---|
| Stalking or coercive tracking | Location OFF by default; time-bound self-controlled session; adult opt-in per sharing recipient; pause/revoke anytime; no hidden historical map |
| Unauthorized location access | Server-side membership checks on every read; precise location never on public endpoints or cache |
| Minor's precise location | Under-13 GPS/account features withheld in beta; COPPA review, verified parent consent, privacy/retention program required before enabling |
| Home/school inference | No precise historical points, recurring visit prediction or public stamps with exact coordinates |
| Dangerous exploration | Safe curated public destinations, no mileage/speed awards, hazard filters and do-not-play-while-driving rule |
| Location spoofing/XP fraud | Server-authoritative awarding, limits, templates, manual alternatives and idempotency; don't increase precision to fight cheating |
| Social coercion | Leave/block/report, private circles, no compulsory streak or "missing" warnings |
| Image GPS leaks | No media in P0; EXIF stripping and share-preview in P1 |
| Impersonation / invitations | Expiring tokens, hashed storage, re-auth on join, rate limits and trusted contact-independent invite acceptance |
| Data/vendor compromise | Least-privileged Cloudflare bindings; secret separation from ANEVUM/RHEN; security review and deletion drills |
| Offline/permission failure | Playable offline/non-GPS alternatives, truthful stale data labels, no fabricated live tracking |
| Public quest abuse | Invite-only beta; later moderation, age/access rules, sensitive-place filters, takedowns/appeals |

The revised Children's Online Privacy Protection Rule has compliance obligations relevant to precise location and child-directed services. **Obtain counsel/compliance review before allowing independent child accounts, collecting children's precise GPS, or marketing this as compliant for all ages.** Adult private beta comes first. See FTC COPPA FAQ and 2025 amendments.

## 6. UX architecture: game first

`GameShell` owns the viewport. `WorldMap` is the single background canvas. `AvatarLayer`, `DiscoveryLayer`, `PartyPresenceLayer` and `QuestLayer` are separate, independently togglable renderers. Compact `Hud`, `QuestSheet`, `PartySheet`, `ChronicleSheet`, `ProfileSheet`, `PrivacySheet` overlay it.

Map rendering: vector style is original and legible, all original tiles/assets are properly licensed. Animation uses CSS/WebGL with device performance guardrails and reduced-motion. Keyboard navigation and voice accessibility never depend on a clickable SVG/Canvas without focusable alternative controls. Use `100dvh`, safe-area insets and internal-scrolling sheets. Provide a standard accessible non-WebGL fallback map/list.

**Perf targets for beta (provisional):** open to interactive <=3 seconds on typical LTE phone, map input p95 <100ms at steady state, no accidental body scrolling at 320/390/1024/1440, animation gracefully degrades at 30 fps, no requirement for continuous GPS for 10-minute game sessions. Test on actual Safari/Android devices.

## 7. Deployment, accounts and ANEVUM separation

**Developer sandbox:** owner-only `lab.anevum.com/projects/nearlore` after Access, host route and signed-in testing exist. Do not reuse the old protected Evergrove demo as though it implements Nearlore.

**Future game distribution:** separate `play.anevum.com` or another explicitly chosen game origin, not published merely by creating an app on Lab. The origin may initially have closed invite-only access.

**Public ANEVUM listing:** the owner wants a real creator submission by display name **Devon** after validated ANEVUM Creator V1 identity, rights, truthful demo link, independent moderation review, and first-player acceptance. Do not fabricate a member or bypass review. Existing `anevum-web` engineering #325 and publishing #329 remain authority; Lab registry #349 is separate.

**Existing code:** Preserve `anevum/family-adventure-book` main history and immersive Evergrove PR #4 as an archive. Build Nearlore on a new candidate branch/repository decision *after* acceptance of this spec; do not rename the public repo or automatically merge abandoned screens into the new game. Keep RHEN private, unmodified and entirely distinct. Transcosmic is a writing/canon project, not a multiplayer game module.

## 8. Milestones and scope gates (targets, not promises)

| Target window | Slice | Exit |
|---|---|---|
| Oct 12–18, 2026 | Name/design/product privacy lock | Working spec accepted, legal/trademark checks initiated, 1 clickable world wireframe |
| Oct 19–Nov 1 | P0a non-GPS game map, avatars, first quest | First ten-minute solo path in browser, starting Level 0, no page scrolling |
| Nov 2–15 | P0b secure adult accounts / private party | Two separately authenticated test adults, real invite/accept/revoke, no cross-account leaks |
| Nov 16–30 | P0c quests, XP ledger, Chronicle | Completed duo adventure, once-only XP, persistent memory and deletion/export |
| Dec 1–13 | P0d privacy and device acceptance | iPhone/Android/desktop, GPS denied, accessible focus, QA and abuse test |
| Dec 14–27 | Private owner beta and repairs | Real testers, security/legal blockers resolved, reproducible acceptance artifact |
| Jan 1, 2027 | **Optional** ANEVUM Creator V1 release candidate | Only if genuinely playable, rights-cleared, moderated, and approved; not a dependency for main ANEVUM opening |

**One functional slice at a time.** Respect limited costs/time. A comprehensive live background-tracking app is not achievable from a web prototype and must not be marketed that way.

## 9. Costs and operations

Prefer existing GitHub, Cloudflare Workers/D1, and static web deployment. D1 includes a free-tier quota for prototyping, but map tiles, geocoding, R2 storage, Durable Objects, bandwidth and legal compliance can create real costs. Use billed quotas/budget alarms before introducing high-frequency real-time presence. No assumption that OSM community standard tile hosts are a free commercial CDN.

Cost order: first mocked world map and a few test tiles → limited licensed real map provider → low-traffic closed beta → measured tiles/live sessions → optimize/request expansion. No need for new Railway, Supabase or Apple developer enrollment just to prototype a browser game. If native background location eventually becomes necessary, revisit app-store distribution and costs separately.

**Revenue doctrine:** free gameplay, core quests, XP, private parties and privacy settings. Optional cosmetics/themes much later. Never sell location histories, monetize children's data, gate safety/consent features behind payment, sell XP/level advantage or use pay-to-win. No ads targeted from places visited.

## 10. Definition of done: first shippable slice

Functional:
- Guest can run map + non-GPS quest at Level 0 and reach Level 1, then reload and keep progress.
- Two real adult test accounts can consent to one private party, plan, finish a quest, receive once-only XP and see only consented information.
- Chronicle uses original user text; no false real-life event or simulated relationship is presented as real.
- Map and game stay usable when GPS denied, tile service slow/unavailable and device orientation changes.

Security and privacy:
- No coordinate data accessible without consent, no cross-account/party IDOR, no party-wide consent grants and server-side TTL verified on session expiry.
- Raw location not in logs or durable database, no photos/children's geolocation in beta, access revocation and account export/delete operations tested.
- External map-provider terms and disclosures correct, age/privacy counsel decision recorded.

Release:
- CI, device/browser screenshots, keyboard/focus/screen-reader, reduced-motion/performance, user acceptance and rollback plan recorded against exact commit.
- Owner explicitly approves external public distribution and publication. Until then: project remains private, not a listed game on anevum.com.

## External reference links (verified 2026-10-12)
- MapLibre: https://maplibre.org/maplibre-gl-js/docs/
- OpenStreetMap standard tile policy: https://operations.osmfoundation.org/policies/tiles/
- Browser geolocation: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/watchPosition
- Apple foreground/background guidance: https://developer.apple.com/documentation/corelocation/handling-location-updates-in-the-background
- Cloudflare D1 pricing: https://developers.cloudflare.com/d1/platform/pricing/
- Cloudflare Durable Objects/WebSocket hibernation: https://developers.cloudflare.com/durable-objects/examples/websocket-hibernation-server/
- FTC COPPA guidance: https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions
- FTC COPPA final amendments: https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-finalizes-changes-childrens-privacy-rule-limiting-companies-ability-monetize-kids-data
