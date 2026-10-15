// Downloads the brand fonts once (Google Fonts, latin subset, woff2) into a local cache so rendering
// never depends on the network. Public Sans and IBM Plex Mono are both SIL Open Font License.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CACHE = path.join(os.homedir(), '.cache', 'make-promo-video', 'fonts');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

// Returns CSS @font-face rules pointing at cached files, or '' when fonts cannot be fetched (the
// compositor then falls back to system-ui and says so).
export async function ensureFonts(families) {
  fs.mkdirSync(CACHE, { recursive: true });
  const rules = [];
  for (const { family, weights } of families) {
    const key = family.replace(/\s+/g, '-').toLowerCase();
    const cssFile = path.join(CACHE, `${key}.css`);
    if (!fs.existsSync(cssFile)) {
      const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weights.join(';')}&display=block`;
      const response = await fetch(url, { headers: { 'User-Agent': UA } }).catch(() => null);
      if (!response?.ok) return '';
      let css = await response.text();
      // Keep only the latin block of each face.
      const blocks = css.split('/* ').filter((block) => block.startsWith('latin */'));
      css = blocks.map((block) => `/* ${block}`).join('\n');
      let index = 0;
      for (const match of [...css.matchAll(/url\((https:[^)]+\.woff2)\)/g)]) {
        const file = path.join(CACHE, `${key}-${index++}.woff2`);
        if (!fs.existsSync(file)) {
          const font = await fetch(match[1]).catch(() => null);
          if (!font?.ok) return '';
          fs.writeFileSync(file, Buffer.from(await font.arrayBuffer()));
        }
        css = css.replace(match[1], `file://${file}`);
      }
      fs.writeFileSync(cssFile, css);
    }
    // Inline the cached files as data: URIs: the compositor's CSP allows fonts from data: only, and the
    // render browser runs without file-access flags.
    const css = fs.readFileSync(cssFile, 'utf8').replace(/url\(file:\/\/([^)]+\.woff2)\)/g, (match, file) => (
      fs.existsSync(file) ? `url(data:font/woff2;base64,${fs.readFileSync(file).toString('base64')})` : match));
    rules.push(css);
  }
  return rules.join('\n');
}
