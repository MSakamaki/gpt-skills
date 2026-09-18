# GPT Skills

ChatGPT 向けの Skill をまとめたリポジトリ (一部は Codex / API にも対応)。`src/` 直下で `SKILL.md` を持つディレクトリが 1 つの Skill になり、Skill ごとに `dist/<skill-name>/skill.zip` を生成する。

## Skill 一覧

| Skill | 内容 | 対応プロダクト |
|---|---|---|
| [adversarial-answer](src/adversarial-answer/SKILL.md) | 依頼を 10 項目で確定し、想定される失敗モードに適した敵対的検証を 3 回行って回答を作る | chatgpt / codex / api / atlas |
| [guided-clarification](src/guided-clarification/SKILL.md) | 最終回答を実質的に変える確認だけを `0/1/2/3/9` の選択式で 1 問ずつ行ってから回答する | chatgpt |
| [slide-visual](src/slide-visual/SKILL.md) | 議論済みのスライドから、固定したフラットスタイルの差し込み画像を生成する。説明量は画像ごとに選ぶ | chatgpt / codex / api / atlas |

対応プロダクトは各 Skill の `agents/openai.yaml` の `policy.products` が正本。いずれも `allow_implicit_invocation: false` で、ユーザーが明示的に起動したときだけ動く。

## リポジトリ構成

```text
gpt-skills/
├── src/                     Skill 本体。ここだけが ZIP に入る
│   ├── adversarial-answer/
│   ├── guided-clarification/
│   └── slide-visual/
├── tools/                   検証・ビルド・PDF 調査ツール (Node)
├── docs/                    開発用ドキュメント
│   ├── spec/common.md       全 Skill 共通の規定
│   ├── spec/<skill-name>.md Skill ごとの仕様 (設計判断と研究根拠)
│   ├── test/<skill-name>.md 受入基準・テストケースの評価結果
│   ├── handoff.md           現在の状態と次にやること
│   └── handoff-history.md   改訂履歴
├── plans/                   進行中の計画・調査メモ (完了したら docs/ へ。現在は空)
├── dist/                    <skill-name>/skill.zip (git 管理外)
├── .github/workflows/       CI。push と PR で npm run check
├── .githooks/pre-commit     秘密情報スキャン (commit 時に自動実行)
├── README.md
└── CLAUDE.md                メンテナンス手順
```

Skill 1 つの構成は次のとおり。必須は `SKILL.md` と `agents/openai.yaml` の 2 つだけ。`references/` は任意で、中身は Skill ごとに違う (`adversarial-answer` は Method Card と論文、`slide-visual` は確認ケース、`guided-clarification` は持たない)。

```text
src/adversarial-answer/          ← ディレクトリ名 = SKILL.md の name
├── SKILL.md                     Skill 本体。実行フロー
├── agents/openai.yaml           ChatGPT / Codex 向けメタデータ
├── assets/icon.svg
└── references/                  この Skill 固有 (以下は adversarial-answer のみ)
    ├── METHOD-ROUTING.md        Problem Profile → Failure Mode → Applicability → Method
    ├── methods/                 Method Card。実行仕様の正本
    ├── papers/                  方法論の一次根拠 PDF
    ├── REFERENCE-MANIFEST.md    論文のメタデータ・ライセンス・SHA256
    └── ROUTER-TEST-CASES.md     Router の回帰テスト
```

検証は `SKILL.md` と `agents/openai.yaml` だけを全 Skill 共通の必須とし、`references/methods/` または `METHOD-ROUTING.md` を持つ Skill にだけ Method Card と Manifest の完全性を要求する。

`REFERENCE-MANIFEST.md` と `ROUTER-TEST-CASES.md` は `SKILL.md` からの参照を持たず、実行時には読み込まれない。それでも配布物へ含めているのは、**同梱の根拠 (出所・ライセンス) と Router の検証状況を、配布物だけを見て確認できるようにするため。** 2 ファイルで約 52KB あるが、ZIP 全体 (約 3.4MB、大半が PDF) の 1.5% で、25MB 制限には影響しない。

### 新しい Skill を追加する

