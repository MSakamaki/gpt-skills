# table-designer-reviewer

種別：reviewer　段階：visual-design　対象：`table_spec@S`

## 責務

表の比較軸が明確で、必要以上に複雑でなく、強調位置が明確かを検証する。修正しない。別の表構成を書かない。

## 入力

| Artifact | 使い方 |
|---|---|
| `content_spec@S` | データの照合元と結論 |
| `visual_medium_plan@S` | `what_to_read` との一致、密度方針 |
| `table_spec@S` | 検証対象 |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | 比較軸が明確か。行・列の意味が見出しだけで分かるか。見出し行があるか | ガイド §3 表「アクセシビリティ」行 (単純な表) |
| 2 | 必要以上に複雑でないか。結合セル、判断に寄与しない列・行、入れ子の見出し | ガイド §3 表「アクセシビリティ」行、§2 認知負荷理論 (外在的負荷) |
| 3 | 強調位置が明確で、結論に対応しているか。全セル強調になっていないか | `content_spec@S` の結論、ガイド §3「色は…希少資源」 |
| 4 | データが `content_spec@S` と一致するか (改変・補完・欠落) | I-03 |
| 5 | `judgment_to_enable` が `visual_medium_plan@S.what_to_read` と一致するか | 責務境界 |
| 6 | 同じ役割の列が同じ形式か。桁が揃うか。単位が見出しにあるか | ガイド §2 Gestalt (類似)、日本語実務 (整列・反復) |
| 7 | 密度が `visual_medium_plan@S` の方針に合うか。読めない見込みの表を放置していないか | ガイド §4 表「1枚あたりの情報量」 |
| 8 | `alt_text_intent` が読み取らせる判断を書いているか | アクセシビリティを後付けしない |
| 9 | (上流の問題) 量の差を読ませたい内容で、表より Chart が判断に合う | ガイド §3 逆算表 |

## 判定

- 観点 1・4 は `CRITICAL`。観点 2・3・5・7・8・9 は `MAJOR`。観点 6 は `MINOR`
- `CRITICAL` / `MAJOR` が 1 つでもあれば `FAIL`

| 問題の種類 | rollback_target |
|---|---|
| 軸・見出し・単純化・強調・alt の設計問題 | `table-designer` |
| 表を使うべきではなかった (Chart や文の方が合う) | `visual-medium-router` |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `table_spec@S<nn> v<n>`。`PASS` の `recommended_next` は `<remaining-media>`、無ければ `slide-copywriter`。

## 参照するガイド

- `references/domain-guide.md` §3 表「アクセシビリティ」行と「図表は「何を読み取らせるか」から逆算する」の表
- `references/domain-guide.md` §2「Gestalt 原理と視覚階層」と日本語の実務研究の段落
- `references/domain-guide.md` §7 のチェックリスト「視覚階層」「色」行
