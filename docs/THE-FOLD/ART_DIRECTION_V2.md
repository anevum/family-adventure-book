# THE FOLD — Premium Visual Art Direction v2
**Session:** ANEVUM.WEB.DESIGN.2026-10-13.001.THE-FOLD-PREMIUM-VISUAL-DIRECTION  
**Status:** Proposed art-direction contract for owner review; not an accepted visual lock, trademark clearance, or deployment authorization.  
**Applies to:** The existing full-viewport game in `public/fold/`, draft PR #7.  
**Does not change:** Level 0 progression, seven starter quests, the Adventure Book ledger, local-save behavior, optional GPS, or deployment/consent gates.

## 1. Design decision: THE LIVING ATLAS
**Creative thesis:** The Fold should feel like a remarkable expedition instrument brought to life: a real map under a sculpted console interface, with luminous metal instruments, dimensional wayfinding glyphs, and a treasured physical Adventure Book. It is a premium, contemporary real-world adventure game—not a dashboard, children's sticker book, generic fantasy RPG, or imitation of a named game.

The physical metaphor is **a mapcase opening into a world**. Folded planes reveal light. Roads and discoveries are grounded in real geography; the player brings their own meaning to places through real experiences. Depth comes from coherent materials, lighting and motion, not piling shadows and gradients onto ordinary website cards.

**Emotional sequence:** intrigue at first open → agency when exploring → anticipation when choosing an activity → tactile satisfaction when completing it → attachment when revisiting a saved chapter.

**One-sentence target:** *A luminous, tactile world atlas with the production discipline of a premium console game and the personal warmth of a memory book.*

### Explicitly reject
- Beige/mint storybook interface, generic green dashboard, flat rounded SaaS cards, ordinary emoji for core game controls, thin monochrome icon-only systems.
- Faux-medieval wood-and-parchment everywhere, random fantasy runes, bright mobile-gacha overload, sci-fi terminal chrome, oversaturated neon, or interchangeable glassmorphism.
- Decorative 3D that makes map text, controls, real consent states or attributed data hard to read.
- Fabricated points of interest or quest destinations presented as real locations.

## 2. Composition and visual hierarchy
The **map is the game world**, not a background decoration. In regular exploration state, aim for at least 65% unobstructed map on a 390 × 844 viewport and more on desktop. A small number of deliberate floating instruments frame it.

Three primary attention anchors:
1. **World / navigation.** Geographic features, the player's chosen mark, and a few large, legible quest entry points. No imaginary landmarks in the real vector map.
2. **Progress / identity.** A forged level medallion and illuminated XP ring/meter, with clear numeric feedback.
3. **Next adventure.** A single elevated, beautiful active quest tile near the edge of the scene. Avoid multiple competing callouts.

The UI should have a readable silhouette at a distance: dark sculpted edge apparatus framing a luminous, spatial world. The **Adventure Book** intentionally changes material and light: from cold outdoor atlas into warm ivory pages.

## 3. Color and light
This is a **deliberate pivot**, not simply the old palette with darker background values. Use depth from blue-black and mineral green, focus with copper/gold, and sparing bright discovery light.

| Token | Hex | Required role |
| --- | --- | --- |
| Night Ink | #0B1721 | Deep backdrop, recessed controls, shadow tone |
| Deep Fjord | #142D36 | Primary sculpted HUD housing and panel faces |
| Forged Slate | #324951 | Raised secondary surfaces and edge midtones |
| Antique Copper | #BD825A | Physical seams, borders, inactive metal trim |
| Beacon Gold | #F2C675 | Achievements, primary reward light, special state |
| Aurora Teal | #55D3C3 | Selected navigation, interactable discovery, verified activity |
| Trail Blue | #75A9CD | Map navigation and information, not rewards |
| Vellum | #F2E5CB | Chapter surfaces, light text panels and book interiors |
| Warm Ivory | #FFF4E0 | Headline and primary text on dark surfaces |
| Verdigris | #3E7165 | Secondary map/forest environment and quiet success |
| Caution Coral | #D87566 | Explicit warning/error accents, not generic decoration |

**Color distribution:** dark mineral framing 55–65% of *UI surfaces*, copper/slate 20–25%, ivory 10–15%, gold/teal combined generally below 10% until an earned reward. This rule does not apply to the **geographic map canvas**, which needs terrain-driven colors and contextual road/label contrast. Keep map legibility even if it means the world itself is brighter than the HUD.

**Light source:** a consistent imaginary upper-left warm key light and lower-right cool bounce. Gold is an earned light, not an outline on every button. Teal is active focus/navigation, not a neon wash. Default world may be twilight, but map controls and streets must still remain readable in bright daylight.

Prepare both *Dusk Atlas* and *Daylight Atlas* map styles from the same tokens. Do not make the user interpret real streets through an overly dark overlay.

## 4. Materials: four physically distinct families
**A. Smoked enamel (game HUD):** deep glossy mineral surface, sharp 1px warm top-edge catchlight, 2–3px darker underside, subtle inset reflection, broad low-opacity ambient shadow. Shape language: chamfered or cut corners with restrained radii, never identical generic rounded rectangles.

