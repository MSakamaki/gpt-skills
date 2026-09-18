import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative, sep, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));
/** Skill 群の置き場。src/<skill-name>/SKILL.md が 1 つの Skill を成す。 */
export const SRC = join(ROOT, 'src');
export const DIST = join(ROOT, 'dist');

/** src/ 直下で SKILL.md を持つディレクトリを Skill として列挙する。 */
export function listSkills() {
  if (!existsSync(SRC)) return [];
  return readdirSync(SRC)
    .filter((name) => statSync(join(SRC, name)).isDirectory())
    .filter((name) => existsSync(join(SRC, name, 'SKILL.md')))
    .sort();
}

export const skillDir = (name) => join(SRC, name);

/**
 * コマンドライン引数から対象 Skill を決める。
 *   --skill=<name> … その Skill だけ
 *   指定なし        … すべての Skill
 */
export function resolveTargets(argv = process.argv) {
  const all = listSkills();
  const arg = argv.find((a) => a.startsWith('--skill='));
  if (!arg) return all;
  const name = arg.slice('--skill='.length);
  if (!all.includes(name)) {
    console.error(`Skill が見つかりません: ${name}`);
    console.error(`利用可能: ${all.join(', ') || '(なし)'}`);
    process.exit(1);
  }
  return [name];
}

/** dir 以下の全ファイルを base 相対の posix パスで返す。 */
export function walk(dir, base = dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir).sort()) {
    const abs = join(dir, name);
    const st = statSync(abs);
    if (st.isDirectory()) out.push(...walk(abs, base));
    else out.push(relative(base, abs).split(sep).join(posix.sep));
  }
  return out;
}

export const sha256 = (abs) => createHash('sha256').update(readFileSync(abs)).digest('hex');

export const fmtBytes = (n) =>
  n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(2)}MB` : `${(n / 1024).toFixed(1)}KB`;

/** 前後のクォートだけを外す (YAML の引用スカラー)。 */
const unquote = (v) => {
  const m = /^(['"])([\s\S]*)\1$/.exec(v);
  return m ? m[2] : v;
};

/**
 * SKILL.md の YAML frontmatter を最小限だけ解釈する (name / description)。
 *
 * ブロックスカラー (`description: >-` の次行以降へ本文を書く形式) に対応する。
 * これを扱えないと description の中身を検査できず、長さだけを見ても意味がない。
 */
export function parseFrontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(text);
  if (!m) return { ok: false, fields: {}, body: text };
  const fields = {};
  const lines = m[1].split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(lines[i]);
    if (!kv) continue;
    const key = kv[1];
    const raw = kv[2].trim();
    // `|` `|-` `>` `>-` などのブロックスカラー。以降のインデント行が値になる。
    const block = /^([|>])[+-]?\d*$/.exec(raw);
    if (!block) {
      fields[key] = unquote(raw);
      continue;
    }
    const buf = [];
    while (i + 1 < lines.length) {
      const next = lines[i + 1];
      if (next.trim() !== '' && !/^\s/.test(next)) break; // インデントが戻ったらブロック終了
      buf.push(next.trim());
      i += 1;
    }
    // 折りたたみ (>) は改行を空白へ畳む。リテラル (|) は改行を保つ。
    fields[key] =
      block[1] === '>' ? buf.join(' ').replace(/\s+/g, ' ').trim() : buf.join('\n').trim();
  }
  return { ok: true, fields, body: text.slice(m[0].length) };
}

/**
 * REFERENCE-MANIFEST.md を解釈する。
 * `## <ENTRY-ID>` 見出しごとに `- Key: Value` 行を集める。
 */
