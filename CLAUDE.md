# CLAUDE.md

このリポジトリで作業するときの指示。ChatGPT / Codex 向けの Skill を作り、検証し、ZIP へパッケージするのが目的。

## リポジトリの前提

- `src/` 直下で `SKILL.md` を持つディレクトリが 1 つの Skill。ディレクトリ名は `SKILL.md` frontmatter の `name` と一致させる (不一致は検証エラー)。
- 配布物は `dist/<skill-name>/skill.zip`。ZIP はトップレベルに `<skill-name>/` を持つ。
- `tools/` `docs/` `plans/` `README.md` `CLAUDE.md` はパッケージに入らない。ZIP へ入るのは `src/<skill>/` 配下のみ。**`src/` 配下からリポジトリ内部のパスを参照しない** — 配布物は配布物だけで完結させる。
- Skill 本文・ドキュメントは日本語で書く。既存ファイルの語調と見出しの粒度に合わせる。
- `dist/` と `node_modules/` は git 管理外。

## 変更したら必ず実行する

```bash
npm run check                      # scan-secrets → build(strict) → verify-package。これが通らない変更はコミットしない
npm run check -- --skill=<name>    # 1 つだけ対象にする
```

`npm run check` は 0 error / 0 warn が正常。WARN が出たら原因を消してからコミットする。個別に動かす場合は `npm run validate` / `npm run build` / `npm run verify` / `npm run scan`。

同じ `check` を `.github/workflows/check.yml` が main への push と全 Pull Request で実行する。CI には `.secrets-denylist` が無いため、組織固有語の検査はリポジトリ Secret `SECRETS_DENYLIST` を設定したときだけ効く。**CI が通ることはローカルで確認しない理由にならない** — 手元で通してからコミットする。

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

スキャンのルールを変えたら `npm run scan:selftest` を通す。検出されるべき見本と、されてはいけない見本が `tools/scan-secrets.mjs` の `selftest()` にある。ルールを追加したら見本も足す。件数はコマンドの出力が持っているので、ここには書かない。

会社名・ドメインなど組織固有の語は `.secrets-denylist` (git 管理外) に書く。**この語をリポジトリ内のファイルへ書き写してはいけない。** `.secrets-denylist.example` はプレースホルダだけを含む。

## Skill を追加する

1. `src/<skill-name>/SKILL.md` — frontmatter は `name` (lowercase kebab-case、ディレクトリ名と一致) と `description` の 2 つが必須。`description` は「何をするか」と「いつ使うか」の両方を書く。起動条件を書かないと意図しない場面で呼ばれる。
2. `src/<skill-name>/agents/openai.yaml` — `interface.display_name` 必須。`icon_small` / `icon_large` は実在するパスを指す。`policy.allow_implicit_invocation: false` は全 Skill 共通の必須 (検証エラー、[docs/spec/common.md](docs/spec/common.md) CINV-01)。
3. `src/<skill-name>/assets/icon.svg` — 既存 Skill の SVG を参考にする。
4. 設計判断を伴うなら `docs/spec/<skill-name>.md` を作る。`common.md` を継承し、固有の事項だけを書く。**spec が無い Skill へ設計判断を加えるときは spec を先に作る。**
5. `npm run check` を実行する。

`references/` は必須ではなく、中身は Skill ごとに違う。`adversarial-answer` は Method Card と論文、`slide-visual` は確認ケース (`references/test-cases.md`) を置き、`slide-studio` は Context Registry (`references/REGISTRY.md`)・Context ファイル (`references/contexts/`)・ドメインガイド (`references/domain-guide.md`) を置き、`guided-clarification` は `SKILL.md` 単体で完結している。

## Skill を編集する

- `SKILL.md` は実行手順の正本。肥大化させない (40KB で WARN)。長い仕様は `references/` へ委譲する。
- `references/` を追加したら、`SKILL.md` から相対パスで参照する。`validate` が `src/` 配下 Markdown の内部参照 (`references/…` `agents/…` `assets/…`) のリンク切れを検出する。
- PDF を追加する場合は `references/REFERENCE-MANIFEST.md` への登録が必須。未登録 PDF は検証エラーになる。
- `.DS_Store` など OS が作る付随ファイルを `src/` へ残さない。ZIP へ入ってしまうため検証エラーにしてある。

```bash
npm run hash -- <file.pdf>                      # Manifest 用の SHA256 / File Size
node tools/pdfinfo.mjs <file.pdf>               # タイトル・著者・ライセンス表記
node tools/pdftext.mjs <file.pdf> <from> <to>   # 指定ページのテキスト
```

