/**
 * PDF の同一性確認とライセンス表記の抽出。
 *   node tools/pdfinfo.mjs <file.pdf> [...]
 *
 * Manifest 登録前に「想定した論文か」「再配布条件がどう書かれているか」を確認するために使う。
 * 厳密な PDF パーサではなく、Info 辞書 / XMP / 展開したテキストの走査にとどめる。
 */
import { readFileSync, statSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';

const LICENSE_PATTERNS = [
  /creativecommons\.org\/licenses\/[a-z-]+\/[0-9.]+/gi,
  /CC[ -]BY[A-Z-]*(?:[ -][0-9.]+)?/g,
  /arxiv\.org\/licenses\/nonexclusive-distrib\/[0-9.]+/gi,
  /All rights reserved/gi,
  /[Oo]pen [Aa]ccess/g,
  /[Pp]ermission (?:is|must|to)[^.]{0,80}\./g,
  /may not be (?:reproduced|duplicated|copied)[^.]{0,80}\./gi,
  /not[- ]for[- ]commercial|non[- ]commercial/gi,
  /RAND (?:is a registered trademark|Corporation)/g,
  /Licensed under|under the terms of[^.]{0,60}\./gi,
];

/** FlateDecode ストリームを展開して連結する。 */
function rawText(buf) {
  const chunks = [];
  const marker = Buffer.from('stream');
  let i = 0;
  while ((i = buf.indexOf(marker, i)) !== -1) {
    let s = i + marker.length;
    if (buf[s] === 0x0d) s += 1;
    if (buf[s] === 0x0a) s += 1;
    const e = buf.indexOf(Buffer.from('endstream'), s);
    i = e === -1 ? s : e + 1;
    if (e === -1) break;
    try {
      chunks.push(inflateSync(buf.subarray(s, e)));
    } catch {
      /* 非圧縮ストリームや画像は無視する */
    }
  }
  return Buffer.concat(chunks).toString('latin1');
}

/** ページ内容ストリームから Tj / TJ のテキストを取り出す。 */
function pageText(streams) {
  const out = [];
  const re = /\((?:[^()\\]|\\[\s\S])*\)/g;
  let m;
  while ((m = re.exec(streams)) !== null) {
    const s = m[0]
      .slice(1, -1)
      .replace(/\\([()\\])/g, '$1')
      .replace(/\\[0-7]{1,3}/g, ' ');
    if (s.trim()) out.push(s);
  }
  return out.join('').replace(/\s+/g, ' ').trim();
}

function infoField(buf, name) {
  const latin = buf.toString('latin1');
  const re = new RegExp(`/${name}\\s*\\(((?:[^()\\\\]|\\\\[\\s\\S])*)\\)`);
  const m = re.exec(latin);
  if (m) return m[1].replace(/\\([()\\])/g, '$1').trim();
  const utf16 = new RegExp(`/${name}\\s*<([0-9A-Fa-f\\s]+)>`).exec(latin);
  if (utf16) {
    const hex = utf16[1].replace(/\s+/g, '');
    const bytes = Buffer.from(hex, 'hex');
    if (bytes.subarray(0, 2).toString('hex') === 'feff')
      return bytes.subarray(2).swap16().toString('utf16le').trim();
    return bytes.toString('latin1').trim();
  }
  return null;
}

function xmpField(text, tag) {
  const m = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`).exec(text);
  if (!m) return null;
  const inner = m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return inner || null;
}

for (const path of process.argv.slice(2)) {
  const buf = readFileSync(path);
  const latin = buf.toString('latin1');
  const streams = rawText(buf);
  const body = `${latin}\n${streams}`;
  const text = pageText(streams);

  console.log(`\n=== ${path}`);
  console.log(`  size   : ${statSync(path).size}`);
  console.log(`  sha256 : ${createHash('sha256').update(buf).digest('hex')}`);
  console.log(`  version: ${latin.slice(0, 8)}`);
  console.log(`  Title  : ${infoField(buf, 'Title') ?? xmpField(body, 'dc:title') ?? '-'}`);
  console.log(`  Author : ${infoField(buf, 'Author') ?? xmpField(body, 'dc:creator') ?? '-'}`);
  console.log(`  Subject: ${infoField(buf, 'Subject') ?? '-'}`);
  console.log(`  Creator: ${infoField(buf, 'Creator') ?? '-'}`);
  console.log(`  head   : ${text.slice(0, 260) || '(テキスト抽出不可)'}`);

  const hits = new Set();
  for (const re of LICENSE_PATTERNS)
    for (const m of body.matchAll(re)) hits.add(m[0].replace(/\s+/g, ' ').trim());
  console.log(`  license hits:`);
  for (const h of [...hits].slice(0, 12)) console.log(`    - ${h}`);
  if (!hits.size) console.log('    - (なし)');
}
