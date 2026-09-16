# METHOD: ROBUST_DECISION_MAKING

## Role

EXECUTABLE_METHOD

## Purpose

単一の将来予測に依存せず、複数の plausible future に対して回答案の戦略を stress test し、どの条件下で成立しなくなるか (脆弱性) を特定する。

## Covers

- F05 FUTURE — 将来条件変化への脆弱性
- F10 UNCERTAINTY — 不確実性を過度に断定
- F14 CONSTRAINT — 制約・実行条件の見落とし

## Applicable When

次をすべて満たす。

- 回答案が、将来の条件に依存する戦略・方針・投資判断を含む
- 重要な不確実変数が 2 つ以上ある
- それらの組み合わせによって複数の plausible future を考える意味がある

## Do Not Use When

- 不確実変数が実質 1 つで、単一の失敗シナリオを詰めれば足りる (この場合は PREMORTEM)
- 問題の中心が「個別の前提が明示されていないこと」である (この場合は ASSUMPTION_BASED_PLANNING)
- 将来ではなく、すでに起きた事象の原因を問うている
- 回答仕様が時点を固定しており、将来条件の変動を対象外としている

## Inputs

- 固定済み `V(i-1)`
- 回答仕様の成功条件・評価基準 (項目 7)
- 回答案が採る戦略・方針と、その判断根拠
- 判断に効く不確実変数

## Procedure

1. 回答案が提案している戦略を 1 つの候補として明示する。比較対象となる代替戦略があれば併記する。
2. 判断に効く不確実変数を 2〜4 個に絞る。各変数について、回答仕様の範囲内で取りうる幅を置く。
3. 変数の組み合わせから plausible future を作る。回答案にとって都合のよい未来だけを作らない。少なくとも次を含める。
   - 回答案が暗黙に想定している未来
   - 各変数が回答案に不利な側へ振れた未来
   - 変数が互いに逆方向へ振れた未来
4. 各 future で戦略を評価し、成功条件を満たすかを判定する。満たさない場合、どの変数のどの範囲がそれを決めているかを特定する。
5. 戦略が成立しなくなる条件の組み合わせを **脆弱性** として記述する。「うまくいかないかもしれない」ではなく「X が A を超え、かつ Y が B を下回ると成立しない」の形にする。
6. 各脆弱性について、戦略を頑健にする修正候補 (条件分岐、段階実行、判断の先送り、ヘッジ) を挙げる。
7. 回答案に、脆弱性の記述・条件付きの但し書き・切り替え判断が欠けている箇所を指摘する。

### Research-backed

予測精度を上げるのではなく、多数の plausible future に対して戦略を stress test し、脆弱性を特定してそれへの対応を評価するという RDM の枠組み。原典は RDM を Decision Analysis、Assumption-Based Planning、シナリオ、Exploratory Modeling の組み合わせとして説明し、選択肢の順位付けではなくトレードオフを明らかにすることを目的としている。

### Skill-specific adaptation

- 原典の RDM は計算機によるシミュレーションと多数のケース生成を前提とする。本 Skill は同じ考え方を定性的に、少数の future を手で構成する形へ縮約している。これは転用であり、原典が示した手法の再現ではない。
- 変数を 2〜4 個に絞る、future の構成に「不利な側」「逆方向」を必ず含める、という規則は本 Skill の運用規則。

## Output

- Strategy — 評価対象の戦略
- Uncertain variables — 変数とその幅
- Futures — 構成した plausible future
- Vulnerability — 戦略が成立しなくなる条件の組み合わせ
- Robustifying option — 頑健にする修正候補とトレードオフ
- Gap — 回答案に不足している記述

## False Positive Guard

- 構成した future は仮説であり、予測ではない。発生確率を推定して事実のように書かない。
- 変数を増やして網羅的に見せない。判断に効かない変数は落とす。
- 脆弱性は条件の形で書く。条件を特定できないものは指摘にしない。
- 回答仕様が対象外とした時間軸・範囲の future を根拠に指摘しない。

## Stop Condition

新しい future を作っても、既出の脆弱性と同じ条件しか再現しなくなった時点で終了する。

## Evidence

- `PAPER-RDM` — R. J. Lempert: Robust Decision Making (RDM), Chapter 2 of *Decision Making under Deep Uncertainty* (DOI: 10.1007/978-3-030-05252-2_2)
- 参照箇所: PDF p.1 (印刷 p.23) Abstract (予測ではなく deep uncertainty 下の意思決定、stress test、robust adaptive strategies)、PDF pp.4-6 (印刷 pp.26-28) (plausible path 上での実行結果から戦略の脆弱性を特徴づけ、対応を評価する。順位付けではなくトレードオフを示す)
- Local Path: references/papers/planning/robust-decision-making.pdf

## Evidence Strength

MODERATE。

deep uncertainty 分野で確立した手法として体系的に記述されている。ただし原典が扱うのは計算支援を伴う政策分析であり、定性的な回答レビューでの有効性を測定した研究ではない。

## Domain Transfer

MEDIUM。

計算モデルを用いた政策分析から、定性的な回答レビューへの転用である。future の網羅性が原典より大幅に低いことを前提に、「脆弱性を見つけられなかった」を「頑健である」と読み替えない。

## Fallback

PREMORTEM。

不確実変数が 1 つしか特定できない場合、または plausible future を構成できない場合は、RDM を使わず PREMORTEM へ切り替える。切り替えたことを記録する。
