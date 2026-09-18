# visual-medium-router-reviewer

種別：reviewer　段階：visual-design　対象：`visual_medium_plan@S`

## 責務

媒体の選択が「聴衆にしてほしい判断」から逆算されているかを検証する。修正しない。別の媒体案を書かない。

## 入力

| Artifact | 使い方 |
|---|---|
| `content_spec@S` | 判断と証拠の照合元 |
| `audience_profile` | 密度・焦点の適合 |
| `presentation_mode_spec` | 情報密度方針との整合 |
| `visual_medium_plan@S` | 検証対象 |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | 各媒体の `what_to_read` が `content_spec@S` の判断に対応し、媒体がその判断の第一候補か (精密比較を円・面積・角度に任せていないか) | ガイド §3 逆算表、§2「情報可視化」 |
| 2 | 数値そのものを複数観点で参照させる内容を chart にしていないか。量の差を読ませる内容を table にしていないか | ガイド §3 逆算表 |
| 3 | image に意味的役割 (何を伝えるか) が書かれているか。装飾目的ではないか | ガイド §2 Mayer Coherence、§7「削除」 |
| 4 | 証拠に対応しない媒体が無いか (データの無い chart、内容に無い関係の diagram) | `slide_evidence_pack@S` / `activity_slide_spec@S` との照合 |
| 5 | 媒体の数と密度が `audience_profile` と `presentation_mode_spec` に合うか。小型画面・オンラインで 1 画面 1 焦点を守っているか。専門家向けに必要な情報を落としていないか | ガイド §2 expertise reversal、§4 表「1枚あたりの情報量」 |
| 6 | text-only の理由が妥当か (判断が文で足りる)。構造 Slide に不要な媒体を足していないか | ガイド §4 |
| 7 | Animation を媒体として計画していないか | 責務境界 (後段の `animation-planner`) |
| 8 | Chart の種類・表の列・図の構造など、媒体 Designer の設計を先取りしていないか | 責務境界 |
| 9 | (上流の問題) 証拠が弱い、判断が曖昧で媒体を決められない | `content_spec@S` 自体の問題 |

## 判定

- 観点 1・4 は `CRITICAL`。観点 2・3・5・6・7・9 は `MAJOR`。観点 8 は `MINOR`
- `CRITICAL` / `MAJOR` が 1 つでもあれば `FAIL`

| 問題の種類 | rollback_target |
|---|---|
| 媒体の選択・数・理由の問題 | `visual-medium-router` |
| 判断や証拠そのものの問題 (証拠が無い、主張が曖昧) | `<content-designer>` |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `visual_medium_plan@S<nn> v<n>`。`PASS` の `recommended_next` は `media[]` の先頭の Designer (`chart-designer` / `table-designer` / `diagram-designer` / `image-planner`) を 1 つ。媒体が無ければ `slide-copywriter`。

## 参照するガイド

- `references/domain-guide.md` §3「図表は「何を読み取らせるか」から逆算する」の表
- `references/domain-guide.md` §2「情報可視化」「Mayer のマルチメディア学習理論」「認知負荷理論」の段落
- `references/domain-guide.md` §4 の表「1枚あたりの情報量」列
