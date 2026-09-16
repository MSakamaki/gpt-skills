# METHOD: ASSUMPTION_BASED_PLANNING

## Role

EXECUTABLE_METHOD

## Purpose

計画や判断が暗黙に依存している前提を洗い出し、そのうち「崩れると計画が成立しなくなる前提」と「実際に崩れうる前提」を特定する。

## Covers

- F01 ASSUMPTION — 暗黙の前提
- F05 FUTURE — 将来条件変化への脆弱性
- F14 CONSTRAINT — 制約・実行条件の見落とし

## Applicable When

次のいずれかを満たす。

- 回答案が、明示されていない前提の上に成り立っている
- 計画・方針が将来の条件 (需要、体制、法令、技術、取引先) に依存している
- 期間が長い、または前提が変化しうる時間軸を持つ

## Do Not Use When

- 前提がすべて回答仕様で固定済みで、変化の余地がない
- すでに発生した事象の原因分析である
- 問題の中心が「具体的な失敗条件の列挙」である (この場合は PREMORTEM)
- 問題の中心が「複数の将来シナリオ間での戦略比較」である (この場合は ROBUST_DECISION_MAKING)

## Inputs

- 固定済み `V(i-1)`
- 回答仕様の背景・前提 (項目 3) と制約条件 (項目 6)
- 計画の時間軸

## Procedure

1. 回答案が成り立つために真でなければならない言明を列挙する。回答案に書かれている前提だけでなく、書かれていないが必要な前提も対象にする。
2. 各前提を 2 軸で分類する。
   - **load-bearing** — この前提が偽になると、回答案の結論または主要な手順が成立しなくなるか
   - **vulnerable** — 回答仕様の時間軸の中で、この前提が偽になりうるか
3. `load-bearing かつ vulnerable` な前提を最優先の指摘対象とする。`load-bearing だが vulnerable でない` 前提は、明示されていなければ「前提の明示不足」として扱う。`load-bearing でない` 前提は指摘しない。
4. 優先対象の各前提について次を求める。
   - その前提が崩れたと判断できる観測可能な兆候
   - 崩れた場合に回答案のどの部分が無効になるか
   - 前提が崩れる前に取れる対応、または崩れた場合の切り替え先
5. 回答案に、前提が明示されていない箇所、兆候が定義されていない箇所、崩れた場合の扱いが無い箇所を指摘する。

### Research-backed

計画が依存する前提を明示し、load-bearing で vulnerable な前提を特定して、兆候と対応を用意するという Assumption-Based Planning の枠組み。RAND が長期・戦略計画向けの計画手法として公開している。

### Skill-specific adaptation

- 手順 3 の優先順位規則と、「load-bearing でない前提は指摘しない」という制限は本 Skill の運用規則。
- 原典は組織の戦略計画を対象としており、単発の回答レビューへの適用は転用である。
- 原典 PDF は再配布不可かつ暗号化により本文抽出ができないため、本 Card は Landing Page の記述と plans2 §12 に依拠する。原典の章立てや具体的な手続きの細部を引用しない。

## Output

各前提について次を記録する。

- Assumption — 前提の言明
- Load-bearing — yes / no と、偽になった場合に無効化される回答案の箇所
- Vulnerable — yes / no と、崩れうる条件
- Signpost — 崩れたと判断できる観測可能な兆候
- Action — 前提が崩れる前・崩れた後に取る対応
- Gap — 回答案に不足している記述

## False Positive Guard

- 「前提が明示されていない」だけでは指摘にしない。load-bearing であることを示す。
- 回答仕様で合意済みの仮定を、前提の見落としとして再指摘しない。
- 起こりうる変化を列挙するだけで終わらせない。回答案のどこが無効になるかを示せない前提は落とす。
- 前提の数を成果にしない。

## Stop Condition

新しく挙げた前提が、既出の前提と同じ箇所を無効化するだけになった時点で終了する。

## Evidence

- `PAPER-ABP` — Dewar, Builder, Hix, Levin: Assumption-Based Planning: A Planning Tool for Very Uncertain Times (RAND MR-114)
- 参照箇所: Landing Page の記述のみ。本文は未参照
- Local Path: - (RAND が再配布に許諾を要求するため同梱しない)

## Evidence Strength

METHODOLOGICAL。

有効性を測定した実験ではなく、RAND が開発した計画手法の記述である。「ABP を適用すれば前提の見落としが減る」という主張はしない。

## Domain Transfer

MEDIUM。

長期・戦略計画から、回答レビューへの転用である。時間軸が短い依頼では vulnerable の判定基準が変わるため、回答仕様の時間軸を明示して判定する。

## Fallback

CORE-AR。

PDF は同梱していない。前提の洗い出しだけであれば SOCRATIC でも部分的に代替できるが、load-bearing / vulnerable の分離は ABP 固有であり、代替した場合はその旨を記録する。
