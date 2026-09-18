# slide-content-model-router-reviewer

種別：reviewer　段階：slide-content　対象：`slide_content_model@S`

## 責務

対象 Slide の内容モデル分類が `purpose` と利用形態に合っているかを検証する。修正しない。別の分類を「正解」として書き換えない (所見で問題点と根拠を示す)。

## 入力

| Artifact | 使い方 |
|---|---|
| `slide_sequence_item@S` | `purpose`、`position_role`、`keeps_on_screen`、候補 |
| `presentation_mode_spec` | 利用形態と interaction 方針 |
| `slide_content_model@S` | 検証対象 |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | 分類が `purpose` の記述と一致するか。`rationale` が `purpose` の語句を根拠にしているか | 3 モデルの定義 |
| 2 | 活動指示 (演習・問い・作業) や区切りの Slide が `assertion-evidence` に分類されていないか | 全 Slide への assertion–evidence 強制の禁止 |
| 3 | 主張を伝える Slide が `structural-navigation` に逃がされていないか (説明を区切りに偽装) | ガイド §1 要点 |
| 4 | `presentation_mode_spec` と整合するか。Workshop の参加機会に対応する Slide が活動指示になっているか | ガイド §4 ワークショップ |
| 5 | `keeps_on_screen: true` の Slide が活動指示として扱われているか | `slide_sequence_item@S` |
| 6 | `candidate_agreed: false` のとき理由が書かれているか。候補に引きずられていないか | 出力仕様 |
| 7 | `next_designer` が分類と対応しているか | 出力仕様 |
| 8 | `purpose` 自体が曖昧または 2 モデルにまたがるのに、分類を強行していないか | 推測禁止 |

## 判定

- 観点 1・2・3・8 は `CRITICAL`。観点 4〜7 は `MAJOR`
- `CRITICAL` / `MAJOR` が 1 つでもあれば `FAIL`

| 問題の種類 | rollback_target |
|---|---|
| 分類の誤り、根拠の欠落、候補への追従、`next_designer` の不一致 | `slide-content-model-router` |
| `purpose` 自体が曖昧、または 1 Slide に 2 モデルが同居しており Slide の切り方に問題がある | `slide-sequence-designer` |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `slide_content_model@S<nn> v<n>`。`PASS` の `recommended_next` は分類に応じて次の 1 つ。

| `content_model` | `recommended_next` |
|---|---|
| `assertion-evidence` | `slide-assertion-designer` |
| `activity-instruction` | `activity-slide-designer` |
| `structural-navigation` | `structural-slide-designer` |

## 参照するガイド

- `references/domain-guide.md` §1 の要点「「1枚1テーマ」より「1枚1主張」」
- `references/domain-guide.md` §4「ワークショップ」の段落と活動スライドの例
- `references/domain-guide.md` §7 のチェックリスト「ストーリー」「1枚の役割」行
