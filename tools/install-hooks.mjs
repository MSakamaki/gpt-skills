/**
 * git フックを有効にする。`core.hooksPath` を `.githooks` へ向けるだけ。
 *   node tools/install-hooks.mjs
 *
 * package.json の `prepare` から呼ばれるため、`npm install` で自動的に有効になる。
 * git リポジトリでない場合や git が無い場合は、何もせず正常終了する
 * (`npm install` 自体を失敗させないため)。
 */
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib.mjs';

const HOOKS_DIR = '.githooks';

const inside = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], {
  cwd: ROOT,
  encoding: 'utf8',
});
if (inside.status !== 0) {
  console.log('install-hooks: git リポジトリではないためスキップしました');
  process.exit(0);
}

const res = spawnSync('git', ['config', 'core.hooksPath', HOOKS_DIR], { cwd: ROOT, encoding: 'utf8' });
if (res.status !== 0) {
  console.error(`install-hooks: core.hooksPath の設定に失敗しました${res.stderr ? `: ${res.stderr.trim()}` : ''}`);
  process.exit(0);
}

// Windows では不要だが、WSL や CI で実行権限が要る場合に備える。
const hook = join(ROOT, HOOKS_DIR, 'pre-commit');
if (existsSync(hook)) {
  try {
    chmodSync(hook, 0o755);
  } catch {
    /* 実行権限を変えられない環境では無視してよい */
  }
}

console.log(`install-hooks: core.hooksPath = ${HOOKS_DIR} (pre-commit で秘密情報スキャンが走ります)`);
