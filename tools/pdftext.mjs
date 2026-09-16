/**
 * PDF からテキストを抽出する。Manifest 登録前の同一性確認と、
 * Method Card 執筆時に原論文の該当箇所を確認するために使う。
 *
 *   node tools/pdftext.mjs <file.pdf> [開始ページ] [終了ページ]
 *
 * ページ番号は 1 始まり。省略時は 1 ページ目のみ。
 */
import { readFileSync } from 'node:fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const [path, fromArg, toArg] = process.argv.slice(2);
if (!path) {
  console.error('usage: node tools/pdftext.mjs <file.pdf> [from] [to]');
  process.exit(1);
}

const doc = await getDocument({
  data: new Uint8Array(readFileSync(path)),
  useSystemFonts: false,
  isEvalSupported: false,
}).promise;

const from = Number(fromArg ?? 1);
const to = Math.min(Number(toArg ?? from), doc.numPages);
console.log(`# ${path} (${doc.numPages} pages) — p${from}..p${to}\n`);

for (let n = from; n <= to; n += 1) {
  const page = await doc.getPage(n);
  const content = await page.getTextContent();
  let out = '';
  let lastY = null;
  for (const item of content.items) {
    if (item.str === undefined) continue;
    const y = item.transform?.[5];
    if (lastY !== null && y !== undefined && Math.abs(y - lastY) > 2) out += '\n';
    out += item.str;
    if (item.hasEOL) out += '\n';
    lastY = y ?? lastY;
  }
  console.log(`--- p${n} ---`);
  console.log(out.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim());
  console.log('');
}