PDF の同梱条件は [docs/spec/adversarial-answer.md](docs/spec/adversarial-answer.md) §4 に従う。出版社の組版版は、著者サイトで無償公開されていても同梱しない。

## slide-visual を触る前に読む

正本は [docs/spec/slide-visual.md](docs/spec/slide-visual.md)。**§5 の不変条件 (INV-01〜13) に触れる変更は、リファクタリングではなく仕様変更として扱う** (spec §25)。特に次を勝手に戻さない。

- 明示起動専用 — 「Slide X の画像」という題材一致で起動する条件を復活させない
- 固定スタイル (フラット / ブルー・ネイビー・グレー / 透過 / 余白 5〜10%) を画像ごとに聞き直させない
- 説明量 (文字量) は画像ごとに確定する。未指定なら方式 1・2・3 をすべて提示する。資料全体での固定を既定にしない
- 文字量以外の質問を 3 択へ水増ししない。`0` は直前の論点だけの委任、`9` は同じ論点の再質問
- 実行していないことを実行済みと書かない (画像を生成していないのに品質を「検証済み」と記録しない)

選択式確認の判定規則は [docs/spec/guided-clarification.md](docs/spec/guided-clarification.md) §6〜§12 を継承し、差分だけを slide-visual spec §12.2 に置いてある。**継承元を変更したら差分表が成立するかを必ず点検する。** 配布物は別 Skill に依存しない (実装は `SKILL.md` 単体で完結させる)。

変更したら [docs/test/slide-visual.md](docs/test/slide-visual.md) の受入基準 (AC-01〜22) を読み直し、根拠列が成立するかを確認して結果を更新する。

## slide-studio を触る前に読む

正本は [docs/spec/slide-studio.md](docs/spec/slide-studio.md)。1 Skill の中に 69 の専門 Context (Designer 32 / Reviewer 32 / Validator 4 / Navigator 1) を持つ Context Router 型の Skill で、**§6 の不変条件 (I-01〜16) と §8 の Context 契約に触れる変更は仕様変更として扱う** (spec §21)。特に次を勝手に変えない。

- 1 Turn = 1 Specialist Context — 人間の操作なしに次 Context へ進む経路を追加しない。「全部やって」でも 1 つだけ実行する
- Reviewer は修正しない。FAIL は rollback_target を示して止まる。自動修復して PASS にする経路を作らない
- Context の追加・削除・責務変更・入出力変更・遷移変更は spec §8 と §13.7 を先に更新する。`references/REGISTRY.md` と `references/contexts/<stage>/<context>.md` は 1 対 1 で、`npm run check` が閉包と Designer / Reviewer の対を検査する
- 出力は PPTX 既定・テンプレート必須・画像は別 Skill で作りユーザーがはめ込む・コード実行が無ければ Build 系は BLOCKED。これらは 2026-09-19 のユーザー決定 (spec §13.5)
- `references/domain-guide.md` の本文を変えない (spec §13.6)。引用マーカーの置換・見出し番号・冒頭注記・付録以外は元原稿とバイト一致していなければならない
- 固定値 (枚数・pt・色数・時間) を規則として書かない (I-09)。ガイドの根拠レベル A/B/C/D を崩さない
- 作業言語と成果物の声を混ぜない (I-15)。対象読者向けのトーン・表記の指定は `deliverable_voice` に記録し、聴衆が読む文字列だけに適用する。Artifact の記述・所見・案内は常に日本語の常体
- 各ターンを「次にすること」で終える (I-16)。結果ブロックだけ返して終える形へ戻さない

秘密情報スキャンは、Artifact 参照 `slide_assertion_spec@S03.assertion` のような `名前@S<nn>.項目` をメールアドレスから除外している (`tools/scan-secrets.mjs`)。この形式以外の `@` を含む例を書くときは誤検知を疑う前に内容を確認する。

変更したら [docs/test/slide-studio.md](docs/test/slide-studio.md) の受入基準 (AC-01〜28) を読み直し、根拠列が成立するかを確認して結果を更新する。実地検証で問題が見つかったら、同書の「実地検証で見つかった問題」へ追記し、spec のどの節を変えたかを残す。

## adversarial-answer を触る前に読む

この Skill だけ設計上の制約が多い。変更前に [docs/handoff.md](docs/handoff.md) §3「覆してはいけない決定事項」を読むこと。Router の構造、Method 選択、PDF の扱いには理由のある決定があり、知らずに変えると設計が崩れる。

