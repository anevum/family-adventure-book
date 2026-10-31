/**
 * Advisory release gate for anevum/family-adventure-book Cloudflare Builds.
 * Fail closed on missing environment, incorrect source, unavailable GitHub API,
 * incomplete/failed mandatory push workflows, or a moved production ref.
 *
 * NOT wired into the production build until branch protection, tokens, and
 * release/rollback procedures are approved. No third-party dependencies.
 */
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const REPOSITORY = 'anevum/family-adventure-book';
const GITHUB_API = `https://api.github.com/repos/${REPOSITORY}`;
const EXPECTED_BRANCH = 'main';
const SHA_PATTERN = /^[0-9a-f]{40}$/i;
const WORKFLOW_PATTERN = /^\.github\/workflows\/[a-zA-Z0-9._-]+\.ya?ml$/;
const DEFAULT_ATTEMPTS = 12;
const DEFAULT_INTERVAL_MS = 5000;

export class ReleaseGateError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ReleaseGateError';
  }
}

function block(message) {
  throw new ReleaseGateError(message);
}

export function readPolicy(env, checkoutSha) {
  if (env.WORKERS_CI !== '1') block('not running in a Workers Builds environment');
  if (env.WORKERS_CI_BRANCH !== EXPECTED_BRANCH) block('not building production main');
  const sha = env.WORKERS_CI_COMMIT_SHA;
  if (typeof sha !== 'string' || !SHA_PATTERN.test(sha)) block('missing or invalid build commit SHA');
  if (typeof checkoutSha !== 'string' || !SHA_PATTERN.test(checkoutSha) || checkoutSha.toLowerCase() !== sha.toLowerCase()) {
    block('the checked-out Git commit differs from the Workers Builds commit');
  }
  const raw = env.RELEASE_GATE_REQUIRED_WORKFLOWS;
  if (typeof raw !== 'string' || !raw.trim()) block('required workflow policy not configured');
  const workflows = raw.split(',').map(item => item.trim());
  if (workflows.length > 5 || workflows.some(path => !WORKFLOW_PATTERN.test(path)) || new Set(workflows).size !== workflows.length) {
    block('required workflow policy is malformed or contains duplicates');
  }
  if (!workflows.includes('.github/workflows/validate.yml')) {
    block('source validation must be a required workflow');
  }
  return { sha: sha.toLowerCase(), workflows };
}

function workflowPath(value) {
  if (typeof value !== 'string') return null;
  // GitHub may return a bare path or owner/repo/path@ref.
  const base = value.split('@', 1)[0];
  return base.startsWith(`${REPOSITORY}/`) ? base.slice(REPOSITORY.length + 1) : base;
}

/** Classify exact-commit, push-to-main workflow runs. Never accept PR-only runs. */
export function classifyRuns(payload, { sha, workflows }) {
  if (!payload || !Array.isArray(payload.workflow_runs) || !Number.isInteger(payload.total_count) || payload.total_count < 0 || payload.total_count > 100) {
    block('GitHub workflow-run response is invalid or truncated');
  }
  const matching = payload.workflow_runs.filter(run => run && run.head_sha === sha && run.head_branch === EXPECTED_BRANCH && run.event === 'push');
  let pending = false;
  for (const path of workflows) {
    const runs = matching.filter(run => workflowPath(run.path) === path && Number.isSafeInteger(run.id) && run.id > 0);
    if (!runs.length) { pending = true; continue; }
    runs.sort((a, b) => b.id - a.id || (b.run_attempt || 0) - (a.run_attempt || 0));
    const latest = runs[0];
    if (latest.status !== 'completed') { pending = true; continue; }
    if (latest.conclusion !== 'success') block(`required GitHub workflow did not pass: ${path}`);
  }
  return pending ? 'pending' : 'success';
}

async function githubJSON(fetchImpl, endpoint) {
  const url = `${GITHUB_API}${endpoint}`;
  const response = await fetchImpl(url, {
    method: 'GET',
    redirect: 'error',
    signal: AbortSignal.timeout(10000),
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'ANEVUM-Family-Adventure-Release-Gate',
    },
  });
  if (!response || response.status !== 200) {
    block(`GitHub API not available (HTTP ${response?.status ?? 'unknown'})`);
  }
  try { return await response.json(); }
  catch { block('GitHub API supplied invalid JSON'); }
}

async function verifyProductionHead(fetchImpl, sha) {
  const data = await githubJSON(fetchImpl, '/git/ref/heads/main');
  if (!data || data.ref !== 'refs/heads/main' || data.object?.sha !== sha) {
    block('the production branch no longer points to the build commit');
  }
}

export async function verifyReleaseGate({
  env = process.env,
  checkoutSha,
  fetchImpl = globalThis.fetch,
  sleep = delay,
  attempts = DEFAULT_ATTEMPTS,
  intervalMs = DEFAULT_INTERVAL_MS,
} = {}) {
  const policy = readPolicy(env, checkoutSha);
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > 20) block('invalid polling attempts');
  if (typeof fetchImpl !== 'function' || typeof sleep !== 'function') block('missing network or sleep implementation');
  await verifyProductionHead(fetchImpl, policy.sha);
  const query = `?branch=main&event=push&head_sha=${policy.sha}&per_page=100`;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const runs = await githubJSON(fetchImpl, `/actions/runs${query}`);
    const state = classifyRuns(runs, policy);
    if (state === 'success') {
      // Re-read main to avoid a release that is already obsolete.
      await verifyProductionHead(fetchImpl, policy.sha);
      return { sha: policy.sha, workflows: policy.workflows };
    }
    if (attempt < attempts) await sleep(intervalMs);
  }
  block('required push workflow checks are missing or still incomplete');
}

function gitHead() {
  try { return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', timeout: 5000, stdio: ['ignore', 'pipe', 'pipe'] }).trim(); }
  catch { block('could not verify the checked-out Git HEAD'); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  Promise.resolve()
    .then(() => verifyReleaseGate({ checkoutSha: gitHead() }))
    .then(result => console.log(`Release gate authorized ${result.sha.slice(0, 12)} after ${result.workflows.length} required push workflow(s)`))
    .catch(error => {
      console.error(`RELEASE BLOCKED: ${error instanceof ReleaseGateError ? error.message : 'verification unavailable'}`);
      process.exitCode = 1;
    });
}
