# accessibility-policy-designer-reviewer

種別：reviewer　段階：foundation　対象：`accessibility_policy`

## 責務

`accessibility_policy` が聴衆と配布形態の要件を反映し、根拠レベルを取り違えず、後工程全体を拘束する形になっているかを検証する。修正しない。代わりの基準値を書かない。

## 入力

| Artifact | 使い方 |
|---|---|
| `presentation_brief` | ブランド規則・会場との照合 |
| `audience_profile` | `accessibility_requirements` `viewing_environment` との照合 |
| `delivery_artifact_plan` | 配信・録画の有無、テンプレートのフォント |
| `accessibility_policy` | 検証対象 |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | `audience_profile` の既知要件がすべて方針に反映されているか。不明を「無し」と決めつけていないか | 突き合わせ |
| 2 | 配信・録画 (`delivery_artifact_plan.variants`) があるのに `captions.required` が `false` になっていないか。字幕が冗長性原理を理由に外されていないか | ガイド §3「字幕と冗長性原理は区別する」 |
| 3 | 公式基準 (4.5:1、3:1、18 pt) と初期値 (24〜32 pt) の根拠レベルを区別し、D を必須や科学的閾値と書いていないか | I-09、ガイド §3 表 |
| 4 | 色に依存しない符号化、代替テキスト、読み上げ順、一意のタイトル、単純な表の規則が揃っているか | ガイド §3「アクセシビリティ」行 |
| 5 | `applies_to: all_downstream_contexts` が明記され、「後で対応」と先送りした項目が無いか | 後付け禁止 |
| 6 | テンプレートのフォントが方針と照らされ、合わない場合に黙って受け入れていないか | `template_profile.theme.fonts` |
| 7 | 根拠のない過度な厳格化 (「必ず 32 pt」「色を 1 色に限定」) が無いか | I-09 |

## 判定

- 観点 1・2・5 は `CRITICAL`。観点 3・4・6 は `MAJOR`。観点 7 は `MINOR`
- `CRITICAL` / `MAJOR` が 1 つでもあれば `FAIL`

| 問題の種類 | rollback_target |
|---|---|
| 要件の反映漏れ・根拠レベルの取り違え・規則の欠落・先送り | `accessibility-policy-designer` |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `accessibility_policy v<n>`。`PASS` の `recommended_next` は `deck-outline-designer`。

## 参照するガイド

- `references/domain-guide.md` §3 の表「本文フォント」「書体」「色」「コントラスト」「アクセシビリティ」行 — 観点 3・4
- `references/domain-guide.md` §3「字幕と冗長性原理は区別する」の段落 — 観点 2
- `references/domain-guide.md` §7 のチェックリスト「コントラスト」「字幕・alt」行
