/**
 * docs/spec/ の spec 間契約を照合する。
 *   node tools/check-spec-contracts.mjs
 *
 * ある spec の一部を別の spec が継承・参照するとき、継承元が変わったことに
 * 依存側が気づけないと、世代が離れたまま両者が食い違う。これを機械的に検出する。
 * 考え方は references/REFERENCE-MANIFEST.md の SHA256 照合と同じで、
 * 対象が PDF ではなく spec の一部という違いしかない。
 *
 * 継承元は、契約とする範囲を HTML コメントで囲む。
 *   <!-- contract: CLARIFY-CONTRACT v1 begin -->
 *   ... 契約本文 ...
 *   <!-- contract: CLARIFY-CONTRACT v1 end -->
 *
 * 依存側は、次の見出しの直後に表で宣言する。表の列順は固定。
 *   ## 契約依存
 *   | 契約 | 版 | 継承元 | 関係 | SHA256 |
 *   |---|---|---|---|---|
 *   | CLARIFY-CONTRACT | v1 | guided-clarification.md §6〜§12 | 継承 | `<64桁>` |
 *
 * 不一致は ERROR。復旧は「継承元の変更を読み、自分の spec がまだ成立するかを
 * 確認してから、出力された実際のハッシュを宣言へ書き写す」。
 * 自動更新は用意しない。確認せずに通す手段を作らないため。
 */
import { readdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { ROOT, Report } from './lib.mjs';

const SPEC_DIR = join(ROOT, 'docs', 'spec');
const DEF_RE = /<!--\s*contract:\s*([A-Z][A-Z0-9-]*)\s+v(\d+)\s+begin\s*-->([\s\S]*?)<!--\s*contract:\s*\1\s+v\2\s+end\s*-->/g;
const TABLE_HEAD = /^\|\s*契約\s*\|\s*版\s*\|\s*継承元\s*\|\s*関係\s*\|\s*SHA256\s*\|\s*$/;
const RELATIONS = new Set(['継承', '参照']);

const r = new Report();
const files = readdirSync(SPEC_DIR).filter((f) => f.endsWith('.md')).sort();

/** 契約名 -> { file, version, sha256 } */
const defs = new Map();
for (const f of files) {
  const text = readFileSync(join(SPEC_DIR, f), 'utf8');
  for (const m of text.matchAll(DEF_RE)) {
    const [, name, version, body] = m;
    if (defs.has(name)) {
      r.error(`契約 ${name} が複数の spec で定義されている: ${defs.get(name).file} と ${f}`);
      continue;
    }
    // 改行コードの差で結果が変わらないよう LF へ揃えてからハッシュする
    const normalized = body.split('\r\n').join('\n').trim();
    if (!normalized) {
      r.error(`${f}: 契約 ${name} v${version} の本文が空`);
      continue;
    }
    defs.set(name, {
      file: f,
      version: Number(version),
      sha256: createHash('sha256').update(normalized, 'utf8').digest('hex'),
      bytes: Buffer.byteLength(normalized),
      refs: [],
    });
  }
}

let declared = 0;
for (const f of files) {
  for (const row of parseDeclarations(readFileSync(join(SPEC_DIR, f), 'utf8'))) {
    declared += 1;
    const where = `${f}: ${row.name} ${row.versionRaw}`;
    const def = defs.get(row.name);
    if (!def) {
      r.error(`${where}: そのような契約を定義している spec が無い`);
      continue;
    }
    if (def.file === f) {
      r.error(`${where}: 自分自身が定義している契約を宣言している`);
      continue;
    }
    if (!RELATIONS.has(row.relation))
      r.error(`${where}: 関係は 継承 か 参照 にする (現在: ${row.relation || '空'})`);
    if (!row.source.includes(def.file))
      r.error(`${where}: 継承元の欄が実際の定義元 (${def.file}) を指していない: ${row.source}`);
    def.refs.push(f);

    if (row.version !== def.version) {
      r.error(
        `${where}: 契約の版が違う (宣言 v${row.version} / 定義 v${def.version} in ${def.file})\n` +
        `          継承元の変更を読み、この spec がまだ成立するかを確認してから版とハッシュを更新する`,
      );
      continue;
    }
    if (row.sha256 !== def.sha256) {
      r.error(
        `${where}: 継承元が変更されている\n` +
        `          宣言 ${row.sha256}\n` +
        `          実際 ${def.sha256}\n` +
        `          ${def.file} の契約範囲を読み、この spec がまだ成立するかを確認してから宣言を書き換える`,
      );
    }
  }
}

for (const [name, def] of defs) {
  if (!def.refs.length) r.warn(`契約 ${name} v${def.version} (${def.file}) を宣言する spec が無い`);
  else r.info(`${name} v${def.version} ${def.file} (${def.bytes}B) <- ${def.refs.join(', ')}`);
}
if (!defs.size && !declared) r.info('契約の定義も宣言も無い');

console.log(`\ncheck-spec-contracts — 定義 ${defs.size} / 宣言 ${declared}`);
process.exit(r.print() ? 0 : 1);

/** 「## 契約依存」見出しの直後にある固定列の表を読む。 */
function parseDeclarations(text) {
  const out = [];
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    if (!/^##+\s+契約依存\s*$/.test(lines[i].trim())) continue;
    let j = i + 1;
    while (j < lines.length && !lines[j].trim().startsWith('|')) {
      if (/^##+\s/.test(lines[j])) break;
      j += 1;
    }
    if (j >= lines.length || !TABLE_HEAD.test(lines[j].trim())) {
      out.push({ name: '(表が無い)', relation: '', source: '', versionRaw: '', version: -1, sha256: '' });
      continue;
    }
    for (let k = j + 2; k < lines.length; k += 1) {
      const line = lines[k].trim();
      if (!line.startsWith('|')) break;
      const c = line.split('|').slice(1, -1).map((s) => s.trim());
      if (c.length < 5) continue;
      const versionRaw = c[1];
      out.push({
        name: c[0].replace(/`/g, ''),
        versionRaw,
        version: Number(/^v(\d+)$/.exec(versionRaw)?.[1] ?? NaN),
        source: c[2],
        relation: c[3],
        sha256: c[4].replace(/`/g, '').toLowerCase(),
      });
    }
  }
  return out;
}
