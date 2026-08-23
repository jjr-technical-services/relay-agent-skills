import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  PUBLIC_SKILL_SLUGS,
  assertSafePackagePath,
  parseFrontmatter,
  readStoredZip,
  sha256,
  validateBundledSkill,
  validateProductionLock,
  verifyLiveLock,
} from '../lib/package-verification.mjs';

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    table[index] = value >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function storedZip(name, content, { symlinkEntry = false } = {}) {
  const nameBuffer = Buffer.from(name);
  const data = Buffer.from(content);
  const crc = crc32(data);
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(data.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(nameBuffer.length, 26);
  const localRecord = Buffer.concat([local, nameBuffer, data]);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(symlinkEntry ? 0x0314 : 20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(data.length, 20);
  central.writeUInt32LE(data.length, 24);
  central.writeUInt16LE(nameBuffer.length, 28);
  if (symlinkEntry) central.writeUInt32LE((0o120777 << 16) >>> 0, 38);
  const centralRecord = Buffer.concat([central, nameBuffer]);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(1, 8);
  end.writeUInt16LE(1, 10);
  end.writeUInt32LE(centralRecord.length, 12);
  end.writeUInt32LE(localRecord.length, 16);
  return Buffer.concat([localRecord, centralRecord, end]);
}

function productionLockEntry(overrides = {}) {
  return {
    assetId: 'asset_1',
    assetVersionId: 'version_1',
    packageUrl: 'https://relay.builtbyrose.co/api/v1/skills/example/package?versionId=version_1',
    packageDigest: `sha256:${'a'.repeat(64)}`,
    sourceRepo: 'rose-digital/relay',
    sourceCommit: '0123456789abcdef0123456789abcdef01234567',
    license: 'MIT',
    qualificationId: 'qualification_1',
    evaluationSuiteDigest: `sha256:${'b'.repeat(64)}`,
    files: [{ path: 'SKILL.md', sha256: 'c'.repeat(64), byteSize: 1 }],
    ...overrides,
  };
}

test('ZIP reader accepts bounded stored files and rejects traversal and symlinks', () => {
  const valid = readStoredZip(storedZip('kpi-tree/SKILL.md', 'safe'));
  assert.equal(valid.get('kpi-tree/SKILL.md').toString(), 'safe');
  assert.throws(() => readStoredZip(storedZip('kpi-tree/../escape', 'unsafe')), /Unsafe ZIP package path/);
  assert.throws(() => readStoredZip(storedZip('kpi-tree/link', 'target', { symlinkEntry: true })), /Symbolic links/);
  for (const unsafe of ['/absolute', 'C:/drive', 'folder\\file', 'folder//file']) {
    assert.throws(() => assertSafePackagePath(unsafe), /Unsafe ZIP package path/);
  }
});

test('frontmatter validation rejects missing identity and accepts a bounded skill', () => {
  assert.throws(() => parseFrontmatter('# no frontmatter'), /frontmatter/);
  const parsed = parseFrontmatter('---\nname: kpi-tree\ndescription: Build a measurable KPI tree.\n---\n\n# KPI Tree');
  assert.equal(parsed.values.name, 'kpi-tree');
  assert.equal(parsed.body, '# KPI Tree');
});

test('bundled validation rejects symlinks and manual file drift', async (t) => {
  const packageRoot = await mkdtemp(path.join(tmpdir(), 'relay-package-verification-'));
  t.after(() => rm(packageRoot, { recursive: true, force: true }));
  const skillRoot = path.join(packageRoot, 'plugins/relay-skills/skills/kpi-tree');
  await mkdir(skillRoot, { recursive: true });
  const markdown = '---\nname: kpi-tree\ndescription: Build a measurable KPI tree for product decisions.\n---\n\n# KPI Tree\n';
  const license = 'MIT License\nPermission is hereby granted, free of charge, to any person obtaining a copy.\n';
  await writeFile(path.join(skillRoot, 'SKILL.md'), markdown);
  await writeFile(path.join(skillRoot, 'LICENSE'), license);
  const skill = { name: 'kpi-tree', plugin: 'relay-skills', path: 'plugins/relay-skills/skills/kpi-tree' };
  const lockEntry = {
    files: [
      { path: 'LICENSE', sha256: sha256(Buffer.from(license)), byteSize: Buffer.byteLength(license) },
      { path: 'SKILL.md', sha256: sha256(Buffer.from(markdown)), byteSize: Buffer.byteLength(markdown) },
    ],
  };
  await validateBundledSkill({ packageRoot, skill, lockEntry });
  await writeFile(path.join(skillRoot, 'SKILL.md'), `${markdown}\nmanual drift\n`);
  await assert.rejects(validateBundledSkill({ packageRoot, skill, lockEntry }), /differs from relay-lock/);
  await symlink('SKILL.md', path.join(skillRoot, 'linked-skill'));
  await assert.rejects(validateBundledSkill({ packageRoot, skill }), /symbolic links/);
});

test('production lock requires exact Relay provenance, qualification, license, and digest', () => {
  const skills = Object.fromEntries(PUBLIC_SKILL_SLUGS.map((slug) => [slug, productionLockEntry()]));
  const lock = {
    schemaVersion: 'relay.agent-skills.lock.v1',
    pluginVersion: '0.2.0',
    distributionStatus: 'production_promoted',
    relayOrigin: 'https://relay.builtbyrose.co',
    skills,
  };
  assert.equal(validateProductionLock(lock), true);
  assert.throws(() => validateProductionLock({
    ...lock,
    skills: { ...skills, 'kpi-tree': productionLockEntry({ sourceRepo: 'third-party/repo' }) },
  }), /governed distribution evidence/);
  assert.throws(() => validateProductionLock({
    ...lock,
    skills: { ...skills, 'kpi-tree': productionLockEntry({ sourceCommit: 'main' }) },
  }), /governed distribution evidence/);
  assert.throws(() => validateProductionLock({
    ...lock,
    skills: { ...skills, 'kpi-tree': productionLockEntry({ license: 'Proprietary' }) },
  }), /governed distribution evidence/);
});

test('live verification checks exact packages, OAuth metadata, OIDC rejection, and the MCP challenge', async () => {
  const packageBytes = new Map(PUBLIC_SKILL_SLUGS.map((slug) => [slug, Buffer.from(`package:${slug}`)]));
  const skills = Object.fromEntries(PUBLIC_SKILL_SLUGS.map((slug) => [slug, productionLockEntry({
    assetId: `asset_${slug}`,
    assetVersionId: `version_${slug}`,
    packageUrl: `https://relay.builtbyrose.co/packages/${slug}.zip`,
    packageDigest: `sha256:${sha256(packageBytes.get(slug))}`,
    qualificationId: `qualification_${slug}`,
  })]));
  const lock = {
    schemaVersion: 'relay.agent-skills.lock.v1',
    pluginVersion: '0.2.0',
    distributionStatus: 'production_promoted',
    relayOrigin: 'https://relay.builtbyrose.co',
    skills,
  };
  const discovery = {
    skills: PUBLIC_SKILL_SLUGS.map((slug) => ({
      name: slug,
      url: skills[slug].packageUrl,
      digest: skills[slug].packageDigest,
      metadata: {
        assetId: skills[slug].assetId,
        assetVersionId: skills[slug].assetVersionId,
        qualificationId: skills[slug].qualificationId,
        evaluationSuiteDigest: skills[slug].evaluationSuiteDigest,
        sourceRepo: skills[slug].sourceRepo,
        sourceCommit: skills[slug].sourceCommit,
        license: skills[slug].license,
      },
    })),
  };
  const fetchImpl = async (url) => {
    const value = String(url);
    if (value.endsWith('/.well-known/agent-skills/index.json')) return Response.json(discovery);
    if (value.endsWith('/.well-known/oauth-authorization-server')) {
      return Response.json({ issuer: lock.relayOrigin });
    }
    if (value.endsWith('/.well-known/oauth-protected-resource/mcp')) {
      return Response.json({
        resource: `${lock.relayOrigin}/mcp`,
        authorization_servers: [lock.relayOrigin],
        scopes_supported: ['relay.skills.read', 'relay.skills.route', 'relay.skills.activate'],
      });
    }
    if (value.endsWith('/.well-known/openid-configuration')) return new Response('Not found.', { status: 404 });
    if (value.endsWith('/mcp')) {
      return new Response('Unauthorized.', {
        status: 401,
        headers: {
          'WWW-Authenticate': `Bearer resource_metadata="${lock.relayOrigin}/.well-known/oauth-protected-resource/mcp", scope="relay.skills.read relay.skills.route relay.skills.activate"`,
        },
      });
    }
    const slug = PUBLIC_SKILL_SLUGS.find((candidate) => value === skills[candidate].packageUrl);
    if (slug) {
      return new Response(packageBytes.get(slug), {
        headers: { Digest: skills[slug].packageDigest },
      });
    }
    return new Response('Not found.', { status: 404 });
  };

  assert.equal(await verifyLiveLock(lock, fetchImpl), true);

  const driftedFetch = async (url) => {
    const value = String(url);
    if (value === skills['kpi-tree'].packageUrl) {
      return new Response('drift', { headers: { Digest: skills['kpi-tree'].packageDigest } });
    }
    return fetchImpl(url);
  };
  await assert.rejects(verifyLiveLock(lock, driftedFetch), /live package bytes differ/);
});
