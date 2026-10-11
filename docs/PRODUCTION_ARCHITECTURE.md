# Production Architecture — Private Family First, Multi-Family Later

This is a **design plan**. The prototype does not implement this backend.

## Separation

Make a new, independent repository and a separate hosting project, auth environment, database and media bucket. Do not reuse ANEVUM accounts, database credentials, Railway services or domains.

## Stack proposal

- Static responsive PWA frontend; the prototype has no third-party runtime dependencies.
- New Cloudflare Workers API for authentication, family scoping, calendar and progression rules.
- Dedicated Cloudflare D1 database for families, members, quests, completions, memories, events, inventories and achievements.
- Dedicated private R2 bucket for photos and voice memories; short-lived signed media access, encryption and safe image transformation.
- Server-authoritative quest completions, badge unlocking and permission checks. Cron jobs for scheduled events, expiration and anniversary notifications.
- Alternative: a private PostgreSQL service + independent auth/storage if more suitable after capacity testing.

## Suggested schema

- `users(id, email, auth_provider_id, created_at)`
- `families(id, name, created_at, founder_user_id, visibility)`
- `family_members(id, family_id, user_id NULL, managed_child_id NULL, role, state, invited_by, created_at)`
- `managed_children(id, family_id, display_name, guardian_membership_id)`
- `profiles(id, family_id, membership_id, display_name, avatar_config_json, xp, settings_json)`
- `quests(id, family_id, title, description, category, status, due_at, created_by, created_at)`
- `quest_participants(quest_id, family_id, membership_id, status)`
- `quest_completions(id, family_id, quest_id, completed_by, completed_at, xp_granted, transaction_id)`
- `memories(id, family_id, title, body, occurred_at, author_membership_id, audience_policy, quest_id NULL)`
- `media(id, family_id, memory_id, owner_membership_id, r2_object_key, mime_type, checksum, created_at)`
- `events(id, family_id, title, starts_at, ends_at, timezone, recurrence_rule NULL, owner_membership_id)`
- `inventory(id, family_id, profile_id NULL, item_id, quantity, earned_at)`
- `badges(id, family_id, profile_id NULL, badge_definition_id, earned_at)`
- `reward_ledger(id, family_id, profile_id NULL, reason, source_id, delta_xp, delta_tokens, created_at)`
- `world_states(family_id, level, scene_json, season, updated_at)`

**All tenant-scoped tables carry `family_id` and are filtered by verified membership on the server.** Membership and media access must not rely solely on frontend filters. Avoid exposing bare sequential IDs publicly. Enforce idempotent rewards with stable event IDs/unique constraints.

## Security & children

Do not launch real account creation until threat-modeling, access checks, passwordless/login flows, invitation expiration/revocation, guardian roles, deletion/export, media virus/content checks, backup restoration and incident response are complete. Children's accounts are guardian-managed, private by default. Any public product for children requires dedicated review of privacy and parental-consent laws.

## Rollout

- Milestone A: Host the static visual demo, test Safari iOS, Android Chrome, reduced motion, performance.
- Milestone B: Move only crew and auth to server-side family workspace; no public signups.
- Milestone C: Move quests, Chronicle, media and calendar; implement recovery and export.
- Milestone D: Ship animation assets, richer rigs and multiple world scenes using performance budgets.
- Milestone E: Invite family; validate actual use, then consider later platform expansion.

## Data migration caveat

The prototype stores a JSON shape under `adventure_book_local_preview_v1`. A production importer would need strict schema validation, authenticated family ownership checks, duplicate detection, safe media parsing and manual confirmation before accepting demo data. Do not treat exported local JSON as authoritative rewards.