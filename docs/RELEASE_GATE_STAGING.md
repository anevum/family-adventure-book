# Family Adventure Book — production release-gate preparation

Status: **PROPOSED / NOT ACTIVE IN PRODUCTION.** This is a source-only,
non-deploying preparation PR. It does not change the existing Cloudflare
production build/deploy configuration or GitHub branch protection.

## Current verified release boundary

Cloudflare Workers Builds watches public `anevum/family-adventure-book`
repository's `main`. Its build command is currently
`node tests/check-release.mjs` and deploy command `npx wrangler deploy`,
with `README.md` excluded from watch paths. The production Worker must be
preserved until a tested handover. GitHub Actions checks are **not** required
by the current Cloudflare deployer, and `main` is unprotected. See
[release issue #11](https://github.com/anevum/family-adventure-book/issues/11).

## What this candidate gate does

`scripts/verify-release-gate.mjs` is an independent, dependency-free Node 22
script. When invoked by a *separately configured* Cloudflare **production
build command**, it denies a release unless all of the following hold:

1. Workers Builds reports `WORKERS_CI=1`, branch `main`, and a valid
   `WORKERS_CI_COMMIT_SHA`; the checked-out Git `HEAD` is the same SHA.
2. GitHub's current `refs/heads/main` points to that exact SHA.
3. Every explicitly configured mandatory GitHub Actions workflow has a
   **successful, completed push event on main for that exact SHA**, not merely
   a pull-request result. It polls for up to 12 attempts at five seconds
   apart to allow independent GitHub Actions jobs to finish.
4. GitHub's `main` ref still points to the build SHA immediately before the
   gate returns success.

A missing workflow policy, wrong SHA/branch, GitHub API error, rate limit,
missing/pending/failed/cancelled workflow, malformed response, or moved ref
blocks deployment with a nonzero exit code. The Cloudflare status check is
*not* used as a required prerequisite because that would be circular.

The policy is set **outside the repository** in the Cloudflare Workers Builds
environment as `RELEASE_GATE_REQUIRED_WORKFLOWS`, a comma-separated list of
workflow paths. The gate always requires
`.github/workflows/validate.yml` and rejects an empty policy. Recommended
final policy *after all workflows are live*:

```text
RELEASE_GATE_REQUIRED_WORKFLOWS=.github/workflows/validate.yml,.github/workflows/release-gate-tests.yml,.github/workflows/history-credentials.yml
```

No GitHub token is embedded in code or logs. The repo is public and GitHub's
unauthenticated API may be subject to IP-based rate limits. A rate-limit or
API failure blocks the release rather than allowing it. If a read-only token
is needed later, it must be scoped and managed outside Git history.

## How to verify this candidate without a production release

```sh
node --test tests/verify-release-gate.test.mjs
node tests/check-release.mjs
```

The automated tests use simulated, fixed GitHub API replies and contain no
network calls or secrets. They cover approvals and failures, including
preview branches, PR-only success, stale commits, duplicate workflows,
missing scanner checks, API denial, cancellation, pending checks, and an
updated `main` ref. The separate GitHub Actions workflow runs these tests
on PRs but never deploys.

## Future cutover — NOT EXECUTED in this job

1. With a GitHub **administrator-capable** connection, protect `main` against
   direct pushes/force pushes and require `source-smoke` plus the test and
   history checks once installed. Current GitHub app access lacks that API.
2. Review and scope the existing user-owned Cloudflare Builds token; verify
   restore capability, currently deployed Worker version, routes and access
   policies. The OAuth connection cannot inspect user-token scopes.
3. Establish a rollback checkpoint and controlled source/asset acceptance
   test. Do not change the production Worker until both exist.
4. Stage a fail-closed Cloudflare production build command that runs the
   independent gate *before* `npx wrangler deploy`, using the policy stored
   outside Git. Ensure the gate script is available in the exact intended
   production commit; do not temporarily bypass the gate to release it.
5. Confirm the **push** GitHub Actions runs complete and the Cloudflare build
   waits/rejects as expected. Test a missing/failed required workflow and
   stale branch SHA on a nonproduction test deployment, then prove rollback.
6. Only after those checks, finish the security PR and update the mandatory
   workflow policy. Leave the production trigger unchanged until cutover is
   explicitly verified.

### What this does *not* guarantee

This script does not itself protect GitHub workflows, workflow files, or
`main`. Without GitHub branch rules, a user able to push source can also
change this script. It cannot make the ref check/deploy atomic, prevent
an admin from bypassing the build system, prove secrets are scoped, or verify
application authentication. Those are independent release controls.

Do not claim a production CI gate is enforced merely because this script and
its synthetic tests pass in a draft PR.
