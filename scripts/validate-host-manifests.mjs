#!/usr/bin/env node
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { PUBLIC_SKILL_SLUGS, sha256, validateProductionLock } from '../lib/package-verification.mjs';

const root = path.resolve(import.meta.dirname, '..');
const scopes = ['relay.skills.read', 'relay.skills.route', 'relay.skills.activate'];

async function json(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), 'utf8'));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const release = process.argv.includes('--release');
  const packageJson = await json('package.json');
  const catalog = await json('catalog.json');
  const lock = await json('relay-lock.json');
  const compatibilityLock = await json('compatibility-lock.json');
  const codexManifest = await json('plugins/relay-skills/.codex-plugin/plugin.json');
  const claudeManifest = await json('plugins/relay-skills/.claude-plugin/plugin.json');
  const codexMcp = await json('plugins/relay-skills/.mcp.json');
  const claudeMcp = await json('plugins/relay-skills/.claude-mcp.json');
  const codexMarketplace = await json('.agents/plugins/marketplace.json');
  const claudeMarketplace = await json('.claude-plugin/marketplace.json');

  assert(packageJson.version === '0.2.1', 'npm package version must be 0.2.1.');
  assert(codexManifest.version === packageJson.version, 'Codex plugin version differs from npm package.');
  assert(claudeManifest.version === packageJson.version, 'Claude plugin version differs from npm package.');
  assert(claudeMarketplace.version === packageJson.version, 'Claude marketplace version differs from npm package.');
  assert(JSON.stringify(catalog.skills.map((skill) => skill.name)) === JSON.stringify(PUBLIC_SKILL_SLUGS), 'Catalog must contain exactly the four public skills in lock order.');
  assert(catalog.skills.every((skill) => skill.plugin === 'relay-skills'), 'Every v0.2.x catalog skill must belong to relay-skills.');

  const codexServer = codexMcp.mcpServers?.relay_skills;
  assert(codexServer?.type === 'http', 'Codex MCP transport must be http.');
  assert(codexServer?.url === 'https://relay.builtbyrose.co/mcp', 'Codex MCP URL is invalid.');
  assert(!('oauth_resource' in codexServer), 'Codex must discover the single OAuth resource from Relay metadata instead of duplicating it.');
  assert(Object.keys(codexMcp.mcpServers || {}).length === 1, 'Codex .mcp.json must contain only the relay_skills server.');

  const claudeServer = claudeMcp.mcpServers?.relay_skills;
  assert(claudeServer?.type === 'http', 'Claude MCP transport must be http.');
  assert(claudeServer?.url === 'https://relay.builtbyrose.co/mcp', 'Claude MCP URL is invalid.');
  assert(claudeServer?.oauth?.scopes === scopes.join(' '), 'Claude OAuth scopes must be one space-separated string.');
  assert(!claudeMcp.mcp_servers, 'Claude MCP config must not use the Codex mcp_servers wrapper.');

  for (const assetField of ['composerIcon', 'logo', 'logoDark']) {
    const relativePath = codexManifest.interface?.[assetField];
    assert(relativePath?.startsWith('./assets/'), `Codex ${assetField} must point into ./assets/.`);
    await access(path.join(root, 'plugins/relay-skills', relativePath));
  }
  assert(Array.isArray(codexManifest.interface?.defaultPrompt), 'Codex defaultPrompt must be an array.');
  assert(codexManifest.interface.defaultPrompt.length <= 3, 'Codex defaultPrompt supports at most three prompts.');
  assert(codexManifest.interface.defaultPrompt.every((prompt) => prompt.length <= 128), 'Codex default prompts must be at most 128 characters.');

  const codexNames = codexMarketplace.plugins.map((plugin) => plugin.name);
  const claudeNames = claudeMarketplace.plugins.map((plugin) => plugin.name);
  for (const name of ['relay-skills', 'relay-product-skills', 'relay-growth-skills']) {
    assert(codexNames.includes(name), `Codex marketplace is missing ${name}.`);
    assert(claudeNames.includes(name), `Claude marketplace is missing ${name}.`);
  }
  assert(claudeMarketplace.plugins.find((plugin) => plugin.name === 'relay-product-skills')?.version === '0.1.0', 'Product compatibility plugin must remain v0.1.0.');
  assert(claudeMarketplace.plugins.find((plugin) => plugin.name === 'relay-growth-skills')?.version === '0.1.0', 'Growth compatibility plugin must remain v0.1.0.');

  for (const [pluginName, expected] of Object.entries(compatibilityLock.plugins)) {
    for (const [relativePath, digest] of Object.entries(expected.files)) {
      const content = await readFile(path.join(root, 'plugins', pluginName, relativePath));
      assert(sha256(content) === digest, `${pluginName}/${relativePath} changed after v0.1.0 freeze.`);
    }
  }

  for (const excluded of [
    'daily-meeting-prep',
    'relay-plan-voice-agent',
    'relay-implement-voice-agent',
    'relay-qualify-voice-agent',
    'relay-release-voice-agent',
    'relay-deliver-voice-agent',
    'silk-design',
  ]) {
    assert(!catalog.skills.some((skill) => skill.name === excluded), `${excluded} must remain outside public distribution.`);
  }

  const productionPromoted = lock.distributionStatus === 'production_promoted';
  if (release || productionPromoted) {
    validateProductionLock(lock);
    const app = await json('plugins/relay-skills/.app.json');
    assert(codexManifest.apps === './.app.json', 'Release Codex manifest must map apps to ./.app.json.');
    const relayApp = app.apps?.['relay-skills'];
    assert(/^asdk_app_[a-f0-9]+$/.test(relayApp?.id || ''), '.app.json must contain the registered ChatGPT app ID.');
    assert(!('required' in relayApp), 'Local host distribution must not force the registered app over the bundled MCP server.');
  } else {
    assert(!codexManifest.apps, 'Candidate manifest must not advertise .app.json before ChatGPT registration.');
  }

  process.stdout.write(`${JSON.stringify({ status: 'valid', release, skills: PUBLIC_SKILL_SLUGS }, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`validate-host-manifests: ${error.message}\n`);
  process.exitCode = 1;
});
