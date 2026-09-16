# CLAUDE.md

このリポジトリで作業するときの指示。ChatGPT / Codex 向けの Skill を作り、検証し、ZIP へパッケージするのが目的。

## リポジトリの前提

- `src/` 直下で `SKILL.md` を持つディレクトリが 1 つの Skill。ディレクトリ名は `SKILL.md` frontmatter の `name` と一致させる (不一致は検証エラー)。
- 配布物は `dist/<skill-name>/skill.zip`。ZIP はトップレベルに `<skill-name>/` を持つ。
- `tools/` `docs/` `plans/` `README.md` `CLAUDE.md` はパッケージに入らない。ZIP へ入るのは `src/<skill>/` 配下のみ。
- Skill 本文・ドキュメントは日本語で書く。既存ファイルの語調と見出しの粒度に合わせる。
- `dist/` と `node_modules/` は git 管理外。

## 変更したら必ず実行する

```bash
npm run check                      # scan-secrets → build(strict) → verify-package。これが通らない変更はコミットしない
npm run check -- --skill=<name>    # 1 つだけ対象にする
```

`npm run check` は 0 error / 0 warn が正常。WARN が出たら原因を消してからコミットする。個別に動かす場合は `npm run validate` / `npm run build` / `npm run verify` / `npm run scan`。

## 秘密情報を書かない

**会社名・個人名・メールアドレス・トークン・社内ホスト名・実ユーザーのパスを、このリポジトリのどのファイルにも書かない。** `src/` の内容は ZIP にして外部へ配布されるため、混入すると取り消せない。

- 例示が必要なときは `example.com` `<YOUR_TOKEN>` `%USERNAME%` などのプレースホルダを使う
- 実際の値は環境変数か git 管理外のファイルへ置く
- ログやコマンド出力を貼るときは、ユーザー名を含むパスとホスト名を伏せる

`git commit` 時に `.githooks/pre-commit` が `node tools/scan-secrets.mjs --staged` を実行し、検出されればコミットが止まる。`npm run check` でも全ファイルを走査する。

検出されたとき。

1. **実際の秘密なら** — 値を無効化し (再発行・変更)、作業ツリーから消す。すでにコミット済みなら履歴からも消す。ユーザーへ必ず報告する
2. **誤検出なら** — その行に `secrets-scan-allow` と書いて除外する。理由がその場で分かる形にすること
3. `git commit --no-verify` で回避してはいけない。内容を確認したうえでユーザーが判断する場合にだけ使う

スキャンのルールを変えたら `npm run scan:selftest` を通す。検出 15 ケース / 非検出 10 ケースの見本が `tools/scan-secrets.mjs` の `selftest()` にある。ルールを追加したら見本も足す。

会社名・ドメインなど組織固有の語は `.secrets-denylist` (git 管理外) に書く。**この語をリポジトリ内のファイルへ書き写してはいけない。** `.secrets-denylist.example` はプレースホルダだけを含む。

## Skill を追加する

1. `src/<skill-name>/SKILL.md` — frontmatter は `name` (lowercase kebab-case、ディレクトリ名と一致) と `description` の 2 つが必須。`description` は「何をするか」と「いつ使うか」の両方を書く。起動条件を書かないと意図しない場面で呼ばれる。
2. `src/<skill-name>/agents/openai.yaml` — `interface.display_name` 必須。`icon_small` / `icon_large` は実在するパスを指す。
3. `src/<skill-name>/assets/icon.svg` — 既存 Skill の SVG を参考にする。
4. `npm run check` を実行する。

`references/` は必須ではない。`adversarial-answer` 固有の構成であり、`guided-clarification` は `SKILL.md` 単体で完結している。

## Skill を編集する

- `SKILL.md` は実行手順の正本。肥大化させない (40KB で WARN)。長い仕様は `references/` へ委譲する。
- `references/` を追加したら、`SKILL.md` から相対パスで参照する。`validate` が `src/` 配下 Markdown の内部参照 (`references/…` `agents/…` `assets/…`) のリンク切れを検出する。
- PDF を追加する場合は `references/REFERENCE-MANIFEST.md` への登録が必須。未登録 PDF は検証エラーになる。

```bash
npm run hash -- <file.pdf>                      # Manifest 用の SHA256 / File Size
node tools/pdfinfo.mjs <file.pdf>               # タイトル・著者・ライセンス表記
node tools/pdftext.mjs <file.pdf> <from> <to>   # 指定ページのテキスト
```

PDF の同梱条件は [README.md](README.md) の「PDF の扱い」に従う。出版社の組版版は、著者サイトで無償公開されていても同梱しない。

## adversarial-answer を触る前に読む

この Skill だけ設計上の制約が多い。変更前に [plans/handoff.md](plans/handoff.md) §3「覆してはいけない決定事項」を読むこと。Router の構造、Method 選択、PDF の扱いには理由のある決定があり、知らずに変えると設計が崩れる。

- `references/METHOD-ROUTING.md` — Problem Profile → Failure Mode → Applicability → Method のルーティング仕様
- `references/methods/METHOD-*.md` — Method Card。実行仕様の正本 (PDF は根拠であって実行指示ではない)
- `references/ROUTER-TEST-CASES.md` — Router の回帰テスト。Router を変更したら追従させる

## 編集してはいけないもの

- `plans/plans1.md` `plans/plans2.md` `plans/phase.md` — 正本仕様。編集禁止。`.gitattributes` で改行正規化の対象からも外してある
- baseline コミット `6e2a38b` — A/B 比較の基準。v1 の内容はここからのみ復元できる

`plans/handoff.md` と `plans/handoff-history.md` は更新してよい。handoff.md は「現在の状態と次にやること」だけを書き、過去の経緯は history 側へ移す。

## ビルドの再現性

`tools/build.mjs` は全 ZIP エントリの日時を固定日時 (`2026-01-01T00:00:00Z`) へ揃えている。JSZip が暗黙に作るフォルダエントリには生成時刻が入るため、この処理を外すと同じ入力から毎回別バイト列の ZIP ができる。**ここは変更しない。**

同じ入力からは同じ SHA256 が出る。`npm run check` 後にハッシュが変わっていたら、入力が変わったということ。

## 環境上の注意

- **Bash の heredoc が `\\` を 1 段階落とす。** クォート付きヒアドキュメント (`<<'EOF'`) でも起きる。正規表現やエスケープを含むソースは Write ツールで書く。単一の `\` は保持される
- **PDF を Read ツールで開けない。** poppler 未インストールのため。`node tools/pdftext.mjs` を使う
- **RAND と Wiley は curl に 403 を返す。** RAND はブラウザ相当の User-Agent でランディングページのみ 200

## コミット

- 1 コミット 1 目的。`npm run check` が通る状態でコミットする
- メッセージは日本語。`feat(<skill>):` `fix:` `docs:` `build:` `test:` を prefix に使う (既存の履歴に合わせる)
- `dist/` はコミットしない
