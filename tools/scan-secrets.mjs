/**
 * 秘密情報スキャン。git に入る前のファイルを検査する。
 *   node tools/scan-secrets.mjs              … 追跡中 + 未追跡 (ignore 対象外) の全ファイル
 *   node tools/scan-secrets.mjs --staged     … ステージ済みの内容だけ (pre-commit フック用)
 *   node tools/scan-secrets.mjs --selftest   … ルールが実際に発火するかの自己テスト
 *
 * 検出対象は 3 種類。
 *   1. トークン・鍵の形をした文字列 (AWS / GitHub / OpenAI / Slack / 秘密鍵 / JWT など)
 *   2. 個人を特定する情報 (メールアドレス、ユーザーのホームディレクトリパス)
 *   3. `.secrets-denylist` に書いた組織固有の語 (会社名・ドメイン・プロジェクト名など)
 *
 * 会社名やドメインそのものを本リポジトリへ書くと、それ自体が漏洩になる。
 * そのため組織固有の語は git 管理外の `.secrets-denylist` に置く。
 * 書き方は `.secrets-denylist.example` を参照。
 *
 * 検出内容は必ずマスクして出力する。スキャン結果のログから秘密が漏れないようにするため。
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib.mjs';

const STAGED = process.argv.includes('--staged');
const SELFTEST = process.argv.includes('--selftest');
const MAX_BYTES = 5 * 1024 * 1024;
const BINARY_EXT = /\.(pdf|zip|png|jpe?g|gif|ico|webp|woff2?|ttf|otf|eot|node|dat|exe|dll|so|dylib|mp4|mp3|wasm)$/i;
const ALLOW_MARKER = 'secrets-scan-allow';
const DENYLIST_FILE = '.secrets-denylist';

// プレースホルダとみなす値。実在の秘密ではないので検出しない。
const PLACEHOLDER =
  /^(?:x{3,}|\*{3,}|\.{3,}|-{3,}|_{3,}|0+|your[_-]?\w*|my[_-]?\w*|dummy\w*|sample\w*|example\w*|test\w*|placeholder|changeme|todo|none|null|undefined|true|false|secret|token|password|apikey|api[_-]key|string|redacted|xxxxx+)$/i;

const isPlaceholder = (v) =>
  !v ||
  PLACEHOLDER.test(v) ||
  /[^\x20-\x7e]/.test(v) || // 非 ASCII を含む値は説明文とみなす
  /^[<{[(]/.test(v) || // <YOUR_TOKEN> {{token}} など
  /[$%]\{|\$\(|%\w+%/.test(v) || // ${VAR} $(cmd) %VAR%
  /^process\.env|^os\.environ/.test(v); // 環境変数からの読み出し

/** ユーザー名の位置が実名ではなくプレースホルダかどうか。 */
const isGenericUser = (name) =>
  /^(?:<[^>]*>|%\w+%|\$\w+|\{+\w+\}+|username|user|youruser|yourname|you|me|name|runner|root|home|shared|public|default|all users)$/i.test(
    name.trim(),
  );

/** メールアドレスのうち、公開しても問題のないもの。 */
const ALLOWED_EMAIL =
  /@(?:example\.(?:com|org|net|jp)|test\.invalid|localhost|users\.noreply\.github\.com)$|^(?:noreply|no-reply|support|info)@(?:anthropic|openai|github|npmjs)\.com$/i;

