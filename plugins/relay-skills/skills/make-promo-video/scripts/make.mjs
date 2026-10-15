#!/usr/bin/env node
// Runs the promo pipeline end to end, or from a given stage.
//
//   node make.mjs init --project <dir> --url https://product.example   scaffold a project
//   node make.mjs login --project <dir> --headed        sign in once to record behind an auth wall
//   node make.mjs audition --project <dir>                 hear voice and style options
//   node make.mjs discover --project <dir>                 list the site's features
//   node make.mjs classify --project <dir>                 Jev categorises them and marks key features
//   node make.mjs draft --project <dir> [--changes changes.json] [--clarify "..."]  write or regenerate script + plan
//   node make.mjs preview --project <dir>                  editable plan page to review before spending
//   node make.mjs --project <dir> [--from capture|voice|broll|timeline|mix|render|qa] [--to <stage>]
//                 [--ratios 16:9,9:16] [--verify-voice] [--voice-provider say]
//
// The creative stages (product understanding, script, storyboard) are written by the agent following
// SKILL.md; this runner produces everything after that and stops at QA. It never publishes.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { argValue, log } from './lib.mjs';

const STAGES = ['capture', 'voice', 'broll', 'music', 'timeline', 'mix', 'render', 'qa'];
const here = import.meta.dirname;
const project = path.resolve(argValue('project') || process.cwd());

if (process.argv[2] === 'init') {
  const url = argValue('url');
  if (!url) throw new Error('init needs --url');
  fs.mkdirSync(project, { recursive: true });
  const origin = new URL(url).origin;
  const example = JSON.parse(fs.readFileSync(path.join(here, '..', 'assets', 'promo.example.json'), 'utf8'));
  example.origin = origin;
  example.product = argValue('product') || new URL(url).hostname.split('.')[0].replace(/^\w/, (c) => c.toUpperCase());
  example.brand.url = new URL(url).hostname;
  for (const [name, value] of [['promo.json', example]]) {
    const file = path.join(project, name);
    if (fs.existsSync(file)) { log('init', `${name} exists, left unchanged`); continue; }
    fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
  }
  for (const name of ['script.example.json', 'storyboard.example.json']) {
    const target = path.join(project, name.replace('.example', ''));
    if (!fs.existsSync(target)) fs.copyFileSync(path.join(here, '..', 'assets', name), target);
  }
  log('init', `project ready at ${project}; write script.json and storyboard.json next (see SKILL.md)`);
  process.exit(0);
}

if (['login', 'audition', 'preview', 'discover', 'classify', 'draft'].includes(process.argv[2])) {
  const result = spawnSync(process.execPath, [path.join(here, `${process.argv[2]}.mjs`), ...process.argv.slice(3)], { stdio: 'inherit' });
  process.exit(result.status ?? 1);
}

const from = STAGES.indexOf(argValue('from') || 'capture');
const to = STAGES.indexOf(argValue('to') || 'qa');
if (from < 0 || to < 0) throw new Error(`Stages are: ${STAGES.join(', ')}`);
for (const stage of STAGES.slice(from, to + 1)) {
  const args = [path.join(here, `${stage}.mjs`), '--project', project];
  if (stage === 'render' && argValue('ratios')) args.push('--ratios', String(argValue('ratios')));
  if (stage === 'voice' && argValue('voice-provider')) args.push('--provider', String(argValue('voice-provider')));
  if (stage === 'qa' && argValue('verify-voice')) args.push('--verify-voice');
  if (argValue('env-file')) args.push('--env-file', String(argValue('env-file')));
  log('make', `stage ${stage}`);
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    log('make', `stage ${stage} failed; fix it and resume with --from ${stage}`);
    process.exit(result.status || 1);
  }
}
log('make', `done. Review renders/, qa.json and provenance.json; a person approves before anything is published.`);
