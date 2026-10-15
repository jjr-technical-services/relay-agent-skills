// Pure rules shared by the stages (and unit-tested): what a generated shot may depict, and how a
// voice transcript is compared with the script.

const UI_TERMS = /\b(ui|user interface|screen|screenshot|dashboard|app|website|web page|browser|button|logo|brand|text|words|letters)\b/i;
const NEGATED = /\bno (text|logos?|words|letters|screens?|ui|user interface|people|faces|hands)\b/gi;

// Generated footage is mood b-roll only. Product UI is always captured, never generated.
export function assertMoodShot(shot) {
  if (shot.depictsUi !== false) throw new Error(`${shot.id}: generated shots must set "depictsUi": false. Product UI is always captured, never generated.`);
  if (UI_TERMS.test((shot.prompt || '').replace(NEGATED, ''))) {
    throw new Error(`${shot.id}: prompt mentions UI, screens, text or brands. Keep generated shots to mood b-roll.`);
  }
  return true;
}

// Spoken numbers and URLs ("forty-one", "relay dot example dot com") are normalised before comparing
// with the transcript, so only real misreads (skipped, swapped or invented words) are flagged.
const UNITS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
export function normaliseSpoken(text) {
  let out = ` ${text.toLowerCase()} `;
  out = out.replace(/\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)[- ](one|two|three|four|five|six|seven|eight|nine)\b/g, (_, t, u) => String(TENS.indexOf(t) * 10 + UNITS.indexOf(u)));
  out = out.replace(/\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\b/g, (t) => String(TENS.indexOf(t) * 10));
  out = out.replace(/\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen)\b/g, (u) => String(UNITS.indexOf(u)));
  out = out.replace(/\s+dot\s+/g, '.');
  out = out.replace(/\b(\d+)[\s-]*dollars?\b/g, '$$$1');
  return out.replace(/[^a-z0-9]+/g, '');
}
function bigrams(text) {
  const grams = new Map();
  for (let i = 0; i < text.length - 1; i += 1) grams.set(text.slice(i, i + 2), (grams.get(text.slice(i, i + 2)) || 0) + 1);
  return grams;
}
export function spokenSimilarity(script, transcript) {
  const a = bigrams(normaliseSpoken(script));
  const b = bigrams(normaliseSpoken(transcript));
  let overlap = 0; let total = 0;
  for (const [gram, count] of a) { overlap += Math.min(count, b.get(gram) || 0); total += count; }
  for (const count of b.values()) total += count;
  return total ? (2 * overlap) / total : 1;
}

// The features a ~45 s video should cover by default: the strongest key features, at most three per
// category, eight in total. Shared by preview.mjs and draft.mjs.
export function recommendFeatures(features, { limit = 8, perCategory = 3 } = {}) {
  const picked = [];
  const counts = {};
  for (const f of features.filter((x) => x.key).sort((a, b) => b.keyScore - a.keyScore)) {
    if (picked.length >= limit || (counts[f.category] || 0) >= perCategory) continue;
    picked.push(f.id);
    counts[f.category] = (counts[f.category] || 0) + 1;
  }
  return picked;
}

// A claim's quote must appear word for word in the text captured from the site.
const squash = (text) => String(text || '').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim().toLowerCase();
export function quoteIsVerbatim(quote, feature) {
  const q = squash(quote).replace(/[.…]+$/, '');
  return q.length >= 8 && squash(`${feature.heading} ${feature.summary}`).includes(q);
}

// Plan edits from the preview page that need no model: reorder, remove, resize shots.
export function applyPlanEdits(storyboard, changes) {
  if (!changes?.shots?.length) return storyboard;
  const byId = Object.fromEntries(storyboard.shots.map((shot) => [shot.id, shot]));
  const shots = changes.shots.filter((edit) => edit.include !== false && byId[edit.id]).map((edit) => {
    const shot = { ...byId[edit.id] };
    if (Number.isInteger(edit.beats) && edit.beats > 0) shot.beats = edit.beats;
    return shot;
  });
  return { ...storyboard, shots };
}
