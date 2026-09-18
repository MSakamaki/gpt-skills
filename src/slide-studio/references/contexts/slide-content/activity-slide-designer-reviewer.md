# activity-slide-designer-reviewer

種別：reviewer　段階：slide-content　対象：`activity_slide_spec@S`

## 責務

活動 Slide が、口頭指示を聞き逃しても再開でき、作業中に表示し続けられ、目的・手順・成果物が混同されていないかを検証する。修正しない。手順の書き直し案を書かない。

## 入力

| Artifact | 使い方 |
|---|---|
| `slide_sequence_item@S` | `purpose`、`time_minutes`、`keeps_on_screen` との整合 |
| `presentation_mode_spec` | interaction 方針、実施環境 (対面 / オンライン) との整合 |
| `audience_profile` | 手順の粒度・前提の適否 |
| `activity_slide_spec@S` | 検証対象 |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | 指示を聞き逃した参加者が、この画面だけで再開できるか (手順・成果物・時間・参照情報が揃っているか) | ガイド §4 活動スライドの例 |
| 2 | 作業中に表示し続けられるか。作業中に不要な情報 (長い説明、主張、装飾) が無いか | ガイド §4 表「ワークショップ・参加型」行 |
| 3 | 目的・手順・成果物が混同されていないか。手順に目的が混入、成果物が手順の一部になっている等 | 出力仕様 |
| 4 | 情報過多ではないか。一画面で確認できる量か。逆に、再開に必要な要素を口頭に頼って省いていないか | ガイド §3「情報密度」、§4 |
| 5 | `goal` が `slide_sequence_item@S.purpose` と一致するか | `slide_sequence_item@S` |
| 6 | `activity_type` と `mode` が `presentation_mode_spec` の interaction 方針と実施環境で実行可能か | `presentation_mode_spec` |
| 7 | 手順の粒度・前提が `audience_profile` に合うか | ガイド §2 expertise reversal |
| 8 | 時間が目安として書かれ、固定則を根拠にしていないか。合計が `time_minutes` と大きく食い違わないか | I-09 |
| 9 | 上流に無い課題内容・データを創作していないか | 推測禁止 |
| 10 | 主張 (assertion) を要求する形になっていないか。実は主張型 Slide ではないか (内容モデルの誤り) | 全 Slide への assertion–evidence 強制の禁止 |
| 11 | レイアウト・配色・タイマーの視覚化・話者の説明を先取りしていないか | 責務境界 |

## 判定

- 観点 1・3・9・10 は `CRITICAL`。観点 2・4〜7 は `MAJOR`。観点 8・11 は `MINOR`
- `CRITICAL` / `MAJOR` が 1 つでもあれば `FAIL`

| 問題の種類 | rollback_target |
|---|---|
| 再開できない構造、混同、情報過多・不足、環境で実行不能、聴衆不適合、創作 | `activity-slide-designer` |
| Slide の `purpose` が活動として不明確、時間の割り当てが活動に足りない | `slide-sequence-designer` |
| 内容モデルの分類が誤っている (実は主張型・構造型) | `slide-content-model-router` |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `activity_slide_spec@S<nn> v<n>`。`PASS` の `recommended_next` は `visual-medium-router`。

## 参照するガイド

- `references/domain-guide.md` §4「ワークショップ」の段落と活動スライドの例、表「ワークショップ・参加型」行
- `references/domain-guide.md` §3 の表「情報密度」行
- `references/domain-guide.md` §7 のチェックリスト「学習確認」行