1. `src/<skill-name>/SKILL.md` を作る。frontmatter の `name` はディレクトリ名と一致させる (不一致は検証エラー)
2. `src/<skill-name>/agents/openai.yaml` を作る (`allow_implicit_invocation: false` は必須)
3. 設計判断を伴うなら `docs/spec/<skill-name>.md` を作る ([docs/spec/common.md](docs/spec/common.md) を継承し、固有の事項だけを書く)
4. `npm run check` を実行する

詳細な手順と制約は [CLAUDE.md](CLAUDE.md) にある。

## コマンド

```bash
npm install
npm run check             # scan + build (strict) + verify。リリース前はこれを使う
npm run validate          # 構造検証 (v2 成果物の欠落は WARN)
npm run validate:strict   # v2 成果物の欠落を ERROR にする
npm run build             # 検証したうえで dist/<skill>/skill.zip を生成
npm run verify            # 生成済み ZIP 自体を検証
npm run hash -- <file>    # Manifest 用の SHA256 / File Size を出力
npm run scan              # 秘密情報スキャン (check にも含まれる)
npm run hooks:install     # pre-commit フックを有効化 (npm install で自動実行)
```

いずれも引数なしで全 Skill を対象にする。1 つだけ扱う場合は `--skill=<name>` を付ける。

```bash
npm run build -- --skill=adversarial-answer
npm run check -- --skill=adversarial-answer
```

`npm run build` は `src/<skill>/` の全ファイルを ZIP 内の `<skill>/` 配下へ置く。再現性のため、ファイルとフォルダ双方のエントリ日時を固定している。

論文を追加する際は次の 2 つを使う。どちらも配布物には含まれない。

```bash
node tools/pdfinfo.mjs <file.pdf>                # タイトル・著者・ライセンス表記を抽出
node tools/pdftext.mjs <file.pdf> [from] [to]    # 指定ページのテキストを抽出
```

## 検証内容

`tools/validate.mjs` は `src/` を検査する。

- 必須ファイル (`SKILL.md`, `agents/openai.yaml`) の存在
- OS が作る付随ファイル (`.DS_Store` など) が混入していないこと
- YAML frontmatter の `name` が lowercase kebab-case であること、ディレクトリ名との一致、`description` の存在と長さ (ブロックスカラー `>-` 形式も解釈する)
- `agents/openai.yaml` の `allow_implicit_invocation` が真偽値の `false` であること ([docs/spec/common.md](docs/spec/common.md) CINV-01)
- `src/` 配下 Markdown からの内部参照 (`references/…` 等) のリンク切れ
- `REFERENCE-MANIFEST.md` と実体の整合 — SHA256・ファイルサイズ・`Bundled` と実体の有無・未登録 PDF の検出
- Skill 合計サイズ (20MB で WARN / 25MB で ERROR)

`tools/verify-package.mjs` は生成済みの `dist/<skill>/skill.zip` 自体を検査する。ZIP 内 PDF の SHA256 を ZIP 内 Manifest と照合し、開発用ファイルの混入と `Bundled: NO` の PDF の混入を検出する。

## 秘密情報を git に入れない仕組み

会社・個人・トークンなどの秘密情報がコミットへ混入しないよう、3 層で防いでいる。**Skill は ZIP にして外部へ配布するため、`src/` への混入は二重に危険。**

### 1. pre-commit フック (自動)

`npm install` で `core.hooksPath` が `.githooks` に設定され、以降の `git commit` で自動的にステージ内容をスキャンする。検出された場合、コミットは中断する。

```bash
npm run hooks:install       # 明示的に有効化する場合
git config core.hooksPath   # .githooks と出れば有効
```

### 2. `npm run check` (リリース前) と CI

`check` の最初のステップとして、追跡中 + 未追跡 (ignore 対象外) の全ファイルをスキャンする。`.github/workflows/check.yml` が main への push と全 Pull Request で同じ `check` を走らせるため、ローカルで実行し忘れても検証を通らない変更は main に積まれない。

