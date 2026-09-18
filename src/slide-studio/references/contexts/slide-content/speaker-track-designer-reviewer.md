# speaker-track-designer-reviewer

種別：reviewer　段階：slide-content　対象：`speaker_track@S`

## 責務

話者原稿が画面文章の朗読になっておらず、視覚と音声が異なる仕事をし、同期点と想定時間が成り立つかを検証する。修正しない。代わりの原稿を書かない。

## 入力

| Artifact | 使い方 |
|---|---|
| `content_spec@S` | 因果・解釈が主張と証拠の範囲か |
| `slide_copy_spec@S` | 朗読になっていないかの照合元。`sync_points` の要素 id |
| `audience_profile` | 説明の深さの適否 |
| `deck_outline` | Story のつなぎとの整合 |
| `speaker_track@S` | 検証対象 |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | Slide 本文の朗読になっていないか。`spoken_message` / `reasoning` が `slide_copy_spec@S` の文をそのまま含んでいないか | ガイド §1 要点、§3「音声との分担」 |
| 2 | 視覚と音声が同じ仕事をしていないか。話者が構造・比較・位置関係の列挙に費やし、因果・意味・解釈・判断・Story を担っていないか | ガイド §2 Redundancy、Wickens |
| 3 | `sync_points` を定義できているか。要素 id が `slide_copy_spec@S` / `media_specs@S` に実在し、順序が説明の流れと合うか | ガイド §2 Temporal contiguity |
| 4 | 想定時間が不自然でないか (内容量に対して極端に短い・長い)。固定則を根拠にしていないか。時間は目安として書かれているか | I-09、ガイド §7「時間」 |
| 5 | `content_spec@S` に無い事実・数値・解釈を創作していないか。解釈が証拠の範囲を超えていないか | I-03 / 推測禁止 |
| 6 | `story_link` が `deck_outline.transitions` と整合するか | `deck_outline` |
| 7 | `not_to_repeat_on_slide` が画面文章を網羅しているか | `slide_copy_spec@S` |
| 8 | 説明の深さが `audience_profile` に合うか (専門家に前提を長々と、初学者に無説明の専門用語) | ガイド §2 expertise reversal |
| 9 | 活動型で、画面に無いと再開できない指示を話者だけに持たせていないか | ガイド §4 活動スライド |
| 10 | 画面文章の書き換え・追加、Animation の実装を先取りしていないか | I-03、責務境界 |
| 11 | `[成果物の声]` の項目が `deliverable_voice` に従い、記録欄 (`not_to_repeat_on_slide` `audience_adaptation` など) が作業言語のままか | I-15 |

## 判定

- 観点 1・2・5 は `CRITICAL`。観点 3・4・6・8・9・11 は `MAJOR`。観点 7・10 は `MINOR`
- `CRITICAL` / `MAJOR` が 1 つでもあれば `FAIL`

| 問題の種類 | rollback_target |
|---|---|
| 朗読化、分担の崩れ、同期点の不備、時間の不自然、創作、Story の不整合 | `speaker-track-designer` |
| 画面文章が話者の内容 (因果・解釈) を既に含んでいて、分担が成り立たない | `slide-copywriter` |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `speaker_track@S<nn> v<n>`。`PASS` の `recommended_next` は `slide-layout-planner`。

## 参照するガイド

- `references/domain-guide.md` §1 の要点「ナレーションとスライドに同じ仕事をさせない」
- `references/domain-guide.md` §2「Mayer のマルチメディア学習理論」「注意資源」の段落
- `references/domain-guide.md` §3 の表「音声との分担」行
- `references/domain-guide.md` §7 のチェックリスト「ナレーション」「時間」行
