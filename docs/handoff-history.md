# handoff.md 改訂履歴

[handoff.md](handoff.md) の肥大化を防ぐため、過去の経緯はこちらへ移す。

## 運用

- `handoff.md` は常に「現在の状態と次にやること」だけを書く。完了した残作業、解消した課題、覆された決定事項は本書へ移してから `handoff.md` から削除する
- 1 改訂 = 1 セクション。新しいものを上に追加する
- 各セクションには、対象コミット、変わった点、`handoff.md` から移してきた項目を書く

---

## 2026-09-16 — adversarial-answer spec の置き換え (R4 完了)

ユーザーが `plans/new-adversarial-answer.md` (2,104 行) を作成したのを受け、`docs/spec/adversarial-answer.md` を置き換えた。**R4 は完了。** 旧 spec (176 行) は実装から起こした要約で、§6 が「実装側を正本」と逆を向いていた。

### 実装との突き合わせ結果

新仕様案は現行実装を正確に写していた。機械的に照合した範囲は次のとおり。

| 照合対象 | 結果 |
|---|---|
| §53 Canonical Router Test Matrix の `required` 36 件 | **全件一致** |
| §49 Method Card Fallback 9 件 | **全件一致** |
| §46 同梱 PDF 6 件 | **一致** |
| §23〜§31 の書誌・Evidence Strength・Transfer Risk | Manifest と**全件一致** |
| §57 Size Guard (20MB WARN / 25MB ERROR) | `tools/validate.mjs` と一致 |

### 実装を正として是正した 4 件

「双方に矛盾が発生する場合は実装を正」という方針に従った。

| ID | 仕様案の記述 | 実装 | 対応 |
|---|---|---|---|
| C-1 | §33 の `DESIGN-PRINCIPLES` 読み込み条件が `CONFLICT` / `FORECAST` / `UNCERTAINTY` + 生成役割の 3 つ | `SKILL.md` は `REQUIREMENTS_ELICITATION` 選択時も条件に含む | §33 へ条件 2 を追加し、各原則の発火条件表を付けた |
| C-2 | §15 の候補表に「担当する原則」列が無い | `METHOD-ROUTING.md` §4 は F02 / F06 / F07 / F10 / F13 へ原則を紐づけている | §15 へ担当する原則の表を追加 |
| C-3 | §17 が「F13 が CRITICAL でも無理に Method を割り当てない」だけ | `METHOD-ROUTING.md` §6 は「`Covers` 持ちを Primary に優先、無い場合に限り例外側を Primary にしてよい」 | §17 へ「Covers に無い Method を当てる規則」を追加 |
| C-4 | §32 の `INDEPENDENT_FIRST` / `MINORITY_DISSENT` に実行時正本の記載が無い | `SKILL.md` §6 が実行時の正本 | 両原則へ明記 |

### 仕様として採用した変更

**PDF 同梱の位置づけを「逸脱」から「現行仕様」へ。** 新仕様案 §47 は `PAPER-AR` / `PAPER-MARE` / `PAPER-ELICITRON` / `PAPER-MAD-RE` の 4 件について `Redistribution Allowed: UNKNOWN` かつ `Bundled: YES` を正式な現行仕様と定め、Deviation ではないとした。旧 plans2 が削除済みで「plans2 §21 からの逸脱」という表現が指す先を失っていたため、この整理を採用した。`README.md` の見出しを「正本仕様からの逸脱」→「`UNKNOWN` ライセンスの 4 本について」へ、`handoff.md` の D8 と K5 を「仕様変更として扱う」へ改めた。

### docs/spec 配下の整合

- **`adversarial-answer.md` を `common.md` 継承の形へ** — §0 / §1 を書き換え、§59 変更手順と §65 完了条件の共通部分を `common.md` §4 / §5 へ委譲。Skill 固有の追加手順だけ残した
- **`common.md` §7 の重複規定を明確化** — 「同じことを 2 箇所に書かない」が、契約 (spec) と手順 (実装) の分離と衝突しないよう、**重複の線引きを「高さ」で決める**と定義した。同じ高さの記述が 2 箇所にある場合だけ重複とみなす
- **書式をリポジトリ規約へ** — 箇条書き 254 件を `-` へ、h1 67 個 → h1 1 個 + h2/h3/h4 の階層へ
- `plans/new-adversarial-answer.md` は `docs/` へ畳み込んだため削除した (`plans/` の運用どおり)

### 変更していないもの

`src/` は一切変更していない。今回は仕様文書の整理であり、実装の振る舞いは変えていない。ハッシュは同日の改行正規化で更新されている (下記)。

---