export function parseManifest(text) {
  const entries = [];
  const sections = text.split(/^##\s+/m).slice(1);
  for (const sec of sections) {
    const [head, ...rest] = sec.split(/\r?\n/);
    const id = head.trim();
    if (!id || id.startsWith('#')) continue;
    const fields = {};
    for (const line of rest) {
      const kv = /^-\s+([^:]+):\s*(.*)$/.exec(line.trim());
      if (kv) fields[kv[1].trim()] = kv[2].trim();
    }
    if (Object.keys(fields).length) entries.push({ id, fields });
  }
  return entries;
}

/**
 * references/REGISTRY.md (Context Registry) を解釈する。Context を持つ Skill (slide-studio など) が置く。
 *   contexts : [{ name, type, stage, requires, produces, next, rollback }]  各配列の要素は token
 *   externals: 外部入力 (ユーザー提供) の Artifact 名
 *   derived  : 派生 Artifact (別途生成しない) の名前
 *   specials : `<token>` 形式の特別な遷移先
 * token は { raw, name, special }。name は末尾の `?` `@S` `@*` を外した Artifact / Context 名。
 * 表のセル内の `\|` は「いずれか」の区切りで、セル分割の前に保護する。
 */
export function parseRegistry(text) {
  const PIPE = String.fromCharCode(1);
  const ESCAPED_PIPE = String.fromCharCode(92) + '|';
  const out = { contexts: [], externals: new Set(), derived: new Set(), specials: new Set() };
  let h2 = '';
  let header = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith('## ')) { h2 = line.slice(3).trim(); header = null; continue; }
    if (line.startsWith('### ') || !line.startsWith('|')) { header = null; continue; }
    const cells = line.split(ESCAPED_PIPE).join(PIPE).split('|').slice(1, -1)
      .map((c) => c.trim().split(PIPE).join('|'));
    if (cells.every((c) => /^:?-{3,}:?$/.test(c))) continue; // 区切り行
    if (!header) { header = cells.map((c) => c.toLowerCase()); continue; }
    const row = Object.fromEntries(header.map((k, i) => [k, cells[i] ?? '']));
    const first = tokens(cells[0]);
    if (header[0] === 'context' && /Context 一覧/.test(h2)) {
      out.contexts.push({
        name: first[0]?.name ?? cells[0],
        type: row.type,
        stage: row.stage,
        requires: tokens(row.requires),
        produces: tokens(row.produces),
        next: tokens(row.next),
        rollback: tokens(row.rollback_candidates),
      });
    } else if (header[0] === 'artifact' && /外部入力/.test(h2)) {
      for (const t of first) out.externals.add(t.name);
    } else if (header[0] === 'artifact' && /派生/.test(h2)) {
      for (const t of first) out.derived.add(t.name);
    } else if (header[0] === 'token' && /特別な遷移先/.test(h2)) {
      for (const t of first) out.specials.add(t.raw);
    }
  }
  return out;

  function tokens(cell) {
    if (!cell) return [];
    const c = cell.trim();
    if (c === '-' || c.startsWith('(')) return [];
    const list = [];
    for (const m of c.matchAll(/`([^`]+)`/g)) {
      const raw = m[1].trim();
      const special = raw.startsWith('<');
      const name = special ? raw : raw.replace(/\?$/, '').replace(/@(S|\*)$/, '');
      list.push({ raw, name, special });
    }
    return list;
  }
}

/**
 * Context Registry と配布物の整合を検査する。validate (src) と verify-package (ZIP) で同じ規則を使う。
 *   files: Skill ルート相対のファイル一覧 / read(path): その内容
 * 検査するのは Registry が閉じていること (遷移先・Artifact が解決する)、Designer と Reviewer が対になっていること (I-04)、
 * Registry の行と references/contexts/ のファイルが 1 対 1 で対応することまで。Context 本文の妥当性は見ない。
 */
export function checkRegistry(reg, files, read, r) {
  const TYPES = new Set(['navigator', 'specialist', 'reviewer', 'validator']);
  const byName = new Map(reg.contexts.map((c) => [c.name, c]));
  const produced = new Set();
  const consumed = new Set();
  for (const c of reg.contexts) {
    for (const t of c.produces) produced.add(t.name);
    for (const t of c.requires) consumed.add(t.name);
  }
  if (!reg.contexts.length) r.error('REGISTRY.md から Context を解釈できない');

  const seen = new Set();
  for (const c of reg.contexts) {
    if (seen.has(c.name)) r.error(`Registry: Context が重複: ${c.name}`);
    seen.add(c.name);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(c.name)) r.error(`Registry: Context 名が kebab-case でない: ${c.name}`);
    if (!TYPES.has(c.type)) r.error(`Registry ${c.name}: type が不正: ${c.type}`);

    const file = `references/contexts/${c.stage}/${c.name}.md`;
    if (!files.includes(file)) r.error(`Registry ${c.name}: Context ファイルが無い: ${file}`);
    else {
      const t = read(file);
      const h1 = /^#\s+(.+)$/m.exec(t)?.[1]?.trim();
      if (h1 !== c.name) r.error(`${file}: 見出し (${h1}) が Context 名と一致しない`);
      const kind = /種別[：:]\s*([a-z]+)/.exec(t)?.[1];
      if (kind !== c.type) r.error(`${file}: 種別 (${kind}) が Registry の type (${c.type}) と一致しない`);
    }

    for (const t of c.requires) {
      if (t.special) { r.error(`Registry ${c.name}: requires に特別トークンは置けない: ${t.raw}`); continue; }
      if (!produced.has(t.name) && !reg.externals.has(t.name) && !reg.derived.has(t.name))
        r.error(`Registry ${c.name}: requires の ${t.name} をどの Context も生成せず、外部入力・派生にも無い`);
    }
    for (const t of [...c.next, ...c.rollback]) {
      if (t.special) {
        if (!reg.specials.has(t.raw)) r.error(`Registry ${c.name}: 未定義の特別トークン: ${t.raw}`);
      } else if (!byName.has(t.name)) r.error(`Registry ${c.name}: 遷移先が Registry に無い: ${t.name}`);
    }

    if (c.type === 'reviewer') {
      if (!(c.produces.length === 1 && c.produces[0].name === 'review_result'))
        r.error(`Registry ${c.name}: reviewer の produces は review_result にする`);
      const target = c.name.replace(/-reviewer$/, '');
      const d = byName.get(target);
      if (!d) r.error(`Registry ${c.name}: 対応する Designer (${target}) が無い`);
      else {
        for (const p of d.produces)
          if (!c.requires.some((t) => t.name === p.name))
            r.error(`Registry ${c.name}: Designer の成果物 ${p.name} を requires に含めていない (I-04)`);
        if (!c.rollback.some((t) => t.name === target))
          r.error(`Registry ${c.name}: rollback_candidates に ${target} が無い (I-05)`);
      }
    } else if (c.type === 'specialist') {
      const rev = byName.get(`${c.name}-reviewer`);
      if (!rev) r.error(`Registry ${c.name}: Reviewer (${c.name}-reviewer) が無い (I-04)`);
      else if (!c.next.some((t) => t.name === rev.name))
        r.error(`Registry ${c.name}: next が自分の Reviewer でない (I-04)`);
      for (const p of c.produces)
        if (!consumed.has(p.name)) r.error(`Registry ${c.name}: 生成する ${p.name} をどの Context も requires しない`);
    }
  }

  for (const p of files.filter((f) => /^references\/contexts\/[^/]+\/[^/]+\.md$/.test(f))) {
    const [, , stage, base] = p.split('/');
    const c = byName.get(base.replace(/\.md$/, ''));
    if (!c) r.error(`Registry に無い Context ファイル: ${p}`);
    else if (c.stage !== stage) r.error(`${p}: ディレクトリ (${stage}) が Registry の stage (${c.stage}) と一致しない`);
  }

  const n = (type) => reg.contexts.filter((c) => c.type === type).length;
  r.info(
    `Context Registry ${reg.contexts.length} Context (specialist ${n('specialist')} / reviewer ${n('reviewer')} / ` +
    `validator ${n('validator')} / navigator ${n('navigator')}) / 外部入力 ${reg.externals.size} / 派生 ${reg.derived.size} / 特別遷移 ${reg.specials.size}`,
  );
}

export class Report {
  constructor() {
    this.errors = [];
    this.warns = [];
    this.infos = [];
    this.prefix = '';
  }
  /** 複数 Skill を 1 つの Report へ集約するとき、メッセージ頭に Skill 名を付ける。 */
  scope(name) { this.prefix = name ? `[${name}] ` : ''; return this; }
  error(msg) { this.errors.push(this.prefix + msg); }
  warn(msg) { this.warns.push(this.prefix + msg); }
  info(msg) { this.infos.push(this.prefix + msg); }
  print() {
    for (const m of this.infos) console.log(`  info  ${m}`);
    for (const m of this.warns) console.log(`  WARN  ${m}`);
    for (const m of this.errors) console.log(`  ERROR ${m}`);
    console.log(`\n${this.errors.length} error / ${this.warns.length} warn`);
    return this.errors.length === 0;
  }
}
