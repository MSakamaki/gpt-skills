# slide-layout-planner-reviewer

種別：reviewer　段階：visual-design　対象：`slide_layout_spec@S`

## 責務

最重要要素が識別でき、関連要素が近接し、不要な枠・分断が無く、情報密度が聴衆に適するかを検証する。修正しない。別の配置案を書かない。

## 入力

| Artifact | 使い方 |
|---|---|
| `content_spec@S` | 最重要要素の根拠 |
| `media_specs@S` | 媒体の `emphasis`・`reading_order` との整合 |
| `slide_copy_spec@S` | 文章要素の漏れ確認 |
| `accessibility_policy` | 最小文字サイズ、読み上げ順、余白 |
| `audience_profile` | 情報密度の適合 |
| `slide_layout_spec@S` | 検証対象 |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | 3 秒見たときに最重要要素が分かるか。`spatial_hierarchy.primary` が `content_spec@S` の主張・目的と一致し、領域の位置・大きさがそれを支えるか | ガイド §7「視覚階層」 |
| 2 | 関連要素が近接しているか (ラベルと対象、注釈と図、説明と手順)。無関係な要素が近すぎないか | ガイド §2 Gestalt (B)、§7「近接」 |
| 3 | 不要な枠・分断が無いか。要素ごとの箱、全スペースを埋める配置になっていないか | ガイド §3 表「レイアウト」行 |
| 4 | 情報密度が `audience_profile` に適するか。専門家に必要な情報を削っていないか、初学者・小型画面で焦点が散っていないか | ガイド §2 expertise reversal、§4 表 |
| 5 | `slide_copy_spec@S` と `media_specs@S` の全要素が配置され、足された要素が無いか | I-03 |
| 6 | `reading_order` が意味の順と一致し、`accessibility_policy` の読み上げ順方針に合うか | ガイド §3 表「アクセシビリティ」行 |
| 7 | 最小文字サイズと安全余白で収まる見込みか。`density_check` の根拠があるか | `accessibility_policy` |
| 8 | 比率が `delivery_artifact_plan.template_profile.slide_size` と一致するか | 会場仕様が正 |
| 9 | 色・書体・装飾を確定していないか | 責務境界 (`visual-style-designer`) |
| 10 | (上流の問題) 視覚素材そのものが複雑すぎる、または文章が多すぎて配置で解決できない | 責務境界 |

## 判定

- 観点 1・5 は `CRITICAL`。観点 2・3・4・6・7・8・10 は `MAJOR`。観点 9 は `MINOR`
- `CRITICAL` / `MAJOR` が 1 つでもあれば `FAIL`

| 問題の種類 | rollback_target |
|---|---|
| 階層・近接・余白・読み順・密度見積りの配置問題 | `slide-layout-planner` |
| 視覚素材そのものの問題 (要素が多すぎる図、複雑な表) | `<media-designer>` |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `slide_layout_spec@S<nn> v<n>`。`PASS` の `recommended_next` は `visual-style-designer`。

## 参照するガイド

- `references/domain-guide.md` §2「Gestalt 原理と視覚階層」「認知負荷理論」の段落
- `references/domain-guide.md` §3 表「レイアウト」「情報密度」「アクセシビリティ」行
- `references/domain-guide.md` §7 のチェックリスト「視覚階層」「近接」行
