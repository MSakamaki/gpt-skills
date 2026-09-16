# METHOD: PREMORTEM

## Role

EXECUTABLE_METHOD

## Purpose

計画または決定案が実行後に失敗したと仮定し、その失敗を説明できる原因を探索する。失敗が起きてからでは遅い見落としを、実行前に列挙する。

## Covers

- F04 FAILURE — 失敗条件の不足
- F14 CONSTRAINT — 制約・実行条件の見落とし

## Applicable When

次をすべて満たす。

- 回答案に、これから実行する具体的な計画・施策・決定案が含まれている
- その計画に実行主体・対象・時間軸のいずれかが特定できる

## Do Not Use When

- 単純な事実確認・定義確認である
- すでに発生した事象の原因診断である (この場合は COMPETING_HYPOTHESES)
- 計画が「方針」の水準にとどまり、失敗を判定できる粒度がない (この場合は ASSUMPTION_BASED_PLANNING を先に検討する)
- 問題の中心が「複数の将来条件に対する脆弱性」である (この場合は ROBUST_DECISION_MAKING)

## Inputs

- 固定済み `V(i-1)`
- 回答仕様のうち、成功条件・評価基準 (項目 7) と制約条件 (項目 6)
- 計画の前提となっている実行環境・体制・期限

## Procedure

1. 期間を具体的に置いて「この計画は実行され、失敗した」と断定形で仮定する。成功可能性をこの段階で議論しない。
2. 失敗の像を先に書く。何がどの程度起きた状態を失敗と呼ぶのかを、回答仕様の成功条件の裏返しとして定義する。
3. その失敗を説明できる原因候補を、互いに独立に生成する。少なくとも次の観点をそれぞれ 1 つ以上通す。
   - 実行体制・要員・スキル
   - 依存する外部要因・他部門・取引先
   - 前提が崩れる条件
   - 制約 (予算・期限・法令・既存システム) との衝突
   - 利用者・現場が想定どおりに動かない場合
4. 各原因に根拠状態を付ける。
   - `EVIDENCED` — 回答案中の記述、入力情報、出典で裏付けられる
   - `PLAUSIBLE` — 裏付けはないが、対象領域で一般に起こりうる
   - `SPECULATIVE` — 想像可能であるにとどまる
5. 影響度と、回答仕様の成功条件を直接損なうかで並べ替える。
6. `EVIDENCED` と、影響が大きい `PLAUSIBLE` だけを Review Issue 候補とする。`SPECULATIVE` は指摘にしない。
7. 採用した原因について、回答案に不足している記述 (前提の明示、緩和策、判断基準、失敗時の扱い) を指摘する。

### Research-backed

「未来の出来事が既に起きたものとして説明させる」という prospective hindsight の枠組みのみ。

### Skill-specific adaptation

手順 2〜7 (失敗像の定義、観点の網羅、根拠状態の付与、SPECULATIVE の除外) は本 Skill の運用規則であり、原典の実験手続きではない。原典 PDF は再配布条件を満たさず未取得のため、実験条件・効果量に基づく主張は行わない。

## Output

各原因について次を記録する。

- Failure scenario — どの成功条件がどう損なわれたか
- Cause — その失敗を説明する原因
- Evidence status — `EVIDENCED` / `PLAUSIBLE` / `SPECULATIVE`
- Impact — 回答仕様への影響
- Suggested mitigation — 回答案へ追加すべき記述

## False Positive Guard

- 生成した失敗原因は仮説であって事実ではない。最終回答で確定した事実として書かない。
- 想像可能であるだけの失敗を、回答案の欠陥として指摘しない。
- 「リスクがある」という抽象的な指摘を採用しない。どの成功条件がどう損なわれるかを示せない指摘は削除する。
- 回答仕様が明示的に対象外とした範囲の失敗を指摘しない。

## Stop Condition

新しい原因を生成しても、既出の原因と同じ成功条件・同じ機序しか指さなくなった時点で終了する。

## Evidence

- `PAPER-PREMORTEM` — Mitchell, Russo, Pennington (1989) Back to the Future: Temporal Perspective in the Explanation of Events (DOI: 10.1002/bdm.3960020103)
- 参照箇所: 未取得のため特定できない
- Local Path: -

## Evidence Strength

LIMITED。

原典は 1989 年の心理学実験であり、本 Skill の適用対象 (実務上の計画レビュー) とは対象が異なる。加えて原典 PDF を取得できていないため、本 Card は plans2 §11 が示す枠組みの記述に依拠している。「Premortem を行えば失敗を予防できる」という主張はしない。

## Domain Transfer

HIGH。

実験課題における事象説明から、実務の計画レビューへの転用である。転用であることを検証サマリーに記載する。

## Fallback

CORE-AR。

原典 PDF は同梱されていないが、本 Card は PDF なしで実行できる。PDF が必要になるのは Card 自体を監査する場合だけで、その場合は Landing Page から利用者が取得する。
