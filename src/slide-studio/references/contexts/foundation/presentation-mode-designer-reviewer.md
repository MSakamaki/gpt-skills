# presentation-mode-designer-reviewer

種別：reviewer　段階：foundation　対象：`presentation_mode_spec`

## 責務

`presentation_mode_spec` が brief と聴衆分析に整合し、固定値を規則化せず、形式に必要な進行要素を含むかを検証する。修正しない。代わりの配分を書かない。

## 入力

| Artifact | 使い方 |
|---|---|
| `presentation_brief` | `use_case` `constraints` `purpose` との照合 |
| `audience_profile` | 閲覧環境・認知条件・密度方向との照合 |
| `presentation_mode_spec` | 検証対象 |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | `delivery_mode` `format` `time_budget.total_minutes` が brief の `use_case` `constraints` と整合するか | 突き合わせ |
| 2 | 閲覧環境・マルチタスク条件が `audience_profile` と整合するか (オンラインなのに長い連続講義になっていないか) | ガイド §4「オンライン配信」 |
| 3 | 「1 分 1 枚」「10 分で注意が切れる」「5.5 分ごとに必ずテスト」などの固定値を規則として書いていないか | I-09、ガイド §2「注意資源」 |
| 4 | Workshop なら活動 (演習・共有・振り返り) が進行の中に入り、聞く時間が連続していないか | ガイド §4「ワークショップ」 |
| 5 | author-driven / participant-driven の配分に根拠があるか。Workshop で導入後に参加者主導へ移る構造か | ガイド §2「ストーリーテリング」 |
| 6 | `information_density_policy` が `audience_profile.information_density_direction` と一致するか。「常に少なく」になっていないか | ガイド §2「認知負荷理論」 |
| 7 | `standalone_reading` が brief (事前・事後配布の記述) と整合するか | 突き合わせ |
| 8 | 枚数・章構成・個々の Slide を決めていないか (先取り) | 責務境界 |

## 判定

- 観点 1・3 は `CRITICAL`。観点 2・4・5・6・7 は `MAJOR`。観点 8 は `MINOR`
- `CRITICAL` / `MAJOR` が 1 つでもあれば `FAIL`

| 問題の種類 | rollback_target |
|---|---|
| 配分・方針・根拠の問題、固定値の規則化 | `presentation-mode-designer` |
| 聴衆分析 (閲覧環境・密度方向) 自体が誤っている | `audience-analyzer` |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `presentation_mode_spec v<n>`。`PASS` の `recommended_next` は `delivery-artifact-planner`。

## 参照するガイド

- `references/domain-guide.md` §4 の表と各段落 — 観点 2・4
- `references/domain-guide.md` §2「ストーリーテリング」「注意資源」の段落 — 観点 3・5