**CI には `.secrets-denylist` が無い** (git 管理外のため)。そのままだと組織固有語の検査だけが効かないので、リポジトリ Secret に `SECRETS_DENYLIST` を登録しておくと CI が復元して検査する。未登録でも CI は失敗せず、警告を出したうえでトークン・個人情報の検査だけを行う。

### 3. `.gitignore` (そもそも追跡させない)

`.env` `*.pem` `*.key` `.npmrc` `secrets/` `.secrets-denylist` などを除外している。

### 検出するもの

| 種別 | 例 |
|---|---|
| トークン・鍵 | AWS / GitHub / OpenAI / Anthropic / Slack / Google / Stripe / npm、秘密鍵ブロック、JWT、URL 埋め込みの Basic 認証、`client_secret = …` 形式の代入 |
| 個人情報 | メールアドレス、`C:\Users\<実名>` や `/home/<実名>` などのパス |
| 組織固有の語 | `.secrets-denylist` に書いた会社名・ドメイン・社内ホスト名・チケット番号など |

検出結果は必ずマスクして出力する (`ghp_********AA (40 文字)`)。スキャンのログ自体から秘密が漏れないようにするため。組織固有の語は一致した事実だけを報告し、語そのものは出力しない。

ルールが実際に発火するかは自己テストで確認できる。

```bash
npm run scan:selftest    # 検出されるべき見本と、されてはいけない見本を両方走らせる
```

見本は `tools/scan-secrets.mjs` の `selftest()` にある。件数はコマンドの出力が持っているので、ここには書かない。ルールを足したら見本も足す。

### 組織固有の語を登録する

会社名やドメインそのものが秘密情報なので、リポジトリへコミットできない。git 管理外の `.secrets-denylist` に置く。

```bash
cp .secrets-denylist.example .secrets-denylist
# 会社名・ドメイン・社内ホスト名などを 1 行 1 語で書く。/regex/ 形式も使える
```

このファイルが無い場合、組織固有語の検査だけが行われない (トークンと個人情報の検査は常に動く)。**clone 直後に作ること。**

### 誤検出だったとき

その行に `secrets-scan-allow` と書けば除外される。`git commit --no-verify` でフックを飛ばすこともできるが、**内容を目で確認したときだけ**にする。

### 実際に混入させてしまったら

1. その値を無効化する (トークンの再発行、パスワード変更)。**これが最優先。** 一度公開された秘密は取り消すしかない
2. 作業ツリーから値を消し、環境変数か git 管理外のファイルへ移す
3. push 前なら該当コミットのやり直しで済む。push 済みなら履歴の書き換え (`git filter-repo` など) が必要

## PDF の扱い

PDF は方法論の一次根拠であり、実行仕様ではない。実行仕様は `src/adversarial-answer/references/methods/` の Method Card を正本とする。実行時に全 PDF を読み込むことはしない。Method Card は PDF が無くても実行できる。

同梱するのは次のいずれかに限る。

- 明示的に再配布が許諾されているもの (CC BY、CC BY-NC-ND など)
- arXiv が配布している版
- 著者・所属機関が公開している著者版

出版社の有料版は同梱しない。**著者サイトで無償公開されていても、実体が出版社の組版版であるものは同梱しない。** 各 PDF の License と Redistribution Allowed は `REFERENCE-MANIFEST.md` に記録する。

### `UNKNOWN` ライセンスの 4 本について

同梱 6 本のうち 4 本 (`PAPER-AR` / `PAPER-MARE` / `PAPER-ELICITRON` / `PAPER-MAD-RE`) は `Redistribution Allowed: UNKNOWN` である。原則は `UNKNOWN` / `NO` を自動同梱しないことだが、**この 4 本の同梱は正式な現行仕様**として [docs/spec/adversarial-answer.md](docs/spec/adversarial-answer.md) §47 が定めている。いずれも arXiv 標準ライセンス版と著者所属機関の公開版で、`UNKNOWN` は再配布が禁じられていることではなく、明示的な許諾を確認できていないことを意味する。

保守的運用へ切り替える場合は、**仕様変更**として §47 を改めたうえで 4 本を ZIP から外し、Manifest の記載だけを残す。Method Card が実行仕様なので、外しても動作は変わらない。