## 2026-09-16 — guided-clarification spec の検証と、spec 体系の整備

ユーザーが `docs/spec/guided-clarification.md` を作成したのを受けて実装と突き合わせ、見つかった矛盾を是正した。

### 検証結果

`SKILL.md` の記述内容と spec の間に実質的な矛盾は無かった。spec §19 が要求する 13 項目 (目的 / 質問条件 / 禁止条件 / 優先順位 / `0/1/2/3/9` / `0` と `9` の意味 / 自由入力 / 質問ループ / 推奨ルール / 例外 / 最終回答条件 / 品質チェック) はすべて実装側にある。矛盾はむしろ**リポジトリ全体の規約と spec 内部**にあった。

### 変わった点

- **正本の優先順位を spec 優先へ統一** — `CLAUDE.md` が「実装を正本として仕様側を直す」と書いていたのに対し、新 spec §20 は「spec を優先する」で正面衝突していた。**spec 優先へ揃えた**
- **`docs/spec/common.md` を新設** — 全 Skill 共通の規定を 1 箇所へ集約し、各 spec が継承する形にした。正本と責務分離、共通の不変条件 (CINV-01 明示起動のみ / CINV-02 配布物の自己完結 / CINV-03 ユーザーの価値判断を代行しない / CINV-04 根拠のない一般化をしない)、外部情報の取得、変更手順、変更完了条件、spec へ書くべき変更かの判定、記述の規約
- **`guided-clarification.md` の共通部分を `common.md` へ委譲** — §20 責務分離 / §21 変更ポリシー / §25 完了条件 / §26 設計判断の原則を、共通部分は参照・固有部分だけ記載する形へ (1,088 行 → 1,045 行)
- **`docs/test/guided-clarification.md` を新設** — AC-01〜10 と TC-01〜10 を評価して結果を記録した。全件 PASS。**ただし机上評価であり、本番環境での実地確認ではない**ことを明記した

### 是正した矛盾

| 内容 | 対応 |
|---|---|
| spec 内部: INV-06 / NFR-03 が `0` の意味を不変としながら、§12.1 が政治的選択で再定義している | INV-06 と NFR-03 へ「§12 の例外を除く」を明記。例外は 2 件だけで、いずれも `0` の意味を狭める方向であり CINV-03 で一貫すると説明 |
| NQ-02「Web 検索で解決できるなら質問しない」が、検索不可時に誤判断になる | 「実際に確認できた」へ変更し、§17.1 として検索できなかった場合のフォールバックを追加。`SKILL.md` にも反映 |
| §10.3 の `9` が固定文言に見えるが、spec 自身の TC-02 も `SKILL.md` の例も文言を変えている | 「固定するのは意味であって文言ではない」と明記 |
| §9 質問 UI の空行が `SKILL.md` と不一致 | spec 側を `SKILL.md` に合わせた |
| §1「ChatGPT Business 利用者」に実装側の根拠がない | 削除 (`openai.yaml` は `products: [chatgpt]` のみ) |
| 書式がリポジトリ規約と不一致 (箇条書き `*` 94 件、h1 27 個) | `-` へ統一、h1 1 個 + h2/h3/h4 の階層へ変換 |

### 評価中に見つかった実装側の不足

spec が要求していて `SKILL.md` に明文が無い箇所が 3 件あった。**spec 優先に従い実装を補った。**

- AC-06 — 「数字での回答を要求し直さない」
- TC-05 — 自由入力に複数条件が含まれる場合はすべて反映する
- TC-06 / INV-04 — 事前に質問列を決めて順に消化しない

### 移してきた項目

- **R4「`docs/spec/adversarial-answer.md` の再構成」を追加** — spec 優先へ統一した結果、このファイルの §6 だけが「実装側を正本」と逆を向いている。guided-clarification と同じ構成へ**ユーザーが書き直す**。それまで過渡状態として扱う旨を `CLAUDE.md` にも明記した

### 配布物

`src/guided-clarification/SKILL.md` を変更したため、guided-clarification の ZIP が変わった。guided-clarification の ZIP が変わった。最終値は `7df5451c…` (改行正規化後)。

---

## 2026-09-16 — CI 追加と、plans (計画) から docs (仕様) への移行

### 変わった点

