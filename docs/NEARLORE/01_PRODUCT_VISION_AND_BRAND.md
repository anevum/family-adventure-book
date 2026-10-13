# NEARLORE — Product vision, identity, and experience

**Status:** Proposed working identity / design, October 12, 2026. Not trademark-cleared, deployed, or approved as a production name.
**Parent:** ANEVUM. **Predecessor:** Evergrove / The Adventure Book (archived as a playable exploration prototype, not the final game).
**Product category:** Real-world social adventure game, with optional, consent-based presence sharing.

## 1. North star

**Nearlore — Your world has stories.**

Turn the real world into a private multiplayer adventure. Streets, parks, local places, home activities, visits, and shared experiences become playable quests and discoverable memories. Players have avatars, XP, unlimited levels, achievements, collected chapters, and private parties. An optional live "adventure session" can show a participant to explicitly chosen members for a short, visible period.

**The map is the main game**, not a map widget inside a dashboard. It occupies the full viewport with an accessible UI overlay. No page-level scrolling. Tapping a place, avatar, event, or quest opens a compact sheet; closing it returns directly to the map.

### What this is not

- Not a Life360 replica, personal safety monitor, emergency dispatcher, vehicle tracker, or turn-by-turn navigation system.
- Not a coercive location-surveillance service, a speed/distance contest, or a game that rewards risky travel.
- Not an app that requires a smartphone's GPS, a car, travel spending, or a public account to earn progression.
- Not a replacement for ANEVUM's public creator/community platform or private RHEN execution environment.

## 2. Audience and central motivation

- **Couples and friends:** Make simple shared plans, set small adventures, celebrate ordinary experiences together.
- **Families and adults:** Plan low-cost, neighborhood, home, and outing activities without turning family coordination into surveillance.
- **Solo explorers:** Explore or complete at-home quests with the same meaningful progression as parties.
- **Creators (later):** Design opt-in challenge packs and local trails after moderation/rights/safety reviews.
- **Children:** Family-inspired, age-suitable quest concepts are a goal, but *independent child accounts, precise child location, chat, and public visibility are not in the initial release*. Determine COPPA-compliant supervised participation before enabling those features.

### Player promise

1. Something playable within 60 seconds of opening the map.
2. A complete 3–10 minute quest possible without GPS or money.
3. An interesting map even without contacts or tracking.
4. Shared progress happens only with explicit participation, not inferred consent.
5. Privacy is an always-accessible first-class action.

## 3. The differentiator

The category already contains real-world map games, travel journal maps, geocaching and scavenger hunts. Nearlore distinguishes itself through the combination of:

- A visual, game-like map, with custom avatars and lightweight animation.
- A **party-first** shared adventure loop (solo, duo, or private party).
- A memory **Chronicle** integrated into earned progression rather than an isolated journal app.
- **Equal-value at-home and low-cost quests** alongside exploration.
- Optional session presence, not continuous compulsory tracking.
- Server-verifiable earning ledger, group-consent model, accessible device support.
- Publishing through ANEVUM when genuine independent-creator acceptance is ready.

Competitors to learn from, not copy: Life360 (private circles/places), Mission Map (IRL quests), Globe Chaser (GPS checkpoint creator), Roamward (travel collectibles), MapShifter (game map styles). Avoid duplicating their names, artwork or trade dress.

## 4. Naming study

### Working recommendation: NEARLORE
- Pronunciation: NEER-lor.
- Semantic: nearby places + stories worth retelling.
- Fits a map, achievement, story, group, and creator-owned IP.
- Distinct from the ANEVUM parent brand and avoids the narrower woodland-only scope of Evergrove.
- **Preliminary online search only; NOT cleared for legal or trademark use.**

Alternatives to reserve in the design review:
- **Milelore:** adventure/travel emphasis; preliminary search surfaced use in cycling travel.
- **Nearling:** whimsical and creature-forward but implies a mascot-heavy game.
- **The Adventure Book:** effective in-game Chronicle or collection name, less distinctive as the master brand.
- **Evergrove:** retain as historical name for the old prototype or potentially a future fictional map region.

Discard / high-conflict examples found during initial search: Roamory (travel tracker), Waylore (travel planner), Roamward (travel app), Wanderloom (travel platform), Mapkin (maps app), Waymori (interactive event map), Daylore (journal/word game), Waylume (AI service). Trademark status is separate from web collisions.

**Clearance gate before final logo/domain/public listing:** exact and confusingly similar names in USPTO/state/appropriate international registers, domains, app stores, games catalogues and social handles, with professional review if needed. Do not purchase a domain or publish under the name based on this preliminary search alone.

### Brand hierarchy
- Game/app: **NEARLORE**
- Descriptor: **A real-world adventure game**
- Tagline: **Your world has stories.**
- Action line: **Go make one.**
- Publisher identity: **By Devon · on ANEVUM** after verified Creator V1 account ownership and publication.
- A **Chapter** = completed adventure saved in the Chronicle.
- A **Party** = a private, invite-only group.
- A **Trail** = ordered optional stops or activities; never an automatically recorded person's route.
- **Discoveries** = user-initiated map/place interactions.
- **Tokens** = nontransferable cosmetic achievement currency; no real-money cash-out.

