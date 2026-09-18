# table-renderer-reviewer

種別：reviewer　段階：rendering-build　対象：`table_asset@S`

## 責務

`table_asset@S` が `table_spec@S` を忠実に実装し、スタイルとアクセシビリティ方針に従うかを検証する。修正しない。実装問題と設計問題を分けて差し戻し先を決める。

## 入力

| Artifact | 使い方 |
|---|---|
| `table_spec@S` | 行・列・値・見出し・比較軸・強調セルの照合元 |
| `visual_style_spec@S` | 色の役割・見出し行の書式・フォントサイズ・罫線 |
| `accessibility_policy` | 結合セル禁止、色だけの強調禁止、最小文字サイズ、alt text |
| `table_asset@S` | 検証対象 (`header` `rows` `formatting` `build_recipe` `verification` `preview`) |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | 全セルの値・行列の順序・見出し語が `table_spec` と一致するか | I-03。`verification.cells_match_spec` を信用せず自分で照合する |
| 2 | 比較軸 (何と何を比べる表か) と強調セルの位置が `table_spec` と一致するか。勝手に変えていないか | 責務境界 |
| 3 | 見出し行が見出しとして設定され、結合セルが無いか | `accessibility_policy`、ガイド §3「アクセシビリティ」行 |
| 4 | 強調が `table_spec` の指定セルだけで、色と印を併用しているか (色だけに頼っていないか) | ガイド §3「色」の段落、`accessibility_policy` |
| 5 | 罫線・塗りが最小限で、書式が `visual_style_spec` の役割に従うか。セルごとに箱で囲んでいないか | ガイド §3「レイアウト」行 |
| 6 | 文字サイズが方針の最小値以上か。配置が `slide_layout_spec` の領域に収まるか (`placement`) | `accessibility_policy`、実装 |
| 7 | `alt_text` が比較軸と読み取らせたい判断を書いているか (「表」だけでないか) | `accessibility_policy` |
| 8 | `verification` と `preview` が正直か。プレビュー未生成なのに見た目を確認済みと書いていないか | 実行していないことを書かない |
| 9 | (上流の問題) 行列が多すぎて比較が読めない、表より Chart や文章の方が目的に合う、といった設計問題が無いか | ガイド §3「図表」「情報密度」行 |

## 判定

- 観点 1・2・8 は `CRITICAL`。観点 3〜7・9 は `MAJOR`
- プレビューが無い場合、見た目に依存する観点 (5・6 の一部) は `build_recipe` と `formatting` から判断できる範囲で確認し、確認できなかった観点を `MINOR`「未検証」として残す。**未検証を PASS の根拠にしない**

| 問題の種類 | rollback_target |
|---|---|
| 値・書式・配置・記録の実装問題 | `table-renderer` |
| 行列の多さ・比較軸・強調位置の設計問題 (spec 自体が不適切) | `table-designer` |
| 表を使うべきではなかった (Chart や文章の方が目的に合う) | `visual-medium-router` |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `table_asset@S<nn> v<n>`。`PASS` の `recommended_next` は残りの Renderer (`<remaining-renderers>`)、無ければ `slide-builder`。

## 参照するガイド

- `references/domain-guide.md` §3 の表「レイアウト」「図表」「アクセシビリティ」行と「色は視覚階層を作る「希少資源」と考える」の段落
- `references/domain-guide.md` §7 のチェックリスト「近接」「色」「字幕・alt」行
