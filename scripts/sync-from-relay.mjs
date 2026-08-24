#!/usr/bin/env node
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import {
  PUBLIC_SKILL_SLUGS,
  RELAY_ORIGIN,
  RELAY_SOURCE_REPO,
  assertSafePackagePath,
  parseFrontmatter,
  readStoredZip,
  sha256,
  validateProductionLock,
} from '../lib/package-verification.mjs';

const packageRoot = path.resolve(import.meta.dirname, '..');

function argumentValue(prefix) {
  return process.argv.slice(2).find((argument) => argument.startsWith(prefix))?.slice(prefix.length).trim() || null;
}

function requiredMetadata(entry, key) {
  const value = entry?.metadata?.[key];
  if (!value) throw new Error(`${entry?.name || 'skill'}: discovery metadata.${key} is required.`);
  return value;
}

async function writeSkillTree(stagingRoot, slug, entries) {
  const prefix = `${slug}/`;
  for (const [archivePath, content] of entries) {
    if (!archivePath.startsWith(prefix)) throw new Error(`${slug}: ZIP entry is outside the expected skill root: ${archivePath}`);
    const relativePath = assertSafePackagePath(archivePath.slice(prefix.length));
    const destination = path.join(stagingRoot, relativePath);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, content);
  }
}

async function main() {
  const discoveryUrl = argumentValue('--discovery=') || `${RELAY_ORIGIN}/.well-known/agent-skills/index.json`;
  const discoveryOrigin = new URL(discoveryUrl).origin;
  if (discoveryOrigin !== RELAY_ORIGIN && !process.argv.includes('--allow-nonproduction-origin')) {
    throw new Error(`Refusing non-production Relay origin ${discoveryOrigin}; pass --allow-nonproduction-origin only for local qualification.`);
  }
  const response = await fetch(discoveryUrl, { headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' } });
  if (!response.ok) throw new Error(`Relay discovery failed with HTTP ${response.status}.`);
  const discovery = await response.json();
  const skillsRoot = path.join(packageRoot, 'plugins', 'relay-skills', 'skills');
  const staged = [];
  const lockSkills = {};

  try {
    for (const slug of PUBLIC_SKILL_SLUGS) {
      const matches = (discovery.skills || []).filter((entry) => entry.name === slug);
      if (matches.length !== 1) throw new Error(`${slug}: expected exactly one production discovery entry; found ${matches.length}.`);
      const entry = matches[0];
      const sourceRepo = requiredMetadata(entry, 'sourceRepo');
      const sourceCommit = requiredMetadata(entry, 'sourceCommit');
      const license = requiredMetadata(entry, 'license');
      if (sourceRepo !== RELAY_SOURCE_REPO) {
        throw new Error(`${slug}: discovery sourceRepo is not ${RELAY_SOURCE_REPO}.`);
      }
      if (!/^[a-f0-9]{40}$/.test(sourceCommit)) throw new Error(`${slug}: sourceCommit is not an exact Git commit.`);
      if (license !== 'MIT') throw new Error(`${slug}: public distribution license must be MIT.`);
      const packageResponse = await fetch(entry.url, { headers: { Accept: 'application/zip', 'Cache-Control': 'no-cache' } });
      if (!packageResponse.ok) throw new Error(`${slug}: package download failed with HTTP ${packageResponse.status}.`);
      const archive = Buffer.from(await packageResponse.arrayBuffer());
      const packageDigest = `sha256:${sha256(archive)}`;
      if (packageDigest !== entry.digest) throw new Error(`${slug}: package digest does not match discovery.`);
      const archiveEntries = readStoredZip(archive);
      const manifestBuffer = archiveEntries.get(`${slug}/manifest.json`);
      const skillBuffer = archiveEntries.get(`${slug}/SKILL.md`);
      const licenseBuffer = archiveEntries.get(`${slug}/LICENSE`);
      if (!manifestBuffer || !skillBuffer || !licenseBuffer) throw new Error(`${slug}: ZIP is missing manifest.json, SKILL.md, or LICENSE.`);
      const manifest = JSON.parse(manifestBuffer.toString('utf8'));
      const frontmatter = parseFrontmatter(skillBuffer.toString('utf8'));
      if (frontmatter.values.name !== slug || !frontmatter.body) throw new Error(`${slug}: invalid SKILL.md identity or body.`);
      if (!licenseBuffer.toString('utf8').includes('Permission is hereby granted, free of charge')) {
        throw new Error(`${slug}: MIT license evidence is missing.`);
      }
      if (
        manifest.slug !== slug
        || manifest.version?.id !== requiredMetadata(entry, 'assetVersionId')
        || manifest.source?.repo !== RELAY_SOURCE_REPO
        || manifest.source?.commit !== sourceCommit
        || manifest.license !== license
      ) throw new Error(`${slug}: package manifest does not match governed discovery metadata.`);

      const stagingRoot = await mkdtemp(path.join(skillsRoot, `.${slug}-sync-`));
      staged.push({ slug, stagingRoot });
      await writeSkillTree(stagingRoot, slug, archiveEntries);
      lockSkills[slug] = {
        assetId: requiredMetadata(entry, 'assetId'),
        assetVersionId: requiredMetadata(entry, 'assetVersionId'),
        packageUrl: entry.url,
        packageDigest,
        sourceRepo: RELAY_SOURCE_REPO,
        sourceCommit,
        license,
        qualificationId: requiredMetadata(entry, 'qualificationId'),
        evaluationSuiteDigest: requiredMetadata(entry, 'evaluationSuiteDigest'),
        files: Array.from(archiveEntries)
          .map(([archivePath, content]) => ({
            path: archivePath.slice(`${slug}/`.length),
            sha256: sha256(content),
            byteSize: content.byteLength,
          }))
          .sort((left, right) => left.path.localeCompare(right.path)),
      };
    }

    const lock = {
      schemaVersion: 'relay.agent-skills.lock.v1',
      pluginVersion: '0.2.0',
      distributionStatus: 'production_promoted',
      relayOrigin: RELAY_ORIGIN,
      skills: lockSkills,
    };
    validateProductionLock(lock);
    for (const { slug, stagingRoot } of staged) {
      const target = path.join(skillsRoot, slug);
      await rm(target, { recursive: true, force: true });
      await rename(stagingRoot, target);
    }
    await writeFile(path.join(packageRoot, 'relay-lock.json'), `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
    process.stdout.write(`${JSON.stringify(lock, null, 2)}\n`);
  } finally {
    for (const { stagingRoot } of staged) await rm(stagingRoot, { recursive: true, force: true });
  }
}

main().catch((error) => {
  process.stderr.write(`sync-from-relay: ${error.message}\n`);
  process.exitCode = 1;
});
