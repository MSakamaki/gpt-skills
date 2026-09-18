# diagram-renderer-reviewer

種別：reviewer　段階：rendering-build　対象：`diagram_asset@S`

## 責務

`diagram_asset@S` が `diagram_spec@S` を忠実に実装し、関係を位置と線で正しく示し、スタイルとアクセシビリティ方針に従うかを検証する。修正しない。実装問題と設計問題を分けて差し戻し先を決める。

## 入力

| Artifact | 使い方 |
|---|---|
| `diagram_spec@S` | ノード・エッジ・グループ・読み順・強調の照合元 |
| `visual_style_spec@S` | 色の役割・線の様式・フォントサイズ |
| `accessibility_policy` | 色だけの区別禁止、最小文字サイズ、読み上げ順、alt text |
| `diagram_asset@S` | 検証対象 (`nodes` `edges` `groups` `shape_order` `build_recipe` `verification` `preview`) |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | ノード (id・ラベル) とエッジ (from・to・種類) が `diagram_spec` と一致するか。増減が無いか | I-03。`verification` を信用せず自分で照合する |
| 2 | `diagram_spec` に無い矢印・階層・順序・優劣を、位置や線で作っていないか (並列の要素を上下に並べて階層に見せる等) | 元の内容に無い関係を足さない |
| 3 | 近接・連結・共通領域が意味と一致するか。同じグループが離れていないか、無関係な要素が近すぎないか | ガイド §2「Gestalt 原理と視覚階層」 |
| 4 | 読み順 (`shape_order`) が `diagram_spec` の読み順と一致し、自然に追えるか | `accessibility_policy` の読み上げ順 |
| 5 | 線が均一で、影・3D・グラデーション・装飾アイコンが無いか。グループを枠線で囲んでいないか | ガイド §3「レイアウト」行、`visual_style_spec` |
| 6 | 強調が `diagram_spec` の指定ノードだけで、関係の種類を色だけで区別していないか (線の様式やラベルを併用) | ガイド §3「色」の段落、`accessibility_policy` |
| 7 | 文字サイズが方針の最小値以上か。配置が `slide_layout_spec` の領域に収まるか | `accessibility_policy`、実装 |
| 8 | `alt_text` が示したい関係を書いているか (「図」だけでないか) | `accessibility_policy` |
| 9 | `verification` と `preview` が正直か。プレビュー未生成なのに見た目を確認済みと書いていないか | 実行していないことを書かない |
| 10 | (上流の問題) 要素が多すぎて関係が読めない、図解より表や文章が目的に合う、といった設計問題が無いか | ガイド §3「情報密度」行 |

## 判定

- 観点 1・2・9 は `CRITICAL`。観点 3〜8・10 は `MAJOR`
- プレビューが無い場合、見た目に依存する観点 (3・5・7 の一部) は座標・`build_recipe`・`formatting` から判断できる範囲で確認し、確認できなかった観点を `MINOR`「未検証」として残す。**未検証を PASS の根拠にしない**

| 問題の種類 | rollback_target |
|---|---|
| 位置・線・書式・順序・記録の実装問題 | `diagram-renderer` |
| 関係の定義・要素数・読み順の設計問題 (spec 自体が不適切) | `diagram-designer` |
| 図解を使うべきではなかった (表や文章の方が目的に合う) | `visual-medium-router` |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `diagram_asset@S<nn> v<n>`。`PASS` の `recommended_next` は残りの Renderer (`<remaining-renderers>`)、無ければ `slide-builder`。

## 参照するガイド

- `references/domain-guide.md` §2「Gestalt 原理と視覚階層」の段落
- `references/domain-guide.md` §3 の表「レイアウト」「色」「情報密度」行
- `references/domain-guide.md` §7 のチェックリスト「視覚階層」「近接」「色」行
