# Evergrove: first real-life adventure

Session: `ANEVUM.WEB.BUILD.2026-10-12.007.EVERGROVE-FIRST-REAL-ADVENTURE`

This is a **development feature** in the existing local-save family Adventure Book. The owner-only ANEVUM creator showcase and production platform remain separate. Never publish personal quest files to this public repository.

## Play the first chapter

1. Open **Quests** and choose **Plan a cozy evening** for a reusable, editable two-hour Together quest. Date defaults to the current browser date; time defaults to 10 PM.
2. Alternatively, choose **Import a private quest** and select a local `.json` file that follows the schema below. No data is transmitted or uploaded.
3. The new quest appears on the Adventure Board. Its planned date/time also appears in the in-game calendar, **not** in Google Calendar.
4. Open the quest, optionally check off each moment as it happens, and enjoy the time away from the screen.
5. Afterward, choose **We did it!**, record an optional note and photograph, and **Complete chapter**. This existing prototype awards 60 family XP and 15 Adventure Tokens **once**, creates a dated Chronicle entry, and unlocks the Hearthlight badge/lantern glow for a completed cozy-evening quest.
6. Use **Crew > Export progress** to retain a manual copy. No cloud backup or recovery exists.

## Private import contract

```json
{
  "schema": "evergrove-adventure-v1",
  "title": "A Cozy Evening",
  "description": "Spend a quiet evening together.",
  "category": "Together",
  "duration": "2 hours",
  "date": "2026-10-12",
  "time": "22:00",
  "audience": "adults",
  "participants": ["Guest One", "Guest Two"],
  "steps": ["Share dessert", "Relax together", "Watch a movie"],
  "template": "cozy-evening"
}
```

Allowed categories: Explore, Together, At Home, Creative, Learn, Surprise. Duration is one of 30 minutes, 1 hour, 2 hours, Half a day, Full day. Date must be valid YYYY-MM-DD and time valid 24-hour HH:MM in the browser's local timezone. 1–8 steps are required. The app limits file size to 16 KiB and validates lengths and types. Imported strings are escaped in all HTML-rendered quest details.

The personal file is **never** committed to source. Only a generic fictional preset is in the repository.

## Limits and security

This is an **unauthenticated localStorage prototype**. Anyone sharing the same browser profile can see saved notes. Incognito clearing, storage eviction, app resets, or switching devices may lose progress. Export is manual and not an encrypted backup. Do not upload irreplaceable family photographs, children's private records, credentials, or sensitive data. The public-safe `dist-showcase/` build continues to disable personal entry, uploads, and persistence outside its own fictional session data.

No Google Calendar sync, real family account invitations, personal media protection, or multi-device collaboration is implemented. The separate user-created Google Calendar event remains unchanged.

## Acceptance checklist

- Fresh browser: create the generic template and verify date, time, Together category, and three optional steps.
- Import a valid local file and confirm its names/description remain browser-only, no network requests, and a matching calendar day and 10 PM event.
- Reject an oversized, invalid-date, malformed-schema, or HTML-injection file safely.
- Check/uncheck steps and reload; progress persists.
- Complete the quest once and confirm one Chronicle entry, +60 XP, +15 Tokens, Hearthlight unlocked and world updated on next home visit. Reopening a completed quest must not award twice.
- Confirm existing demo quests, world walking, mobile navigation, save/export/reset and original showcase branch are intact.

Code-level checks run through `node tests/check-release.mjs`. Real-device 320/390/1024/1440px, keyboard, reduced-motion, and visual acceptance remain needed before merging or deployment.
