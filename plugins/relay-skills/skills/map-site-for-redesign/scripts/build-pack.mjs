#!/usr/bin/env node
// Validate the written docs against the captured shots, assemble the design-tool handoff, and zip it.
//
//   node build-pack.mjs [--config pack.config.json] [--strict] [--no-zip] [--no-parts] [--parts <MiB>] [--with-masters]
//
// Expects:  docs/00-master-brief.md, docs/<area>.md (one per area), docs/flows.md, docs/findings.md,
//           shots/<area>/*.png, handoff/sheets/*.png (contact-sheet.mjs), handoff/upload/ (make-upload-copy.mjs),
//           logs/truncated.json (written by lib.mjs shot() when a page hit the height cap).
// Also:    docs/kickoff-goals.md, 4-5 redesign goals the capturing agent inferred from findings.
// Produces: handoff/START-HERE.md, handoff/KICKOFF-PROMPT.md, handoff/00-MASTER-BRIEF.md, handoff/FINDINGS.md,
//           handoff/flows.md, handoff/prompts/NN-<area>.md (area spec wrapped in load-and-wait instructions),
//           handoff/manifest.json, and two zips:
//             <product>-design-pack.zip       all of handoff/ (add --with-masters for shots/)
//             <product>-design-pack-lite.zip  docs, prompts and sheets only
//           and, by default, self-contained part zips in <product>-design-pack-parts/, each under the
//           upload limit (config uploadLimitMiB, default 19; --parts <MiB> overrides, --no-parts skips):
//             00-docs.zip, then NN-<area>-<k>.zip of that area's upload JPEGs, stored uncompressed,
//             internal paths kept, so unzipping every part into one folder rebuilds handoff/.
// Online design tools (Claude Design among them) reject single uploads over 20 MB, so every file meant
// for upload (lite zip, parts, contact sheets, upload JPEGs) is checked against the limit; --strict fails
// on any file over it, by name. The full zip is for desktop transfer only and is not checked.
// Area order comes from config.areas, else alphabetical. --strict exits non-zero on any issue.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const REQUIRED_PAGE_FIELDS = [
  'Status', 'Audience & access', 'Nav entry', 'Purpose', 'Layout & content', 'Actions', 'Substates', 'Flows', 'Design notes',
];
export const REQUIRED_DOCS = ['00-master-brief.md', 'flows.md', 'findings.md', 'kickoff-goals.md'];
export const DEFAULT_UPLOAD_LIMIT_MIB = 19; // online design tools reject single uploads over 20 MB

// Every upload-bound file over the limit, as issues naming the file. files: [{ file, bytes }].
export function oversizeUploads(files, limitMiB) {
  const limitBytes = limitMiB * 1048576;
  return files.filter((entry) => entry.bytes > limitBytes).map((entry) => ({
    kind: 'over-upload-limit', file: entry.file, mib: +(entry.bytes / 1048576).toFixed(1), limitMiB,
  }));
}

