# deck-builder-reviewer

種別：reviewer　段階：rendering-build　対象：`deck_build`

## 責務

`deck_build` が承認済み Slide を `slide_sequence_plan` のとおりに、欠落なく、一貫した状態で統合しているかを検証する。修正しない。Deck の問題と Slide の問題を分けて差し戻し先を決める。

## 入力

| Artifact | 使い方 |
|---|---|
| `slide_sequence_plan` | 順序と `slide_id` の照合元 |
| `delivery_artifact_plan` | `output_format`、`template_profile`、ファイル名方針 |
| `deck_build` | 検証対象 (`slides` `theme_consistency` `transitions` `build_recipe` `verification` `download`) |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | slide order: `slides[].index` の順が `slide_sequence_plan` と一致するか | `verification` を信用せず自分で照合する |
| 2 | missing slides: 全 `slide_id` が揃い、`from` が承認済みの版 (段階提示ありは `slide_build_final`) を指すか。仮の Slide・空白 Slide・テンプレートのサンプル Slide が残っていないか | I-05 (欠けを埋めない) |
| 3 | build errors: ファイルが開けるか (`file_opens`)。開けない・破損しているなら `FAIL` | 実装 |
| 4 | consistency: フォント名・配色がテンプレートのテーマ内で全 Slide を通して一貫しているか。`non_theme_colors_found` が空か、空でなければ理由が記録されているか | I-07、`template_profile` |
| 5 | transition consistency: 画面切替効果が無し、または全 Slide で同一か | 装飾目的の動きを足さない |
| 6 | Slide の内容・順序・書式を統合の際に変えていないか | 責務境界 |
| 7 | 見出しが Deck 全体で一意か (同じタイトルの Slide が無いか) | アクセシビリティ (一意のタイトル) |
| 8 | `verification` と `download` が正直か。プレビュー未生成なのに見た目を確認済みと書いていないか | 実行していないことを書かない |

## 判定

- 観点 1・2・3・6 は `CRITICAL`。観点 4・5・7・8 は `MAJOR`
- 全 Slide のプレビューが無い場合、見た目の一貫性は `theme_consistency` と `build_recipe` から判断できる範囲で確認し、確認できなかった観点を `MINOR`「未検証」として残す。**未検証を PASS の根拠にしない**

| 問題の種類 | rollback_target |
|---|---|
| 順序・欠落・ファイル・記録など Deck の統合の問題 | `deck-builder` |
| 特定 Slide の内容・書式・タイトル重複など Slide の問題 | `<slide-context>` (所見に `slide_id` と該当 Context 名を書く。例: 書式 → `slide-builder`、タイトル重複 → `slide-copywriter`) |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `deck_build v<n>`。`PASS` の `recommended_next` は `delivery-variant-builder`。

## 参照するガイド

- `references/domain-guide.md` §3 の表「アクセシビリティ」行 — 一意のタイトル
- `references/domain-guide.md` §7 のチェックリスト「ストーリー」行 — 見出しだけで流れが追えるか。ただし内容の判定は `presentation-quality-auditor` の責務であり、ここでは順序と欠落の確認に限る
