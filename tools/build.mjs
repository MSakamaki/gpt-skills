/**
 * src/ を dist/skill.zip へパッケージする。
 *   node tools/build.mjs              … 検証は lenient
 *   node tools/build.mjs --require-v2 … v2 成果物の欠落で失敗させる
 *
 * ZIP はトップレベルに adversarial-answer/ を持つ形式 (v1 の配布物と同形式)。
 * 再現性のため mtime を固定する。
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import JSZip from 'jszip';
import { ROOT, SRC, DIST, PACKAGE_PREFIX, walk, sha256, fmtBytes } from './lib.mjs';

const FIXED_DATE = new Date('2026-01-01T00:00:00Z');

const validateArgs = [join(ROOT, 'tools', 'validate.mjs')];
if (process.argv.includes('--require-v2')) validateArgs.push('--require-v2');
const validation = spawnSync(process.execPath, validateArgs, { stdio: 'inherit' });
if (validation.status !== 0) {
  console.error('\nbuild 中止: validate が失敗しました');
  process.exit(validation.status ?? 1);
}

const files = walk(SRC);
if (!files.length) {
  console.error('build 中止: src/ にファイルがありません');
  process.exit(1);
}

const zip = new JSZip();
for (const rel of files) {
  zip.file(`${PACKAGE_PREFIX}/${rel}`, readFileSync(join(SRC, rel)), { date: FIXED_DATE });
}

const buffer = await zip.generateAsync({
  type: 'nodebuffer',
  compression: 'DEFLATE',
  compressionOptions: { level: 9 },
  platform: 'UNIX',
});

mkdirSync(DIST, { recursive: true });
const out = join(DIST, 'skill.zip');
writeFileSync(out, buffer);

const raw = files.reduce((n, p) => n + statSync(join(SRC, p)).size, 0);
console.log(`\nbuild`);
console.log(`  ${files.length} ファイル / 展開時 ${fmtBytes(raw)}`);
console.log(`  dist/skill.zip ${fmtBytes(statSync(out).size)}`);
console.log(`  sha256 ${sha256(out)}`);
