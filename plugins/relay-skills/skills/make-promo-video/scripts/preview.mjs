#!/usr/bin/env node
// Stage: preview (gate G1). Builds preview.html: the plan a person approves before anything is paid
// for or rendered. Shows the candidate features with checkboxes (from discover.mjs), then every shot
// with its thumbnail, spoken line, on-screen text, timing, source type and the evidence behind each
// claim, plus a cost estimate. "Copy selection" gives back the chosen feature ids and notes as JSON
// to paste into the conversation, so the script and storyboard can be revised before generation.
//
//   node preview.mjs --project <dir>
import fs from 'node:fs';
import path from 'node:path';
import { recommendFeatures } from './rules.mjs';
import { ttsCost } from './tts.mjs';
import { loadProject, log, readJson } from './lib.mjs';

const config = loadProject();
const script = config.script || { lines: [], claims: [] };
const storyboard = config.storyboard || { shots: [] };
const features = readJson(path.join(config.root, 'features.json'), { features: [] }).features;
const voice = readJson(path.join(config.root, 'audio', 'voice.json'), { lines: {} });
const escape = (text) => String(text ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const dataUri = (file) => (file && fs.existsSync(file) ? `data:image/${file.endsWith('.png') ? 'png' : 'jpeg'};base64,${fs.readFileSync(file).toString('base64')}` : '');

const lines = Object.fromEntries(script.lines.map((line) => [line.id, line]));
const claims = Object.fromEntries((script.claims || []).map((claim) => [claim.id, claim]));
const secondsFor = (line) => voice.lines[line.id]?.duration ?? line.vo.split(/\s+/).length / 2.6;

function thumbFor(shot) {
  const dir = path.join(config.root, 'capture', shot.id);
  if (shot.source === 'live' && fs.existsSync(path.join(dir, 'frames'))) {
    const frames = fs.readdirSync(path.join(dir, 'frames')).filter((f) => f.endsWith('.jpg')).sort();
    return frames.length ? path.join(dir, 'frames', frames[Math.floor(frames.length * 0.6)]) : null;
  }
  const feature = features.find((f) => (shot.featureIds || []).includes(f.id));
  if (feature?.thumb) return path.join(config.root, feature.thumb);
  if (shot.source === 'generated' && fs.existsSync(path.join(config.root, 'broll', `${shot.id}.mp4`))) return null;
  return null;
}

let t = 0;
const rows = storyboard.shots.map((shot) => {
  const shotLines = (shot.lineIds || []).map((id) => lines[id]).filter(Boolean);
  const beatSeconds = storyboard.mode === 'beat' ? (shot.beats || 4) * 60 / (storyboard.bpm || 112) : null;
  const seconds = beatSeconds ?? Math.max(shotLines.reduce((sum, line) => sum + secondsFor(line) + 0.3, 0.5), shot.minDuration || 0);
  const start = t; t += seconds;
  const thumb = dataUri(thumbFor(shot));
  const claimList = shotLines.flatMap((line) => line.claimIds || []).map((id) => claims[id]).filter(Boolean);
  const kind = { live: 'Recorded flow', still: 'Page tour', title: 'Title card', generated: 'Generated b-roll', text: 'Text card', hero3d: '3D hero', lift: 'Lifted element', scroll: 'Speed-ramped scroll' }[shot.source] || shot.source;
  const visual = shot.source === 'text' ? `<div class="card-thumb">${escape(shot.text || '')}${shot.sub ? `<br><small>${escape(shot.sub)}</small>` : ''}</div>`
    : shot.source === 'title' ? `<div class="card-thumb">${escape(shot.title?.heading || '')}</div>`
    : shot.source === 'generated' ? `<div class="card-thumb gen">${escape(shot.prompt || '').slice(0, 160)}…</div>`
    : thumb ? `<img src="${thumb}" alt="">` : '<div class="card-thumb">Not captured yet</div>';
  const beatControl = storyboard.mode === 'beat' ? `<label class="ctl">Beats <input type="number" min="1" max="16" value="${shot.beats || 4}" data-beats></label>` : '';
  return `<tr data-shot="${escape(shot.id)}">
    <td class="ctl-cell"><label class="ctl"><input type="checkbox" checked data-include> Keep</label>
      <div class="move"><button type="button" class="ghost" data-up aria-label="Move ${escape(shot.id)} earlier">↑</button><button type="button" class="ghost" data-down aria-label="Move ${escape(shot.id)} later">↓</button></div>${beatControl}</td>
    <td class="tc">${start.toFixed(1)}–${t.toFixed(1)}s<br><span class="id">${escape(shot.id)}</span></td>
    <td class="vis">${visual}<span class="pill ${shot.source}">${kind}</span></td>
    <td>${shotLines.map((line) => `<p class="vo">“${escape(line.caption || line.vo)}”</p>`).join('') || '<p class="muted">No voiceover</p>'}
      ${shot.headline ? `<p class="muted">On screen: ${escape(shot.headline)}</p>` : ''}
      ${shot.steps ? `<p class="muted">Steps: ${escape(shot.steps.map((s) => `${s.do}${s.text ? ` “${s.text}”` : ''}`).join(' → '))}</p>` : ''}</td>
    <td>${claimList.map((claim) => `<p class="ev"><b>${claim.id}</b> “${escape(claim.evidence.quote)}” <a href="${escape(claim.evidence.url)}">${escape(new URL(claim.evidence.url).pathname)}</a></p>`).join('') || '<p class="muted">No claims</p>'}</td>
  </tr>`;
}).join('\n');

const used = new Set(storyboard.shots.flatMap((shot) => shot.featureIds || []));
const CATEGORY_ORDER = ['core_capability', 'workflow', 'trust_governance', 'problem', 'integrations', 'audience_use_case', 'developer', 'pricing', 'call_to_action', 'example_content', 'page_chrome'];
const CATEGORY_LABEL = { core_capability: 'Core capabilities', workflow: 'Features and workflows', trust_governance: 'Trust and governance', problem: 'Problem statements', integrations: 'Integrations', audience_use_case: 'Audiences and use cases', developer: 'Developers and agents', pricing: 'Pricing', call_to_action: 'Calls to action', example_content: 'Example content', page_chrome: 'Page chrome' };
const classified = features.some((f) => f.category);
const recommended = new Set(recommendFeatures(features));
const groups = {};
for (const feature of features) (groups[classified ? feature.category || 'unclassified' : feature.page] ||= []).push(feature);
const groupKeys = Object.keys(groups).sort((a, b) => (CATEGORY_ORDER.indexOf(a) + 99) % 99 - (CATEGORY_ORDER.indexOf(b) + 99) % 99);
const checkedByDefault = (f) => (used.size ? used.has(f.id) : recommended.has(f.id));
const featureHtml = groupKeys.map((group) => {
  const list = groups[group].sort((a, b) => (b.keyScore ?? 0) - (a.keyScore ?? 0));
  return `<h3>${escape(classified ? CATEGORY_LABEL[group] || group : group)} <span class="n">${list.length}</span></h3><div class="grid">${list.map((f) => `
  <label class="feature${f.key ? ' is-key' : ''}"><input type="checkbox" value="${f.id}" data-heading="${escape(f.heading)}" data-key="${f.key ? 1 : 0}" data-rec="${recommended.has(f.id) ? 1 : 0}" ${checkedByDefault(f) ? 'checked' : ''}>
    <span class="tags">${recommended.has(f.id) ? '<i class="rec">Recommended</i>' : ''}${f.key ? '<i class="key">Key</i>' : ''}${used.has(f.id) ? '<i>In storyboard</i>' : ''}${f.keyScore != null ? `<i class="score">${Math.round(f.keyScore * 100)}</i>` : ''}${f.uncertain?.length ? `<i class="unc" title="Low-confidence: ${escape(f.uncertain.join(', '))}">unsure</i>` : ''}</span>
    ${f.thumb ? `<img src="${dataUri(path.join(config.root, f.thumb))}" alt="">` : ''}
    <b>${escape(f.heading)}</b><span>${escape(f.summary)}</span><span class="pg">${escape(f.page)}</span></label>`).join('')}</div>`;
}).join('');

const chars = script.lines.reduce((sum, line) => sum + line.vo.length, 0);
const genSeconds = storyboard.shots.filter((s) => s.source === 'generated').reduce((sum, s) => sum + (s.seconds || 8), 0);
const rate = config.broll.rateUsdPerSecond ?? 0.15;
const cost = ttsCost(chars, t) + t / 60 * 0.003 + genSeconds * rate;

const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escape(config.product)} promo plan</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
:root{--ink:${config.brand.ink};--paper:#fff;--ground:#f5f6f8;--muted:#64748b;--rule:#e2e5ea;--accent:#b45309}
*{box-sizing:border-box}body{margin:0;background:var(--ground);color:var(--ink);font:15px/1.5 "Public Sans",system-ui,sans-serif;padding:0 16px 60px}
.wrap{max-width:1180px;margin:0 auto}header{padding:36px 0 18px;border-bottom:1px solid var(--rule)}
h1{font-size:30px;margin:6px 0;letter-spacing:-.01em}h2{font-size:20px;margin:34px 0 10px}h3{font:500 12px/1 "IBM Plex Mono",monospace;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin:22px 0 8px}
.meta{display:flex;flex-wrap:wrap;gap:6px 18px;font:13px "IBM Plex Mono",monospace;color:var(--muted)}
.tbl{overflow-x:auto;background:var(--paper);border:1px solid var(--rule);border-radius:6px}table{border-collapse:collapse;width:100%;min-width:900px}
td{vertical-align:top;padding:12px;border-bottom:1px solid var(--rule)}tr:last-child td{border-bottom:0}
.tc{font:13px "IBM Plex Mono",monospace;color:var(--muted);white-space:nowrap}.vis{width:300px}.vis img,.card-thumb{width:280px;aspect-ratio:16/9;object-fit:cover;object-position:left top;border:1px solid var(--rule);border-radius:4px;display:block}
.card-thumb{background:var(--ink);color:#fff;font-weight:700;padding:14px;font-size:15px;display:flex;align-items:center}.card-thumb.gen{background:#1e293b;font-weight:400;font-size:12px;color:#cbd5e1}
.pill{display:inline-block;margin-top:6px;font:11px "IBM Plex Mono",monospace;padding:1px 7px;border-radius:4px;background:#eef1f5;color:var(--muted)}.pill.generated{background:#fdf3e7;color:var(--accent)}
.vo{margin:0 0 6px;font-size:15px}.muted{color:var(--muted);font-size:13px;margin:4px 0}.ev{font-size:12.5px;margin:0 0 6px;color:#334155}.ev a{color:var(--muted)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}
.feature{display:flex;flex-direction:column;gap:4px;background:var(--paper);border:1px solid var(--rule);border-radius:6px;padding:10px;cursor:pointer;font-size:13px}
.feature img{width:100%;aspect-ratio:16/9;object-fit:cover;object-position:left top;border-radius:4px;border:1px solid var(--rule)}.feature span{color:var(--muted);font-size:12px}
.feature:has(input:checked){border-color:var(--ink);box-shadow:inset 0 0 0 1px var(--ink)}.feature input{align-self:flex-start;cursor:pointer}.tags{display:flex;gap:4px;flex-wrap:wrap;min-height:18px}.tags i{font:normal 10.5px \"IBM Plex Mono\",monospace;padding:1px 6px;border-radius:4px;background:#eef1f5;color:var(--muted)}.tags i.rec{background:var(--ink);color:#fff}.tags i.key{background:#e9f5ec;color:#166534}.tags i.unc{background:#fbf5e3;color:#a16207}.tags i.score{margin-left:auto}.pg{font:11px \"IBM Plex Mono\",monospace;color:var(--muted)}h3 .n{color:#94a3b8}.bar button.ghost{background:#fff;color:var(--ink);border:1px solid var(--rule)}
.ctl-cell{width:110px}.ctl{display:flex;gap:6px;align-items:center;font-size:13px;margin:0 0 6px}.ctl input[type=number]{width:52px;font:13px \"IBM Plex Mono\",monospace;padding:3px;border:1px solid var(--rule);border-radius:4px}.move{display:flex;gap:4px;margin:0 0 6px}.move button{padding:2px 9px}.id{font:11px \"IBM Plex Mono\",monospace;color:var(--muted)}tr.off{opacity:.38}.script{background:var(--paper);border:1px solid var(--rule);border-radius:6px;padding:12px 14px;margin-bottom:12px}.bar2{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 10px}button.ghost{background:#fff;color:var(--ink);border:1px solid var(--rule)}
.bar{position:sticky;top:0;background:var(--ground);padding:12px 0;display:flex;gap:10px;align-items:center;flex-wrap:wrap;border-bottom:1px solid var(--rule);z-index:2}
button{font:600 14px "Public Sans",system-ui;background:var(--ink);color:#fff;border:0;border-radius:4px;padding:9px 14px;cursor:pointer}
textarea{width:100%;min-height:70px;font:14px "Public Sans",system-ui;border:1px solid var(--rule);border-radius:4px;padding:8px}
#out{font:12px "IBM Plex Mono",monospace;white-space:pre-wrap;background:var(--paper);border:1px solid var(--rule);border-radius:4px;padding:10px;display:none}
</style></head><body><div class="wrap">
<header><div class="meta"><span>Promo plan · gate G1</span><span>${escape(config.origin)}</span></div>
<h1>${escape(config.product)}: ${escape(script.type || 'promo')}, about ${Math.round(t)} s</h1>
<div class="meta"><span>${storyboard.shots.length} shots</span><span>${script.lines.length} lines</span><span>${genSeconds}s generated b-roll</span><span>estimated spend ~$${cost.toFixed(2)}</span><span>formats ${config.ratios.join(' · ')}</span></div>
<p>${escape(script.message || '')}</p></header>
<div class="bar"><span id="count"></span><button id="save" type="button">Save changes</button><button id="copy" class="ghost" type="button">Copy changes</button><span class="muted">Then run: node scripts/make.mjs draft --project &lt;dir&gt; --changes changes.json</span></div>
<h2>Script</h2>
<div class="script">${script.lines.map((line) => `<p class="vo"><span class="id">${escape(line.id)}</span> “${escape(line.caption || line.vo)}”</p>`).join('') || '<p class="muted">No voice lines.</p>'}</div>
<label for="clarify"><b>What should change?</b> The script and plan are regenerated from this as a whole (no line-by-line edits). Leave it empty to apply only the shot edits below.</label>
<textarea id="clarify" placeholder="For example: punchier hook, lead with the catalog, drop pricing, warmer voice lines"></textarea>
<h2>Storyboard</h2><p class="muted">Untick a shot to drop it, reorder with the arrows${storyboard.mode === 'beat' ? ', and change its length in beats' : ''}.</p><div class="tbl"><table>${rows}</table></div>
<h2>Features to include</h2>
<div class="bar2"><button class="ghost" type="button" data-pick="rec">Select recommended</button><button class="ghost" type="button" data-pick="key">Select all key</button><button class="ghost" type="button" data-pick="none">Clear</button></div>
<p class="muted">${classified ? 'Features are grouped and scored by Jev (Key = important and showable; Recommended = the strongest eight for a ~45 s video, at most three per category; the number is its key score out of 100). ' : ''}Tick what the video should show. ${used.size ? 'Checked boxes are what the current storyboard covers.' : 'Recommended features are checked to start.'} Changing the features regenerates the script and plan.</p>
${featureHtml || '<p class="muted">Run discover.mjs to list the product’s features.</p>'}
<pre id="out"></pre>
</div><script>
const boxes=[...document.querySelectorAll('.feature input')];const count=document.getElementById('count');
document.querySelectorAll('[data-pick]').forEach(btn=>btn.addEventListener('click',()=>{const mode=btn.dataset.pick;boxes.forEach(b=>{b.checked=mode==='rec'?b.dataset.rec==='1':mode==='key'?b.dataset.key==='1':false});update()}));
const update=()=>{count.textContent=boxes.filter(b=>b.checked).length+' of '+boxes.length+' features selected'};boxes.forEach(b=>b.addEventListener('change',update));update();
const rowsEl=()=>[...document.querySelectorAll('tr[data-shot]')];
document.querySelectorAll('[data-up],[data-down]').forEach(btn=>btn.addEventListener('click',()=>{const tr=btn.closest('tr');if(btn.hasAttribute('data-up')&&tr.previousElementSibling)tr.parentNode.insertBefore(tr,tr.previousElementSibling);if(btn.hasAttribute('data-down')&&tr.nextElementSibling)tr.parentNode.insertBefore(tr.nextElementSibling,tr)}));
document.querySelectorAll('[data-include]').forEach(box=>box.addEventListener('change',()=>box.closest('tr').classList.toggle('off',!box.checked)));
const changes=()=>({schema:'relay.promo_changes.v1',features:boxes.filter(b=>b.checked).map(b=>({id:b.value,heading:b.dataset.heading})),
  shots:rowsEl().map(tr=>{const beats=tr.querySelector('[data-beats]');return{id:tr.dataset.shot,include:tr.querySelector('[data-include]').checked,...(beats?{beats:Number(beats.value)}:{})}}),
  clarification:document.getElementById('clarify').value.trim()});
document.getElementById('copy').addEventListener('click',async()=>{const text=JSON.stringify(changes(),null,2);const out=document.getElementById('out');out.textContent=text;out.style.display='block';
try{await navigator.clipboard.writeText(text);document.getElementById('copy').textContent='Copied'}catch{const r=document.createRange();r.selectNodeContents(out);getSelection().removeAllRanges();getSelection().addRange(r)}});
document.getElementById('save').addEventListener('click',()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(changes(),null,2)],{type:'application/json'}));a.download='changes.json';a.click();document.getElementById('save').textContent='Saved changes.json'});
</script></body></html>`;
const out = path.join(config.root, 'preview.html');
fs.writeFileSync(out, html);
log('preview', `${out} (${(html.length / 1024 / 1024).toFixed(1)} MB, ${features.length} features, ${storyboard.shots.length} shots, ~$${cost.toFixed(2)})`);
