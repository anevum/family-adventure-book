import test from 'node:test';
import assert from 'node:assert/strict';
import { readPolicy, classifyRuns, verifyReleaseGate, ReleaseGateError } from '../scripts/verify-release-gate.mjs';

const SHA = 'a'.repeat(40);
const SHA_OTHER = 'b'.repeat(40);
const VALIDATE = '.github/workflows/validate.yml';
const HISTORY = '.github/workflows/history-credentials.yml';
const validEnv = () => ({
  WORKERS_CI: '1', WORKERS_CI_BRANCH: 'main', WORKERS_CI_COMMIT_SHA: SHA,
  RELEASE_GATE_REQUIRED_WORKFLOWS: `${VALIDATE},${HISTORY}`,
});
const run = (path = VALIDATE, changes = {}) => ({
  id: path === VALIDATE ? 100 : 101, path, head_sha: SHA, head_branch: 'main',
  event: 'push', status: 'completed', conclusion: 'success', run_attempt: 1, ...changes,
});
const data = (runs) => ({ total_count: runs.length, workflow_runs: runs });
function mockGitHub({ headShas = [SHA, SHA], runs = [run(), run(HISTORY)], statuses = {} } = {}) {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    const isRef = url.endsWith('/git/ref/heads/main');
    const status = statuses[isRef ? 'ref' : 'runs'] ?? 200;
    const headSha = headShas[Math.min(calls.filter(c => c.url.endsWith('/git/ref/heads/main')).length - 1, headShas.length - 1)];
    return { status, json: async () => isRef ? { ref: 'refs/heads/main', object: { sha: headSha } } : data(typeof runs === 'function' ? runs(calls.filter(c => c.url.includes('/actions/runs')).length) : runs) };
  };
  return { fetchImpl, calls };
}
async function verify(overrides = {}) {
  const { fetchImpl } = mockGitHub();
  return verifyReleaseGate({ env: validEnv(), checkoutSha: SHA, fetchImpl, sleep: async () => {}, attempts: 2, ...overrides });
}

test('permits only both successful exact-head push workflows', async () => {
  const { fetchImpl, calls } = mockGitHub();
  const r = await verify({ fetchImpl });
  assert.deepEqual(r.workflows, [VALIDATE, HISTORY]);
  assert.equal(calls.length, 3); // main before, runs, main after
  assert.match(calls[1].url, /branch=main&event=push&head_sha=aaaa/);
  assert.equal(calls[1].options.redirect, 'error');
});

test('accepts repo-qualified GitHub workflow paths with ref suffix', () => {
  assert.equal(classifyRuns(data([run('anevum/family-adventure-book/.github/workflows/validate.yml@refs/heads/main')]), {sha:SHA,workflows:[VALIDATE]}), 'success');
});

