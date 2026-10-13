# NEARLORE — Core gameplay, progression and multiplayer systems

**Status:** Design specification, not implemented. Companion: `01_PRODUCT_VISION_AND_BRAND.md`.
**Master principle:** Real life supplies adventure; the player supplies intent. Collection, XP and memories follow *deliberate* interactions, never continuous surveillance.

## 1. The 60-second fantasy

Open Nearlore. See a playful map of where you are—or any manually selected map area. Your avatar has just arrived at Level **0**. The app suggests a tiny "First Page" quest: find something interesting about today, or plan a small two-person adventure. You choose, play, confirm the outcome and watch one part of your atlas illuminate. A new Chronicle chapter opens. You are free to close the app.

No account or GPS is mandatory to experience this first loop. If someone invites you into a private Party, the same engine creates cooperative chapters.

### Primary loop
`Explore/Choose → Join/Start → Do something → Confirm → Award XP → Chronicle/unlock → New possibility`

### Secondary loops
- **Collections:** world discoveries, themed stickers, chapter covers, party landmarks; not exact footprints/trails.
- **Social:** private party planning, optional presence, joined quests, reactions to shared chapters (later).
- **Creative:** edit quests with names/steps, choose imagery, decorate private maps.
- **Seasonal:** locally relevant and fully accessible challenge decks, no required streaks.

## 2. Single player / duo / party

**Player**
- Private identity, display name, optional avatar, personal Level 0+, XP ledger, achievements, private Chronicle and privacy settings.
- Progress belongs to the player, not the person who invited them.
- A player can join multiple parties but shares **nothing** between them by default.

**Party**
- Invite-only group. Create with a display name, theme/banner and a member limit during beta (suggest 8).
- Creator administers membership, but **cannot** override another adult's device location/privacy consent, view historical private routes, or create earned activity on another user's behalf.
- All members separately opt in to collaborative chapters. Leaving a party revokes access to future sharing and triggers the applicable retention/deletion flows.
- Party progress is a separate contribution ledger; party owners cannot farm XP by adding inactive members.
- Partner/date-night parties are supported without requiring a family relationship.

**Invite mechanics**
- Expiring, single-use or limited-use invitation; authenticate on acceptance in secure beta.
- No public discovery of private party, no searchable membership list, no number-to-account harvesting, no address-book upload.
- Decline/block/report actions. Adult trust and location consent are independent from party membership.
- Anonymous guest prototype may simulate a fictional companion *visibly labeled simulated*, never imply a real person accepted an invite.

## 3. Quest categories and templates

| Quest family | Example | GPS necessary? | Rewards |
|---|---|---|---|
| At home | Cook a new recipe, take turns choosing music | No | Equivalent to exploration |
| Duo/party | Plan a low-cost date, play a tabletop game | No | Cooperative shared chapter |
| Exploration | Discover a local park or library | Optional, explicit check-in only | Discovery + chapter |
| Curiosity | Learn the history of a neighborhood landmark | No | Story sticker |
| Creative | Make a drawing or write a tiny story together | No | Collection art |
| Kindness | Help a person or community with consent | No | Positive contribution |
| Long-form | Finish a multi-step weekend activity | Optional | Chapter/collection milestone |

**Sample starting chapters**
1. **The First Page** — choose a quest and finish one small activity; single-player.
2. **Two Paths, One Story** — invite an adult partner and mutually join a 2–3 step quest; cooperative.
3. **A Place Worth Noticing** — discover a public place on the map, then record an observation; no travel required.
4. **Kitchen Expedition** — prepare or try a homemade snack, optionally with a partner; zero-budget alternative.
5. **The Golden Hour** — notice a change in the sky or surroundings from wherever you are; do not ask for travel at night.
6. **The Hidden Detail** — find something interesting about your neighborhood from the map, a book or memory.
7. **Our Little Tradition** — save a recurring, private adventure template (no obligation to maintain a streak).