**B. Forged copper (primary mechanisms):** bronze/copper trim on level ring, icon sockets and selected border segments; controlled 2–3-stop metallic reflection; bevel deep enough to suggest thickness (about 4–8 CSS px at normal scale). Reserve bright polished gold for earned XP/rewards.

**C. Cast enamel / gem (quest glyphs):** primary quest marker is a medallion with outer metal ring, dark cavity, dimensional central symbol, restrained local light and ground/contact shadow. Clear active, available, completed, and inactive silhouettes without relying on hue alone.

**D. Vellum folio (Adventure Book):** warm ivory pages and nuanced paper grain, dark ink, a stitched/bound spine edge and embossed chapter numerals. Decorative page edges frame *real* written memories, without turning user text into unreadable ornamental typography.

Each component must show believable **edge, face, depth, and contact shadow**. Do not rely on one oversized diffuse box-shadow as the entire depth system. Avoid faked texture noise that degrades readability.

## 5. Brand mark and shape grammar
The primary Fold mark is a **single folded ribbon creating an opening**: the negative space suggests both an unfolded map crease and a passage forward. It should be recognizable in silhouette at 24px and work as an app icon at 128px. The fold-line angle (roughly 35–45°) becomes a recurring subtle design motif for panel corners, card dividers and quest frames.

Do not reuse the ANEVUM corporate orbit mark as the game icon; The Fold may sit inside ANEVUM, but its consumer identity should stand independently. Avoid a generic open-book clipart symbol, stock compass rose or meaningless decorative rune.

Required lockup variations: icon alone, horizontal wordmark, light/dark one-color, inactive embossed state and illuminated active state. The working product name still requires trademark clearance before public adoption.

## 6. Icon system: custom, weighty, game-native
No emoji characters as final navigation or quest art. Build one coherent set of reusable vector game glyphs:
- **Map:** folded-plate compass / map aperture.
- **Quests:** stamped trail crest / mission seal.
- **The Book:** bound folio with a distinct page fold.
- **My Fold:** two interlocking folded ribbons, not fake user avatars.
- **Rank / XP:** star-forged medallion with progress cuts.
- **Privacy:** physical shield / closed aperture, unmistakable off/one-time-on states.
- **Settings:** mechanical 8-point wheel; physically match the control family.
- Seven starter quest emblems: First Page, Just Us, Homebound, Small Wonder, Memory Lane, Little Kindness, Our Ritual.

Design on a **24×24 geometry** for standard controls and **48×48 master artwork** for prominent pins/tiles. Use filled silhouettes plus one inset/highlight plane; do not mix random outline weights. Keep optical center, angle of projection and light direction consistent. At small sizes simplify geometry; do not shrink complex engravings. Use SVG components or sprite assets with accessible text labels. Every icon must remain recognizable in monochrome.

## 7. Map world and camera illusion
A truthful vector map remains available only after explicit opt-in. Use MapLibre geographic layers, not invented POIs. The illustrated offline/demo world can be more stylized, but must be clearly marked as a demo. Actual places are not labeled as quest sites unless the user explicitly marks or validates them.

**Depth stack:** geographic terrain/data → low-cost terrain tint and relief where data supports it → soft atmospheric vignette/ambient lighting → physically grounded markers with contact shadows → raised HUD. Keep streets, water, landmarks, labels and map attribution visible. Avoid permanently obscuring the map with fake terrain effects. Optional 3D building extrusions should depend on actual supported map data and device capability, not imply invented buildings.

Map interaction should feel like handling a living atlas: eased camera motion, gentle selection pulses, tactile zoom controls and a small compass heading indicator. Keep manual marker placement and no-GPS mode first-class. A marker must say **player-placed**, not “nearby adventure,” unless a real verified venue exists.

One-time location handling remains opt-in, with one-tap clear/reset and no background tracking. Revealing a real position must not imply shared location or nearby players.

## 8. Primary interface components
**Top-left brand:** compact Fold emblem inset into a slim metal cartouche, with a wordmark that doesn't consume the viewport.

**Level / XP:** a 3D enamel-and-metal medallion (not a rounded profile badge). Inner radial well for level numeral, segmented or embossed ring for progress and a short, high-contrast numeric XP statement. Reward flashes must never replace accurate XP numbers.

**Compass / map controls:** hand-finished instrument buttons, each with accessible labels; fixed in a compact vertical control cluster on larger screens. On mobile, keep controls outside thumb-obscuring areas and away from map attribution.

**Quest card:** one highlighted mission tile with illustrated icon, one-line intention, XP and a physically raised primary action. The bottom face should show a contact shadow and tactile pressed movement.

**Main navigation:** a floating carved command rail with large *custom glyph buttons*, not a generic website bottom nav bar. Primary destinations: Map, Quests, My Fold, Book; Settings remains secondary. Selected state lifts its icon and reveals a concentrated aurora light underneath. Desktop adapts placement rather than stretching a full-width bar.

