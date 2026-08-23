#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
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

process.stdout.write(`${JSON.stringify({ status: 'installed', codex: true, claude: true }, null, 2)}\n`);