**Quest schema**
- ID; template/creator; title and localized text; age rating; category; accessibility alternative; difficulty; duration; optional map marker/area with privacy classification; optional participant list; ordered/parallel goals; reward policy version; moderation state.
- Completion methods: **self-confirmation** (ordinary), **participant-confirmation** (joint, requires explicit approval by each), or **opt-in verified public place check-in** (later and only where safe). Proof through personal photos/location history is never the default.
- Run states: `DRAFT → READY → ACTIVE → COMPLETE`; `ABANDONED` and `EXPIRED` are recoverable, not punished. Membership can be withdrawn before completion without shaming.
- A new quest run uses a stable unique completion key; a retry cannot award again.

## 4. Level 0 and unlimited progression

**Start:** Level 0, XP 0, tokens 0, no achievements except onboarding tutorial state.

**Earned threshold:**

```
xp_to_next_level(L) = 80 + 20 × L
total_xp_to_reach_level(L) = 10 × L² + 70 × L
```

where L is any nonnegative integer; no fixed maximum. Examples:
- Level 0 → 1: 80 cumulative XP.
- Level 1 → 2: 180 cumulative XP.
- Level 2 → 3: 300 cumulative XP.
- Level 5: 600 cumulative XP.
- Level 10: 1,700 cumulative XP.
- Level 25: 8,000 cumulative XP.

The server derives level from an **append-only award ledger** and configured formula version. The client only animates the projection. Avoid per-player writable XP totals as the source of truth.

**Illustrative reward policy for beta** — tuning values, not launched economy:
- First Page onboarding completion: 80 XP, once.
- Standard short quest: 35–60 XP (limit 2 eligible personal quests/day for XP; additional completions still save stories).
- Mutually confirmed duo/party quest: 60 XP to each opt-in participating member, capped independently (not multiplied by group size).
- Discovery via a new *public place category* or curated clue: 15 XP, once per curated discovery, capped at 3/day. A user may also self-confirm an equivalent discovery offline.
- Chronicle note, photograph, location precision or invitation: **0 XP** to avoid oversharing and spam incentives.
- No distance driven, speed, hazardous places, car use, ad views, purchases, or tracking-hours multipliers.

Earn cap policy and level pacing must be simulated across children-safe analog, low-income, homebound, commuter and low-frequency players. Rewards can be reversed with audit events on abuse; levels should be recomputed consistently and transparent to the player.

**Tokens:** Earned cosmetic currency, non-transferable, no cash value, no cash-out, never redeemable for gambling. Can customize avatars, map pins and Chronicle frames. Paid store is a later review, not beta scope.

**Party levels:** A second, separately earned shared collection score. Contribution is opt-in and avoids broadcasting how many hours/where members traveled. A party displays milestone badges without individual XP rankings.

## 5. Achievements and collection

Opening set:
- **First Spark:** Finish first adventure.
- **Our First Page:** Two consenting participants finish a collaborative quest.
- **Homegrown:** Complete three different free at-home quests.
- **Wayfinder:** Explore three public place categories or their no-GPS equivalents.
- **Storykeeper:** Save five chapters (not contingent on supplying photographs).
- **Together Again:** Two separate days with a mutually joined quest.
- **Atlas Awakens:** Reach Level 5.
- **The Curious Few:** Complete at least three different activity categories.

A badge represents a private accomplishment, not proof of someone's current location. Badges are not broadcast to other parties without separate permission.

## 6. Geography as an optional game mechanic

**Map layers:** base cartography → whimsical environmental overlay → user-selected discoveries → quest markers → own avatar → explicitly authorized party markers. Maps can be navigated without GPS or logging in.

**Location modes — default is Off**
1. **Off:** show manual region or neutral starting area; complete most game quests.
2. **Use while playing:** request browser foreground position solely for self-centering or user-initiated public-place check-in. Do not start permission flow at app load.
3. **Share this adventure:** when the player explicitly starts an ephemeral session, show their approximate or precise position (explicit precision choice; approximate recommended default) to specifically chosen adult party members only; visible timer, in-game "sharing" indicator, stop control, maximum one hour per session.
4. **Background native (deferred):** separate opt-in permission and mobile development after product-market fit, security, battery and compliance reviews. Never automatically upgrade foreground consent to always-on.

**No default path/route history.** Ephemeral presence expires at session end or within minutes of last update. Exact coordinates never appear in invitations, analytics, public profiles, screenshots generated for public sharing, link previews or server access logs. Location check-in metadata should be short-lived, and any derived badge should not let others reconstruct where the person lives, studies, works or regularly travels.