- **CI を追加** — `.github/workflows/check.yml`。main への push と全 Pull Request で `npm ci` → `npm run scan:selftest` → `npm run check` を実行する。selftest を先に置いたのは、スキャンのルール自体が壊れていれば `check` が 0 件を返しても意味がないため。ZIP の SHA256 は Job Summary へ出力する
- **`docs/spec/adversarial-answer.md` を新設** — `plans/plans2.md` のうち持ち越す価値のある内容を集約した。設計判断の理由 (ルーティング順序・数値スコア禁止・最大 3)、Method の分類、**各 Method が原典から何を採り何を採らないか**、PDF の取得と同梱の方針、やってはいけないこと、仕様と実装の対応表
- **`plans/` の正本仕様 3 ファイルを削除** — `plans1.md` / `plans2.md` / `phase.md`。Phase 1〜8 完了により役目を終えた。`phase.md` は完了済みの段階実装プロンプト、`plans1.md` は採否を済ませた旧版で、持ち越す内容は無かった
- **配布物を自己完結にした** — `src/` 配下にあった `plans2 §N` 参照 15 件を、外部に依存しない記述へ置き換えた。`REFERENCE-MANIFEST.md` の `tools/` パス参照 2 件も同様。**`src/` からリポジトリ内部のパスを参照しない**という規則を CLAUDE.md へ明記した
- **`.gitattributes` の `plans/** -text` を削除** — 正本仕様を改行正規化から守るための指定だった。対象が無くなったため外した。残る handoff 2 ファイルに差分は出ていない

### 削除にあたって移したもの

| 元 | 先 | 理由 |
|---|---|---|
| plans2 §3 / §7〜§17 の研究根拠 | `docs/spec/adversarial-answer.md` §3 | `METHOD-ABP` と `METHOD-PREMORTEM` は原典 PDF を取得できておらず、plans2 の記述が唯一の根拠だった |
| plans2 §18 Method の分類 | `docs/spec/adversarial-answer.md` §2 | Manifest の `Role` 欄の定義元 |
| plans2 §21 PDF ルール / §34 優先度 / §37 Size Guard | `docs/spec/adversarial-answer.md` §4 | README が同梱方針の根拠として引いていた |
| plans2 §2 / §23 設計原則 | `docs/spec/adversarial-answer.md` §1 | D1〜D3 の根拠 |
| plans2 §39 やってはいけないこと | `docs/spec/adversarial-answer.md` §5 | 他に記録が無かった |

`handoff.md` §3 の D1〜D10 の根拠列は `plans2 §N` から `SPEC §N` へ付け替えた。

### 削除しなかったもの

- **`docs/PHASE7-AB.md`** — v1 との A/B の実測とリスク K1〜K6 の一次記録。計画文書と違い測定結果なので再現できない。`handoff.md` §5 が詳細を委譲している
- **`handoff.md` / `handoff-history.md`** — 現役の引き継ぎ資料 (後に `docs/` へ移動)

### 配布物

`src/` の 8 ファイルを変更したため ZIP が変わった。sha256 `07a13507…` → `88864bc9…`。

### ドキュメントの配置を整理

同日中に、引き継ぎ資料と仕様の置き場を `docs/` へ統一した。

```text
docs/
├── spec/<skill-name>.md   Skill ごとの仕様。ファイル名は src/ のディレクトリ名と揃える
├── handoff.md             現在の状態と次にやること
├── handoff-history.md     本書
└── PHASE7-AB.md           v1 との A/B 実測
plans/                     進行中の計画・調査メモ (.gitkeep のみ)
```

- `docs/SPEC.md` → `docs/spec/adversarial-answer.md`。Skill が増えたときに 1 ファイルへ混ぜないための分割
- `plans/handoff.md` → `docs/handoff.md`、`plans/handoff-history.md` → `docs/handoff-history.md`
- `plans/` は `.gitkeep` だけ残した。**進行中の計画を置く場所であり、完了したものは `docs/` へ畳み込むか削除する。** 今回の `doc-audit.md` のように、役目を終えた計画をここへ残さない

`guided-clarification` には `docs/spec/` を作っていない。`SKILL.md` 単体で完結しており、そこに書かれていない設計判断が無いため。**仕様書を作るなら実装から起こすことになり、二重管理になる。**

### 未着手

- リポジトリ Secret `SECRETS_DENYLIST` が未設定。設定するまで、CI では組織固有語の検査だけが効かない (トークン・個人情報の検査は常に動く)

---

## 2026-09-16 — ドキュメント監査の是正 (対象コミット `0191a74` 時点)

ドキュメント監査 (`plans/doc-audit.md`、是正完了に伴い削除) の所見 D-01〜D-18 に対応した。判明した事実と決定を以下に残す。

### 変わった点