**Modals / sheets:** a rising physical panel with a visible rim, layered backing, precise type hierarchy and enough negative space. Body may scroll within its contained sheet; body/page itself does not scroll.

**Adventure Book:** emotional hero feature. Chapter title, date, meaningful memory and reward stamp get distinct hierarchy; page turn has a restrained hinge/fold animation. No mock entries that look like real family history.

**Quest completion:** symbolic fold opens and reveals a gilded chapter seal, XP counts up once, optional subtle particles end within a bounded interval. Respect reduced-motion settings. All rewards remain tied to the existing deterministic game ledger.

## 9. Typography and legibility
Two families maximum: **Marcellus** (or equivalently legible editorial serif) for titles, chapter labels and short signature phrases; **Manrope** (or equivalent strong modern sans) for UI, body, buttons and numeric data. Font licensing, actual font metrics and performance must be checked before shipping.

- Map/HUD primary actions and mobile body labels: normally **14–16px**, with compact support labels no smaller than **12px**. Avoid the existing 8–10px utility text as the normal mobile baseline.
- Titles: 26–38px depending on viewport; adventure headings may use a larger editorial scale in a focus scene.
- Tap targets at least **44×44 CSS px**, preferably 48 on mobile. Targets must not overlap.
- WCAG AA contrast target for important text and interface states; light text on dark enamel, dark ink on vellum. Avoid gold as a small paragraph-text color.
- Content and title lengths must wrap without clipping at 320px width, landscape, zoom and dynamic text size.

## 10. Motion, sound and tactile response
Use a single motion vocabulary. Objects have **mass**, but the game responds immediately.
- Control hover/press: ~120–180ms, slight translate/compression and reflective edge movement.
- Panel reveal: ~220–320ms, easing with fast departure and soft final settle.
- Marker discover/select: ~350–550ms, short scale/lighting response rather than infinite attention pulses.
- Chapter earned: ~600–900ms focused animation, then return control; never block the game unnecessarily.
- Ambient motion: subtle slow atmosphere, used sparingly and suppressed on low-power / reduced-motion settings.
- Optional UI sounds and haptics: short and tasteful, **muted by default** until the player consents. No ambient audio autoplay.

Choose a lightweight composition approach: CSS transforms, opacity and optimized vector layers first; add WebGL/3D only if it visibly improves the map and can run reliably on target devices. A high-end appearance must not depend on a high-end phone.

## 11. Accessibility, performance and honesty
- Maintain the full-viewport/no-page-scroll contract, with internal modal scroll and keyboard/focus management.
- Honor reduced motion, strong text contrast and screen reader labels; no information conveyed by icon/color alone.
- Preserve MapLibre attribution, consent statements, local-save caveats and external map network disclosures.
- Never display invented players, parties, venues, GPS history or unearned achievements.
- The map and identity must degrade gracefully when tiles, fonts, shaders or audio are unavailable.
- Aim for smooth interaction on a typical recent phone, stable frames while panning, no interaction-blocking external asset fetches at game start and careful memory usage. Use measured device traces before promising 60fps everywhere.
- Keep image/sprite/network payloads bounded and versioned; no full-screen video loops as a substitute for a functional world.

## 12. Design deliverables and pass/fail criteria
The next visual implementation may begin only against a complete **art package**, not another collection of disconnected CSS tweaks:

1. Fold mark: full / small / monochrome / inverted SVG set, tested at 24, 48 and 128px.
2. Palette, typography, surface depths, border shapes, glow and motion tokens in one reusable design system.
3. Consistent SVG glyph family: 5 primary navigation, 7 quests, map/compass, XP, privacy, settings and status.
4. Two fully composed reference states—**390×844 mobile** and **1440×900 desktop**—showing the *same* recognizable identity, not two unrelated layouts.
5. Component specifications for medallion, quest tile, marker, navigation rail, panels and book folio.
6. At least one finished **Adventure Book** detail state and an earned-chapter motion storyboard.
7. Map style treatment for daylight/dusk with actual geographic label checks, attribution, offline fallback and honest user-placed markers.
8. Browser and iPhone touch checks; short usability walkthrough: Level 0 → choose adventure → complete two checks → earn 80 XP → see Level 1 → reopen chapter.
9. Color contrast, 320px/landscape bounds, readable type, keyboard access, reduced motion and resource-load robustness.
10. Side-by-side screenshots against the existing PR #7 game. If the revised screen still looks like generic SaaS cards, emoji-driven indie UI, indistinct material or an obscured map, it **fails the art-direction acceptance** even if tests pass.

### Sequence and scope
**First:** establish visual identity, tokens, icons and the mobile + desktop hero scene.  
**Second:** make the quest card, markers, HUD and Book share one material / motion system.  
**Third:** implement and verify interactive responsive states using the **existing gameplay code**.  
**Finally:** test live map provider rendering and actual iPhone Safari; obtain owner visual acceptance before merge or protected Lab preview.

Do **not** use this brief to authorize public release, new social accounts, location sharing, RHEN changes or a production hosting move. Multiplayer and cloud progression remain separate product-engineering milestones. The design can suggest their future visual affordances without pretending they exist now.
