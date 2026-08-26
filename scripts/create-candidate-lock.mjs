#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  PUBLIC_SKILL_SLUGS,
  RELAY_ORIGIN,
  RELAY_SOURCE_REPO,
  collectFiles,
  sha256,
} from '../lib/package-verification.mjs';

const packageRoot = path.resolve(import.meta.dirname, '..');
const skillsRoot = path.join(packageRoot, 'plugins', 'relay-skills', 'skills');
const skills = {};

for (const slug of PUBLIC_SKILL_SLUGS) {
  const root = path.join(skillsRoot, slug);
  const files = await collectFiles(root);
  skills[slug] = {
    assetId: null,
    assetVersionId: null,
    packageUrl: null,
    packageDigest: null,
    sourceRepo: RELAY_SOURCE_REPO,
    sourceCommit: null,
    license: 'MIT',
    qualificationId: null,
    evaluationSuiteDigest: null,
    files: await Promise.all(files.map(async (file) => {
      const content = await readFile(path.join(root, file));
      return { path: file, sha256: sha256(content), byteSize: content.byteLength };
    })),
  };
}

const lock = {
  schemaVersion: 'relay.agent-skills.lock.v1',
  pluginVersion: '0.2.1',
  distributionStatus: 'candidate_unpromoted',
  relayOrigin: RELAY_ORIGIN,
  skills,
};
await writeFile(path.join(packageRoot, 'relay-lock.json'), `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
process.stdout.write('Wrote candidate relay-lock.json. Release verification will remain blocked until production sync.\n');
