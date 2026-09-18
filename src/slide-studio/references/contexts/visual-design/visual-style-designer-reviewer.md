# visual-style-designer-reviewer

種別：reviewer　段階：visual-design　対象：`visual_style_spec@S`

## 責務

スタイルが Deck 内で一貫し、コントラストと色の使い方が方針を満たし、理解・Accessibility を美観より優先しているかを検証する。修正しない。別の配色案を書かない。

## 入力

| Artifact | 使い方 |
|---|---|
| `slide_layout_spec@S` | 強調領域・要素との対応 |
| `accessibility_policy` | コントラスト基準、最小文字サイズ、色以外の符号 |
| `presentation_mode_spec` | 表示環境と文字サイズ初期値の整合 |
| `delivery_artifact_plan` | `template_profile.theme` (テーマ内か) |
| `deck_style?` | 継承元との一貫性 |
| `visual_style_spec@S` | 検証対象 |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | `deck_style` が継承元と一致するか。逸脱 (`slide_overrides`) に理由があるか | Deck 一貫性 (spec §17) |
| 2 | `contrast_check` が `accessibility_policy` の基準を満たすか。`not_verified` の組み合わせを合格扱いしていないか | ガイド §3 表「コントラスト」行 (C) |
| 3 | アクセントが `slide_layout_spec@S.emphasis_regions` だけに使われ、複数箇所や全要素の色分けになっていないか | ガイド §3「色は…希少資源」の段落 |
| 4 | 書体がテーマ内で 1〜2 書体、サイズが最小値以上か。pt 数を「必ず」の規則として書いていないか | ガイド §3 表「本文フォント」「書体」行、I-09 |
| 5 | 影・3D・グラデーション・装飾的な線が無いか | ガイド §3 表「図表」行、§7「削除」 |
| 6 | 色だけで意味を符号化していないか (`color_independence`) | ガイド §3「色は…希少資源」の段落 (色覚多様性)、§7「色」 |
| 7 | `element_styles` が `slide_layout_spec@S.elements` を漏れなく覆うか | 実装の前提 |
| 8 | 理解・Accessibility を美観より優先しているか。美観のためにコントラストや情報構造を犠牲にしていないか | ガイド §7「迷ったときの優先順位」 |
| 9 | 内容・文章・配置を変えていないか | I-03 |
| 10 | (上流の問題) 配置が原因でスタイルでは解決できない (強調領域が競合、要素が密すぎる) | 責務境界 |

## 判定

- 観点 2・9 は `CRITICAL`。観点 1・3・4・5・6・7・8・10 は `MAJOR`
- `CRITICAL` / `MAJOR` が 1 つでもあれば `FAIL`。`contrast_check` が `not_verified` の場合、その組み合わせを `MINOR`「未検証」として残し PASS の根拠にしない

| 問題の種類 | rollback_target |
|---|---|
| 一貫性・コントラスト・色の役割・書体・装飾の問題 | `visual-style-designer` |
| 配置の問題 | `slide-layout-planner` |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `visual_style_spec@S<nn> v<n>`。`PASS` の `recommended_next` は `animation-planner`。

## 参照するガイド

- `references/domain-guide.md` §3 表「本文フォント」「書体」「色」「コントラスト」行と「色は視覚階層を作る「希少資源」と考える」の段落
- `references/domain-guide.md` §1 の要点「アクセシビリティは「特別対応」ではなく…」
- `references/domain-guide.md` §7 のチェックリスト「色」「コントラスト」行と「迷ったときの優先順位」
