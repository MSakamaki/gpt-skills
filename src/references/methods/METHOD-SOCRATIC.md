# METHOD: SOCRATIC

## Role

EXECUTABLE_METHOD

## Purpose

回答案に対して、定義・前提・一貫性・因果・反例を検査する問いを当て、曖昧なまま使われている概念と、確かめられていない結び付きを露出させる。

## Covers

- F01 ASSUMPTION — 暗黙の前提
- F11 AMBIGUITY — 定義・概念の曖昧さ
- F12 INFORMATION — 判断に必要な情報の不足
- F15 CAUSALITY — 因果関係の飛躍

## Applicable When

次のいずれかを満たす。

- 回答案に、定義せずに使われている評価語・専門語・抽象概念がある
- 回答案の主張が、根拠から結論へ跳んでいる箇所を含む
- 依頼そのものが曖昧で、まず論点を確定する必要がある
- 特化した Method の適用条件を満たさないが、一般的な攻撃より踏み込みたい

## Do Not Use When

- 用語と論点が回答仕様で既に厳密に定義されている
- 問題の中心が「視点・関係者の不足」である (この場合は REQUIREMENTS_ELICITATION)
- 問題の中心が「具体的な主張の反証」である (この場合は DEFEATER)

## Inputs

- 固定済み `V(i-1)`
- 回答仕様の全 10 項目
- 回答案の主要な主張と、その前提

## Procedure

1. 回答案から、検査対象の言明を 3〜6 個選ぶ。結論、評価、因果を述べている箇所を優先する。
2. 各言明に対して次の 5 種類の問いを当てる。すべてを当てる必要はないが、少なくとも 3 種類を試す。
   - **定義** — ここで使われている語は何を指すか。範囲の境界はどこか。回答案の他の箇所と同じ意味か
   - **前提** — この言明が成り立つために、何が真でなければならないか。それは確かめられているか
   - **一貫性** — 回答案の他の箇所、回答仕様、引用した出典と矛盾していないか
   - **因果** — 根拠から結論へ至る経路は何か。相関・時間的前後・共通原因では説明できないか
   - **反例** — この言明が成り立たない具体的な場合はあるか。その場合に結論はどう変わるか
3. 問いに対して、回答案の記述または入力情報から答えられるかを確認する。
4. 答えられない問いを分類する。
   - `UNDEFINED` — 定義がなく、読み手によって解釈が分かれる
   - `UNGROUNDED` — 前提が確かめられていない
   - `INCONSISTENT` — 他の記述と矛盾する
   - `LEAP` — 根拠から結論への経路が示されていない
   - `NEEDS_INPUT` — 判断に必要な情報が依頼側にしかない
5. 結論または回答仕様の成功条件に影響するものだけを Review Issue とする。
6. `NEEDS_INPUT` は、最終回答で確認が必要な事項として残す。回答仕様の確定済み項目を蒸し返さない。

### Research-backed

Socratic elenchus 系の研究が、単なる討論ではなく critical questioning と概念の明確化を中心に据えている点。

### Skill-specific adaptation

手順 1〜6 のすべて (5 種類の問い、4 分類、採用規則) は本 Skill の運用規則である。参考文献 (`PAPER-SOCRATIC`) は出版社有料のため本文を取得しておらず、同論文の手法・実験結果を再現するものではない。本 Card は Socratic questioning の一般的枠組みに基づく。

## Output

- Statement — 検査した言明
- Question — 当てた問い
- Answerable — 回答案・入力情報から答えられるか
- Classification — `UNDEFINED` / `UNGROUNDED` / `INCONSISTENT` / `LEAP` / `NEEDS_INPUT`
- Impact — 結論または成功条件への影響
- Gap — 回答案に追加すべき定義・根拠・経路の説明

## False Positive Guard

- 問いを立てられることと、回答案に欠陥があることは別である。結論に影響しない曖昧さを指摘にしない。
- 一般的な用語まで定義を要求しない。読み手 (回答仕様の項目 4) にとって解釈が分かれる語に限る。
- 問いの数を成果にしない。
- 回答仕様で既に合意した仮定を `UNGROUNDED` として再指摘しない。
- 定義を足すことで回答が読みにくくなる場合、それは改善ではない (F16)。

## Stop Condition

新しい問いが、既出の分類と同じ箇所しか指さなくなった時点で終了する。

## Evidence

- `PAPER-SOCRATIC` — Socratic Elenchus-inspired multi-agent debate for mitigating hallucinations in large language models (Expert Systems with Applications)
- 参照箇所: 未取得のため特定できない
- Local Path: - (Elsevier 有料のため取得・同梱ともに不可)

## Evidence Strength

LIMITED。

参考文献の本文を取得できていないため、本 Card は同論文の手法の実装ではない。Socratic questioning という一般的な枠組みに対する本 Skill の運用定義である。

## Domain Transfer

MEDIUM。

問いによる検査という枠組み自体は領域を選ばないが、有効性を裏付ける実証を本 Card は持たない。

## Fallback

CORE-AR。