**Map discovery:** curated, safe, publicly accessible place categories and opt-in visits. No collection targets at private residences, schools, medical facilities, shelters, hazardous areas, roadways, railway corridors or paid-only venues. Existing private home bases are only user-controlled fictional decorations, not pins on a public map.

**Safety:** no quests during driving; avoid sudden alerts while a device is in motion. No speed, route efficiency or mileage rewards. GPS spoofing or inaccurate location should not pressure players to overshare; provide a manual alternative.

## 7. Real-time party UX

Private party sheet:
- Member nickname/character portrait, voluntary activity status, last voluntary check-in; indicate stale/offline distinctly.
- If someone shares presence: limited-precision marker plus clear "shared until" timestamp for both sender and recipient.
- Do not show an actual participant who hasn't accepted and shared. In demo mode, label simulations plainly.
- All members can end their sharing unilaterally. An organizer cannot unpause them.
- A private journey planner can assign places/activities, but never display "missing", "late" or guilt notifications by default.

Future optional features (explicitly separate from core game): event geofences, background visits, active-route navigation, family safety alerts, public adventure packs, friend matchmaking, in-game chat, notifications, AR, pets/companions, location-based mini games, native iOS/Android and wearables.

## 8. Chronicle (The Adventure Book survives)

**The Adventure Book** becomes the game's durable in-world Chronicle, not necessarily the master brand.

Each chapter can contain:
- Title, date or rough day, participants who actively approve being named, memory text, optional art/photo, achievement, quest completion, private visibility.
- "Only me", "selected party", and "share externally" are distinct actions with visible previews.
- Users can edit, remove, export, and revoke sharing. Personal memory privacy persists even when party membership changes.
- Strip image EXIF/GPS before media upload, or avoid photo uploads entirely in the first browser playtest. Never publicly publish private family content.

## 9. First 10 minutes (acceptance scenario)

Minute 0: Open app and enter guest mode, no forced signup/GPS.
Minute 1: See map game, Level 0, 0 XP. Choose optional location or manual map.
Minute 2: Choose "The First Page" (e.g. make a small plan).
Minute 3: Complete one simple activity. No GPS required.
Minute 4: Confirm completion and reach Level 1 via 80 XP.
Minute 5: Watch the marker glow, collect "First Spark", browse the new Chronicle page.
Minute 6–8: Choose "Two Paths, One Story", optionally invite a partner to play.
Minute 9: If partner isn't available, continue with a solo or home quest without blocked progress.
Minute 10: Close and reopen; progress persists. No live location remains active.

**What makes it a game:** agency, meaningful objectives, a game-world map that visually changes, identifiable rewards, cooperative chapters, collection and continued discovery.

## 10. MVP / post-MVP line

**P0 playable private game:** full-screen map; real guest and registered user flows; manual map + optional foreground GPS; quest engine (at least 7 tested templates); local/remote state; one party invite path; one cooperative quest; XP Level 0+; at least 6 badges; local Chronicle; privacy controls; no background tracking.

**P1 after reliable private beta:** real-time opt-in session presence; second theme; richer avatar customization, party Atlas and moderated template packs.

**P2 only after audited privacy and user demand:** native iOS/Android background location, more sophisticated co-op maps, audio/social features, creator marketplace, paid cosmetics, public community adventures.

## 11. Playtesting gates

- A player who denies GPS can still gain XP, finish a chapter, and start Level 1.
- No quest completion/award duplication across reload, double tap, offline resend or rapid membership change.
- One adult cannot consent to sharing another adult's live position.
- Empty party never exposes a fictional "real" member.
- Shared session visibly expires; closing browser may not immediately notify peers, so server-side TTL is mandatory.
- All minors-related cases fail closed unless a separately approved age-appropriate system exists.
- Map has meaningful interaction on slow phones and accessible controls with reduced motion.
- Full-screen map does not cause body scrolling or hide map/license attribution behind overlays.
- Rate-limit quest XP without punishing legitimate non-geographic participation.
- Players can see/edit/export/delete their own chapters; group removal doesn't leak private stories.

## Research / policy anchors
- https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/watchPosition
- https://developer.apple.com/documentation/corelocation/handling-location-updates-in-the-background
- https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions
