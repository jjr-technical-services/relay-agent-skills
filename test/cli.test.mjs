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

test('verify validates the complete native library against locked files', () => {
  const result = run(['verify', '--json']);
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.length, 63);
  for (const name of ['relay-skill-router', 'kpi-tree', 'ab-test-setup', 'negotiate-tactically', 'steel-design', 'write-grant-proposal', 'get-started-with-relay']) {
    assert.ok(report.some((entry) => entry.name === name), `${name} must be included`);
  }
  assert.equal(report.every((entry) => /^sha256:[a-f0-9]{64}$/.test(entry.digest)), true);
});

test('release verification accepts the exact production-promoted evidence', () => {
  const result = run(['verify', '--release']);
  assert.equal(result.status, 0, result.stderr);
});

test('host manifest validation accepts the promoted lock in normal and release modes', () => {
  const promoted = spawnSync(process.execPath, [path.join(root, 'scripts/validate-host-manifests.mjs')], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(promoted.status, 0, promoted.stderr);
  const release = spawnSync(process.execPath, [path.join(root, 'scripts/validate-host-manifests.mjs'), '--release'], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.equal(release.status, 0, release.stderr);
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


test('explicit OAuth setup requests refresh-token access on both hosts', async () => {
  const codex = run(['mcp', '--host', 'codex']);
  assert.equal(codex.status, 0, codex.stderr);
  assert.match(codex.stdout, /scopes = \["offline_access",/);
  const claude = run(['mcp', '--host', 'claude']);
  assert.equal(claude.status, 0, claude.stderr);
  const scopes = JSON.parse(claude.stdout).mcpServers['relay-skills'].oauth.scopes.split(' ');
  assert.deepEqual(scopes, ['offline_access', 'relay.skills.read', 'relay.skills.route', 'relay.skills.activate', 'relay.assets.read', 'relay.assets.write', 'relay.assets.publish', 'relay.agents.write', 'relay.runs.create', 'relay.runs.read', 'relay.runs.respond', 'relay.work_orders.create', 'relay.work_orders.read', 'relay.commissions.create', 'relay.commissions.read', 'relay.rooms.read', 'relay.rooms.write']);
  const codexManifest = JSON.parse(await readFile(path.join(root, 'plugins/relay-skills/.mcp.json'), 'utf8'));
  assert.deepEqual(codexManifest.mcpServers.relay_skills.scopes, scopes);
  const manifest = JSON.parse(await readFile(path.join(root, 'plugins/relay-skills/.claude-mcp.json'), 'utf8'));
  assert.deepEqual(Object.values(manifest.mcpServers)[0].oauth.scopes.split(' '), scopes);
});

test('expanded native installation preserves design references without a Relay connection', async (t) => {
  const project = await mkdtemp(path.join(tmpdir(), 'relay-native-library-'));
  t.after(() => rm(project, { recursive: true, force: true }));
  const result = run(['install', 'steel-design', 'get-started-with-relay', '--scope', 'project', '--host', 'both', '--project-dir', project, '--json']);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).length, 4);
  for (const hostRoot of ['.agents/skills', '.claude/skills']) {
    const guide = await readFile(path.join(project, hostRoot, 'get-started-with-relay/references/workflows.md'), 'utf8');
    assert.match(guide, /research-competitive-positioning/);
    assert.match(guide, /write-grant-proposal/);
    const design = await readFile(path.join(project, hostRoot, 'steel-design/SKILL.md'), 'utf8');
    assert.match(design, /name: steel-design/);
  }
});