// docs: { 'billing.md': '...markdown...' }; shotPaths: png paths relative to shots/ (e.g. 'billing/x.png').
export function validateDocs({ docs, shotPaths, truncated = [] }) {
  const shots = new Set(shotPaths.map((file) => path.basename(file)));
  const issues = [];
  const referenced = new Set();
  for (const required of REQUIRED_DOCS) {
    if (!docs[required]) issues.push({ kind: 'missing-doc', doc: required });
  }
  for (const [doc, text] of Object.entries(docs)) {
    // Shot names always contain "__" (<route>__<nn>-<state>__<viewport>); sheet names and placeholders do not.
    for (const match of text.matchAll(/[A-Za-z0-9_.\-[\]]*__[A-Za-z0-9_.\-[\]]+\.png/g)) {
      const name = path.basename(match[0]);
      referenced.add(name);
      if (!shots.has(name)) issues.push({ kind: 'missing-shot', doc, shot: name });
    }
    if (REQUIRED_DOCS.includes(doc)) continue;
    // Only "### <Page> — `<route>`" headings are page specs; other ### subsections (flows, notes) are free-form.
    const sections = text.split(/\n(?=### )/).filter((section) => /^### [^\n]*`\/[^`]*`/.test(section));
    if (!sections.length) issues.push({ kind: 'no-page-sections', doc });
    for (const section of sections) {
      const heading = section.split('\n', 1)[0].replace(/^###\s+/, '');
      const missing = REQUIRED_PAGE_FIELDS.filter((field) => !section.includes(`**${field}:**`));
      if (missing.length) issues.push({ kind: 'incomplete-page-spec', doc, page: heading, missing });
    }
    if (!/coverage gaps/i.test(text)) issues.push({ kind: 'no-coverage-gaps-section', doc });
  }
  // Local-environment effects (flags off, no keys, stubbed services) must not read as product bugs.
  if (docs['findings.md'] && !/^#+\s*local environment only/im.test(docs['findings.md'])) {
    issues.push({ kind: 'findings-missing-local-environment-section', doc: 'findings.md' });
  }
  // A page cut at the height cap must be admitted in some Coverage gaps list (by file or route slug).
  const gapText = Object.values(docs).map((text) => text.split(/^#+\s*coverage gaps/im).slice(1).join('\n')).join('\n');
  for (const row of truncated) {
    const name = path.basename(row.name);
    if (!gapText.includes(name) && !gapText.includes(name.split('__')[0])) {
      issues.push({ kind: 'truncated-shot-not-in-coverage-gaps', shot: name });
    }
  }
  // Baseline shots are reference material; only deep-capture shots must be cited by a doc.
  const unreferenced = shotPaths.filter((file) => !file.startsWith('baseline/') && !referenced.has(path.basename(file)));
  for (const file of unreferenced) issues.push({ kind: 'uncited-shot', shot: file });
  return { issues, referencedCount: referenced.size, unreferenced };
}

export function wrapAreaPrompt({ product, index, total, area, doc }) {
  const nn = String(index).padStart(2, '0');
  return [
    `# ${product} area ${nn}/${String(total).padStart(2, '0')}: ${area}`, '',
    `Paste this after the master brief. Attach the contact sheets \`sheets/${area}-*.png\` for an overview; when you need detail, attach the full screenshots it names from \`upload/shots/${area}/\`. Read it, confirm what you received, list any questions, and wait. Do not start designing until I say "all areas loaded".`, '',
    'Screenshot names: `<route>__<nn>-<state>__<desktop|mobile>`. States named `stubbed` were produced by rewriting a response in the capture environment; they are not real behaviour.', '',
    '---', '',
    doc.replace(/\bshots\/([A-Za-z0-9_-]+)\/([^\s)]+)\.png/g, 'upload/shots/$1/$2.jpg'),
  ].join('\n');
}

// The product summary: the first paragraph that is not a heading, a blockquote, or a paste/attach
// instruction to the design tool (briefs usually open with "Paste this first").
export function productSummary(markdown = '') {
  return markdown.split(/\n\s*\n/).map((block) => block.trim())
    .find((block) => block && !/^(#|>|\||```|- )/.test(block) && !/\b(paste|attach)\b/i.test(block)) || '';
}

export function buildKickoffPrompt({ product, brief, goals, areaFiles, stubbedCount, truncatedCount }) {
  return [
    `# Kickoff: redesign ${product}`, '',
    '> Paste this into the design tool first. The goals section was inferred by the capturing agent from FINDINGS.md: edit it before pasting.', '',
    '## The product', productSummary(brief), '',
    '## What is attached',
    '- `00-MASTER-BRIEF.md`: product, personas, current information architecture and its known problems, visual system to keep.',
    '- `FINDINGS.md`: bugs, dead ends, orphans and duplicates found while capturing.',
    ...areaFiles.map((file) => `- \`prompts/${file}\`: one area's overview, flows and a spec per route.`),
    '- `sheets/*.png`: contact sheets, labelled desktop thumbnails per area.',
    '- Full-resolution screenshots are available on request; ask for them by file name.', '',
    '## Caveat',
    `Every name, company and number is fixture data from a local build, not customer data. ${stubbedCount} screenshots show stubbed (rewritten) responses and ${truncatedCount} stop at the height cap; the specs label both.`, '',
    '## Redesign goals (inferred, edit before pasting)',
    goals.trim(), '',
    '## How to work',
    '1. Read everything. Summarize the product, list the problems you see and your questions. Do not design yet.',
    '2. Propose the information architecture: a sitemap, plus a table mapping every current route to its new location (or "retired").',
    '3. Design the app shell, then Home.',
    "4. Then one area per turn, in prompt order, covering every state and flow in that area's spec.",
    'Ask for full-resolution screenshots whenever a thumbnail is not enough.', '',
  ].join('\n');
}

// Greedy, order-preserving grouping of one area's files into parts of at most limitBytes each.
// A single file larger than the limit gets a part of its own (and is reported by the caller).
export function planAreaParts(files, limitBytes) {
  const parts = [];
  let current = [];
  let size = 0;
  for (const file of files) {
    if (current.length && size + file.bytes > limitBytes) {
      parts.push(current);
      current = [];
      size = 0;
    }
    current.push(file);
    size += file.bytes;
  }
  if (current.length) parts.push(current);
  return parts;
}

function dirBytes(dir) {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir, { recursive: true }).map(String).reduce((sum, name) => {
    const stat = fs.statSync(path.join(dir, name));
    return sum + (stat.isFile() ? stat.size : 0);
  }, 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const { loadConfig, readJson, writeJson } = await import('./lib.mjs');
  const config = loadConfig();
  const pack = config.packDir;
  const docsDir = path.join(pack, 'docs');
  const docs = fs.existsSync(docsDir)
    ? Object.fromEntries(fs.readdirSync(docsDir).filter((name) => name.endsWith('.md')).map((name) => [name, fs.readFileSync(path.join(docsDir, name), 'utf8')]))
    : {};
  const shotsDir = path.join(pack, 'shots');
  const shotFiles = fs.existsSync(shotsDir)
    ? fs.readdirSync(shotsDir, { recursive: true }).filter((name) => String(name).endsWith('.png')).map(String)
    : [];
  // Baseline shots are not uploaded, and older runs may have logged a shot twice: count unique deep shots.
  const truncated = [...new Map(readJson(path.join(pack, 'logs', 'truncated.json'), [])
    .filter((row) => row.dir !== 'baseline')
    .map((row) => [`${row.dir}/${path.basename(row.name, '.png')}.png`, { ...row, name: `${path.basename(row.name, '.png')}.png` }])).values()];
  const signedOut = readJson(path.join(pack, 'logs', 'signed-out.json'), []);
  const docAreas = Object.keys(docs).filter((name) => !REQUIRED_DOCS.includes(name)).map((name) => name.replace(/\.md$/, ''));
  const configured = (JSON.parse(fs.readFileSync(config.configFile, 'utf8')).areas || []).filter((area) => docAreas.includes(area));
  const areas = [...configured, ...docAreas.filter((area) => !configured.includes(area)).sort()];

  const handoff = path.join(pack, 'handoff');
  const sheets = fs.existsSync(path.join(handoff, 'sheets')) ? fs.readdirSync(path.join(handoff, 'sheets')).filter((name) => name.endsWith('.png')).sort() : [];
  const uploadDir = path.join(handoff, 'upload');
  fs.rmSync(path.join(handoff, 'prompts'), { recursive: true, force: true });
  fs.mkdirSync(path.join(handoff, 'prompts'), { recursive: true });
  const copies = [['00-master-brief.md', '00-MASTER-BRIEF.md'], ['findings.md', 'FINDINGS.md'], ['flows.md', 'flows.md']];
  for (const [from, to] of copies) if (docs[from]) fs.writeFileSync(path.join(handoff, to), docs[from]);

  const packIssues = [];
  const rows = areas.map((area, i) => {
    const index = i + 1;
    const file = `${String(index).padStart(2, '0')}-${area}.md`;
    fs.writeFileSync(path.join(handoff, 'prompts', file), wrapAreaPrompt({ product: config.product, index, total: areas.length, area, doc: docs[`${area}.md`] }));
    const areaSheets = sheets.filter((sheet) => sheet.startsWith(`${area}-`));
    if (!areaSheets.length) packIssues.push({ kind: 'no-contact-sheet', doc: area });
    const routes = (docs[`${area}.md`].match(/^### /gm) || []).length;
    const shots = shotFiles.filter((name) => name.startsWith(`${area}/`)).length;
    return { area, file, routes, shots, sheets: areaSheets.length, kb: Math.round(Buffer.byteLength(docs[`${area}.md`]) / 1024) };
  });
  if (!fs.existsSync(uploadDir)) packIssues.push({ kind: 'no-upload-copy', doc: 'run make-upload-copy.mjs' });
  const stubbedCount = shotFiles.filter((name) => /stubbed/i.test(name)).length;
  if (docs['kickoff-goals.md']) {
    fs.writeFileSync(path.join(handoff, 'KICKOFF-PROMPT.md'), buildKickoffPrompt({
      product: config.product,
      brief: docs['00-master-brief.md'],
      goals: docs['kickoff-goals.md'].replace(/^#.*\n/, ''),
      areaFiles: rows.map((row) => row.file),
      stubbedCount,
      truncatedCount: truncated.length,
    }));
  }

  const { issues, referencedCount, unreferenced } = validateDocs({ docs, shotPaths: shotFiles, truncated });
  const allIssues = [...issues, ...packIssues, ...signedOut.map((row) => ({ kind: 'signed-in-shot-rendered-signed-out', shot: `${row.dir}/${row.name}`, persona: row.persona }))];
  const stubbed = shotFiles.filter((name) => /stubbed/i.test(name));
  const startHere = [
    `# ${config.product} design handoff pack`, '',
    `Captured ${new Date().toISOString().slice(0, 10)} from ${config.origin} with fixture data. Every name, company and number is fixture data, not customer data.`, '',
    '## Contents', '| Path | What it is |', '|---|---|',
    '| `KICKOFF-PROMPT.md` | A short prompt to paste into the design tool first: attachments, caveats, goals (inferred, edit them) and a staged workflow |',
    '| `00-MASTER-BRIEF.md` | Product, personas, current IA and its known problems, tokens to keep, pack layout. **Attach first.** |',
    '| `prompts/NN-<area>.md` | One per area: overview, end-to-end flows, then a spec for every route |',
    `| \`sheets/*.png\` | ${sheets.length} contact sheets of labelled desktop thumbnails, for a fast overview |`,
    '| `upload/shots/<area>/*.jpg` | Every screenshot at 1x JPEG. **Use these for uploads.** |',
    '| `FINDINGS.md` | Bugs, dead ends, orphans and inconsistencies, with local-environment-only effects separated |',
    '| `flows.md` | Journeys that cross areas |', '',
    '| # | Area | Routes | Screenshots | Sheets | Spec size |', '|---|---|---|---|---|---|',
    ...rows.map((row, i) => `| ${String(i + 1).padStart(2, '0')} | ${row.area} | ${row.routes} | ${row.shots} | ${row.sheets} | ${row.kb} KB |`), '',
    '## How to run it in the design tool',
    '1. Start a new project. Edit the goals in `KICKOFF-PROMPT.md`, paste it, and attach `00-MASTER-BRIEF.md` and `FINDINGS.md`.',
    '2. For each area in order: paste `prompts/NN-<area>.md`, attach its `sheets/<area>-*.png`, then the `upload/shots/<area>/` images for the flows that matter most (each spec\'s Flows line names them in order).',
    '3. Say **"all areas loaded"**, then ask for the new IA and app shell first, then one area at a time.',
    '4. If a prompt is truncated, paste the area overview and flows first and the route specs in a second message.',
    'Upload limits change and were not verified for this pack: plan on sheets first, then a few selected full shots per message.', '',
    '## Caveats',
    `- **Stubbed states:** ${stubbed.length} screenshots were produced by rewriting a response (names contain \`stubbed\`).`,
    `- **Very long pages:** ${truncated.length} screenshots stop at the ${config.maxShotHeight} px height cap; each is listed in its area's Coverage gaps.`,
    '- **Local environment:** flags that could not be enabled and services without keys are listed under "Local environment only" in FINDINGS.md.', '',
  ].join('\n');
  fs.writeFileSync(path.join(handoff, 'START-HERE.md'), startHere);
  writeJson(path.join(handoff, 'manifest.json'), {
    schemaVersion: 'relay.redesign_capture_pack.v1',
    product: config.product,
    origin: config.origin,
    generatedAt: new Date().toISOString(),
    areas: rows,
    screenshotCount: shotFiles.length,
    referencedScreenshotCount: referencedCount,
    unreferencedScreenshots: unreferenced,
    stubbedScreenshots: stubbed,
    truncatedScreenshots: truncated,
    mastersMB: +(dirBytes(shotsDir) / 1e6).toFixed(1),
    uploadMB: +(dirBytes(uploadDir) / 1e6).toFixed(1),
    issues: allIssues,
  });

  const partsIndex = process.argv.indexOf('--parts');
  const uploadLimitMiB = (partsIndex !== -1 && Number(process.argv[partsIndex + 1])) || config.uploadLimitMiB || DEFAULT_UPLOAD_LIMIT_MIB;
  const limitBytes = uploadLimitMiB * 1048576;
  const sizeOf = (relative) => ({ file: relative, bytes: fs.statSync(path.join(pack, relative)).size });
  const listFiles = (relativeDir, pattern) => (fs.existsSync(path.join(pack, relativeDir))
    ? fs.readdirSync(path.join(pack, relativeDir), { recursive: true }).map(String).filter((name) => pattern.test(name)).sort().map((name) => path.join(relativeDir, name))
    : []);
  const uploadBound = [...listFiles('handoff/sheets', /\.png$/), ...listFiles('handoff/upload', /\.jpg$/)].map(sizeOf);
  // Trim dashes so zip never reads the name as an option; fall back when nothing is left.
  const base = config.product.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'product';

  if (!process.argv.includes('--no-zip')) {
    const full = `${base}-design-pack.zip`;
    const lite = `${base}-design-pack-lite.zip`;
    for (const name of [full, lite]) fs.rmSync(path.join(pack, name), { force: true });
    execFileSync('zip', ['-qr', full, 'handoff', ...(process.argv.includes('--with-masters') ? ['shots'] : [])], { cwd: pack });
    const liteEntries = ['START-HERE.md', 'KICKOFF-PROMPT.md', '00-MASTER-BRIEF.md', 'FINDINGS.md', 'flows.md', 'prompts', 'sheets']
      .map((entry) => path.join('handoff', entry)).filter((entry) => fs.existsSync(path.join(pack, entry)));
    execFileSync('zip', ['-qr', lite, ...liteEntries], { cwd: pack });
    uploadBound.push(sizeOf(lite));
    console.log(`zip -> ${path.join(pack, full)} (${(fs.statSync(path.join(pack, full)).size / 1048576).toFixed(1)} MiB; desktop transfer only)`);
    console.log(`lite zip -> ${path.join(pack, lite)} (${(fs.statSync(path.join(pack, lite)).size / 1048576).toFixed(1)} MiB)`);
  }

  if (!process.argv.includes('--no-zip') && !process.argv.includes('--no-parts')) {
    const partsRelative = `${base}-design-pack-parts`;
    const partsDir = path.join(pack, partsRelative);
    fs.rmSync(partsDir, { recursive: true, force: true });
    fs.mkdirSync(partsDir, { recursive: true });
    const zipList = (name, entries, stored) => execFileSync('zip', ['-q', ...(stored ? ['-0'] : []), path.join(partsDir, name), '-@'], { cwd: pack, input: entries.join('\n') });
    const docEntries = ['START-HERE.md', 'KICKOFF-PROMPT.md', '00-MASTER-BRIEF.md', 'FINDINGS.md', 'flows.md']
      .map((entry) => `handoff/${entry}`).filter((entry) => fs.existsSync(path.join(pack, entry)));
    for (const dir of ['prompts', 'sheets']) {
      const full = path.join(handoff, dir);
      if (fs.existsSync(full)) docEntries.push(...fs.readdirSync(full).sort().map((name) => `handoff/${dir}/${name}`));
    }
    const written = [];
    // Docs and sheets split too if the sheets alone push them over the limit.
    const docParts = planAreaParts(docEntries.map((entry) => ({ entry, bytes: fs.statSync(path.join(pack, entry)).size })), limitBytes);
    docParts.forEach((part, k) => {
      const name = docParts.length === 1 ? '00-docs.zip' : `00-docs-${k + 1}.zip`;
      zipList(name, part.map((file) => file.entry), false);
      written.push({ name, images: 0 });
    });
    let sequence = 1;
    let packedImages = 0;
    for (const { area } of rows) {
      const areaDir = path.join(uploadDir, 'shots', area);
      if (!fs.existsSync(areaDir)) continue;
      const files = fs.readdirSync(areaDir).filter((name) => name.endsWith('.jpg')).sort()
        .map((name) => ({ entry: `handoff/upload/shots/${area}/${name}`, bytes: fs.statSync(path.join(areaDir, name)).size }));
      planAreaParts(files, limitBytes).forEach((part, k) => {
        const name = `${String(sequence).padStart(2, '0')}-${area}-${k + 1}.zip`;
        zipList(name, part.map((file) => file.entry), true);
        written.push({ name, images: part.length });
        packedImages += part.length;
        sequence += 1;
      });
    }
    const uploadImages = listFiles('handoff/upload', /\.jpg$/).length;
    if (packedImages !== uploadImages) allIssues.push({ kind: 'parts-image-count-mismatch', packed: packedImages, expected: uploadImages });
    for (const part of written) uploadBound.push(sizeOf(path.join(partsRelative, part.name)));
    const largest = Math.max(...written.map((part) => fs.statSync(path.join(partsDir, part.name)).size)) / 1048576;
    console.log(`${written.length} parts -> ${partsDir}, ${packedImages}/${uploadImages} images, largest ${largest.toFixed(1)} MiB (limit ${uploadLimitMiB} MiB)`);
  }
  allIssues.push(...oversizeUploads(uploadBound, uploadLimitMiB));
  for (const issue of allIssues) console.log('ISSUE', JSON.stringify(issue));
  console.log(`${areas.length} areas, ${shotFiles.length} shots, ${stubbed.length} stubbed, ${truncated.length} truncated, ${allIssues.length} issues`);
  if (process.argv.includes('--strict') && allIssues.length) process.exit(1);
}
