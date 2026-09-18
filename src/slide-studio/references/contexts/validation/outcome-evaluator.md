# outcome-evaluator

種別：validator　段階：validation　対象：Deck 全体

## 責務

発表の実施後、または検証データが存在するときに、`success_criteria` の各条件が `validation_plan` の方法で実際に満たされたかを `measured_results` から評価する。成果物を作らず、修正しない。Reviewer-of-Reviewer を置かず、人間承認で代替できない。**測定データが無ければ BLOCKED。推測で効果を評価しない。**

## 禁止

- 「分かりやすくなったはず」「反応が良かったから理解された」と推定しない。満足度 (反応指標) を理解・行動 (成果指標) の代わりにしない
- 視線・注視時間・離脱率・回答率を理解の直接測定として扱わない。有意差の有無だけで判断しない
- A/B でスライド以外 (話者・台本・時間・情報内容) が違うのに「デザインの効果」と断定しない
- `DELIVERY_READY` (利用可能) と `OUTCOME_VALIDATED` (効果を実測) を混同しない。差し戻しを強制せず、改善候補は次版への提案として書く

## 入力

- `success_criteria` — 評価する条件 (SC-n)。理解 / 記憶 / 判断 / 行動 / Accessibility
- `validation_plan` — 各 SC の指標・測定方法・タイミング・判定基準 (最小効果、標本、比較条件)
- `measured_results` — 実測データ。無ければ BLOCKED。測定方法・時期・対象者数・比較条件・欠測を含むこと

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | `measured_results` が `validation_plan` の指標・方法・タイミングで測られているか。違うなら何が比較できないか | `validation_plan` |
| 2 | understanding: 直後テストの正答率・推論問題・説明の質。因果・比較を問う設問か | §5 の表「理解」 |
| 3 | retention: 遅延再生・再認 (1 日〜1 週間後)。直後の結果と混同していないか | §5「記憶保持」 |
| 4 | attention: thought probe、注視、離脱率。**視線 ≠ 理解**。理解の測定と併せて解釈する | §5「注意」、「視線＝理解とみなしてはいけない」 |
| 5 | cognitive_load: セグメント後の主観評定 | §5「認知負荷」 |
| 6 | behavior: 実行率・判断精度・完了時間 (数日〜数週間後)。発表目的から逆算した指標か | §5「行動変容」の段落 |
| 7 | accessibility_outcome: 到達可能性、字幕精度、読み上げの実測 | §5「アクセシビリティ」 |
| 8 | satisfaction: 補助指標として扱い、成果指標と分ける | §5「満足度」 |
| 9 | 効果量・信頼区間・標本数が記録され、事前の最小効果と比べているか。アウトカムごとに効果量は異なる | §5「効果量と信頼区間」 |
| 10 | A/B ならスライド以外が同じか。複数改善を一度に入れた場合は「パッケージの効果」としか言えないか | §5「スライド以外を可能な限り同じにする」 |

## 判定

- `measured_results` が無い、または対象 Deck に対する測定でない → `BLOCKED`。どの指標のデータが必要かを書く
- SC ごとに `met` / `not_met` / `inconclusive` (データ不足、比較条件が不成立、効果量が最小効果に届かず信頼区間が 0 を含む) を判定し、根拠を書く
- 全体 `verdict`: 主要 SC がすべて `met` → `PASS` (`recommended_next: <outcome-validated>`)。1 つでも `not_met` → `FAIL`。主要 SC に `inconclusive` が残れば `PASS` にせず `BLOCKED` (追加測定を提案)
- `FAIL` / `inconclusive` の所見には改善候補の Context を提案として書く (例: 理解が低い → `slide-assertion-designer` / `slide-evidence-selector`、注意が続かない → `deck-outline-designer` / `animation-planner`、行動が変わらない → `success-criteria-designer` / `deck-outline-designer`)。差し戻しではない

## 出力：`outcome_evaluation`

```yaml
artifact: outcome_evaluation
artifact_id: outcome_evaluation
version: 1
produced_by: outcome-evaluator
based_on: [success_criteria v1, validation_plan v1, measured_results v1]
verdict: PASS                     # PASS | FAIL | BLOCKED
measurement_summary:
  design: single_group_pre_post   # single_group_pre_post | ab_between | ab_within | observational
  participants: 38
  comparability: 話者・台本・時間・情報内容は同一
per_criterion:
  - id: SC-1
    metric: understanding
    result: 直後テスト正答率 0.71 (事前 0.42)
    effect: d=0.62, 95%CI [0.18, 1.05]   # 事前の最小効果 d=0.4
    verdict: met                  # met | not_met | inconclusive
    evidence: measured_results.tests.immediate / validation_plan.SC-1
  - {id: SC-3, metric: behavior, verdict: inconclusive, evidence: 追跡期間 (2 週間) 未到達}
findings: []
unverified:
  - {id: SC-3, reason: 行動指標の追跡データが未取得}
recommended_next: <outcome-validated>   # FAIL / BLOCKED なら改善候補または追加測定
```

## 参照するガイド

- `references/domain-guide.md` §5「評価指標と検証方法」全体 — 評価対象の表、A/B の注意、効果量と信頼区間、視線 ≠ 理解、行動変容の指標、反応指標と成果指標の区別
- `references/domain-guide.md` §7 のチェックリスト「検証」行
