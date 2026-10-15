#!/usr/bin/env node
// Stage: classify. Categorises every discovered feature and scores which are key, using Jev (TypeSafe
// System One, the model Relay calls "Zev"). Jev returns typed answers with calibrated confidence, so
// low-confidence calls are flagged rather than trusted. It cannot write text, only decide.
//
//   node classify.mjs --project <dir> [--concurrency 6]
//
// Needs ZEV_API_KEY (environment or .env.local). Billed on input tokens only; every call goes to
// spend.jsonl. Adds to each feature in features.json: category, keyScore (0-1), keyLevel, showable,
// promoWorthy, key (boolean), uncertain (list of low-confidence answers).
import path from 'node:path';
import { argValue, loadProject, log, logSpend, readJson, secret, writeJson } from './lib.mjs';

const MODEL = 'jev-1.13.0';
const USD_PER_INPUT_TOKEN = 0.000000042; // $42 per billion input tokens, output free (TypeSafe, per Relay docs/zev-structured-decisions.md)
const HOST = 'https://api.typesafe.ai/v1/systemone';

export const CATEGORIES = {
  problem: 'States the customer problem or pain the product solves, not a feature.',
  core_capability: 'What the product fundamentally does: its main promise or engine.',
  workflow: 'A specific product feature, tool or flow a user performs.',
  example_content: 'One example item in a catalog or gallery (a single template, agent, listing), not a capability.',
  trust_governance: 'Security, control, approvals, cost visibility, compliance, audit.',
  integrations: 'Connecting other tools, data sources, imports or APIs for customers.',
  pricing: 'Plans, price, free trial, billing terms.',
  audience_use_case: 'Who it is for: industries, teams, roles, goals or use cases.',
  developer: 'Developer or agent-builder features: API docs, SDKs, publishing agents.',
  call_to_action: 'An invitation to sign up, start, book or try.',
  page_chrome: 'Navigation, headings with no product meaning, legal, help or filter labels.',
};

const KEY_LEVELS = [
  'Not a feature: page chrome, labels or legal text.',
  'Minor detail a first-time viewer would not miss.',
  'Useful supporting detail.',
  'Important: strengthens the case for the product.',
  'Core: a first-time viewer must see this to understand why to use the product.',
];

export function questionsFor() {
  return {
    category: { type: 'choice', instructions: 'Which category best describes this section of the product website?', criteria: CATEGORIES },
    key: { type: 'score', instructions: 'For a 45-second promo video aimed at first-time prospects, how essential is this section to show?', criteria: KEY_LEVELS },
    showable: { type: 'noul', instructions: 'Can this be shown on screen as real, working product interface (not only marketing copy or an illustration)?' },
    promo_worthy: { type: 'noul', instructions: 'Does this section state a concrete, specific benefit a promo video could claim, rather than a vague slogan or a label?' },
  };
}

async function ask(key, state, questions) {
  const response = await fetch(HOST, {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ model: MODEL, state, questions }),
  });
  if (!response.ok) throw new Error(`Jev returned ${response.status}`);
  return response.json();
}

// Turns Jev answers into the fields the preview uses. The key score is normalised to 0-1 across the
// five levels; a feature is "key" when it scores Important or Core with confidence, is not page chrome
// or example content, and is either showable or a promo-worthy claim.
export function interpret(answers, threshold = 0.6) {
  const uncertain = [];
  const category = answers.category?.choice;
  if ((answers.category?.confidence ?? 0) < threshold) uncertain.push('category');
  const keyScore = Math.max(0, Math.min(1, Number(answers.key?.score ?? 0) / (KEY_LEVELS.length - 1)));
  if ((answers.key?.confidence ?? 0) < threshold) uncertain.push('key');
  const showable = Number(answers.showable?.noul ?? 0);
  const promoWorthy = Number(answers.promo_worthy?.noul ?? 0);
  const keyLevel = Math.round(keyScore * (KEY_LEVELS.length - 1));
  const key = keyLevel >= 3 && !['page_chrome', 'example_content'].includes(category) && (showable >= 0.5 || promoWorthy >= 0.5);
  return { category, keyScore: Number(keyScore.toFixed(3)), keyLevel, showable: Number(showable.toFixed(3)), promoWorthy: Number(promoWorthy.toFixed(3)), key, uncertain };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const config = loadProject();
  const key = secret('ZEV_API_KEY', config) || secret('TYPESAFE_API_KEY', config);
  if (!key) throw new Error('ZEV_API_KEY is not set (environment or .env.local).');
  const file = path.join(config.root, 'features.json');
  const data = readJson(file);
  if (!data?.features?.length) throw new Error('Run discover.mjs first.');
  const questions = questionsFor();
  const concurrency = Number(argValue('concurrency', 6));
  let tokens = 0;
  let index = 0;
  let failed = 0;
  async function worker() {
    while (index < data.features.length) {
      const feature = data.features[index++];
      const state = { product: config.product, site: config.origin, page: feature.page, heading: feature.heading, text: feature.summary };
      try {
        const body = await ask(key, state, questions);
        Object.assign(feature, interpret(body.answers || {}), { classifiedBy: body.model || MODEL });
        const inputTokens = Number(body.usage?.input_tokens ?? body.usage?.prompt_tokens ?? 0);
        tokens += inputTokens;
      } catch (error) {
        failed += 1;
        feature.classifyError = error.message;
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  const usd = tokens * USD_PER_INPUT_TOKEN;
  logSpend(config, { stage: 'classify', provider: 'typesafe', model: MODEL, unit: 'input_token', quantity: tokens, rate: USD_PER_INPUT_TOKEN, usd });
  data.classifiedAt = new Date().toISOString();
  writeJson(file, data);
  const keys = data.features.filter((f) => f.key);
  log('classify', `${data.features.length} features, ${keys.length} key, ${failed} failed, ${tokens} input tokens (~$${usd.toFixed(6)})`);
  for (const f of keys.sort((a, b) => b.keyScore - a.keyScore)) log('classify', `key: ${f.id} [${f.category}] ${f.heading}`);
}
