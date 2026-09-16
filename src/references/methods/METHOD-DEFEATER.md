# METHOD: DEFEATER

## Role

EXECUTABLE_METHOD

## Purpose

回答案の主要な主張を `CLAIM / ARGUMENT / EVIDENCE` へ分解し、その主張を覆しうる具体的な疑い (defeater) を立てて、確認するか反証するかを決める。解消できなかった defeater は未解決として残す。

## Covers

- F08 EVIDENCE — 根拠不足
- F09 DEFEATER — 重大な反証が未解決
- F16 OVERCORRECTION — 検証によって正しい内容を悪化させる

## Applicable When

次のいずれかを満たす。

- 回答仕様が高い保証水準を求めている (安全性、法令遵守、不可逆な判断、重大な損失の可能性)
- 見落としの許容度が低いと明示されている
- 回答案の中心的な主張が、限られた根拠の上に立っている

## Do Not Use When

- 主張が明確でなく、まず論点を定義する段階にある (この場合は SOCRATIC)
- 回答仕様が探索的で、結論の確からしさより選択肢の広さを求めている
- 反証を立てる対象となる具体的な主張が回答案に存在しない
- 単一の事実の真偽確認であり、出典との突き合わせで決着する。Invariant Gate の `G3 FACT` と `G6 SOURCE` で足りる
- 回答仕様に高保証要求がなく、検出した `F08 EVIDENCE` の Severity が `MAJOR` 未満である。根拠が 1 つしかないというだけでは適用しない

## Inputs

- 固定済み `V(i-1)`
- 回答仕様の成功条件・評価基準 (項目 7) と根拠・検証方法 (項目 10)
- 回答案の主要な主張と、それを支える根拠

## Procedure

1. 回答案から、覆ると結論が変わる主張を 1〜3 個選ぶ。これを `CLAIM` とする。
2. 各 `CLAIM` について、それを支える推論 `ARGUMENT` と、推論が依拠する `EVIDENCE` を分けて書き出す。
3. 各 `CLAIM` に対して疑い (doubt) を出す。少なくとも次の 3 種類を試す。
   - **主張そのものへの反証** — `CLAIM` が偽になる具体的な条件・反例
   - **根拠への疑い** — `EVIDENCE` が主張を支えていない、範囲が違う、時点が古い、出典が主張と一致しない
   - **推論への疑い** — `EVIDENCE` から `CLAIM` へ至る推論が成立しない条件
4. 各 doubt を精査する。曖昧なままにせず、次のいずれかへ確定させる。
   - `DISMISSED` — 根拠がなく、疑いとして成立しない
   - `REFUTED` — 回答案または出典で明確に否定できる。否定の根拠を記録する
   - `CONFIRMED` — 疑いが正しい。回答案の修正が必要
   - `UNRESOLVED` — 現在の情報では確認も反証もできない
5. `CONFIRMED` を Review Issue とする。
6. `UNRESOLVED` は消さずに残す。何が分かれば解消するかを併記する。
7. 最終回答へ、`UNRESOLVED` を未解決の不確実性として反映する。`REFUTED` のうち、読み手が同じ疑いを持ちうるものは、否定の根拠とともに残す。

### Research-backed

- doubt を assurance case 上の節点に対する疑いとして明示し、未調査の doubt と、調査対象へ精緻化した defeater を区別すること。
- doubt を dismiss するか、より具体的な反対主張へ sharpen して subcase で調査するかを決めること。
- 「主張が真であるという確信」に加えて「見落とされた、または未解決の疑いが存在しないという確信」を求める indefeasible confidence の考え方。
- defeater の指摘を批判ではなく、主張を明確化する貢献として扱うこと。
- 確証バイアスへの対抗として、作成者自身が意図的に doubt を生成すること。

### Skill-specific adaptation

- 手順 3 の 3 分類 (主張・根拠・推論への疑い) は本 Skill の運用規則である。**原典は defeater の体系的な探索方法を扱っていないと明記している**。したがって「どう探すか」は原典の裏付けを持たない。
- `CLAIM` を 1〜3 個に絞る制限と、`UNRESOLVED` を最終回答へ反映する規則は本 Skill の運用規則。
- 原典は assurance case という構造化文書を対象とする。本 Skill は通常の回答文へ適用するため、`CLAIM / ARGUMENT / EVIDENCE` は回答文から抽出して構成する。

## Output

各 `CLAIM` について次を記録する。

- CLAIM — 覆ると結論が変わる主張
- ARGUMENT — 主張を支える推論
- EVIDENCE — 推論が依拠する根拠
- Defeaters — doubt と、その判定 (`DISMISSED` / `REFUTED` / `CONFIRMED` / `UNRESOLVED`)
- Resolution — `REFUTED` の根拠、`CONFIRMED` の修正内容、`UNRESOLVED` の解消条件

## False Positive Guard

- 根拠を示せない疑いは `DISMISSED` とし、指摘に数えない。
- 「絶対とは言えない」型の一般的な懐疑は defeater にしない。`CLAIM` が偽になる条件を示せるものだけを扱う。
- `UNRESOLVED` を増やすことで慎重に見せない。判断に影響しない未解決は落とす。
- `CONFIRMED` による修正が、元の正しい記述を弱めていないか確認する (F16)。断定を避けるだけの書き換えは修正ではない。

## Stop Condition

新たな doubt が、既出の defeater と同じ根拠・同じ推論段階しか突かなくなった時点で終了する。

## Evidence

- `PAPER-DEFEATERS` — Bloomfield, Netkachova, Rushby: Defeaters and Eliminative Argumentation in Assurance 2.0 (arXiv:2405.15800v1 / SRI-CSL-2024-01)
- 参照箇所: PDF p.2 Abstract (doubt を記録し、確認または反証する subcase へ展開する)、PDF p.4 (印刷 p.3) §1 Introduction (indefeasible confidence、doubt と defeater の区別、dismiss / sharpen、確証バイアスへの対抗、defeater の探索方法は本レポートの対象外であること)
- Local Path: references/papers/assurance/defeaters-2405.15800.pdf

## Evidence Strength

METHODOLOGICAL。

有効性を測定した実験ではなく、Assurance 2.0 における defeater の表現・評価・記録の方法を定めた技術レポートである。「Defeater を使えば見落としが減る」という主張はしない。

## Domain Transfer

MEDIUM。

高保証システムの assurance case から、一般の回答へ適用する。原典が前提とする構造化された argument と評価伝播の仕組みは本 Skill にはないため、判定の伝播規則 (propagation rules) は採用していない。

## Fallback

CORE-AR。

同梱 PDF があるため、Card の記述に疑義がある場合は原典を参照できる。
