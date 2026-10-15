#!/usr/bin/env node
// Stage: draft (gate G1). Writes script.json and storyboard.json from the chosen features, or rewrites
// them from a clarification ("make it punchier", "lead with pricing", "drop the marketplace").
//
//   node draft.mjs --project <dir> [--changes changes.json] [--clarify "text"] [--seconds 40]
//
// changes.json comes from the preview page's "Save changes": the chosen features, the shot order with
// shots switched off or resized, and a clarification. Shot order and size edits alone are applied
// directly; a clarification or a different feature set regenerates the script and plan with a model
// (OpenAI Responses API, promo.json draft.model, default gpt-5.6-terra). Scripts are regenerated as a
// whole, never edited line by line.
//
// What the model may not do is checked in code, not trusted: every claim must quote the captured site
// text word for word, shots can only point at discovered features (their selectors come from
// discover.mjs, not from the model), recorded flows can only be kept from the previous plan, and
// generated shots must pass the mood-only rule. A failed check is sent back once; if it still fails,
// nothing is overwritten. The previous files are kept in drafts/<time>/.
import fs from 'node:fs';
import path from 'node:path';
import { applyPlanEdits, assertMoodShot, quoteIsVerbatim, recommendFeatures } from './rules.mjs';
import { SAFE_ID, argValue, loadProject, log, logSpend, readJson, secret, writeJson } from './lib.mjs';

const SOURCES = ['text', 'hero3d', 'lift', 'scroll', 'live', 'title', 'generated'];

const nullable = (type) => ({ type: [type, 'null'] });
export const DRAFT_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['message', 'audience', 'claims', 'lines', 'shots'],
  properties: {
    message: { type: 'string' },
    audience: { type: 'string' },
    claims: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'featureId', 'quote'], properties: { id: { type: 'string' }, featureId: { type: 'string' }, quote: { type: 'string' } } } },
    lines: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'vo', 'caption', 'claimIds'], properties: { id: { type: 'string' }, vo: { type: 'string' }, caption: nullable('string'), claimIds: { type: 'array', items: { type: 'string' } } } } },
    shots: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['id', 'source', 'beats', 'featureId', 'keep', 'text', 'sub', 'claimIds', 'lineIds', 'hit', 'silenceBefore', 'prompt'],
      properties: {
        id: { type: 'string' }, source: { type: 'string', enum: SOURCES }, beats: { type: 'integer' },
        featureId: nullable('string'), keep: nullable('string'), text: nullable('string'), sub: nullable('string'),
        claimIds: { type: 'array', items: { type: 'string' } }, lineIds: { type: 'array', items: { type: 'string' } },
        hit: { type: 'boolean' }, silenceBefore: { type: 'boolean' }, prompt: nullable('string'),
      } } },
  },
};

const HOUSE_STYLE = `You plan short, music-driven product promo videos (no continuous narrator), cut on the beat.
Shape: a 3-5 word kinetic text hook; two or three short problem cards; a reveal (hero3d with hit and silenceBefore, carrying the first voice line); three proof sections, each a 3-beat text card naming one benefit followed by one or two real-UI shots (lift, scroll, hero3d, or a kept live flow); a montage of three or four 2-beat hero3d shots; an end card (title, or generated if allowed) carrying the last voice line.
Shot sources: text (kinetic card, 3-5 words in "text", optional short "sub"), hero3d (tilted view of a feature's page region), lift (a feature's card lifted off its page; only for features that are a self-contained card or panel), scroll (speed-ramped scroll down to a feature), live (only by setting "keep" to the id of an existing recorded flow), title (end card: "text" is the heading, "sub" one line), generated (mood b-roll behind the end card: "prompt" with no UI, text, logos, brands or people).
Voice: a character, not a narrator. At most three short lines, 4-10 words each, placed on the reveal, the strongest proof shot and the end card. Write "vo" as it should be spoken (numbers and URLs in words) and "caption" as it should be read, or null.
Claims: any factual statement in a line or card must cite a claim. A claim quotes the given feature text WORD FOR WORD (copy a contiguous span of at least 8 characters from that feature's heading or text). Never invent metrics, customers, testimonials, comparisons or capabilities.
Shot, line and claim ids are short and unique, letters, digits, - and _ only (T1, R1, P1, P1-lift, M1, E-end). Every non-text, non-title shot needs a featureId from the list, except kept live shots.`;

