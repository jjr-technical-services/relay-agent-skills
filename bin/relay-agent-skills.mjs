#!/usr/bin/env node
import { cp, lstat, mkdir, mkdtemp, readFile, rename, rm } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import {
  validateBundledSkill,
  validateProductionLock,
  verifyLiveLock,
} from '../lib/package-verification.mjs';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(await readFile(path.join(packageRoot, 'catalog.json'), 'utf8'));
const relayLock = JSON.parse(await readFile(path.join(packageRoot, 'relay-lock.json'), 'utf8'));
const hostRoots = {
  codex: { user: path.join(homedir(), '.agents', 'skills'), project: '.agents/skills' },
  claude: { user: path.join(homedir(), '.claude', 'skills'), project: '.claude/skills' },
};

function usage() {
  return `relay-agent-skills <command> [options]

Commands:
  list [--json]                         List bundled skills.
  verify [skill...] [--release] [--json] Validate bundled skills against relay-lock.json.
  verify-live [--json]                  Compare relay-lock.json with production discovery.
  install <skill...> [options]           Install skills into Codex, Claude Code, or both.
  mcp [--host codex|claude]              Print the Relay MCP configuration for a host.

Install options:
  --host codex|claude|both               Default: both.
  --scope user|project                   Default: user.
  --project-dir <path>                   Project root for project scope. Default: cwd.
  --force                                Replace only the exact target skill directory.
  --json                                 Emit machine-readable output.
`;
}

function parseArguments(argv) {
  const positionals = [];
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith('--')) {
      positionals.push(value);
      continue;
    }
    const [rawKey, inlineValue] = value.slice(2).split('=', 2);
    if (['json', 'force', 'help', 'release'].includes(rawKey)) {
      options[rawKey] = true;
      continue;
    }
    const nextValue = inlineValue ?? argv[index + 1];
    if (!nextValue || (inlineValue === undefined && nextValue.startsWith('--'))) {
      throw new Error(`Option --${rawKey} requires a value.`);
    }
    options[rawKey] = nextValue;
    if (inlineValue === undefined) index += 1;
  }
  return { positionals, options };
}

function skillByName(name) {
  return catalog.skills.find((skill) => skill.name === name);
}

async function validateSkill(skill) {
  return validateBundledSkill({
    packageRoot,
    skill,
    lockEntry: relayLock.skills?.[skill.name] || null,
  });
}

function resolveHosts(value = 'both') {
  if (value === 'both') return ['codex', 'claude'];
  if (value === 'codex' || value === 'claude') return [value];
  throw new Error('--host must be codex, claude, or both.');
}

function installRoot(host, scope, projectDir) {
  if (!hostRoots[host]) throw new Error(`Unsupported host: ${host}`);
  if (scope === 'user') return hostRoots[host].user;
  if (scope === 'project') return path.resolve(projectDir || process.cwd(), hostRoots[host].project);
  throw new Error('--scope must be user or project.');
}

async function installSkills(names, options) {
  const skills = names.map((name) => {
    const skill = skillByName(name);
    if (!skill) throw new Error(`Unknown skill: ${name}`);
    return skill;
  });
  const hosts = resolveHosts(options.host);
  const scope = options.scope || 'user';
  await Promise.all(skills.map(validateSkill));
  const targets = hosts.flatMap((host) => skills.map((skill) => ({
    host,
    skill,
    target: path.join(installRoot(host, scope, options['project-dir']), skill.name),
  })));

  for (const { target } of targets) {
    try {
      await lstat(target);
      if (!options.force) throw new Error(`${target} already exists; pass --force to replace this exact skill.`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  const installed = [];
  for (const { host, skill, target } of targets) {
    const parent = path.dirname(target);
    await mkdir(parent, { recursive: true });
    const staging = await mkdtemp(path.join(parent, `.${skill.name}-install-`));
    try {
      await cp(path.join(packageRoot, skill.path), staging, { recursive: true, errorOnExist: true });
      if (options.force) await rm(target, { recursive: true, force: true });
      await rename(staging, target);
    } catch (error) {
      await rm(staging, { recursive: true, force: true });
      throw error;
    }
    installed.push({ host, scope, name: skill.name, path: target });
  }
  return installed;
}

function print(value, json) {
  if (json) process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
  else if (Array.isArray(value)) {
    for (const row of value) process.stdout.write(`${row.name}\t${row.plugin || row.host}\t${row.digest || row.path || ''}\n`);
  } else process.stdout.write(`${value}\n`);
}

async function main() {
  const [command = 'help', ...argv] = process.argv.slice(2);
  const { positionals, options } = parseArguments(argv);
  if (options.help || ['help', '--help', '-h'].includes(command)) return print(usage(), false);
  if (command === 'list') return print(catalog.skills, options.json);
  if (command === 'verify') {
    if (options.release) validateProductionLock(relayLock);
    const skills = positionals.length ? positionals.map((name) => skillByName(name)) : catalog.skills;
    if (skills.some((skill) => !skill)) throw new Error('One or more requested skills are unknown.');
    return print(await Promise.all(skills.map(validateSkill)), options.json);
  }
  if (command === 'verify-live') {
    await verifyLiveLock(relayLock);
    return print({ status: 'matched', relayOrigin: relayLock.relayOrigin, skills: Object.keys(relayLock.skills) }, options.json);
  }
  if (command === 'install') {
    if (!positionals.length) throw new Error('Install requires at least one skill name.');
    return print(await installSkills(positionals, options), options.json);
  }
  if (command === 'mcp') {
    const host = options.host || 'codex';
    if (host === 'codex') return print('[mcp_servers.relay-skills]\nurl = "https://relay.builtbyrose.co/mcp"\nauth = "oauth"\noauth_resource = "https://relay.builtbyrose.co/mcp"\nscopes = ["relay.skills.read", "relay.skills.route", "relay.skills.activate"]', false);
    if (host === 'claude') return print(JSON.stringify({ mcpServers: { 'relay-skills': { type: 'http', url: 'https://relay.builtbyrose.co/mcp', oauth: { scopes: 'relay.skills.read relay.skills.route relay.skills.activate' } } } }, null, 2), false);
    throw new Error('--host must be codex or claude for the mcp command.');
  }
  throw new Error(`Unknown command: ${command}\n\n${usage()}`);
}

main().catch((error) => {
  process.stderr.write(`relay-agent-skills: ${error.message}\n`);
  process.exitCode = 1;
});