- **remote の事実誤りを訂正** — 「remote 未設定」は誤り。GitHub の `origin` へ push 済みで、リポジトリは **public**。`handoff.md` §1 / §4 / §6 / §7 を現状へ更新した
- **履歴の秘密情報スキャンを実施** — public と判明したため、全コミットのテキスト blob 82 件を既存の `tools/scan-secrets.mjs` へ通した。**検出 0 件。** 使い捨てスクリプトで行ったためリポジトリには残していない
- **Router 仕様の穴を 3 つ塞いだ** — `METHOD-ROUTING.md` §4 の「担当する原則」列へ `REQUIREMENTS_MAD` / `ADVERSARIAL_COLLABORATION` を追加 (D-04)、`SKILL.md` の `DESIGN-PRINCIPLES.md` 読み込み条件へ `REQUIREMENTS_ELICITATION` 選択時を追加 (D-05)、§6 へ `Covers` 外の Method を次候補として選べる例外規則を明記 (D-06)。**36 ケースを再評価し全件 PASS のまま**
- **カバレッジ表を検証可能にした** — `ROUTER-TEST-CASES.md` の「Method 別カバレッジ」は人手集計で復元不能だった。`allowed_methods` / `forbidden_primary` から導ける定義へ置き換え、全件を列挙した
- **暗黙起動の矛盾を解消** — `allow_implicit_invocation: false` を維持し、`SKILL.md` の description を明示起動前提へ書き換えた (D-07)
- **正本の所在を明記** — Invariant Gate G1〜G7、`INDEPENDENT_FIRST` / `MINORITY_DISSENT`、Method の適用境界の 3 箇所について、どちらが正本かを 1 行ずつ書いた (D-11)
- **README / CLAUDE.md の整備** — plans2 §21 からの逸脱 (D8) の明記、`ROUTER-TEST-CASES.md` を配布物に残す理由、plans2 > plans1 の優先順位、`plans/` 編集禁止の復帰、`check` の注釈修正、selftest 件数の直書き削除、対応プロダクト列の追加

### 決めたこと

| 所見 | 決定 |
|---|---|
| D-02 | `ROUTER-TEST-CASES.md` は**配布物に残す**。理由を README へ明記。plans2 §22 / §30 に沿い、サイズも ZIP 全体の 1.5% で影響がないため |
| D-07 | **明示起動のみ。** description 側を書き換えた |
| D-16 | `package.json` の `version: 2.0.0` は**現状維持**。`private: true` のため実害なし |

### 移してきた項目

- **R2「git remote 未設定」を削除** — 事実ではなかったため。旧 R3 / R4 を R2 / R3 へ繰り上げた
- **選択肢 D を縮小** — 「GitHub 化 + Actions」のうち GitHub 化は完了済み。残りは CI 設定だけになった


### 監査で確認して問題が無かったもの

再監査時に同じ検査を繰り返さないための記録。いずれも監査時点 (2026-09-16) で一致を確認している。

- **相対リンク** — 全 Markdown の相対リンクに切れ 0 件
- **サイズ・ハッシュの記載** — `docs/PHASE7-AB.md` §4 の読み込み量は実ファイルと完全一致。「固定約 46KB」「固定約 35KB」も再計算で一致
- **Failure Mode 対応** — Method Card 9 枚の `## Covers` は Router の候補表と全 Method で一致
- **Manifest** — 13 エントリ / 同梱 6 件。`DESIGN-PRINCIPLES.md` が引く `PAPER-*` ID は全て実在し、`validate` / `verify-package` の照合も通る
- **Method Card の構造** — 9 枚すべてが plans2 §19 のテンプレート (Role / Purpose / Covers / Applicable When / Do Not Use When / Inputs / Procedure / Output / False Positive Guard / Stop Condition / Evidence / Evidence Strength / Domain Transfer / Fallback) に従う
- **Route Check** — `METHOD-ROUTING.md` §7 の RC1〜RC8 は plans2 §24 と文言まで一致
- **Invariant Gate** — `SKILL.md` の G1〜G7 は plans2 §26 と一致
- **実行モード** — `role_separated_single_model` の扱いは plans2 §28 と一致 (D6)
- **テストケース数** — `id:` は 36 件
- **guided-clarification** — `SKILL.md` 単体で完結し、内部矛盾なし

### 再監査の手順

```bash
npm run check                      # src/ 内の参照切れは validate が見る
git remote -v && git log --oneline | wc -l
grep -c "^id: " src/adversarial-answer/references/ROUTER-TEST-CASES.md
stat -c "%s %n" src/adversarial-answer/SKILL.md \
  src/adversarial-answer/references/METHOD-ROUTING.md \
  src/adversarial-answer/references/methods/METHOD-CORE-AR.md
```

