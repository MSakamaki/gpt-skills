# slide-sequence-designer-reviewer

種別：reviewer　段階：deck-design　対象：`slide_sequence_plan`

## 責務

`slide_sequence_plan` が `deck_outline` を漏れなく Slide へ分割し、各 Slide の役割が 1 つで、利用形態に合っているかを検証する。修正しない。Slide の追加・削除・並べ替えの具体案を書かない。

## 入力

| Artifact | 使い方 |
|---|---|
| `deck_outline` | 章・message・参加機会との対応 |
| `presentation_mode_spec` | 情報密度方針、進行形式との整合 |
| `slide_sequence_plan` | 検証対象 |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | `deck_outline.sections` のすべてがいずれかの Slide に対応し、どの章にも属さない孤立 Slide が無いか | `section_ref` |
| 2 | 1 Slide に 2 つ以上の目的・結論が入っていないか (`purpose` が複文になっていないか) | ガイド §3「情報密度」行、§7「1枚の役割」 |
| 3 | 逆に、1 つの結論や 1 つの図 (地図・系統図など) を根拠なく細切れにしていないか | ガイド §3「初期値」の段落 (全体像を残し段階提示) |
| 4 | 構造 Slide (divider / agenda / transition) が過多でないか。位置を示す必要がある箇所にだけあるか | I-09 (枚数埋め禁止) |
| 5 | Workshop なら `deck_outline.participation` に対応する活動 Slide があり、`keeps_on_screen` が付いているか | ガイド §4 ワークショップ |
| 6 | `content_model_candidate` が `purpose` と矛盾していないか (活動指示に assertion-evidence が付いている等) | 3 モデルの定義 |
| 7 | `density_note` が `presentation_mode_spec` の情報密度方針と一致するか | `presentation_mode_spec` |
| 8 | `slide_id` が `S01` から連番で重複が無く、`depends_on` が順序と矛盾しないか | 出力仕様 |
| 9 | 時間の目安の合計が `deck_outline` の配分と大きくずれていないか。`count_rationale` が固定則 (1 分 1 枚など) を根拠にしていないか | ガイド §4 冒頭、I-09 |
| 10 | 主張文・証拠・見出し・視覚表現を先取りしていないか | 責務境界 |

## 判定

- 観点 1・2・6 は `CRITICAL`。観点 3・4・5・7・8 は `MAJOR`。観点 9・10 は `MINOR`
- `CRITICAL` / `MAJOR` が 1 つでもあれば `FAIL`

| 問題の種類 | rollback_target |
|---|---|
| 分割の漏れ・重複、2 目的の Slide、過剰な細切れ、構造 Slide の過多、候補モデルの矛盾、ID の不備 | `slide-sequence-designer` |
| 章の message 自体が複数の結論を含む、章の粒度が Slide 化に向かない | `deck-outline-designer` |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `slide_sequence_plan v<n>`。`PASS` の `recommended_next` は対象 Slide の `slide-content-model-router` (通常は `S01` から)。

## 参照するガイド

- `references/domain-guide.md` §4 の冒頭段落と枚数表 (初期値としての扱い)
- `references/domain-guide.md` §3 の表「情報密度」行と「初期値」の段落
- `references/domain-guide.md` §4「ワークショップ」の段落
- `references/domain-guide.md` §7 のチェックリスト「1枚の役割」「時間」行
