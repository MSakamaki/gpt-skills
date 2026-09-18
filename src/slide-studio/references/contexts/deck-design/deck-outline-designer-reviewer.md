# deck-outline-designer-reviewer

種別：reviewer　段階：deck-design　対象：`deck_outline`

## 責務

`deck_outline` が、問いから結論まで論理がつながり、聴衆と利用形態に適した構造かを検証する。修正しない。章の並べ替え案や代わりの message を書かない。

## 入力

| Artifact | 使い方 |
|---|---|
| `presentation_brief` | 目的・ユースケース・時間制約との整合 |
| `audience_profile` | 前提説明の量、専門性との適合 |
| `presentation_mode_spec` | 進行形式・interaction・author/participant 配分との整合 |
| `success_criteria` | 全成功条件が章に対応付けられているか |
| `deck_outline` | 検証対象 |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | 問い → なぜ重要か → 現状／証拠 → 何が分かったか → だから何をするか がつながるか。`transitions.logic` に飛躍・循環が無いか | ガイド §2 因果チェーン |
| 2 | `success_criteria` の各条件がいずれかの章に対応付けられているか。どの章も寄与しない条件、どの条件にも寄与しない章が無いか | `supports_success_criteria` |
| 3 | `audience_profile` に適しているか。専門家に不要な前提章、初学者に不足する前提・中間ステップ | ガイド §2 expertise reversal |
| 4 | `presentation_mode_spec` と整合するか。進行形式、interaction 方針、author/participant の配分、情報密度方針 | `presentation_mode_spec` |
| 5 | Workshop なら活動 (演習・共有・振り返り) が章として構造に入っているか。説明章の連続になっていないか | ガイド §4 ワークショップの段落 |
| 6 | オンライン配信なら参加機会 (チェック・問い) が配置され、間隔が「初期値」として書かれているか (固定則として書いていないか) | ガイド §2 注意資源、§4 オンライン配信 |
| 7 | 意思決定向けなら結論が先にあるか (Answer first)。経緯の順番説明になっていないか | ガイド §4 社内報告の段落 |
| 8 | 章の message に上流 Artifact に無い事実・数値・結論が入っていないか | I-03 / 推測禁止 |
| 9 | 時間配分の合計が `constraints.time_minutes` と大きく食い違わないか (目安として) | ガイド §7「時間」行 |
| 10 | 枚数・見出し文面・視覚表現・配色など他 Context の領分を先取りしていないか | 責務境界 (I-07) |

## 判定

- 観点 1・2・8 は `CRITICAL`。観点 3〜7 は `MAJOR`。観点 9・10 は `MINOR`
- `CRITICAL` / `MAJOR` が 1 つでもあれば `FAIL`

| 問題の種類 | rollback_target |
|---|---|
| 論理の飛躍、章の過不足、message の創作、参加機会の欠落 | `deck-outline-designer` |
| 進行形式・interaction 方針そのものが目的に合わない | `presentation-mode-designer` |
| 成功条件が構造に落とせない形で書かれている (測れない、目的とずれる) | `success-criteria-designer` |
| 聴衆の既有知識・専門性の前提が誤っている | `audience-analyzer` |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `deck_outline v<n>`。`PASS` の `recommended_next` は `slide-sequence-designer`。

## 参照するガイド

- `references/domain-guide.md` §2「ストーリーテリング」「認知負荷理論」「注意資源」の段落
- `references/domain-guide.md` §4 の各ユースケースの段落
- `references/domain-guide.md` §7 のチェックリスト「目的」「ストーリー」「学習確認」「時間」行
