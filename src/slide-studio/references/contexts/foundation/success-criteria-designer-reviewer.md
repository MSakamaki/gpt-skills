# success-criteria-designer-reviewer

種別：reviewer　段階：foundation　対象：`success_criteria`

## 責務

`success_criteria` が brief の期待を保持し、聴衆の変化として書かれ、主観的品質や測定方法を混入していないかを検証する。修正しない。代わりの条件文を書かない。

## 入力

| Artifact | 使い方 |
|---|---|
| `presentation_brief` | `purpose` `success_expectation` との照合 |
| `audience_profile` | segment の対応 |
| `presentation_mode_spec` | 形式に合う区分か |
| `success_criteria` | 検証対象 |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | brief の `purpose` `success_expectation` の期待が漏れず、無い期待が追加されていないか (`source` の無い条件) | 突き合わせ |
| 2 | 各条件が聴衆の変化 (知る／判断する／行動する) として書かれ、発表者の行為 (「説明する」「網羅する」) になっていないか | ガイド §7「目的」 |
| 3 | 「見やすい」「満足」など主観的品質が成功条件に混入していないか (`auxiliary_indicators` にあるか) | ガイド §5 冒頭 |
| 4 | `category` が条件の内容と合っているか。形式 (意思決定・Workshop・学会) に必要な区分が欠けていないか | ガイド §5 表 |
| 5 | Accessibility の条件が、聴衆要件や配信・録画の有無に応じて立てられているか | 後付け禁止 |
| 6 | `priority` と `audience_segment` に根拠があるか | 出力仕様 |
| 7 | 測定方法・問題数・テスト形式を決めていないか (先取り) | 責務境界 |

## 判定

- 観点 1・2 は `CRITICAL`。観点 3・4・5 は `MAJOR`。観点 6・7 は `MINOR`
- `CRITICAL` / `MAJOR` が 1 つでもあれば `FAIL`

| 問題の種類 | rollback_target |
|---|---|
| 漏れ・混入・書き方・区分・主観品質 | `success-criteria-designer` |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `success_criteria v<n>`。`PASS` の `recommended_next` は `validation-plan-designer`。

## 参照するガイド

- `references/domain-guide.md` §5 冒頭の段落と表 — 観点 3・4
- `references/domain-guide.md` §5「行動変容」の段落 — 反応指標と成果指標の区別
- `references/domain-guide.md` §7 のチェックリスト「目的」「検証」行 — 観点 2
