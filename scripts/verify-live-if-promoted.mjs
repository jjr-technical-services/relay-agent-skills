#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { verifyLiveLock } from '../lib/package-verification.mjs';

const root = path.resolve(import.meta.dirname, '..');
const lock = JSON.parse(await readFile(path.join(root, 'relay-lock.json'), 'utf8'));
if (lock.distributionStatus === 'production_promoted') {
  await verifyLiveLock(lock);
  process.stdout.write('Production Relay discovery matches relay-lock.json.\n');
} else {
  process.stdout.write('Candidate lock is not promoted; live drift verification is intentionally pending.\n');
}
