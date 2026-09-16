/**
 * REFERENCE-MANIFEST.md へ記載する SHA256 / File Size を出力する。
 *   node tools/hash.mjs <path> ...          … 指定ファイル
 *   node tools/hash.mjs                     … 全 Skill 配下の PDF
 *   node tools/hash.mjs --skill=<name>      … 指定 Skill 配下の PDF
 *
 * パスは各 Skill のルート (src/<skill-name>/) からの相対で表示する。
 * Manifest の Local Path はこの表記を使う。
 */
import { statSync } from 'node:fs';
import { join, relative, resolve, sep, posix } from 'node:path';
import { skillDir, resolveTargets, walk, sha256 } from './lib.mjs';

const paths = process.argv.slice(2).filter((a) => !a.startsWith('--'));

/** @type {{label: string, abs: string}[]} */
const targets = [];

if (paths.length) {
  for (const p of paths) {
    const abs = resolve(process.cwd(), p);
    targets.push({ label: p.split(sep).join(posix.sep), abs });
  }
} else {
  for (const skill of resolveTargets()) {
    const root = skillDir(skill);
    for (const rel of walk(root).filter((f) => f.endsWith('.pdf')))
      targets.push({ label: `${skill}: ${rel}`, abs: join(root, rel) });
  }
}

for (const { label, abs } of targets) {
  console.log(label);
  console.log(`  SHA256: ${sha256(abs)}`);
  console.log(`  File Size: ${statSync(abs).size}`);
}

if (!targets.length) console.log('対象ファイルがありません');
