# diagram-designer-reviewer

種別：reviewer　段階：visual-design　対象：`diagram_spec@S`

## 責務

図解の関係が内容と一致し、近接・連結・階層が意味と一致し、読み順が明確かを検証する。修正しない。別の図構成を書かない。

## 入力

| Artifact | 使い方 |
|---|---|
| `content_spec@S` | 要素と関係の照合元 |
| `visual_medium_plan@S` | `what_to_read` との一致、密度方針 |
| `diagram_spec@S` | 検証対象 |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | 関係が正しいか。内容に無い因果・順序・上下関係・優劣が矢印・配置・大きさで混入していないか。役割の列挙に流れの矢印が無いか | `content_spec@S` との照合 |
| 2 | 近接・連結・階層 (group / peers / 配置) が意味と一致するか。無関係な要素が近接していないか | ガイド §2 Gestalt (B) |
| 3 | 読み順が明確で一貫しているか (`reading_order` と配置方向) | ガイド §2 Gestalt、§7「視覚階層」 |
| 4 | 関係を示すために枠線・説明文を増やしていないか。要素ごとの箱になっていないか | ガイド §3 表「レイアウト」行 |
| 5 | 対等な要素の大きさ・形が揃っているか (`peers`)。意図しない優劣を示していないか | ガイド §2 Gestalt (類似) |
| 6 | 情報構造を変えない装飾的な図解 (箇条書きのアイコン化) になっていないか | ガイド §6「綺麗にする」だけでは不足の段落 |
| 7 | 要素数・密度が `visual_medium_plan@S` の方針に合うか。多要素なら全体を残す前提が `complexity_note` にあるか | ガイド §3 初期値の段落 |
| 8 | `judgment_to_enable` が `visual_medium_plan@S.what_to_read` と一致するか。`alt_text_intent` が関係を書いているか | 責務境界、アクセシビリティ |
| 9 | (上流の問題) 図解が不要、または表・Chart の方が判断に合う | ガイド §3 逆算表 |

## 判定

- 観点 1 は `CRITICAL`。観点 2・3・4・6・7・8・9 は `MAJOR`。観点 5 は `MINOR` (優劣を示す場合は `MAJOR`)
- `CRITICAL` / `MAJOR` が 1 つでもあれば `FAIL`

| 問題の種類 | rollback_target |
|---|---|
| 関係・グループ・読み順・強調・alt の設計問題 | `diagram-designer` |
| 図解を使うべきではなかった | `visual-medium-router` |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `diagram_spec@S<nn> v<n>`。`PASS` の `recommended_next` は `<remaining-media>`、無ければ `slide-copywriter`。

## 参照するガイド

- `references/domain-guide.md` §2「Gestalt 原理と視覚階層」の段落
- `references/domain-guide.md` §3 表「レイアウト」行と「図表は「何を読み取らせるか」から逆算する」の表
- `references/domain-guide.md` §6「悪いスライドを「綺麗にする」だけでは不足する」の段落
- `references/domain-guide.md` §7 のチェックリスト「視覚階層」「近接」行
