import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative, sep, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const SRC = join(ROOT, 'src');
export const DIST = join(ROOT, 'dist');
/** ZIP 内のトップレベルフォルダ名。既存 adversarial-answer.zip と同形式を保つ。 */
export const PACKAGE_PREFIX = 'adversarial-answer';

/** dir 以下の全ファイルを skill root 相対の posix パスで返す。 */
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

/** SKILL.md の YAML frontmatter を最小限だけ解釈する (name / description)。 */
export function parseFrontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(text);
  if (!m) return { ok: false, fields: {}, body: text };
  const fields = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (kv) fields[kv[1]] = kv[2].trim();
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
  constructor() { this.errors = []; this.warns = []; this.infos = []; }
  error(msg) { this.errors.push(msg); }
  warn(msg) { this.warns.push(msg); }
  info(msg) { this.infos.push(msg); }
  print() {
    for (const m of this.infos) console.log(`  info  ${m}`);
    for (const m of this.warns) console.log(`  WARN  ${m}`);
    for (const m of this.errors) console.log(`  ERROR ${m}`);
    console.log(`\n${this.errors.length} error / ${this.warns.length} warn`);
    return this.errors.length === 0;
  }
}
