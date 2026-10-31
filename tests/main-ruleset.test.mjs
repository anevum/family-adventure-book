import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ruleset = JSON.parse(readFileSync(new URL('../ops/github/rulesets/main-initial.json', import.meta.url), 'utf8'));
const rule = type => ruleset.rules.find(item => item.type === type);

test('imports as an active branch ruleset targeting only main', () => {
  assert.equal(ruleset.target, 'branch');
  assert.equal(ruleset.enforcement, 'active');
  assert.deepEqual(ruleset.conditions.ref_name, { include: ['refs/heads/main'], exclude: [] });
});

test('does not grant administrator or integration bypass', () => {
  assert.deepEqual(ruleset.bypass_actors, []);
});

test('requires a pull request while permitting a solo maintainer', () => {
  const p = rule('pull_request')?.parameters;
  assert.ok(p);
  assert.equal(p.required_approving_review_count, 0);
  assert.equal(p.require_code_owner_review, false);
  assert.equal(p.require_last_push_approval, false);
  assert.deepEqual(p.allowed_merge_methods.slice().sort(), ['merge', 'rebase', 'squash']);
});

test('prevents deletion and force pushes', () => {
  assert.ok(rule('deletion'));
  assert.ok(rule('non_fast_forward'));
  assert.equal(ruleset.rules.filter(item => item.type === 'deletion').length, 1);
});

test('requires exactly the current GitHub Actions source-smoke check', () => {
  const p = rule('required_status_checks')?.parameters;
  assert.ok(p);
  assert.equal(p.strict_required_status_checks_policy, true);
  assert.equal(p.do_not_enforce_on_create, false);
  assert.deepEqual(p.required_status_checks, [
    { context: 'source-smoke', integration_id: 15368 },
  ]);
});

test('does not require checks absent from main or the unrelated Cloudflare preview', () => {
  const list = rule('required_status_checks').parameters.required_status_checks.map(x => x.context);
  for (const premature of ['history-credential-check', 'release-gate-unit-tests', 'Workers Builds: family-adventure-book']) {
    assert.ok(!list.includes(premature));
  }
});

test('does not contain secrets or repository-specific user identities', () => {
  const content = JSON.stringify(ruleset);
  assert.doesNotMatch(content, /github_pat_|ghp_|cf-access-token|Bearer|devon@|hotmail\.com/i);
});

test('ruleset is auditable and includes only expected initial rule types', () => {
  assert.deepEqual(ruleset.rules.map(x => x.type).sort(), [
    'deletion','non_fast_forward','pull_request','required_status_checks',
  ]);
});