const RULES = [
  // --- 1. トークン・鍵 -----------------------------------------------------
  {
    id: 'aws-access-key',
    desc: 'AWS アクセスキー ID',
    re: /(?<![A-Z0-9])(?:AKIA|ASIA|AIDA|AROA|AGPA|ANPA)[0-9A-Z]{16}(?![A-Z0-9])/g,
  },
  {
    id: 'github-token',
    desc: 'GitHub トークン',
    re: /\bgh[pousr]_[A-Za-z0-9]{30,}\b|\bgithub_pat_[A-Za-z0-9_]{50,}\b/g,
  },
  {
    id: 'anthropic-key',
    desc: 'Anthropic API キー',
    re: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/g,
  },
  {
    id: 'openai-key',
    desc: 'OpenAI API キー',
    re: /\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{32,}\b/g,
  },
  {
    id: 'slack-token',
    desc: 'Slack トークン / Webhook',
    re: /\bxox[abprse]-[A-Za-z0-9-]{10,}\b|https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9\/+]{20,}/g,
  },
  {
    id: 'google-api-key',
    desc: 'Google API キー',
    re: /\bAIza[0-9A-Za-z_-]{35}\b/g,
  },
  {
    id: 'stripe-key',
    desc: 'Stripe シークレットキー',
    re: /\b(?:sk|rk)_live_[0-9A-Za-z]{20,}\b/g,
  },
  {
    id: 'npm-token',
    desc: 'npm トークン',
    re: /\bnpm_[A-Za-z0-9]{30,}\b|\/\/[^\s:]+\/:_authToken=(?!\$\{)[^\s]+/g,
  },
  {
    id: 'azure-openai-endpoint-key',
    desc: 'Azure / OpenAI 互換サービスのキー指定',
    re: /\bapi-key\s*[:=]\s*["']?([A-Za-z0-9_-]{16,})["']?/gi,
    value: 1,
  },
  {
    id: 'private-key',
    desc: '秘密鍵ブロック',
    re: /-----BEGIN (?:RSA |DSA |EC |OPENSSH |PGP |ENCRYPTED )?PRIVATE KEY(?: BLOCK)?-----/g,
  },
  {
    id: 'jwt',
    desc: 'JWT (署名付きトークン)',
    re: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
  },
  {
    id: 'url-basic-auth',
    desc: 'URL に埋め込まれた認証情報',
    re: /\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@]+:([^\s/:@]{3,})@[^\s/]+/gi,
    value: 1,
  },
  {
    id: 'generic-secret-assignment',
    desc: '秘密情報らしき代入',
    re: /\b(?:api[_-]?key|secret[_-]?\w*|access[_-]?token|auth[_-]?token|client[_-]?secret|password|passwd|credential[s]?|private[_-]?key)\s*[:=]\s*["'`]?([^\s"'`,;{}()<>]{8,})["'`]?/gi,
    value: 1,
    // 値が英数字主体のトークン形でなければ説明文とみなす。
    filter: (m) => /^[A-Za-z0-9_.\/+=-]+$/.test(m),
  },

  // --- 2. 個人情報 ---------------------------------------------------------
  {
    id: 'email',
    desc: 'メールアドレス',
    re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+\b/g,
    filter: (m) => !ALLOWED_EMAIL.test(m),
  },
  {
    id: 'windows-user-path',
    desc: 'Windows ユーザープロファイルのパス',
    re: /\b[A-Za-z]:[\\/]Users[\\/]([^\\/\s"'<>|:;,)\]]+)/g,
    value: 1,
    filter: (m, whole) => !isGenericUser(whole.split(/[\\/]/).pop() ?? ''),
  },
  {
    id: 'unix-home-path',
    desc: 'ホームディレクトリのパス',
    re: /(?:^|[\s"'`(=])(?:\/home|\/Users)\/([A-Za-z0-9._-]+)/gm,
    value: 1,
    filter: (m) => !isGenericUser(m),
  },
];

// ---------------------------------------------------------------------------

const deny = SELFTEST ? [] : loadDenylist();

if (SELFTEST) process.exit(selftest() ? 0 : 1);

const targets = STAGED ? stagedFiles() : trackedFiles();
const findings = [];
let scanned = 0;
let allowed = 0;

for (const path of targets) {
  const content = STAGED ? stagedContent(path) : diskContent(path);
  if (content === null) continue;
  scanned += 1;
  for (const f of scanFile(path, content)) {
    if (f.allowedInline) allowed += 1;
    else findings.push(f);
  }
}

console.log(`\nscan-secrets (${STAGED ? 'staged' : 'worktree'}) — ${scanned} ファイルを検査`);
if (deny.length) console.log(`  info  ${DENYLIST_FILE} から ${deny.length} 語を読み込み`);
else console.log(`  info  ${DENYLIST_FILE} が無いため組織固有語の検査はしていない`);
if (allowed) console.log(`  info  ${ALLOW_MARKER} により ${allowed} 件を除外`);

for (const f of findings) {
  console.log(`  ERROR ${f.path}:${f.line}  [${f.id}] ${f.desc}`);
  console.log(`        ${f.masked}`);
}

