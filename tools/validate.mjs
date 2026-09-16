/**
 * Skill 構造検証。src/ 直下の各 Skill を検査する。
 *   node tools/validate.mjs                        … 全 Skill。v2 成果物の欠落は WARN
 *   node tools/validate.mjs --require-v2           … v2 成果物の欠落を ERROR にする
 *   node tools/validate.mjs --skill=<name>         … 指定 Skill だけ
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { skillDir, resolveTargets, walk, sha256, fmtBytes, parseFrontmatter, parseManifest, Report } from './lib.mjs';

const REQUIRE_V2 = process.argv.includes('--require-v2');
const SIZE_LIMIT = 25 * 1024 * 1024;
const SIZE_WARN = 20 * 1024 * 1024;
const SKILL_MD_WARN = 40 * 1024;
const REQUIRED = ['SKILL.md', 'agents/openai.yaml'];
const V2_ARTIFACTS = [
  'references/METHOD-ROUTING.md',
  'references/REFERENCE-MANIFEST.md',
  'references/ROUTER-TEST-CASES.md',
];
const V2_METHOD_CARDS = 9;
const BACKSLASH = String.fromCharCode(92);

const r = new Report();
const targets = resolveTargets();
if (!targets.length) r.scope().error('src/ 直下に SKILL.md を持つディレクトリがありません');

for (const skill of targets) {
  r.scope(targets.length > 1 ? skill : '');
  validateSkill(skill, r);
}
r.scope();

console.log(`\nvalidate (${REQUIRE_V2 ? 'strict/v2' : 'lenient'}) — ${targets.join(', ') || 'なし'}`);
process.exit(r.print() ? 0 : 1);

function validateSkill(skill, r) {
  const root = skillDir(skill);
  const files = walk(root);
  const abs = (p) => join(root, p);
  const v2 = (msg) => (REQUIRE_V2 ? r.error(msg) : r.warn(msg));

  for (const p of REQUIRED) if (!files.includes(p)) r.error(`必須ファイルが無い: ${p}`);

  // --- SKILL.md -----------------------------------------------------------
  if (files.includes('SKILL.md')) {
    const text = readFileSync(abs('SKILL.md'), 'utf8');
    const { ok, fields } = parseFrontmatter(text);
    if (!ok) r.error('SKILL.md に YAML frontmatter が無い');
    else {
      if (!fields.name) r.error('SKILL.md frontmatter に name が無い');
      else {
        if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fields.name))
          r.error(`SKILL.md の name が lowercase kebab-case でない: ${fields.name}`);
        if (fields.name !== skill)
          r.error(`SKILL.md の name (${fields.name}) がディレクトリ名 (${skill}) と一致しない`);
      }
      if (!fields.description) r.error('SKILL.md frontmatter に description が無い');
      else {
        if (fields.description.length > 1024)
          r.warn(`description が長い (${fields.description.length} 文字)`);
        r.info(`name=${fields.name} / description=${fields.description.length} 文字`);
      }
    }
    const size = Buffer.byteLength(text);
    if (size > SKILL_MD_WARN) r.warn(`SKILL.md が肥大化 (${fmtBytes(size)}) — references/ への委譲を検討`);
    else r.info(`SKILL.md ${fmtBytes(size)}`);
  }

  // --- 参照リンク切れ検査 --------------------------------------------------
  {
    const seen = new Set();
    let checked = 0;
    for (const doc of files.filter((p) => p.endsWith('.md'))) {
      const t = readFileSync(abs(doc), 'utf8');
      const targetsInDoc = [
        ...t.matchAll(/`([^`\s]+)`/g),
        ...t.matchAll(/\]\(([^)\s]+)\)/g),
        ...t.matchAll(/^\s*(?:-\s*)?(?:Local Path|Method Card|Evidence File):\s*(\S+)\s*$/gim),
      ].map((m) => m[1]);
      for (const raw of targetsInDoc) {
        const rel = raw.split(BACKSLASH).join('/').replace(/^\.\//, '');
        if (!/^(references|agents|assets)\//.test(rel)) continue;
        const key = `${doc}::${rel}`;
        if (seen.has(key)) continue;
        seen.add(key);
        checked += 1;
        if (!existsSync(abs(rel))) r.error(`参照切れ: ${doc} -> ${rel}`);
      }
    }
    r.info(`内部参照 ${checked} 件を検査`);
  }

  // --- agents/openai.yaml -------------------------------------------------
  if (files.includes('agents/openai.yaml')) {
    const y = readFileSync(abs('agents/openai.yaml'), 'utf8');
    for (const m of y.matchAll(/icon_\w+:\s*(\S+)/g))
      if (!existsSync(abs(m[1]))) r.error(`agents/openai.yaml の icon が存在しない: ${m[1]}`);
    if (!/display_name:/.test(y)) r.error('agents/openai.yaml に display_name が無い');
  }

  // --- v2 成果物 (adversarial-answer 固有) ---------------------------------
  // references/methods/ を持つ Skill だけ v2 の完全性を要求する。
  const hasMethods = files.some((p) => p.startsWith('references/methods/'));
  const declaresV2 = hasMethods || files.includes('references/METHOD-ROUTING.md');
  if (declaresV2) {
    for (const p of V2_ARTIFACTS) if (!files.includes(p)) v2(`v2 成果物が無い: ${p}`);
    const cards = files.filter((p) => /^references\/methods\/METHOD-.+\.md$/.test(p));
    if (cards.length < V2_METHOD_CARDS)
      v2(`Method Card が ${cards.length} 件 (期待 ${V2_METHOD_CARDS} 件以上)`);
    else r.info(`Method Card ${cards.length} 件`);
  }

  // --- Manifest 整合性 ----------------------------------------------------
  const manifestPath = 'references/REFERENCE-MANIFEST.md';
  if (files.includes(manifestPath)) {
    const entries = parseManifest(readFileSync(abs(manifestPath), 'utf8'));
    if (!entries.length) r.error('REFERENCE-MANIFEST.md からエントリを解釈できない');
    const declared = new Set();
    for (const { id, fields } of entries) {
      for (const k of ['Title', 'License', 'Redistribution Allowed', 'Bundled', 'Local Path'])
        if (!fields[k]) r.error(`Manifest ${id}: ${k} が無い`);
      const bundled = /^yes$/i.test(fields.Bundled ?? '');
      const local = (fields['Local Path'] ?? '').split(BACKSLASH).join('/');
      if (!bundled) {
        if (local !== '-' && existsSync(abs(local)))
          r.error(`Manifest ${id}: Bundled=NO だが実体がある: ${local}`);
        continue;
      }
      declared.add(local);
      if (!existsSync(abs(local))) {
        r.error(`Manifest ${id}: Local Path が存在しない: ${local}`);
        continue;
      }
      const actual = sha256(abs(local));
      if ((fields.SHA256 ?? '').toLowerCase() !== actual)
        r.error(`Manifest ${id}: SHA256 不一致\n          期待 ${fields.SHA256}\n          実際 ${actual}`);
      const declaredSize = Number((fields['File Size'] ?? '').replace(/[^0-9]/g, ''));
      const actualSize = statSync(abs(local)).size;
      if (declaredSize && declaredSize !== actualSize)
        r.error(`Manifest ${id}: File Size 不一致 (期待 ${declaredSize} / 実際 ${actualSize})`);
    }
    for (const p of files.filter((f) => f.endsWith('.pdf')))
      if (!declared.has(p)) r.error(`Manifest に未登録の PDF: ${p}`);
    r.info(`Manifest ${entries.length} エントリ / 同梱 ${declared.size} 件`);
  } else if (files.some((f) => f.endsWith('.pdf'))) {
    r.error('PDF があるが references/REFERENCE-MANIFEST.md が無い');
  }

  // --- サイズ --------------------------------------------------------------
  const total = files.reduce((n, p) => n + statSync(abs(p)).size, 0);
  if (total > SIZE_LIMIT) r.error(`合計サイズが 25MB 超: ${fmtBytes(total)}`);
  else if (total > SIZE_WARN) r.warn(`合計サイズが 20MB 超: ${fmtBytes(total)}`);
  r.info(`${files.length} ファイル / 合計 ${fmtBytes(total)}`);
}
