/**
 * REFERENCE-MANIFEST.md へ記載する SHA256 / File Size を出力する。
 *   node tools/hash.mjs src/references/papers/core/foo.pdf ...
 *   node tools/hash.mjs            … src/ 配下の PDF をすべて出力
 */
import { statSync } from 'node:fs';
import { join, relative, sep, posix } from 'node:path';
import { SRC, walk, sha256 } from './lib.mjs';

const args = process.argv.slice(2);
const targets = args.length
  ? args.map((p) => join(process.cwd(), p))
  : walk(SRC)
      .filter((p) => p.endsWith('.pdf'))
      .map((p) => join(SRC, p));

for (const abs of targets) {
  const rel = relative(SRC, abs).split(sep).join(posix.sep);
  console.log(`${rel}`);
  console.log(`  SHA256: ${sha256(abs)}`);
  console.log(`  File Size: ${statSync(abs).size}`);
}
