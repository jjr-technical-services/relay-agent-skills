#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import path from 'node:path';
import process from 'node:process';

if (process.env.RELAY_DISPOSABLE_HOST_ENV !== '1') {
  throw new Error('Refusing host mutation outside an explicitly disposable environment.');
}

const root = path.resolve(import.meta.dirname, '..');

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', env: process.env });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed (${result.status}): ${result.stderr || result.stdout}`);
  }
  return result.stdout;
}

run('codex', ['plugin', 'marketplace', 'add', root, '--json']);
const codexAvailable = JSON.parse(run('codex', ['plugin', 'list', '--marketplace', 'relay', '--available', '--json']));
for (const name of ['relay-skills', 'relay-product-skills', 'relay-growth-skills']) {
  if (!JSON.stringify(codexAvailable).includes(name)) throw new Error(`Codex marketplace did not parse ${name}.`);
}
run('codex', ['plugin', 'add', 'relay-product-skills@relay', '--json']);
run('codex', ['plugin', 'add', 'relay-growth-skills@relay', '--json']);
run('codex', ['plugin', 'add', 'relay-skills@relay', '--json']);
const codexInstalled = run('codex', ['plugin', 'list', '--json']);
for (const name of ['relay-skills', 'relay-product-skills', 'relay-growth-skills']) {
  if (!codexInstalled.includes(name)) throw new Error(`Codex did not install ${name}.`);
}

const expectedSkills = JSON.parse(await readFile(path.join(root, 'catalog.json'), 'utf8')).skills.map((skill) => skill.name);
const nativeResult = await new Promise((resolve, reject) => {
  const server = spawn('codex', ['app-server'], { cwd: root, env: process.env, stdio: ['pipe', 'pipe', 'ignore'] });
  const timeout = setTimeout(() => { server.kill(); reject(new Error('Codex native skill discovery timed out.')); }, 60_000);
  const lines = createInterface({ input: server.stdout });
  const send = (value) => server.stdin.write(`${JSON.stringify(value)}\n`);
  lines.on('line', (line) => {
    let response;
    try { response = JSON.parse(line); } catch { return; }
    if (response.error) { clearTimeout(timeout); server.kill(); reject(new Error(JSON.stringify(response.error))); }
    if (response.id === 1) {
      send({ method: 'initialized' });
      send({ id: 2, method: 'skills/list', params: { cwds: [root], forceReload: true } });
    }
    if (response.id === 2) { clearTimeout(timeout); server.kill(); resolve(response.result); }
  });
  server.on('error', (error) => { clearTimeout(timeout); reject(error); });
  send({ id: 1, method: 'initialize', params: { clientInfo: { name: 'relay_native_library_qualification', version: '0.3.0' }, capabilities: { experimentalApi: true } } });
});
const nativeSkills = (nativeResult.data || []).flatMap((entry) => entry.skills || []);
for (const name of expectedSkills) {
  if (!nativeSkills.some((skill) => skill.name === `relay-skills:${name}` && skill.enabled !== false)) {
    throw new Error(`Codex did not discover the enabled native workflow relay-skills:${name}.`);
  }
}
const codexMcp = run('codex', ['mcp', 'list']);
if (!codexMcp.includes('relay_skills')) {
  throw new Error('Codex installed relay-skills but did not load its bundled MCP server.');
}

run('claude', ['plugin', 'marketplace', 'add', root]);
const claudeAvailable = run('claude', ['plugin', 'list', '--available', '--json']);
for (const name of ['relay-skills', 'relay-product-skills', 'relay-growth-skills']) {
  if (!claudeAvailable.includes(name)) throw new Error(`Claude marketplace did not parse ${name}.`);
}
run('claude', ['plugin', 'install', 'relay-product-skills@relay', '--scope', 'user']);
run('claude', ['plugin', 'install', 'relay-growth-skills@relay', '--scope', 'user']);
run('claude', ['plugin', 'install', 'relay-skills@relay', '--scope', 'user']);
const claudeInstalled = run('claude', ['plugin', 'list', '--json']);
for (const name of ['relay-skills', 'relay-product-skills', 'relay-growth-skills']) {
  if (!claudeInstalled.includes(name)) throw new Error(`Claude did not install ${name}.`);
}

process.stdout.write(`${JSON.stringify({ status: 'installed', codex: true, claude: true, nativeSkills: expectedSkills.length }, null, 2)}\n`);
