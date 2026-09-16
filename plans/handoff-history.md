# handoff.md 改訂履歴

[handoff.md](handoff.md) の肥大化を防ぐため、過去の経緯はこちらへ移す。

## 運用

- `handoff.md` は常に「現在の状態と次にやること」だけを書く。完了した残作業、解消した課題、覆された決定事項は本書へ移してから `handoff.md` から削除する
- 1 改訂 = 1 セクション。新しいものを上に追加する
- 各セクションには、対象コミット、変わった点、`handoff.md` から移してきた項目を書く

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
