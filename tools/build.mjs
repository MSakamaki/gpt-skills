/**
 * src/<skill-name>/ を dist/<skill-name>/skill.zip へパッケージする。
 *   node tools/build.mjs                    … 全 Skill
 *   node tools/build.mjs --skill=<name>     … 指定 Skill だけ
 *   node tools/build.mjs --require-v2       … v2 成果物の欠落で失敗させる
 *
 * ZIP はトップレベルに <skill-name>/ を持つ形式。
 * 再現性のため、ファイルとフォルダ双方のエントリ日時を固定する。
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import JSZip from 'jszip';
import { ROOT, DIST, skillDir, resolveTargets, walk, sha256, fmtBytes } from './lib.mjs';

const FIXED_DATE = new Date('2026-01-01T00:00:00Z');

const targets = resolveTargets();
if (!targets.length) {
  console.error('build 中止: src/ 直下に SKILL.md を持つディレクトリがありません');
  process.exit(1);
}

const validateArgs = [join(ROOT, 'tools', 'validate.mjs')];
for (const flag of ['--require-v2']) if (process.argv.includes(flag)) validateArgs.push(flag);
const skillArg = process.argv.find((a) => a.startsWith('--skill='));
if (skillArg) validateArgs.push(skillArg);

const validation = spawnSync(process.execPath, validateArgs, { stdio: 'inherit' });
if (validation.status !== 0) {
  console.error('\nbuild 中止: validate が失敗しました');
  process.exit(validation.status ?? 1);
}

console.log('\nbuild');
for (const skill of targets) {
  const root = skillDir(skill);
  const files = walk(root);
  if (!files.length) {
    console.error(`  ${skill}: ファイルがありません`);
    process.exit(1);
  }

  const zip = new JSZip();
  for (const rel of files) {
    zip.file(`${skill}/${rel}`, readFileSync(join(root, rel)), { date: FIXED_DATE });
  }
  // JSZip が暗黙に作るフォルダエントリには生成時刻が入るため、すべて固定日時へ揃える。
  // これをしないと同じ入力から実行のたびに別バイト列の ZIP ができる。
  for (const entry of Object.values(zip.files)) entry.date = FIXED_DATE;

  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
    platform: 'UNIX',
  });

  const outDir = join(DIST, skill);
  mkdirSync(outDir, { recursive: true });
  const out = join(outDir, 'skill.zip');
  writeFileSync(out, buffer);

  const raw = files.reduce((n, p) => n + statSync(join(root, p)).size, 0);
  console.log(`  ${skill}`);
  console.log(`    ${files.length} ファイル / 展開時 ${fmtBytes(raw)}`);
  console.log(`    dist/${skill}/skill.zip ${fmtBytes(statSync(out).size)}`);
  console.log(`    sha256 ${sha256(out)}`);
}
