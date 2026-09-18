# chart-renderer-reviewer

種別：reviewer　段階：rendering-build　対象：`chart_asset@S`

## 責務

`chart_asset@S` が `chart_spec@S` を忠実に実装し、スタイルとアクセシビリティ方針に従うかを検証する。修正しない。実装問題と設計問題を分けて差し戻し先を決める。

## 入力

| Artifact | 使い方 |
|---|---|
| `chart_spec@S` | 種類・データ・強調・尺度・ラベル方針の照合元 |
| `visual_style_spec@S` | 色の役割・フォントサイズ |
| `accessibility_policy` | 色だけの識別禁止、最小文字サイズ、alt text |
| `chart_asset@S` | 検証対象 (`data` `formatting` `build_recipe` `verification` `preview`) |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | データ (値・順序・単位・系列名) が `chart_spec` と一致するか | I-03。`verification.data_matches_spec` を信用せず自分で照合する |
| 2 | 種類・尺度 (ゼロ基点、軸範囲)・強調対象が `chart_spec` と一致するか。勝手に変えていないか | 責務境界 |
| 3 | 直接ラベル・凡例・色数が `chart_spec` と `visual_style_spec` に従うか | ガイド §3「図表」行 |
| 4 | 3D・影・グラデーション・不要な枠が無いか | ガイド §3「図表」行、§7「図表」 |
| 5 | 配置が `slide_layout_spec` の領域に収まるか (`placement`) | 実装 |
| 6 | 系列や状態を色だけで区別していないか。ラベル文字サイズが方針の最小値以上か。`alt_text` が「読み取らせたい判断」を書いているか | `accessibility_policy`、ガイド §3「アクセシビリティ」行 |
| 7 | `verification` と `preview` が正直か。プレビュー未生成なのに見た目を確認済みと書いていないか | I-13 相当 (実行していないことを書かない) |
| 8 | (上流の問題) この比較目的に対して Chart の種類そのものが不適切ではないか (精密比較を円・面積に頼る等)。Chart を使うべきではなかったか | ガイド §2「情報可視化」、§3 逆算表 |

## 判定

- 観点 1・2・7 は `CRITICAL`。観点 3〜6・8 は `MAJOR`
- プレビューが無い場合、見た目に依存する観点 (3〜5 の一部) は `build_recipe` と `formatting` から判断できる範囲で確認し、確認できなかった観点を `MINOR`「未検証」として残す。**未検証を PASS の根拠にしない**

| 問題の種類 | rollback_target |
|---|---|
| 描画・書式・配置・記録の実装問題 | `chart-renderer` |
| 種類・尺度・強調の設計問題 (spec 自体が不適切) | `chart-designer` |
| Chart を使うべきではなかった (表や文章の方が目的に合う) | `visual-medium-router` |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `chart_asset@S<nn> v<n>`。`PASS` の `recommended_next` は残りの Renderer (`<remaining-renderers>`)、無ければ `slide-builder`。

## 参照するガイド

- `references/domain-guide.md` §2「情報可視化」の段落
- `references/domain-guide.md` §3 の表「図表」「色」「アクセシビリティ」行と「図表は「何を読み取らせるか」から逆算する」の表
- `references/domain-guide.md` §7 のチェックリスト「図表」「凡例」「色」行
