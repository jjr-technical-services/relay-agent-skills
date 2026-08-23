import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const cli = path.join(root, 'bin', 'relay-agent-skills.mjs');

function run(args, options = {}) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd: options.cwd || root,
    env: { ...process.env, HOME: options.home || process.env.HOME },
    encoding: 'utf8',
  });
}

test('top-level help flags print usage', () => {
  for (const flag of ['--help', '-h']) {
    const result = run([flag]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /relay-agent-skills <command>/);
  }
});

test('verify validates all four bundled skills against the candidate lock', () => {
  const result = run(['verify', '--json']);
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.deepEqual(report.map((entry) => entry.name), [
    'relay-skill-router',
    'kpi-tree',
    'ab-test-setup',
    'negotiate-tactically',
  ]);
  assert.equal(report.every((entry) => /^sha256:[a-f0-9]{64}$/.test(entry.digest)), true);
});

test('release verification fails closed until production promotion supplies exact evidence', () => {
  const result = run(['verify', '--release']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /not production-promoted/);
});

test('host manifest validation accepts the candidate and rejects release mode', () => {
  const candidate = spawnSync(process.execPath, [path.join(root, 'scripts/validate-host-manifests.mjs')], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(candidate.status, 0, candidate.stderr);
  const release = spawnSync(process.execPath, [path.join(root, 'scripts/validate-host-manifests.mjs'), '--release'], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(release.status, 1);
  assert.match(release.stderr, /not production-promoted/);
});

test('project installation targets both host skill roots', async (t) => {
  const project = await mkdtemp(path.join(tmpdir(), 'relay-agent-skills-project-'));
  t.after(() => rm(project, { recursive: true, force: true }));
  const result = run(['install', 'kpi-tree', '--scope', 'project', '--host', 'both', '--project-dir', project, '--json']);
  assert.equal(result.status, 0, result.stderr);
  const installed = JSON.parse(result.stdout);
  assert.equal(installed.length, 2);
  assert.match(await readFile(path.join(project, '.agents/skills/kpi-tree/SKILL.md'), 'utf8'), /name: kpi-tree/);
  assert.match(await readFile(path.join(project, '.claude/skills/kpi-tree/SKILL.md'), 'utf8'), /name: kpi-tree/);
});

test('installer refuses replacement unless force is explicit', async (t) => {
  const project = await mkdtemp(path.join(tmpdir(), 'relay-agent-skills-existing-'));
  t.after(() => rm(project, { recursive: true, force: true }));
  assert.equal(run(['install', 'ab-test-setup', '--scope', 'project', '--host', 'codex', '--project-dir', project]).status, 0);
  const duplicate = run(['install', 'ab-test-setup', '--scope', 'project', '--host', 'codex', '--project-dir', project]);
  assert.equal(duplicate.status, 1);
  assert.match(duplicate.stderr, /already exists/);
  assert.equal(run(['install', 'ab-test-setup', '--scope', 'project', '--host', 'codex', '--project-dir', project, '--force']).status, 0);
});
