# Family Adventure Book — initial GitHub main protection

**Status: STAGED ONLY, NOT APPLIED.** Small Job 038 of the GitHub reorganization.
The exact account has repository admin permissions, but the installed GitHub
connection lacks the separate administration API permission required to create
or edit branch rulesets (the protection endpoint returns HTTP 403). Committing
the JSON file does **not** activate any GitHub rule. An administrator must
import or create it in the GitHub repository Settings.

## Confirmed existing checks and release ownership

As observed October 30 local time (October 31 UTC):

- Repository: `anevum/family-adventure-book`; existing default branch `main`.
- `main` currently reports `protected: false`; no repository rulesets were
  returned. Never describe this staged configuration as live protection.
- Present pull-request job: **`source-smoke`**, supplied by the GitHub
  Actions application (app ID **15368**). It passes on the current main
  commit and the two draft security/release PRs.
- **Do not require** `history-credential-check` or
  `release-gate-unit-tests` in the initial ruleset: their workflows only
  exist on independent, unmerged draft PRs #14 and #15. Requiring them now
  would deadlock staged merges.
- **Do not require** `Workers Builds: family-adventure-book` in the initial
  ruleset. Cloudflare's preview checks include historical failed attempts,
  and the production build is not yet CI-gated.
- Production builds are still managed by **Cloudflare Builds watching
  `main`**, independent of GitHub required status checks. Branch protection
  is an important prerequisite, not a substitute for the separate release
  gate, token scope, app verification or rollback.

## Staged ruleset

File: [ops/github/rulesets/main-initial.json](../ops/github/rulesets/main-initial.json).

The import payload targets **only `refs/heads/main`**, with:

- Active enforcement, no bypass actors, no deletion and no force pushes.
- All updates through a pull request, with **zero required approvals**
  (solo-maintainer friendly; a second person's review is encouraged but
  not assumed).
- The exact required `source-smoke` status context from GitHub Actions
  app ID **15368**.
- Strict freshness: the PR must be tested against the latest `main`.
- No signed-commit requirement or merge-method restriction that would
  unexpectedly block existing working procedures.

## Apply using repository administrator access

1. Open [GitHub repository Rulesets](https://github.com/anevum/family-adventure-book/settings/rules).
   If this link does not show the editor, use
   **Settings → Rules → Rulesets** in the repository.
2. Choose to **import a ruleset JSON**, using
   `ops/github/rulesets/main-initial.json` from this draft branch.
   GitHub also supports creating a *new branch ruleset* manually with
   identical settings; review all imported fields before saving.
3. Confirm `main` is the **only** target, enforcement **Active**,
   zero bypass actors, deletion and force pushes blocked, a PR required
   with zero approvals, and the strict `source-smoke` check scoped to
   GitHub Actions as the source. Do **not** add the Cloudflare check.
4. Save the ruleset. This GitHub settings change does not modify
   application files or deploy a Worker by itself.
5. Verify using GitHub's UI and the GitHub API:
   `GET /repos/anevum/family-adventure-book/branches/main` should
   report `protected: true`; `GET /repos/anevum/family-adventure-book/rulesets`
   should show an **active** branch ruleset. Inspect its full rules
   to confirm `source-smoke` and the no-bypass protections.
6. Recheck that both draft PRs remain **unmerged**, and Cloudflare's
   current production deployment ID is unchanged.

Do not merge [PR #14](https://github.com/anevum/family-adventure-book/pull/14)
or [PR #15](https://github.com/anevum/family-adventure-book/pull/15)
as a side effect of applying branch protection. The production source
change still requires a staged, verified fail-closed Cloudflare release
path and a rehearsed rollback.

## After the safe release cutover

When the security and release-gate workflow files actually exist on
`main`, and their PR checks are verified on the intended exact commits,
**update the same active ruleset** to also require:

- `history-credential-check` (GitHub Actions),
- `release-gate-unit-tests` (GitHub Actions),
- the existing `source-smoke` (GitHub Actions).

Keep the separate Cloudflare worker deployment controls aligned with
the *push-run workflow* policy defined in
[RELEASE_GATE_STAGING.md](./RELEASE_GATE_STAGING.md).
Do not confuse PR check requirements with Cloudflare's separate
post-merge push-run verifier.

## Rollback and limitations

An authorized repository administrator can temporarily disable or
adjust this ruleset if it unexpectedly blocks safe repository work,
then inspect required status contexts before re-enabling it. This
reverses only GitHub repository governance, not production Worker
deployments. Do not grant a standing administrator bypass to work
around an incorrect check name or incomplete CI.

This file's schema and invariants are checked by
`node --test tests/main-ruleset.test.mjs`. Those tests prove that the
*staged JSON* matches our intended settings; only a GitHub API/UI
readback after import can prove actual enforcement.

Current work and release gaps are tracked in
[issue #11](https://github.com/anevum/family-adventure-book/issues/11).
