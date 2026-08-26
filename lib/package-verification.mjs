import { createHash } from 'node:crypto';
import { lstat, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

export const PUBLIC_SKILL_SLUGS = Object.freeze([
  'relay-skill-router',
  'kpi-tree',
  'ab-test-setup',
  'negotiate-tactically',
]);
export const RELAY_ORIGIN = 'https://relay.builtbyrose.co';
export const RELAY_SOURCE_REPO = 'rose-digital/relay';

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

export function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

export function parseFrontmatter(markdown) {
  const match = String(markdown || '').match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) throw new Error('SKILL.md must begin with closed YAML frontmatter.');
  const values = {};
  for (const line of match[1].split('\n')) {
    const field = line.match(/^([a-zA-Z0-9_-]+):\s*(.+)$/);
    if (field) values[field[1]] = field[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return { values, body: markdown.slice(match[0].length).trim() };
}

export function assertSafePackagePath(value) {
  const name = String(value || '');
  if (
    !name
    || name.includes('\0')
    || name.includes('\\')
    || name.startsWith('/')
    || /^[a-zA-Z]:/.test(name)
    || name.endsWith('/')
    || name.split('/').some((segment) => !segment || segment === '.' || segment === '..')
    || path.posix.normalize(name) !== name
  ) throw new Error(`Unsafe ZIP package path: ${name || '<empty>'}`);
  return name;
}

function findEndOfCentralDirectory(archive) {
  const minimum = Math.max(0, archive.length - 65_557);
  for (let offset = archive.length - 22; offset >= minimum; offset -= 1) {
    if (archive.readUInt32LE(offset) === 0x06054b50) return offset;
  }
  throw new Error('ZIP end-of-central-directory record is missing.');
}

export function readStoredZip(archiveInput) {
  const archive = Buffer.from(archiveInput);
  const endOffset = findEndOfCentralDirectory(archive);
  const diskNumber = archive.readUInt16LE(endOffset + 4);
  const centralDisk = archive.readUInt16LE(endOffset + 6);
  const entriesOnDisk = archive.readUInt16LE(endOffset + 8);
  const entryCount = archive.readUInt16LE(endOffset + 10);
  const centralSize = archive.readUInt32LE(endOffset + 12);
  const centralOffset = archive.readUInt32LE(endOffset + 16);
  if (diskNumber !== 0 || centralDisk !== 0 || entriesOnDisk !== entryCount) {
    throw new Error('Multi-disk ZIP archives are not allowed.');
  }
  if (centralOffset + centralSize > endOffset) throw new Error('ZIP central directory is out of bounds.');

  const entries = new Map();
  let cursor = centralOffset;
  for (let index = 0; index < entryCount; index += 1) {
    if (archive.readUInt32LE(cursor) !== 0x02014b50) throw new Error('Malformed ZIP central-directory entry.');
    const versionMadeBy = archive.readUInt16LE(cursor + 4);
    const flags = archive.readUInt16LE(cursor + 8);
    const compressionMethod = archive.readUInt16LE(cursor + 10);
    const expectedCrc32 = archive.readUInt32LE(cursor + 16);
    const compressedSize = archive.readUInt32LE(cursor + 20);
    const uncompressedSize = archive.readUInt32LE(cursor + 24);
    const nameLength = archive.readUInt16LE(cursor + 28);
    const extraLength = archive.readUInt16LE(cursor + 30);
    const commentLength = archive.readUInt16LE(cursor + 32);
    const externalAttributes = archive.readUInt32LE(cursor + 38);
    const localOffset = archive.readUInt32LE(cursor + 42);
    const name = assertSafePackagePath(archive.subarray(cursor + 46, cursor + 46 + nameLength).toString('utf8'));
    if (entries.has(name)) throw new Error(`Duplicate ZIP entry: ${name}`);
    const creatorSystem = versionMadeBy >>> 8;
    const unixMode = externalAttributes >>> 16;
    if (creatorSystem === 3 && (unixMode & 0o170000) === 0o120000) {
      throw new Error(`Symbolic links are not allowed: ${name}`);
    }
    if (flags & 0x1) throw new Error(`Encrypted ZIP entries are not allowed: ${name}`);
    if (compressionMethod !== 0 || compressedSize !== uncompressedSize) {
      throw new Error(`Only uncompressed Relay ZIP entries are supported: ${name}`);
    }
    if (localOffset + 30 > archive.length || archive.readUInt32LE(localOffset) !== 0x04034b50) {
      throw new Error(`Malformed local ZIP entry: ${name}`);
    }
    const localFlags = archive.readUInt16LE(localOffset + 6);
    const localMethod = archive.readUInt16LE(localOffset + 8);
    const localNameLength = archive.readUInt16LE(localOffset + 26);
    const localExtraLength = archive.readUInt16LE(localOffset + 28);
    if (localFlags !== flags || localMethod !== compressionMethod) throw new Error(`ZIP header mismatch: ${name}`);
    const localName = archive.subarray(localOffset + 30, localOffset + 30 + localNameLength).toString('utf8');
    if (localName !== name) throw new Error(`ZIP filename mismatch: ${name}`);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const dataEnd = dataStart + compressedSize;
    if (dataEnd > archive.length) throw new Error(`ZIP entry is out of bounds: ${name}`);
    const data = archive.subarray(dataStart, dataEnd);
    if (crc32(data) !== expectedCrc32) throw new Error(`ZIP CRC mismatch: ${name}`);
    entries.set(name, Buffer.from(data));
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  if (cursor !== centralOffset + centralSize) throw new Error('ZIP central-directory size mismatch.');
  return entries;
}

export async function collectFiles(root, relative = '') {
  const entries = await readdir(path.join(root, relative), { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const child = path.posix.join(relative, entry.name);
    assertSafePackagePath(child);
    const absolute = path.join(root, child);
    const stats = await lstat(absolute);
    if (stats.isSymbolicLink()) throw new Error(`${child}: symbolic links are not allowed.`);
    if (stats.isDirectory()) files.push(...await collectFiles(root, child));
    else if (stats.isFile()) files.push(child);
    else throw new Error(`${child}: unsupported package entry.`);
  }
  return files;
}

function validateSkillContents(name, filesByPath) {
  const skillMarkdown = filesByPath.get('SKILL.md')?.toString('utf8');
  const license = filesByPath.get('LICENSE')?.toString('utf8');
  if (!skillMarkdown) throw new Error(`${name}: SKILL.md is missing.`);
  if (!license) throw new Error(`${name}: LICENSE is missing.`);
  const frontmatter = parseFrontmatter(skillMarkdown);
  if (frontmatter.values.name !== name) throw new Error(`${name}: frontmatter name does not match.`);
  if (!frontmatter.values.description || frontmatter.values.description.length > 1024) {
    throw new Error(`${name}: description must be 1-1024 characters.`);
  }
  if (!frontmatter.body) throw new Error(`${name}: instructions are empty.`);
  if (!license.includes('Permission is hereby granted, free of charge')) {
    throw new Error(`${name}: MIT license evidence is missing.`);
  }
}

export async function validateBundledSkill({ packageRoot, skill, lockEntry = null }) {
  const root = path.resolve(packageRoot, skill.path);
  if (!root.startsWith(`${path.resolve(packageRoot)}${path.sep}`)) throw new Error(`${skill.name}: path escapes package root.`);
  const files = await collectFiles(root);
  const filesByPath = new Map(await Promise.all(files.map(async (file) => [file, await readFile(path.join(root, file))])));
  validateSkillContents(skill.name, filesByPath);
  if (lockEntry) {
    const expected = new Map(lockEntry.files.map((file) => [file.path, file]));
    if (expected.size !== files.length) throw new Error(`${skill.name}: file count differs from relay-lock.json.`);
    for (const [file, content] of filesByPath) {
      const locked = expected.get(file);
      if (!locked) throw new Error(`${skill.name}: ${file} is not present in relay-lock.json.`);
      if (locked.sha256 !== sha256(content) || locked.byteSize !== content.byteLength) {
        throw new Error(`${skill.name}: ${file} differs from relay-lock.json.`);
      }
    }
  }
  const digest = createHash('sha256');
  for (const file of files) {
    digest.update(`${file}\0`);
    digest.update(filesByPath.get(file));
    digest.update('\0');
  }
  return { name: skill.name, plugin: skill.plugin, files: files.length, digest: `sha256:${digest.digest('hex')}` };
}

export function validateProductionLock(lock) {
  if (lock?.schemaVersion !== 'relay.agent-skills.lock.v1') throw new Error('relay-lock.json schemaVersion is invalid.');
  if (lock?.pluginVersion !== '0.2.1') throw new Error('relay-lock.json pluginVersion must be 0.2.1.');
  if (lock?.relayOrigin !== RELAY_ORIGIN) throw new Error(`relay-lock.json relayOrigin must be ${RELAY_ORIGIN}.`);
  if (lock?.distributionStatus !== 'production_promoted') throw new Error('relay-lock.json is not production-promoted.');
  const names = Object.keys(lock.skills || {});
  if (JSON.stringify(names) !== JSON.stringify(PUBLIC_SKILL_SLUGS)) throw new Error('relay-lock.json skill order or membership is invalid.');
  for (const slug of PUBLIC_SKILL_SLUGS) {
    const entry = lock.skills[slug];
    if (
      !entry.assetId
      || !entry.assetVersionId
      || !entry.qualificationId
      || !entry.evaluationSuiteDigest
      || entry.sourceRepo !== RELAY_SOURCE_REPO
      || !/^[a-f0-9]{40}$/.test(String(entry.sourceCommit || ''))
      || entry.license !== 'MIT'
      || !/^sha256:[a-f0-9]{64}$/.test(String(entry.packageDigest || ''))
      || !Array.isArray(entry.files)
      || !entry.files.length
    ) throw new Error(`${slug}: relay-lock.json is missing required governed distribution evidence.`);
  }
  return true;
}

export async function verifyLiveLock(lock, fetchImpl = fetch) {
  validateProductionLock(lock);
  const response = await fetchImpl(`${lock.relayOrigin}/.well-known/agent-skills/index.json`, {
    headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
  });
  if (!response.ok) throw new Error(`Relay discovery failed with HTTP ${response.status}.`);
  const discovery = await response.json();
  for (const slug of PUBLIC_SKILL_SLUGS) {
    const current = discovery.skills?.find((skill) => skill.name === slug);
    const locked = lock.skills[slug];
    if (!current) throw new Error(`${slug}: missing from live Relay discovery.`);
    const comparable = {
      assetId: current.metadata?.assetId,
      assetVersionId: current.metadata?.assetVersionId,
      qualificationId: current.metadata?.qualificationId,
      evaluationSuiteDigest: current.metadata?.evaluationSuiteDigest,
      sourceRepo: current.metadata?.sourceRepo,
      sourceCommit: current.metadata?.sourceCommit,
      license: current.metadata?.license,
      packageDigest: current.digest,
      packageUrl: current.url,
    };
    for (const [key, value] of Object.entries(comparable)) {
      if (locked[key] !== value) throw new Error(`${slug}: live ${key} differs from relay-lock.json.`);
    }

    const packageResponse = await fetchImpl(locked.packageUrl, {
      headers: { Accept: 'application/zip', 'Cache-Control': 'no-cache' },
    });
    if (!packageResponse.ok) {
      throw new Error(`${slug}: live package failed with HTTP ${packageResponse.status}.`);
    }
    if (packageResponse.headers.get('digest') !== locked.packageDigest) {
      throw new Error(`${slug}: live package Digest header differs from relay-lock.json.`);
    }
    const packageBytes = Buffer.from(await packageResponse.arrayBuffer());
    if (`sha256:${sha256(packageBytes)}` !== locked.packageDigest) {
      throw new Error(`${slug}: live package bytes differ from relay-lock.json.`);
    }
  }


  const authorizationServerResponse = await fetchImpl(
    `${lock.relayOrigin}/.well-known/oauth-authorization-server`,
    { headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' } },
  );
  if (!authorizationServerResponse.ok) {
    throw new Error(`Relay OAuth authorization-server metadata failed with HTTP ${authorizationServerResponse.status}.`);
  }
  const authorizationServer = await authorizationServerResponse.json();
  if (authorizationServer.issuer !== lock.relayOrigin) {
    throw new Error('Relay OAuth authorization-server issuer drifted.');
  }

  const protectedResourceUrl = `${lock.relayOrigin}/.well-known/oauth-protected-resource/mcp`;
  const protectedResourceResponse = await fetchImpl(protectedResourceUrl, {
    headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
  });
  if (!protectedResourceResponse.ok) {
    throw new Error(`Relay OAuth protected-resource metadata failed with HTTP ${protectedResourceResponse.status}.`);
  }
  const protectedResource = await protectedResourceResponse.json();
  const expectedScopes = ['relay.skills.read', 'relay.skills.route', 'relay.skills.activate'];
  if (
    protectedResource.resource !== `${lock.relayOrigin}/mcp`
    || !protectedResource.authorization_servers?.includes(lock.relayOrigin)
    || expectedScopes.some((scope) => !protectedResource.scopes_supported?.includes(scope))
  ) {
    throw new Error('Relay OAuth protected-resource metadata drifted.');
  }

  const oidcResponse = await fetchImpl(`${lock.relayOrigin}/.well-known/openid-configuration`, {
    headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
  });
  if (oidcResponse.status !== 404) {
    throw new Error(`Relay unsupported OIDC metadata returned HTTP ${oidcResponse.status}; expected 404.`);
  }

  const mcpResponse = await fetchImpl(`${lock.relayOrigin}/mcp`, {
    headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
  });
  const challenge = mcpResponse.headers.get('www-authenticate') || '';
  if (
    mcpResponse.status !== 401
    || !challenge.includes(`resource_metadata="${protectedResourceUrl}"`)
    || expectedScopes.some((scope) => !challenge.includes(scope))
  ) {
    throw new Error('Relay MCP OAuth 401 challenge drifted.');
  }
  return true;
}