if (findings.length) {
  console.log(`\n${findings.length} 件の疑いを検出した。コミットしてはいけない。`);
  console.log('誤検出であれば、その行の末尾に次のマーカーを書けば除外できる。');
  console.log(`  ${ALLOW_MARKER}`);
  console.log('実際の秘密情報であれば、値を環境変数か git 管理外のファイルへ移すこと。');
  console.log('すでにコミット済みの場合は履歴からも消し、その秘密を無効化する。');
  process.exit(1);
}
console.log('\n0 件。scan-secrets OK');

// ---------------------------------------------------------------------------

function scanFile(path, content) {
  const out = [];
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line || line.length > 4000) continue;
    const inlineAllowed = line.includes(ALLOW_MARKER);
    for (const rule of RULES) {
      rule.re.lastIndex = 0;
      let m;
      while ((m = rule.re.exec(line)) !== null) {
        const whole = m[0];
        const value = rule.value ? m[rule.value] : whole;
        if (!value) continue;
        if (rule.id === 'generic-secret-assignment' && (isPlaceholder(value) || !/[0-9]/.test(value)))
          continue;
        if (rule.id === 'azure-openai-endpoint-key' && isPlaceholder(value)) continue;
        if (rule.filter && !rule.filter(value, whole)) continue;
        out.push({
          path,
          line: i + 1,
          id: rule.id,
          desc: rule.desc,
          masked: mask(whole),
          allowedInline: inlineAllowed,
        });
      }
    }
    for (const d of deny) {
      d.re.lastIndex = 0;
      if (d.re.test(line))
        out.push({
          path,
          line: i + 1,
          id: `denylist:${d.label}`,
          desc: `${DENYLIST_FILE} の語に一致`,
          masked: '(内容は表示しない)',
          allowedInline: inlineAllowed,
        });
    }
  }
  return out;
}

/** 検出値は先頭数文字と長さだけ出す。ログに秘密をそのまま残さないため。 */
function mask(v) {
  const s = String(v);
  if (s.length <= 8) return `${s.slice(0, 2)}${'*'.repeat(Math.max(s.length - 2, 1))} (${s.length} 文字)`;
  return `${s.slice(0, 4)}${'*'.repeat(8)}${s.slice(-2)} (${s.length} 文字)`;
}

/**
 * `.secrets-denylist` を読む。1 行 1 語。
 *   literal      … 大文字小文字を無視した部分一致
 *   /regex/flags … 正規表現
 *   # 始まり     … コメント
 */
function loadDenylist() {
  const p = join(ROOT, DENYLIST_FILE);
  if (!existsSync(p)) return [];
  const out = [];
  for (const raw of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const rx = /^\/(.+)\/([gimsu]*)$/.exec(line);
    try {
      out.push(
        rx
          ? { label: 'regex', re: new RegExp(rx[1], rx[2].includes('g') ? rx[2] : `${rx[2]}g`) }
          : { label: 'term', re: new RegExp(escapeRe(line), 'gi') },
      );
    } catch {
      console.error(`  WARN  ${DENYLIST_FILE} の行を正規表現として解釈できない: ${line}`);
    }
  }
  return out;
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, (c) => `\\${c}`);
}

function git(args) {
  const res = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (res.status !== 0) {
    console.error(`git ${args.join(' ')} が失敗しました`);
    if (res.stderr) console.error(res.stderr.trim());
    process.exit(1);
  }
  return res.stdout;
}

function splitZ(s) {
  return s.split('\0').filter(Boolean);
}

/** 追跡中 + 未追跡 (ignore 対象外)。ignore されているファイルは git に入らないので対象外。 */
function trackedFiles() {
  return splitZ(git(['ls-files', '-z', '-c', '-o', '--exclude-standard']));
}

function stagedFiles() {
  return splitZ(git(['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z']));
}