async function callModel(config, messages) {
  const key = secret('OPENAI_API_KEY', config);
  if (!key) throw new Error('OPENAI_API_KEY is not set (environment or .env.local).');
  const model = config.raw.draft?.model || 'gpt-5.6-terra';
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model, reasoning: { effort: config.raw.draft?.effort || 'medium' }, input: messages,
      text: { format: { type: 'json_schema', name: 'promo_draft', schema: DRAFT_SCHEMA, strict: true } },
    }),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`Draft model ${model} failed: ${response.status} ${JSON.stringify(body?.error || body).slice(0, 300)}. Set promo.json draft.model if this model is unavailable.`);
  const text = body.output_text || body.output?.flatMap((item) => item.content || []).find((c) => c.type === 'output_text')?.text;
  logSpend(config, { stage: 'draft', provider: 'openai', model, unit: 'token', quantity: (body.usage?.input_tokens || 0) + (body.usage?.output_tokens || 0), inputTokens: body.usage?.input_tokens, outputTokens: body.usage?.output_tokens, usd: 0, unpriced: true });
  return { model, draft: JSON.parse(text) };
}

// Turns the model's draft into script.json and storyboard.json, or returns the problems found.
export function materialise(draft, { config, features, previous, bpm, allowGenerated }) {
  const errors = [];
  const byId = Object.fromEntries(features.map((f) => [f.id, f]));
  const observedAt = (config.featuresDiscoveredAt || new Date().toISOString()).slice(0, 10);
  const claims = draft.claims.map((claim) => {
    const feature = byId[claim.featureId];
    if (!feature) errors.push(`claim ${claim.id} cites unknown feature ${claim.featureId}`);
    else if (!quoteIsVerbatim(claim.quote, feature)) errors.push(`claim ${claim.id} quote is not word for word from feature ${claim.featureId}: "${claim.quote}"`);
    return { id: claim.id, text: claim.quote, featureId: claim.featureId, evidence: { url: feature ? new URL(feature.page, `${config.origin}/`).toString() : config.origin, quote: claim.quote, label: 'Observed', observedAt } };
  });
  const claimIds = new Set(claims.map((c) => c.id));
  const badId = (kind, id) => (SAFE_ID.test(String(id)) ? false : (errors.push(`${kind} id ${JSON.stringify(id)} must be 1-40 letters, digits, "-" or "_"`), true));
  for (const claim of draft.claims) badId('claim', claim.id);
  const lines = draft.lines.map((line) => {
    badId('line', line.id);
    for (const id of line.claimIds) if (!claimIds.has(id)) errors.push(`line ${line.id} cites unknown claim ${id}`);
    return { id: line.id, vo: line.vo, ...(line.caption ? { caption: line.caption } : {}), claimIds: line.claimIds };
  });
  const lineIds = new Set(lines.map((l) => l.id));
  const previousShots = Object.fromEntries((previous?.shots || []).map((shot) => [shot.id, shot]));
  const seen = new Set();
  const cta = config.brand.url ? `Start free at ${config.brand.url}` : null;
  const shots = [];
  for (const s of draft.shots) {
    if (badId('shot', s.id)) continue;
    if (seen.has(s.id)) errors.push(`duplicate shot id ${s.id}`);
    seen.add(s.id);
    for (const id of s.claimIds) if (!claimIds.has(id)) errors.push(`shot ${s.id} cites unknown claim ${id}`);
    for (const id of s.lineIds) if (!lineIds.has(id)) errors.push(`shot ${s.id} uses unknown line ${id}`);
    const beats = Math.max(1, Math.min(16, s.beats || 4));
    const common = { beats, ...(s.lineIds.length ? { lineIds: s.lineIds } : {}), ...(s.hit ? { hit: true } : {}), ...(s.silenceBefore ? { silenceBefore: true } : {}) };
    if (s.keep) {
      const kept = previousShots[s.keep];
      if (!kept) { errors.push(`shot ${s.id} keeps unknown shot ${s.keep}`); continue; }
      shots.push({ ...kept, ...common, id: kept.id });
      continue;
    }
    if (s.source === 'live') { errors.push(`shot ${s.id}: live flows can only be kept from the previous plan (set keep)`); continue; }
    if (s.source === 'text') { shots.push({ id: s.id, source: 'text', text: s.text || '', ...(s.sub ? { sub: s.sub } : {}), claimIds: s.claimIds, ...common }); continue; }
    const end = { style: 'end', heading: s.text || config.product, ...(s.sub ? { sub: s.sub } : {}), ...(cta ? { cta } : {}) };
    if (s.source === 'title') { shots.push({ id: s.id, source: 'title', captions: false, title: end, ...common }); continue; }
    if (s.source === 'generated') {
      if (!allowGenerated) { shots.push({ id: s.id, source: 'title', captions: false, title: end, ...common }); continue; }
      const shot = { id: s.id, source: 'generated', depictsUi: false, captions: false, prompt: s.prompt || '', title: end, fallbackTitle: end, ...common };
      try { assertMoodShot(shot); } catch (error) { errors.push(error.message); }
      shots.push(shot);
      continue;
    }
    const feature = byId[s.featureId];
    if (!feature) { errors.push(`shot ${s.id} (${s.source}) needs a featureId from the list`); continue; }
    const base = { id: s.id, source: s.source, url: feature.page, featureIds: [feature.id], ...common };
    if (s.source === 'hero3d') shots.push({ ...base, focus: feature.selector });
    else if (s.source === 'lift') shots.push({ ...base, selector: feature.container || feature.selector, pad: 16 });
    else if (s.source === 'scroll') shots.push({ ...base, from: 0, to: feature.selector });
  }
  const totalBeats = shots.reduce((sum, shot) => sum + (shot.beats || 4), 0);
  return {
    errors,
    seconds: (totalBeats * 60) / bpm,
    script: { schema: 'relay.promo_script.v1', product: config.product, type: 'teaser', message: draft.message, audience: draft.audience, claims, lines, cta: cta ? { text: 'Start free', url: config.origin } : undefined },
    storyboard: { schema: 'relay.promo_storyboard.v1', mode: 'beat', bpm, shots },
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const config = loadProject();
  const featureFile = readJson(path.join(config.root, 'features.json'));
  if (!featureFile?.features?.length) throw new Error('Run discover.mjs (and classify.mjs) first.');
  config.featuresDiscoveredAt = featureFile.discoveredAt;
  const features = featureFile.features;
  const changes = argValue('changes') ? readJson(path.resolve(String(argValue('changes')))) : null;
  const clarification = String(argValue('clarify') || changes?.clarification || changes?.notes || '').trim();
  const previousBoard = config.storyboard;
  const previousFeatures = [...new Set((previousBoard?.shots || []).flatMap((s) => s.featureIds || []))].sort();
  const chosen = changes?.features?.length ? changes.features.map((f) => f.id || f) : previousFeatures.length ? previousFeatures : recommendFeatures(features);
  const featuresChanged = previousFeatures.length && JSON.stringify([...chosen].sort()) !== JSON.stringify(previousFeatures);

  const backup = () => {
    const dir = path.join(config.root, 'drafts', new Date().toISOString().replace(/[:.]/g, '-'));
    fs.mkdirSync(dir, { recursive: true });
    for (const name of ['script.json', 'storyboard.json']) if (fs.existsSync(path.join(config.root, name))) fs.copyFileSync(path.join(config.root, name), path.join(dir, name));
    if (changes) writeJson(path.join(dir, 'changes.json'), changes);
    return dir;
  };

  // Order, removal and size edits need no model.
  if (previousBoard && !clarification && !featuresChanged && changes?.shots?.length) {
    const dir = backup();
    writeJson(path.join(config.root, 'storyboard.json'), applyPlanEdits(previousBoard, changes));
    log('draft', `applied plan edits (order, removals, lengths); previous version in ${path.relative(config.root, dir)}`);
    process.exit(0);
  }

  const bpm = previousBoard?.bpm || config.music.bpm || 112;
  const seconds = Number(argValue('seconds', config.raw.targetSeconds || 40));
  const allowGenerated = config.broll.provider !== 'none';
  const pool = features.filter((f) => chosen.includes(f.id));
  const extra = features.filter((f) => !chosen.includes(f.id) && f.category === 'problem').slice(0, 3);
  const keepable = (previousBoard?.shots || []).filter((s) => s.source === 'live').map((s) => ({ id: s.id, url: s.url, does: (s.steps || []).map((st) => `${st.do}${st.text ? ` "${st.text}"` : ''}`).join(', ') }));
  const featureList = [...pool, ...extra].map((f) => ({ id: f.id, page: f.page, category: f.category || null, key: Boolean(f.key), liftable: Boolean(f.container), heading: f.heading, text: f.summary }));
  const user = {
    product: config.product, site: config.origin, targetSeconds: seconds, bpm, beatSeconds: Number((60 / bpm).toFixed(3)),
    targetBeats: Math.round((seconds * bpm) / 60), allowGenerated,
    features: featureList, keepableLiveShots: keepable,
    previousPlan: previousBoard ? { script: config.script, shots: previousBoard.shots.map((s) => ({ id: s.id, source: s.source, beats: s.beats, text: s.text || s.title?.heading || null, featureIds: s.featureIds || [] })) } : null,
    planEdits: changes?.shots || null,
    clarification: clarification || null,
  };
  const messages = [
    { role: 'system', content: HOUSE_STYLE },
    { role: 'user', content: `Plan the video. Cover the chosen features (not the problem-only extras except as problem cards). ${clarification ? `The user asked for this change: "${clarification}".` : ''}\n${JSON.stringify(user)}` },
  ];
  let { model, draft } = await callModel(config, messages);
  let result = materialise(draft, { config, features, previous: previousBoard, bpm, allowGenerated });
  if (result.errors.length) {
    log('draft', `first draft had ${result.errors.length} problem(s); asking once more`);
    messages.push({ role: 'assistant', content: JSON.stringify(draft) }, { role: 'user', content: `Fix these problems and return the whole plan again:\n- ${result.errors.join('\n- ')}` });
    ({ model, draft } = await callModel(config, messages));
    result = materialise(draft, { config, features, previous: previousBoard, bpm, allowGenerated });
  }
  if (result.errors.length) {
    for (const error of result.errors) log('draft', `problem: ${error}`);
    throw new Error('The draft still breaks the rules above; nothing was overwritten. Try a clearer clarification.');
  }
  const dir = backup();
  writeJson(path.join(config.root, 'script.json'), result.script);
  writeJson(path.join(config.root, 'storyboard.json'), result.storyboard);
  writeJson(path.join(config.root, 'draft.json'), { schema: 'relay.promo_draft.v1', model, clarification: clarification || null, features: chosen, seconds: Number(result.seconds.toFixed(1)), previous: path.relative(config.root, dir), draftedAt: new Date().toISOString() });
  log('draft', `${result.storyboard.shots.length} shots, ${result.script.lines.length} voice lines, ${result.script.claims.length} claims, ~${result.seconds.toFixed(0)}s (${model}); previous version in ${path.relative(config.root, dir)}`);
  if (Math.abs(result.seconds - seconds) / seconds > 0.25) log('draft', `warning: plan is ~${result.seconds.toFixed(0)}s against a ${seconds}s target`);
}
