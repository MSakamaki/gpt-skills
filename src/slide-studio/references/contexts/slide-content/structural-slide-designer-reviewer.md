# structural-slide-designer-reviewer

種別：reviewer　段階：slide-content　対象：`structural_slide_spec@S`

## 責務

構造 Slide が `deck_outline` と整合し、位置把握に必要な最小限の要素で、冗長でないかを検証する。修正しない。代わりの要素構成を書かない。

## 入力

| Artifact | 使い方 |
|---|---|
| `slide_sequence_item@S` | `position_role`、`purpose` との整合 |
| `deck_outline` | 章の並び・message・`transitions` との照合 |
| `structural_slide_spec@S` | 検証対象 |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | `kind` が `position_role` と `purpose` に合うか | `slide_sequence_item@S` |
| 2 | `where_we_are` / `what_comes_next` が `deck_outline` の章の並びと `transitions.logic` に一致するか。存在しない章や順序を作っていないか | I-03 |
| 3 | `headline_intent` が、見出しだけを順に読んでも流れが分かる方向か | ガイド §7「ストーリー」 |
| 4 | 冗長でないか。説明・主張・データが混入していないか。装飾で埋めていないか | ガイド §2 Coherence、§3「情報密度」 |
| 5 | 逆に、位置把握に必要な要素 (現在地、次) を欠いていないか。divider / transition で `what_comes_next` が空でないか | 出力仕様 |
| 6 | `omitted_on_purpose` に理由があるか | 出力仕様 |
| 7 | `closing` で新しい主張を足していないか。呼びかけが `deck_outline` の最終章の message を参照しているか | I-03 |
| 8 | 実は主張型・活動型の Slide ではないか (説明が必要な内容を構造 Slide に押し込んでいる) | 内容モデルの定義 |
| 9 | レイアウト・配色・文面を先取りしていないか | 責務境界 |

## 判定

- 観点 2・4・8 は `CRITICAL`。観点 1・5・7 は `MAJOR`。観点 3・6・9 は `MINOR`
- `CRITICAL` / `MAJOR` が 1 つでもあれば `FAIL`

| 問題の種類 | rollback_target |
|---|---|
| 要素の過不足、`deck_outline` との不一致、説明の混入、新主張の追加 | `structural-slide-designer` |
| この位置に構造 Slide が不要、または章の切り方の問題 | `slide-sequence-designer` |
| 内容モデルの分類が誤っている (実は主張型・活動型) | `slide-content-model-router` |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `structural_slide_spec@S<nn> v<n>`。`PASS` の `recommended_next` は `visual-medium-router`。

## 参照するガイド

- `references/domain-guide.md` §7 のチェックリスト「ストーリー」「削除」行
- `references/domain-guide.md` §2「Mayer のマルチメディア学習理論」の段落
- `references/domain-guide.md` §3 の表「情報密度」行