突き合わせの要点は 4 つ。**(1) 件数・サイズ・ハッシュ、(2) Failure Mode と Method の対応、(3) `docs/spec/adversarial-answer.md` からの逸脱が `handoff.md` §3 に記録されているか、(4) 実行時の参照グラフと配布物の内容。**

監査の全文 (所見 D-01〜D-18 の詳細と是正計画) は `plans/doc-audit.md` にあったが、是正完了に伴い削除した。必要なら git 履歴から復元できる。

### 配布物

`SKILL.md` / `METHOD-ROUTING.md` / `DESIGN-PRINCIPLES.md` / `ROUTER-TEST-CASES.md` / `REFERENCE-MANIFEST.md` を変更したため ZIP が変わった。sha256 `5771f3ef…` → `88864bc9…`。入力が変わったので変わるのが正しい。

---

## 2026-09-16 — リポジトリルート移動とメンテナンス文書の整備 (対象コミット `c006bab` 時点)

### 変わった点

- **リポジトリルートを移動** — `D:\gpt-skills\adversarial-answer` → `D:\gpt-skills`。Skill 本体・ツール・検証内容は変更なし。`npm run check` は 0 error / 0 warn、`dist/adversarial-answer/skill.zip` の sha256 も `5771f3ef…` のまま変わっていない
- **`CLAUDE.md` を新規作成** — Skill の追加・編集手順、`npm run check` の位置づけ、編集禁止ファイル、ビルド再現性、環境上の落とし穴をまとめた。本書 §3 の決定事項と §9 の注意点への入口になっている
- **`README.md` を改稿** — 単一 Skill 前提の記述を外し、リポジトリ全体の構成図と Skill 1 つ分の構成図を分離。`references/` が `adversarial-answer` 固有である旨の重複記述を整理した
- **旧ルート名を参照していた箇所を修正** — 本書 §2 の構成図、§7 の `cd` パス、`src/references/…` 表記、`docs/PHASE2-PLAN.md` の後日注記

### 移してきた項目

なし (残作業・課題・決定事項に変更はない)

---

## 2026-09-16 — 初版 (対象コミット `11f8e09`)

`plans/phase.md` の Phase 1〜8 完了を受けて作成。

### この時点の状態

- v1 (単一論文ベース) から v2 (Failure Mode Router + Method Card + Invariant Gate) への移行が完了
- `npm run check` 0 error / 0 warn、Router Regression 36 ケース全 PASS
- `dist/skill.zip` 3.40MB / sha256 `5771f3ef…`
- 本番環境 (ChatGPT) での動作確認のみ未実施

### 主な経緯

- **フォルダ再編** — ルート直下に散っていた Skill 本体を `src/` へ移し、`tools/` `docs/` `dist/` を追加。node 製のビルドと検証を新規作成した (リポジトリに validator / package script が存在しなかったため)
- **PDF 13 本のうち 6 本を同梱** — Premortem 原典 (Wiley 1989) と ABP (RAND MR-114) は P0 だが取得・再配布条件を満たさず不足として記録。別論文への置換はしていない
- **Method Card 9 枚を作成** — 同梱 PDF がある 4 枚は原典の該当ページを実際に読んで裏付け、未取得の 5 枚は原典の実験条件・効果量に基づく主張を書かない方針とした
- **Phase 6 で DEFEATER の過剰適用を検出** — `F08 EVIDENCE` を検出しただけで DEFEATER が Primary に選ばれ、出典照合で済む事実確認を過剰な指摘へ膨らませていた。テストではなく仕様 (Card の `Do Not Use When` と ROUTING の F08 注) を修正
- **Phase 7 の敵対的レビューで 2 件を検出** — Method Card のページ引用が PDF ページと印刷ページで混在していた (RDM は 22 ページずれて読める状態)。Invariant Gate に実施結果の記録義務がなかった。どちらも修正済み
- **ZIP の再現性欠陥を修正** — JSZip が暗黙に作るフォルダエントリへ生成時刻が入り、同じ `src/` から実行のたびに別バイト列の ZIP ができていた

### 意図的な仕様逸脱

- `plans2.md` §21 は `Redistribution Allowed` が `UNKNOWN` の PDF を配布物へ同梱しないと定めるが、arXiv 標準ライセンスの 3 本と Elicitron を同梱している (ユーザー承認済み)
- 逆に、著者サイトで無償公開されていても実体が出版社の組版版である 2 本 (Adversarial Collaboration / Forecasting Tournaments) は、ユーザーの当初指示より厳格な側へ倒して除外した

### 削除したもの

- `D:\gpt-skills\adversarial-answer.zip` (v1 の配布物、408KB)。内容はコミット `6e2a38b` から復元できる