- `references/METHOD-ROUTING.md` — Problem Profile → Failure Mode → Applicability → Method のルーティング仕様
- `references/methods/METHOD-*.md` — Method Card。実行仕様の正本 (PDF は根拠であって実行指示ではない)
- `references/ROUTER-TEST-CASES.md` — Router の回帰テスト。Router を変更したら追従させる
- [docs/spec/adversarial-answer.md](docs/spec/adversarial-answer.md) — 設計判断の理由と、各 Method が原典から何を採り何を採らないか
- [docs/spec/common.md](docs/spec/common.md) — 全 Skill 共通の不変条件と変更手順

## 仕様はどこにあるか

正本は役割で分かれている。**同じことを 2 箇所に書かない。**

| 対象 | 正本 |
|---|---|
| 実行手順・Invariant Gate | `src/adversarial-answer/SKILL.md` |
| ルーティング規則 | `src/adversarial-answer/references/METHOD-ROUTING.md` |
| Method の実行仕様 | `src/adversarial-answer/references/methods/METHOD-*.md` |
| 論文の書誌・ライセンス・SHA256 | `src/adversarial-answer/references/REFERENCE-MANIFEST.md` |
| 全 Skill 共通の規定 | [docs/spec/common.md](docs/spec/common.md) |
| Skill ごとの設計判断・研究根拠 | `docs/spec/<skill-name>.md` — [adversarial-answer](docs/spec/adversarial-answer.md) / [guided-clarification](docs/spec/guided-clarification.md) / [slide-visual](docs/spec/slide-visual.md) / [slide-studio](docs/spec/slide-studio.md) |
| 受入基準の評価結果 | `docs/test/<skill-name>.md` — [guided-clarification](docs/test/guided-clarification.md) / [slide-visual](docs/test/slide-visual.md) / [slide-studio](docs/test/slide-studio.md) |
| `slide-visual` の確認ケース (T / V / S) | `src/slide-visual/references/test-cases.md` |
| `slide-studio` の Context 一覧・入出力・遷移・差し戻し先 | `src/slide-studio/references/REGISTRY.md` |
| `slide-studio` の各 Context の手順 | `src/slide-studio/references/contexts/<stage>/<context>.md` |
| `slide-studio` のドメイン知識 (スライド設計の科学的根拠) | `src/slide-studio/references/domain-guide.md` |
| `slide-studio` の確認ケース (A / T / B / L / N / S) | `src/slide-studio/references/test-cases.md` |
| `slide-studio` のターンの並びの例 | `src/slide-studio/SAMPLES.md` (実行時には読まない) |
| 覆してはいけない決定 (D1〜D10) | [docs/handoff.md](docs/handoff.md) §3 |

**spec と実装が矛盾する場合、spec を優先する。** 実装だけを変えて spec と食い違わせてはならない。変更手順と完了条件は `docs/spec/common.md` §4 / §5 が正本。

Skill の仕様は `docs/spec/<skill-name>.md` に置く。ファイル名は `src/` のディレクトリ名と揃える。各 spec は `common.md` を継承し、Skill 固有の事項だけを書く。spec は必須ではないが、**spec が無い Skill に設計判断を加えるときは spec を作ってから実装する。**

2026-09-16 まで仕様は `plans/plans2.md` `plans/plans1.md` `plans/phase.md` にあったが、Phase 1〜8 完了に伴い持ち越す内容を `docs/spec/` へ集約して削除した。旧ファイルは git 履歴から参照できる。**`plans2 §N` のような参照を新たに書かないこと。**

spec は「何が成り立っていなければならないか」(契約) を書き、実装は「それをどう実行するか」(手順) を書く。**同じ高さの記述が 2 箇所にあるときだけ重複とみなす** (`docs/spec/common.md` §7)。Method Card の `Procedure` を spec へ丸写ししない。

## 編集してはいけないもの

- baseline コミット `6e2a38b` — A/B 比較の基準。v1 の内容はここからのみ復元できる

`docs/handoff.md` と `docs/handoff-history.md` は更新してよい。handoff.md は「現在の状態と次にやること」だけを書き、過去の経緯は history 側へ移す。

`plans/` は空だが `.gitkeep` で残してある。新しい作業の計画や調査メモを一時的に置く場所で、**役目を終えたら消すか `docs/` へ畳み込む。** 完了した計画をここへ残さない。

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