## 5. Visual design system

**Creative direction: The Living Atlas.** Not a fantasy forest, not a corporate SaaS dashboard, not an exact Life360 UI. A living cartographic surface with delightful illustrative details and clear real-world geographic legibility.

| Token | Proposed color | Use |
|---|---|---|
| Midnight ink | `#102A35` | HUD, chrome, game shell |
| Cartographic parchment | `#F7F1E5` | Clear labels, sheet surfaces |
| Living mint | `#D8F6A4` | positive discovery, world growth |
| Lagoon | `#75D8CD` | optional active presence / safe interactions |
| Lantern gold | `#F5CA87` | quests, achievements, treasure |
| Coral bloom | `#F39481` | party celebration, story moments |
| Slate | `#78969B` | secondary information |
| Safety amber | `#F2B45E` | expiry, consent, warning notices |

Proposed type: friendly and crisp geometric sans for navigation and legible small text; restrained bookish display serif only in Chronicle and chapter titles. Use a licensed, optimized webfont or system fallback; do not bundle proprietary fonts from design references.

**Primary mark concept:** a distinctive open location-pin shape enclosing a curved trail with two discovery nodes. One-color recognizable silhouette at 24px. Do not use the ANEVUM 01 ORBIT mark as the game's mark; preserve the selected 01 ORBIT for the publisher brand.

**Map aesthetic:** streets remain readable; natural areas get texture, water gets layered animated highlights, familiar places get illustrated quest pins. Idle motion is very restrained; nearby tappable hotspots respond with light/scale, never obscure navigation. User-controlled bright/dark modes and reduced-motion setting. No location animation when sharing is off.

**Sound:** soft discoverable notes for quest completion/collectibles; muted by default. Do not include unlicensed music or sounds.

## 6. Single-screen app layout

```
┌───────────────────────────┐
│ NEARLORE       L0  0 XP  ◎│  ← always-visible level + privacy
│ Party: My Crew        ◉   │  ← private group selector
│                           │
│      THE REAL MAP         │  ← full-screen pan / zoom map
│        ✧ Park             │
│   ⌂ Home quest       ◇    │  ← tappable locations / discoveries
│          ◉ Me             │  ← self position only with permission
│                           │
│  [Next: Make a Story]     │  ← contextual next quest, not fixed panel
│ [Map] [Quests] [Party] [Book] │
└───────────────────────────┘
```

Desktop: map fills viewport; left compact tool rail and floating party/quest sheets. Mobile: compact top XP/privacy line; four iconic bottom nav actions; optional side sheet covers at most ~70% screen and returns to map. Side panels may scroll internally when necessary, but document/body never does.

### Primary screen states
1. **First launch** — enter as guest, see stylized sample region, choose "Explore without location" or "Use my location". No forced location or sign-up.
2. **Map idle** — map, own marker if permitted, 1–3 relevant quests, party portraits (if sharing is enabled).
3. **Quest detail** — story prompt, location optional, steps, participants, accessible reward.
4. **Active adventure** — lightweight progress, opt-in temporary share controls, Pause/End, finish action.
5. **Completion** — earned XP, badge/sticker, a small visual world change, optional memory capture.
6. **Chronicle** — selected chapter memories, editable visibility, export/delete.
7. **Party/Privacy** — invite, member roles, per-person sharing settings, clear timer, leave/block/report.
8. **Offline / GPS denied** — non-location quests and previously cached interface remain playable. Clearly label stale map/location; never fabricate live member locations.

## 7. Emotional design rules

- The first reward should happen because the player **chooses to do something**, not because an invisible GPS collector tracked travel.
- Cooperative rather than competitive default. No guilt, FOMO, or punishment for leaving location off.
- The reward for an ordinary dinner at home can equal the reward for visiting an expensive attraction.
- Completing a quest should feel like opening a page in a personal living atlas.
- Parties have durable, meaningful stories without publishing addresses or exposing children.
- Narrative copy is curious and playful, not babyish or exclusively fantasy-themed.

## 8. Naming and launch decision checklist

- [ ] Owner accepts the *real-world map game* premise rather than the original fictional clearing.
- [ ] Working name receives domain/trademark/confusability review before trademark claims or public use.
- [ ] Mark/wordmark passes 24px one-color, high-contrast and compact/mobile tests.
- [ ] One 5-minute first-session prototype proves **map → quest → completion → reward → story**.
- [ ] Accessibility and privacy defaults approved as part of the product identity, not late QA.

## Research links (review date October 12, 2026)
- https://www.life360.com/location-sharing
- https://apps.apple.com/us/app/mission-map-your-irl-minimap/id6744417798
- https://globe-chaser.com/
- https://www.mapshifter.com/
- https://maplibre.org/maplibre-gl-js/docs/
