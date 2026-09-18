/**
 * リリース前の一括チェック。scan-secrets → spec-contracts → build (strict) → verify-package を順に実行する。
 *   node tools/check.mjs
 *   node tools/check.mjs --skill=<name>
 *
 * 引数はそのまま build / verify へ渡す。npm script 経由でも引数が確実に届くよう、
 * シェルの && ではなくこのスクリプトで連結している。
 * scan-secrets と spec-contracts は Skill 単位ではなくリポジトリ全体が対象なので、引数を渡さない。
 */
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { ROOT } from './lib.mjs';

const passthrough = process.argv.slice(2);

const steps = [
  { name: 'scan-secrets', args: [join(ROOT, 'tools', 'scan-secrets.mjs')] },
  { name: 'spec-contracts', args: [join(ROOT, 'tools', 'check-spec-contracts.mjs')] },
  { name: 'build', args: [join(ROOT, 'tools', 'build.mjs'), '--require-v2', ...passthrough] },
  { name: 'verify', args: [join(ROOT, 'tools', 'verify-package.mjs'), ...passthrough] },
];

for (const step of steps) {
  const res = spawnSync(process.execPath, step.args, { stdio: 'inherit' });
  if (res.status !== 0) {
    console.error(`\ncheck 中止: ${step.name} が失敗しました`);
    process.exit(res.status ?? 1);
  }
}

console.log('\ncheck OK');
