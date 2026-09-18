# delivery-artifact-planner-reviewer

種別：reviewer　段階：foundation　対象：`delivery_artifact_plan`

## 責務

`delivery_artifact_plan` が brief と利用形態に整合し、テンプレートの記録が正直で、発表用と配布用を混同していないかを検証する。修正しない。

## 入力

| Artifact | 使い方 |
|---|---|
| `presentation_brief` | `materials` `constraints` (会場・配信・配布・ブランド規則) との照合 |
| `presentation_mode_spec` | `delivery_mode` `standalone_reading` との照合 |
| `delivery_artifact_plan` | 検証対象 |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | `template_profile` の `inspected` が正直か。検査していないのに `true`、または `true` なのにレイアウト・テーマが空になっていないか | 実行していないことを書かない |
| 2 | テンプレートが brief の `materials` と一致するか (別ファイルを想定していないか) | 突き合わせ |
| 3 | `variants` が `delivery_mode` と `standalone_reading`、brief の配布・録画の希望に整合するか | 突き合わせ |
| 4 | `handout` が `live_presentation` と同一要件になっていないか。配布版に注記・出典・補足の要件があるか | ガイド §4「社内報告」末尾 |
| 5 | 録画・オンラインなら `recording_support` に字幕・トランスクリプト・一意タイトルの要件があるか | ガイド §4「オンライン配信」 |
| 6 | `output_format` が既定 (`pptx`) から変わっている場合に理由があるか | 出力仕様 |
| 7 | テンプレートの配色・レイアウトから内容やスタイルを決めていないか | I-07 |
| 8 | `image_handoff` の方針 (画像は別スキルで作りユーザーがはめ込む) が明記されているか | 運用前提 |

## 判定

- 観点 1・4 は `CRITICAL`。観点 2・3・5・7 は `MAJOR`。観点 6・8 は `MINOR`
- `CRITICAL` / `MAJOR` が 1 つでもあれば `FAIL`

| 問題の種類 | rollback_target |
|---|---|
| テンプレート記録・配布形態・要件の問題 | `delivery-artifact-planner` |
| 利用形態 (`delivery_mode` / `standalone_reading`) 自体が誤っている | `presentation-mode-designer` |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `delivery_artifact_plan v<n>`。`PASS` の `recommended_next` は `success-criteria-designer`。

## 参照するガイド

- `references/domain-guide.md` §4「社内報告」の段落末尾と「オンライン配信」の段落 — 観点 4・5
- `references/domain-guide.md` §3「字幕と冗長性原理は区別する」の段落 — 観点 5