function stagedContent(path) {
  if (BINARY_EXT.test(path)) return null;
  const res = spawnSync('git', ['show', `:${path}`], {
    cwd: ROOT,
    encoding: 'buffer',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (res.status !== 0) return null;
  return decode(res.stdout);
}

function diskContent(path) {
  if (BINARY_EXT.test(path)) return null;
  const abs = join(ROOT, path);
  if (!existsSync(abs) || !statSync(abs).isFile() || statSync(abs).size > MAX_BYTES) return null;
  return decode(readFileSync(abs));
}

/** NUL を含むものはバイナリとみなして対象外にする。 */
function decode(buf) {
  if (!buf || buf.includes(0)) return null;
  return buf.toString('utf8');
}

// ---------------------------------------------------------------------------

/** ルールが実際に発火するか、正常な文字列で誤検出しないかを確認する。 */
function selftest() {
  const B = String.fromCharCode(92); // backslash
  // 見本のトークンは分割して組み立てる。実在の秘密ではないが、
  // 完全な形で書くと GitHub の push protection など外部のスキャナが
  // 本物の混入とみなし、push が拒否されるため。
  const J = (...parts) => parts.join('');
  // 以下は検出されるべき見本。自分自身のスキャンから外すため
  // secrets-scan-allow を付けてある。
  const hit = [
    ['aws-access-key', 'key = ' + J('AKIA', 'IOSFODNN7EXAMPLE')], // secrets-scan-allow
    ['github-token', 'token: ' + J('ghp', '_') + 'a'.repeat(36)], // secrets-scan-allow
    ['anthropic-key', 'ANTHROPIC_API_KEY=' + J('sk', '-ant-', 'api03-') + 'x1y2z3'.repeat(6)], // secrets-scan-allow
    ['openai-key', 'OPENAI_API_KEY=' + J('sk', '-') + 'Ab3'.repeat(14)], // secrets-scan-allow
    ['slack-token', J('xox', 'b-', '123456789012-abcdefghijklmnop')], // secrets-scan-allow
    ['google-api-key', J('AI', 'za') + 'B'.repeat(35)], // secrets-scan-allow
    ['stripe-key', J('sk', '_live_') + 'c4d5e6f7g8'.repeat(3)], // secrets-scan-allow
    ['npm-token', J('npm', '_') + 'z9'.repeat(18)], // secrets-scan-allow
    ['private-key', J('-----BEGIN ', 'RSA ', 'PRIVATE KEY', '-----')], // secrets-scan-allow
    ['jwt', J('eyJ', 'hbGciOiJIUzI1NiJ9.', 'eyJ', 'zdWIiOiIxMjM0NTY3ODkwIn0.', 'dBjftJeZ4CVPmB92K')], // secrets-scan-allow
    ['url-basic-auth', J('https://deploy:', 'hunter2pass', '@internal.example/repo.git')], // secrets-scan-allow
    ['generic-secret-assignment', J('client_secret', ' = "', 'Gx9-qp2LmT4vR8sd1', '"')], // secrets-scan-allow
    ['email', 'contact: ' + J('taro.yamada', '@', 'somecorp.co.jp')], // secrets-scan-allow
    ['windows-user-path', 'C:' + B + 'Users' + B + 'sato' + B + 'AppData'], // secrets-scan-allow
    ['unix-home-path', 'path = ' + J('/home/', 'tanaka', '/work')], // secrets-scan-allow
  ];
  const miss = [
    'sha256 5771f3efdd52bd0193cb71c8bec2c7f748ff62b97e5759d879ee79b32ef31cca',
    'api_key は環境変数から読む',
    'password: <YOUR_PASSWORD>',
    'token = process.env.GITHUB_TOKEN',
    'apiKey: ${API_KEY}',
    'mail: someone@example.com',
    'C:' + B + 'Users' + B + '%USERNAME%' + B + 'Desktop',
    'cd D:' + B + 'gpt-skills',
    'npm run check -- --skill=adversarial-answer',
    '- Local Path: references/papers/core/adversarial-review-2608.18167.pdf',
  ];

  let ok = true;
  console.log('\nscan-secrets --selftest');
  for (const [id, sample] of hit) {
    const found = scanFile('selftest', sample).map((f) => f.id);
    if (!found.includes(id)) {
      console.log(`  ERROR 検出できなかった: ${id}`);
      ok = false;
    }
  }
  for (const sample of miss) {
    const found = scanFile('selftest', sample);
    if (found.length) {
      console.log(`  ERROR 誤検出: [${found.map((f) => f.id).join(', ')}] <- ${sample.slice(0, 60)}`);
      ok = false;
    }
  }
  console.log(ok ? `  ${hit.length} 検出 / ${miss.length} 非検出 すべて期待どおり\n\nselftest OK` : '\nselftest FAILED');
  return ok;
}