test('rejects missing Workers Builds environment', () => assert.throws(() => readPolicy({...validEnv(),WORKERS_CI:undefined},SHA), /Workers Builds/));
test('rejects preview branch', () => assert.throws(() => readPolicy({...validEnv(),WORKERS_CI_BRANCH:'feature/foo'},SHA), /production main/));
test('rejects missing or malformed commit SHA', () => assert.throws(() => readPolicy({...validEnv(),WORKERS_CI_COMMIT_SHA:'abc'},SHA), /invalid build commit/));
test('rejects mismatched checked-out commit', () => assert.throws(() => readPolicy(validEnv(),SHA_OTHER), /checked-out Git commit/));
test('rejects missing required workflow policy', () => assert.throws(() => readPolicy({...validEnv(),RELEASE_GATE_REQUIRED_WORKFLOWS:''},SHA), /not configured/));
test('rejects policy omitting source workflow', () => assert.throws(() => readPolicy({...validEnv(),RELEASE_GATE_REQUIRED_WORKFLOWS:HISTORY},SHA), /source validation/));
test('rejects duplicate required workflows', () => assert.throws(() => readPolicy({...validEnv(),RELEASE_GATE_REQUIRED_WORKFLOWS:`${VALIDATE},${VALIDATE}`},SHA), /malformed/));
test('rejects invalid workflow paths', () => assert.throws(() => readPolicy({...validEnv(),RELEASE_GATE_REQUIRED_WORKFLOWS:`${VALIDATE},../exfil.yml`},SHA), /malformed/));
test('rejects missing first main branch ref', async () => { const {fetchImpl}=mockGitHub({headShas:[SHA_OTHER]}); await assert.rejects(verify({fetchImpl}), /branch no longer/); });
test('rejects main branch moving after checks pass', async () => { const {fetchImpl}=mockGitHub({headShas:[SHA,SHA_OTHER]}); await assert.rejects(verify({fetchImpl}), /branch no longer/); });
test('rejects GitHub API rate-limit or unauthorized response', async () => { const {fetchImpl}=mockGitHub({statuses:{runs:403}}); await assert.rejects(verify({fetchImpl}), /HTTP 403/); });
test('rejects unavailable ref API', async () => { const {fetchImpl}=mockGitHub({statuses:{ref:503}}); await assert.rejects(verify({fetchImpl}), /HTTP 503/); });
test('rejects malformed workflow payload', () => assert.throws(() => classifyRuns({total_count:101,workflow_runs:[]},{sha:SHA,workflows:[VALIDATE]}), /invalid or truncated/));
test('rejects failed required check', async () => { const {fetchImpl}=mockGitHub({runs:[run(),run(HISTORY,{conclusion:'failure'})]}); await assert.rejects(verify({fetchImpl}), /did not pass/); });
test('rejects cancelled required check', async () => { const {fetchImpl}=mockGitHub({runs:[run(),run(HISTORY,{conclusion:'cancelled'})]}); await assert.rejects(verify({fetchImpl}), /did not pass/); });
test('rejects success from PR event without push', async () => { const {fetchImpl}=mockGitHub({runs:[run(),run(HISTORY,{event:'pull_request'})]}); await assert.rejects(verify({fetchImpl}), /missing or still incomplete/); });
test('rejects success for another commit', async () => { const {fetchImpl}=mockGitHub({runs:[run(),run(HISTORY,{head_sha:SHA_OTHER})]}); await assert.rejects(verify({fetchImpl}), /missing or still incomplete/); });
test('rejects success from another branch', async () => { const {fetchImpl}=mockGitHub({runs:[run(),run(HISTORY,{head_branch:'development'})]}); await assert.rejects(verify({fetchImpl}), /missing or still incomplete/); });
test('rejects wrong workflow path with matching name', async () => { const {fetchImpl}=mockGitHub({runs:[run(),run('.github/workflows/fake.yml')]}); await assert.rejects(verify({fetchImpl}), /missing or still incomplete/); });
test('rejects missing mandatory scanner workflow', async () => { const {fetchImpl}=mockGitHub({runs:[run()]}); await assert.rejects(verify({fetchImpl}), /missing or still incomplete/); });
test('rejects indefinitely queued check', async () => { const {fetchImpl}=mockGitHub({runs:[run(),run(HISTORY,{status:'queued',conclusion:null})]}); await assert.rejects(verify({fetchImpl}), /missing or still incomplete/); });
test('selects newest rerun, not stale prior successful run', async () => { const {fetchImpl}=mockGitHub({runs:[run(),run(HISTORY),run(HISTORY,{id:999,status:'in_progress',conclusion:null})]}); await assert.rejects(verify({fetchImpl}), /missing or still incomplete/); });
test('allows queued run when it later succeeds on exact commit', async () => { const {fetchImpl}=mockGitHub({runs:n=>n===1?[run(),run(HISTORY,{status:'queued',conclusion:null})]:[run(),run(HISTORY)]}); await verify({fetchImpl}); });
test('rejects missing checkout sha', async () => { await assert.rejects(verify({checkoutSha:undefined}), /checked-out Git commit/); });
test('requires valid retry bounds', async () => { await assert.rejects(verify({attempts:0}), /invalid polling attempts/); });
test('denies malformed JSON response', async () => { const {fetchImpl}=mockGitHub(); let count=0; const bad=async(url,opts)=>{const r=await fetchImpl(url,opts);if(++count===2)return {status:200,json:async()=>{throw Error('parse')}};return r};await assert.rejects(verify({fetchImpl:bad}), /invalid JSON/); });
test('uses only the configured required workflows, not Cloudflare check-run statuses', async () => { const {fetchImpl}=mockGitHub({runs:[run(),run(HISTORY)]});await verify({fetchImpl}); });
