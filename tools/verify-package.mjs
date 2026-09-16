/**
 * 生成済み dist/<skill-name>/skill.zip を検証する。src/ ではなく配布物そのものを対象にする。
 *   node tools/verify-package.mjs                 … 全 Skill
 *   node tools/verify-package.mjs --skill=<name>  … 指定 Skill だけ
 *
 * 検査内容
 *   - ZIP 内の全ファイルが <skill-name>/ 配下にある
 *   - 開発用ファイル (tools / docs / plans / node_modules) が混入していない
 *   - 必須ファイルが揃っている
 *   - SKILL.md の frontmatter が読め、name がディレクトリ名と一致する
 *   - ZIP 内 PDF の SHA256 が ZIP 内 Manifest の記載と一致する
 *   - Manifest が Bundled: NO と宣言した PDF が混入していない
 *   - Markdown からの内部参照が ZIP 内で解決する
 *   - 合計サイズが 25MB 以内
 */
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import JSZip from 'jszip';
import { DIST, resolveTargets, fmtBytes, parseFrontmatter, parseManifest, Report } from './lib.mjs';

const SIZE_LIMIT = 25 * 1024 * 1024;
const REQUIRED = ['SKILL.md', 'agents/openai.yaml'];
const FORBIDDEN = /(^|\/)(node_modules|tools|docs|plans|dist)\//;
const BACKSLASH = String.fromCharCode(92);

const r = new Report();
const targets = resolveTargets();
if (!targets.length) r.error('検証対象の Skill がありません');

for (const skill of targets) {
  r.scope(targets.length > 1 ? skill : '');
  const zipPath = join(DIST, skill, 'skill.zip');
  if (!existsSync(zipPath)) {
    r.error(`dist/${skill}/skill.zip がありません。先に npm run build を実行してください`);
    continue;
  }
  await verifyZip(skill, zipPath, r);
}
r.scope();

console.log(`\nverify-package — ${targets.join(', ') || 'なし'}`);
process.exit(r.print() ? 0 : 1);

async function verifyZip(skill, zipPath, r) {
  const zip = await JSZip.loadAsync(readFileSync(zipPath));
  const entries = Object.values(zip.files).filter((f) => !f.dir);

  /** skill root からの相対パス -> Buffer */
  const contents = new Map();
  for (const entry of entries) {
    if (!entry.name.startsWith(`${skill}/`)) {
      r.error(`トップレベルが ${skill}/ でない: ${entry.name}`);
      continue;
    }
    if (FORBIDDEN.test(entry.name)) r.error(`開発用ファイルが混入: ${entry.name}`);
    contents.set(entry.name.slice(skill.length + 1), await entry.async('nodebuffer'));
  }

  for (const p of REQUIRED) if (!contents.has(p)) r.error(`必須ファイルが無い: ${p}`);

  // --- SKILL.md -----------------------------------------------------------
  if (contents.has('SKILL.md')) {
    const { ok, fields } = parseFrontmatter(contents.get('SKILL.md').toString('utf8'));
    if (!ok) r.error('SKILL.md の frontmatter を解釈できない');
    else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fields.name ?? ''))
      r.error(`name が不正: ${fields.name}`);
    else if (fields.name !== skill)
      r.error(`name (${fields.name}) が ZIP のトップレベル (${skill}) と一致しない`);
    else r.info(`name=${fields.name}`);
  }

  // --- Manifest 照合 ------------------------------------------------------
  if (contents.has('references/REFERENCE-MANIFEST.md')) {
    const entriesM = parseManifest(contents.get('references/REFERENCE-MANIFEST.md').toString('utf8'));
    const declared = new Set();
    for (const { id, fields } of entriesM) {
      const local = (fields['Local Path'] ?? '').split(BACKSLASH).join('/');
      const bundled = /^yes$/i.test(fields.Bundled ?? '');
      if (!bundled) {
        if (contents.has(local)) r.error(`${id}: Bundled=NO だが ZIP に含まれている: ${local}`);
        if (!/^(yes|no|unknown|unknown-restricted)$/i.test(fields['Redistribution Allowed'] ?? ''))
          r.error(`${id}: Redistribution Allowed が不正: ${fields['Redistribution Allowed']}`);
        continue;
      }
      declared.add(local);
      if (!contents.has(local)) { r.error(`${id}: ZIP に実体が無い: ${local}`); continue; }
      const actual = createHash('sha256').update(contents.get(local)).digest('hex');
      if ((fields.SHA256 ?? '').toLowerCase() !== actual)
        r.error(`${id}: ZIP 内 PDF の SHA256 不一致\n          期待 ${fields.SHA256}\n          実際 ${actual}`);
    }
    for (const p of [...contents.keys()].filter((n) => n.endsWith('.pdf')))
      if (!declared.has(p)) r.error(`Manifest 未登録の PDF が ZIP に含まれている: ${p}`);
    r.info(`Manifest ${entriesM.length} エントリ / ZIP 内 PDF ${declared.size} 件を照合`);
  } else if ([...contents.keys()].some((n) => n.endsWith('.pdf'))) {
    r.error('ZIP に PDF があるが Manifest が無い');
  }

  // --- 内部参照 ------------------------------------------------------------
  {
    let checked = 0;
    for (const [name, buf] of contents) {
      if (!name.endsWith('.md')) continue;
      const t = buf.toString('utf8');
      const refs = [
        ...t.matchAll(/`([^`\s]+)`/g),
        ...t.matchAll(/\]\(([^)\s]+)\)/g),
        ...t.matchAll(/^\s*-\s*(?:Local Path|Method Card):\s*(\S+)\s*$/gim),
      ].map((m) => m[1]);
      for (const raw of refs) {
        const rel = raw.split(BACKSLASH).join('/').replace(/^\.\//, '');
        if (!/^(references|agents|assets)\//.test(rel)) continue;
        checked += 1;
        // 末尾が / のものはディレクトリ参照。配下にファイルが 1 つ以上あればよい
        const ok = rel.endsWith('/')
          ? [...contents.keys()].some((n) => n.startsWith(rel))
          : contents.has(rel);
        if (!ok) r.error(`ZIP 内の参照切れ: ${name} -> ${rel}`);
      }
    }
    r.info(`ZIP 内の内部参照 ${checked} 件を検査`);
  }

  // --- サイズ --------------------------------------------------------------
  const raw = [...contents.values()].reduce((n, b) => n + b.length, 0);
  if (raw > SIZE_LIMIT) r.error(`展開時サイズが 25MB 超: ${fmtBytes(raw)}`);
  r.info(`${contents.size} ファイル / 展開時 ${fmtBytes(raw)} / ZIP ${fmtBytes(readFileSync(zipPath).length)}`);
}
