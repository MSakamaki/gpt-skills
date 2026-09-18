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
