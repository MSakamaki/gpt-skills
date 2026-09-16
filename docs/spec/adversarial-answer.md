# adversarial-answer 仕様

## 0. 文書情報

- 対象Skill: `adversarial-answer`
- 表示名: `敵対的検証による回答の精度向上`
- 基準日: 2026-09-16
- 対象プロダクト: ChatGPT / Codex / API / Atlas
- 起動方式: 明示起動のみ (`allow_implicit_invocation: false`)
- 外部情報取得: **方法論の探索には利用しない** (共通規定 common.md §3 の「利用しない」に当たる)。回答内容の調査は回答仕様の項目 10 に従う

本書は [common.md](common.md) を継承する。**正本と責務分離 (§1)、共通の不変条件 (§2)、外部情報の取得 (§3)、変更手順 (§4)、変更完了条件 (§5)、spec へ書くべき変更かの判定 (§6)、記述の規約 (§7) は common.md が正本。** 本書はそれらを繰り返さず、`adversarial-answer` に固有の事項だけを書く。

---

## 1. 本書の位置付け

本書を `adversarial-answer` の設計・動作仕様の正本とする。次は本書を実装した成果物であり、**本書と矛盾する場合は本書を優先する** (common.md §1.1)。

```text
src/adversarial-answer/SKILL.md
src/adversarial-answer/agents/openai.yaml
src/adversarial-answer/references/METHOD-ROUTING.md
src/adversarial-answer/references/DESIGN-PRINCIPLES.md
src/adversarial-answer/references/methods/METHOD-*.md
src/adversarial-answer/references/REFERENCE-MANIFEST.md
src/adversarial-answer/references/ROUTER-TEST-CASES.md
```

ただし本書は 2026-09-16 時点の現行実装を仕様化したものである。**本書が定めるのは「何が成り立っていなければならないか」であり、実行手順の細部は Method Card と `SKILL.md` が持つ。** 本書へ Card の `Procedure` を丸写ししない (common.md §7)。

実装の都合だけで本書と異なる挙動を追加し、それを事後的に正本として扱わない。

---

## 2. Skillの目的

ユーザーの依頼を構造化し、不確実性を必要な範囲で確認した後、回答案を作成し、異なる観点から必ず3回の敵対的検証を行う。

単純に同じレビューを3回繰り返すのではない。

依頼ごとに、

```text
Problem Profile
↓
Failure Mode
↓
Applicability
↓
Verification Method
```

を判定し、その回答で起きやすいFailure Modeに適した検証方法を割り当てる。

Skillの成功条件は、

> 多数の批判を生成すること

ではなく、

> 重大な誤り・見落としを発見しつつ、誤った批判や過剰修正によって元の正しい回答を悪化させないこと

である。

---

## 3. 非目的

本Skillは次を目的としない。

- 合意そのものを作る
- 必ず元回答を変更する
- 敵対的指摘を大量生成する
- すべての依頼へ同じ検証方法を適用する
- 論文の手続きを忠実に再現する
- 複数Agentが利用できない場合に処理を停止する
- 研究論文の効果を研究対象外へ無条件に一般化する
- 方法論研究のために毎回Web検索する
- PDFそのものを実行仕様として扱う

---

## 4. UI / 起動仕様

`agents/openai.yaml` は次の意味を持つ。

```yaml
interface:
  display_name: 敵対的検証による回答の精度向上
  short_description: 依頼項目の整理を行い、その内容を確認しつつ3回の敵対的検証で根拠ある高精度な回答を作成
  default_prompt: $adversarial-answer を使い、依頼を整理して根拠を確認し、3回の敵対的検証を経た回答を作成してください。

policy:
  products:
    - chatgpt
    - codex
    - api
    - atlas
  allow_implicit_invocation: false
```

したがって、本Skillは原則としてユーザーが明示的に起動した場合に利用する。

---

## 5. 全体フロー

```text
Skill起動
│
├─ 1. 必須10項目を収集
│
├─ 2. 重大な不確実性を確認
│
├─ 3. 回答仕様を確定
│
├─ 4. Problem Profileを分類
│
├─ 5. Failure Modeを抽出
│
├─ 6. Method候補を抽出
│
├─ 7. Applicabilityを評価
│
├─ 8. 最大3 Methodを選択
│
├─ 9. Route Check
│
├─ 10. 必要なMethod Cardをロード
│
├─ 11. 必要ならPDFを監査目的で参照
│
├─ 12. V0を生成
│
├─ 13. Review Round 1
│
├─ 14. Review Round 2
│
├─ 15. Review Round 3
│
└─ 16. 最終回答
```

Review Roundは必ず3回行う。

---

## 6. 必須入力

回答作成前に、次の10項目すべてについてユーザー自身の明示入力を得る。

1. 目的
2. 依頼内容
3. 背景・前提
4. 対象者
5. 入力情報
6. 制約条件
7. 成功条件・評価基準
8. 出力形式
9. 詳しさ・トーン
10. 根拠・検証方法

`なし`は有効な明示入力とする。

次は入力済みとみなさない。

- AIによる推測
- 過去会話からの暗黙補完
- ユーザーMemory
- 一般論からの補完

すでに明示された項目は再質問しない。

---

## 7. 必須入力収集

不足項目だけを一括で尋ねる。

入力テンプレート:

```markdown
1. 目的：
2. 依頼内容：
3. 背景・前提：
4. 対象者：
5. 入力情報：
6. 制約条件：
7. 成功条件・評価基準：
8. 出力形式：
9. 詳しさ・トーン：
10. 根拠・検証方法：
```

未入力行だけを提示する。

質問を提示したターンでは回答作成を開始しない。

---

## 8. 追加確認

10項目がすべて揃った後、以下を確認する。

1. 曖昧語・未定義語
2. 項目間の矛盾
3. 出典間の矛盾
4. 対象範囲・除外範囲
5. 優先順位
6. トレードオフ
7. 例外
8. 失敗条件
9. 期限・基準時点
10. 測定可能な判断基準
11. 指定された検証水準を満たすために不足している情報

回答が最終結果を大きく変える場合だけ質問する。

重大な確認事項がなければ、

```text
質問なし
```

として同一ターンで次工程へ進む。

---

## 9. 回答仕様

10項目と追加確認で決定した内容を統合し、回答仕様として固定する。

以降、回答仕様を暗黙に変更してはならない。

避けられず新しい仮定を置く場合は記録し、最終回答へ明示する。

---

## 10. Problem Profile

回答仕様を次へ分類する。

| ID            | 分類        |
| ------------- | --------- |
| `REQ`         | 要件・課題整理   |
| `DECISION`    | 意思決定・比較   |
| `CAUSE`       | 原因・仮説分析   |
| `PLAN`        | 計画・施策     |
| `UNCERTAINTY` | 深い不確実性    |
| `CONFLICT`    | 意見・利害対立   |
| `ASSURANCE`   | 高保証・重大リスク |
| `FORECAST`    | 将来予測      |
| `FACT`        | 事実・根拠確認   |
| `GENERIC`     | その他       |

Primary:

```text
0〜1個
```

Secondary:

```text
0個以上
```

分類不能なら `GENERIC` とする。

Problem ProfileからMethodを直接決定してはならない。

---

## 11. Failure Mode

Problem Profileとは独立して検出する。

| ID  | 名称             | 内容                 |
| --- | -------------- | ------------------ |
| F01 | ASSUMPTION     | 暗黙の前提              |
| F02 | CONFIRMATION   | 現在案を支持する情報への偏り     |
| F03 | ALTERNATIVE    | 代替仮説・代替案不足         |
| F04 | FAILURE        | 失敗条件不足             |
| F05 | FUTURE         | 将来条件変化への脆弱性        |
| F06 | PERSPECTIVE    | ステークホルダー・視点不足      |
| F07 | CONSENSUS      | 初期案・多数派・他Agentへの同調 |
| F08 | EVIDENCE       | 根拠不足               |
| F09 | DEFEATER       | 重大な反証が未解決          |
| F10 | UNCERTAINTY    | 不確実性の過度な断定         |
| F11 | AMBIGUITY      | 定義・概念の曖昧さ          |
| F12 | INFORMATION    | 判断に必要な情報不足         |
| F13 | CRITERIA       | 評価基準自体の不備          |
| F14 | CONSTRAINT     | 制約・実行条件の見落とし       |
| F15 | CAUSALITY      | 因果関係の飛躍            |
| F16 | OVERCORRECTION | 敵対的検証による回答悪化       |

---

## 12. Severity

各Failure Modeへ次を付与する。

#### CRITICAL

- 成功条件を直接損なう
- 安全性に関係する
- 法令に関係する
- 不可逆な判断に関係する

#### MAJOR

結論または主要手順が変わる。

#### MINOR

表現または補足レベルに留まる。

Methodは、

```text
CRITICAL → MAJOR
```

の順にCoverageする。

MINORだけを理由にMethodを追加しない。

---

## 13. F07 / F16の特殊扱い

`F07 CONSENSUS` と `F16 OVERCORRECTION` は常に検出対象とする。

ただし専門Methodの選択理由には使用しない。

担当:

```text
F07 → CORE-AR
F16 → Invariant Gate G7
```

---

## 14. Method分類

Methodには3種類ある。

### CORE_PROTOCOL

全Roundで常時使用する。

```text
CORE-AR
```

### EXECUTABLE_METHOD

Review Roundへ直接割り当てる。

```text
SOCRATIC
REQUIREMENTS_ELICITATION
CONSIDER_OPPOSITE
COMPETING_HYPOTHESES
PREMORTEM
ASSUMPTION_BASED_PLANNING
ROBUST_DECISION_MAKING
DEFEATER
```

### DESIGN_PRINCIPLE

Roundとしては選択せず、Skill全体の挙動を制御する。

```text
MARE_PROCESS_SEPARATION
REQUIREMENTS_MAD
ADVERSARIAL_COLLABORATION
FORECAST_CALIBRATION
INDEPENDENT_FIRST
MINORITY_DISSENT
```

---

## 15. Failure Mode → Method候補

| Failure Mode | 第一候補                     | 第二候補                                 |
| ------------ | ------------------------ | ------------------------------------ |
| F01          | ABP                      | SOCRATIC                             |
| F02          | CONSIDER_OPPOSITE        | ACH                                  |
| F03          | ACH                      | CONSIDER_OPPOSITE                    |
| F04          | PREMORTEM                | —                                    |
| F05          | RDM                      | ABP                                  |
| F06          | REQUIREMENTS_ELICITATION | —                                    |
| F07          | CORE-AR                  | CONSIDER_OPPOSITE                    |
| F08          | DEFEATER※                | ACH                                  |
| F09          | DEFEATER                 | —                                    |
| F10          | RDM                      | —                                    |
| F11          | SOCRATIC                 | REQUIREMENTS_ELICITATION             |
| F12          | SOCRATIC                 | REQUIREMENTS_ELICITATION             |
| F13          | 専任Methodなし               | SOCRATIC                             |
| F14          | PREMORTEM                | ABP / RDM / REQUIREMENTS_ELICITATION |
| F15          | ACH                      | SOCRATIC                             |
| F16          | Invariant Gate G7        | DEFEATER                             |

この表は候補生成用であり、選択結果ではない。候補は必ず §18 の Applicability 評価を通す。

Failure Mode には、Method 候補とは別に**担当する Design Principle** が紐づくものがある。原則は Method 候補ではなく、選択した Method の実行のしかたを縛る。

| Failure Mode | 担当する原則 |
|---|---|
| F02 | `ADVERSARIAL_COLLABORATION` (Profile に `CONFLICT` を含む場合) |
| F06 | `MARE_PROCESS_SEPARATION` / `REQUIREMENTS_MAD` |
| F07 | `INDEPENDENT_FIRST` / `MINORITY_DISSENT` / `ADVERSARIAL_COLLABORATION` / `REQUIREMENTS_MAD` |
| F10 | `FORECAST_CALIBRATION` |
| F13 | `MARE_PROCESS_SEPARATION` + Invariant Gate G1 |

発火条件は §33 の表に従う。

---

## 16. F08とDEFEATER

`F08 EVIDENCE` を検出しただけでDEFEATERを選ばない。

次のいずれかが必要。

1. `ASSURANCE` Profileを持つ
2. F08またはF09がCRITICAL
3. 覆ると結論が変わる具体的な主張が存在し、その反証条件を書ける

それ以外の根拠不足は、

```text
G3 FACT
G6 SOURCE
```

で扱う。

---

## 17. F13 CRITERIA

F13専用のExecutable Methodは存在しない。

次で扱う。

```text
Invariant Gate G1
+
MARE_PROCESS_SEPARATION
+
必要ならSOCRATIC
```

### Covers に無い Method を当てる規則

`F13` を `Covers` に持つ Method Card は存在しない。**その Failure Mode の一部分を検査できると Card が明示している Method** は次候補として選んでよいが、次を守る。

- **Primary は `Covers` に持つ Method を優先する。** 他の Failure Mode を `Covers` に持つ適用可能 Method が選択集合にあるなら、そちらを Primary とし、例外で選んだ Method は次候補に置く
- `Covers` に持つ適用可能 Method が 1 つも無い場合に限り、例外で選んだ Method を Primary にしてよい。CORE-AR だけで進むより、部分的にでも検査できる Method を当てる方を採る
- Cover が部分的であることを検証サマリーへ記録する
- Applicability 評価は通常どおり通す。この例外は特化の判定を緩めるだけで、`Do Not Use When` を免除しない

3 Method 枠を埋めるために F13 へ Method を足さない。完全に解決できなければ、未解決事項として最終回答へ残す。

---

## 18. Method選択

1. CRITICALの未Coverage Failure Modeを取得する。
2. なければMAJORを取得する。
3. Failure ModeをCoversに持つMethodを候補化する。
4. `Applicable When` を確認する。
5. `Do Not Use When` を確認する。
6. 適用条件が不明ならMethodを除外する。
7. 最も具体的なMethodをPrimaryにする。
8. 未Coverageの重要Failure Modeが残ればMethodを追加する。
9. Coverageがほぼ重複するMethodを追加しない。
10. 最大3 Methodで停止する。
11. 適用可能Methodが無ければCORE-ARのみ使用する。

数値スコアは使用しない。

---

## 19. 最大3 Method

3は上限であり目標ではない。

有効な例:

```text
1 Method + CORE-AR
2 Method + CORE-AR
3 Method
CORE-ARのみ
```

禁止:

```text
3 Methodを埋めるためだけに
適用条件の弱いMethodを追加する
```

---

## 20. Method境界

### PREMORTEM vs ABP

```text
失敗という結果から逆算
→ PREMORTEM

計画依存の前提を検査
→ ABP
```

### PREMORTEM vs RDM

```text
単一の失敗シナリオ
→ PREMORTEM

2個以上の重要な不確実変数
+
複数Future
→ RDM
```

### ACH vs 案比較

```text
観測を説明する複数仮説
+
識別Evidence
→ ACH

選択肢A/Bの好み・評価
→ ACH禁止
```

### SOCRATIC vs REQUIREMENTS_ELICITATION

```text
定義・概念・因果
→ SOCRATIC

ステークホルダー・視点不足
→ REQUIREMENTS_ELICITATION
```

### DEFEATER vs 一般批判

```text
具体的なClaim
+
反証条件
→ DEFEATER

一般的な懐疑
→ CORE-AR
```

---

## 21. Route Check

V0作成前に必ず実行する。

| ID  | 確認                         |
| --- | -------------------------- |
| RC1 | 最重要Failure Modeは何か         |
| RC2 | Primary Methodは直接それを検査するか  |
| RC3 | Applicable Whenを満たすか       |
| RC4 | Do Not Use Whenに該当しないか     |
| RC5 | Method間Coverageが重複しすぎていないか |
| RC6 | CRITICALが未Coverageでないか     |
| RC7 | より具体的なMethodを見落としていないか     |
| RC8 | False Positiveを増やさないか      |

失敗した場合、Route再選択は1回だけ許可する。

2回目でも未解決なら、残存Failure Modeを記録して進む。

無限ループは禁止。

---

## 22. CORE-AR

### 目的

主回答、Reviewer、Criticを分離し、根拠付き不同意を経て回答を変更する。

### Covers

```text
F07 CONSENSUS
F16 OVERCORRECTION
```

### 常時適用

すべてのReview Roundに適用する。

### Procedure

各Round `i`:

```text
V(i-1)を固定
↓
Reviewer Ri
↓
Critic Ci
↓
Stabilization
↓
採否判定
↓
Vi作成
↓
Invariant Gate
```

Criticの判定:

```text
AGREE

DISAGREE EVIDENCE:
<具体的な反証>

DISAGREE CONCERN:
<方法上・認識上の異議>
```

Stabilizationの最大反復:

```text
5
```

回答案はStabilization中に変更しない。

---

## 23. CORE-ARの研究上の扱い

参考文献:

**Adversarial Review: Structured Disagreement for Grounded Agentic Code Review**

- Authors: Eric S. Qiu / Joyce Gill
- Year: 2026
- arXiv:2608.18167
- Landing Page: https://arxiv.org/abs/2608.18167
- PDF: https://arxiv.org/pdf/2608.18167v1
- Original Domain: Agentic Code Review
- Evidence Strength: LIMITED
- Domain Transfer Risk: HIGH

採用する:

- Main / Reviewer / Critic分離
- 回答案固定
- CriticがReviewerも検証
- 根拠付き不同意
- Consensusを成功条件にしない
- Review stabilization

採用しない:

> 一般回答でも同手法により精度が向上することが実証されている

という扱い。

一般回答への適用は転用である。

---

## 24. SOCRATIC

### Purpose

定義、前提、一貫性、因果、反例を問いによって検査する。

### Covers

```text
F01 F11 F12 F15
```

### Applicable

- 未定義の評価語・専門語・抽象概念
- 根拠から結論への飛躍
- 論点自体が曖昧
- 特化Methodが使えない

### Do Not Use

- 用語が厳密に定義済み
- 問題の中心がPerspective不足
- 問題の中心が具体的Claimの反証

### Procedure

重要なStatementを3〜6個選び、

- Definition
- Assumption
- Consistency
- Causality
- Counterexample

のうち3種類以上を当てる。

不足を:

```text
UNDEFINED
UNGROUNDED
INCONSISTENT
LEAP
NEEDS_INPUT
```

へ分類する。

### False Positive Guard

質問できること自体を欠陥と扱わない。

### Evidence

Socratic Elenchus-inspired multi-agent debate for mitigating hallucinations in large language models

- Landing Page: https://www.sciencedirect.com/science/article/pii/S0957417426011218
- PDF: 非同梱
- Evidence Strength: LIMITED
- Transfer Risk: MEDIUM

原典本文未取得のため、本Methodの具体的手順はSkill固有仕様である。

---

## 25. REQUIREMENTS_ELICITATION

### Purpose

複数の利用者・関係者視点から候補要件を発見する。

### Covers

```text
F06 F11 F12 F14
```

### Applicable

- 要件・仕様・課題一覧
- 複数利用者
- 抜け漏れ検出

### Do Not Use

- 対象者と利用文脈が完全固定
- 定義曖昧さのみ
- 事実確認・原因分析

### Procedure

3〜6種類のStakeholderを作る。

最低限検討:

- 利用者
- 運用・保守
- 失敗時対応者
- 決裁者
- 想定外利用者
- 間接的影響者

各Stakeholderについて:

```text
Action
Observation
Challenge
```

を作る。

候補要件は必ず:

```text
CANDIDATE_REQUIREMENT
```

として扱う。

既存要件と比較:

```text
COVERED
PARTIAL
MISSING
```

### 禁止

生成Personaの要求を、

```text
CONFIRMED_REQUIREMENT
```

と扱わない。

### Evidence

**Elicitron: An LLM Agent-Based Simulation Framework for Design Requirements Elicitation**

- arXiv:2404.16045
- Landing Page:
  https://www.research.autodesk.com/publications/elicitron-llm-based-simulation-framework-design-requirements/
- PDF:
  https://www.research.autodesk.com/app/uploads/2024/11/Elicitron.pdf
- Evidence Strength: MODERATE
- Transfer Risk: MEDIUM

---

## 26. CONSIDER_OPPOSITE

### Purpose

現在の結論の反対側を成立させる立場で検討する。

### Covers

```text
F02 F03 F07
```

### Applicable

- 明確な結論
- 対立可能な立場
- 同じ情報から別結論を構成可能

### Do Not Use

- 反転可能な結論がない
- 原因仮説をEvidenceで識別できる
- 結論が回答仕様で固定
- 反対立場が明確に事実に反する

### Resolution

```text
元結論を維持
条件付きに変更
結論変更
```

### Guard

反対意見を構成できたこと自体を、元回答が誤りである証拠にしない。

### Evidence

**Considering the Opposite: A Corrective Strategy for Social Judgment**

- DOI: 10.1037/0022-3514.47.6.1231
- Landing Page:
  https://pubmed.ncbi.nlm.nih.gov/6527215/
- PDF: 非同梱
- Evidence Strength: LIMITED
- Transfer Risk: HIGH

---

## 27. COMPETING_HYPOTHESES

### Purpose

複数の原因仮説を、支持Evidenceの量ではなく矛盾によって除外する。

### Covers

```text
F02 F03 F08 F15
```

### Applicable

すべて必要:

- 説明仮説が2つ以上
- 仮説を識別するEvidenceがある、または取得可能

### Do Not Use

- 案比較
- 将来の失敗探索
- 識別Evidenceが取得不能
- 説明対象が未定義

### Procedure

Evidence × Hypothesis Matrixを作る。

セル:

```text
C = Consistent
I = Inconsistent
N = Non-diagnostic
```

`I` に基づいて除外する。

`C` の個数による人気投票は禁止する。

### Evidence

**The "Analysis of Competing Hypotheses" in Intelligence Analysis**

- DOI: 10.1002/acp.3550
- Landing Page:
  https://onlinelibrary.wiley.com/doi/10.1002/acp.3550
- PDF: 非同梱
- Evidence Strength: LIMITED
- Transfer Risk: MEDIUM

ACHがBias除去を保証するとは扱わない。

---

## 28. PREMORTEM

### Purpose

計画が将来失敗したと仮定し、その原因を逆算する。

### Covers

```text
F04 F14
```

### Applicable

- 具体的な計画・施策・決定
- 実行主体、対象、時間軸のいずれかが特定可能

### Do Not Use

- 事実確認
- 既発生事象の原因分析
- 方針レベルで失敗判定不能
- 複数Futureが中心

### Evidence State

生成した原因を:

```text
EVIDENCED
PLAUSIBLE
SPECULATIVE
```

へ分類する。

`SPECULATIVE` はReview Issueにしない。

### Evidence

**Back to the Future: Temporal Perspective in the Explanation of Events**

- DOI: 10.1002/bdm.3960020103
- Landing Page:
  https://onlinelibrary.wiley.com/doi/abs/10.1002/bdm.3960020103
- PDF: 非同梱
- Evidence Strength: LIMITED
- Transfer Risk: HIGH

Premortemにより失敗予防が保証されるとは扱わない。

---

## 29. ASSUMPTION_BASED_PLANNING

### Purpose

計画を成立させる前提を、

```text
load-bearing
vulnerable
```

の2軸で評価する。

### Covers

```text
F01 F05 F14
```

最優先:

```text
load-bearing = yes
AND
vulnerable = yes
```

各前提について:

```text
Assumption
Load-bearing
Vulnerable
Signpost
Action
Gap
```

を記録する。

### Evidence

**Assumption-Based Planning: A Planning Tool for Very Uncertain Times**

- RAND MR-114
- Landing Page:
  https://www.rand.org/pubs/monograph_reports/MR114.html
- PDF:
  https://www.rand.org/content/dam/rand/pubs/monograph_reports/2005/MR114.pdf
- Bundled: NO
- Redistribution: NO
- Evidence Strength: METHODOLOGICAL
- Transfer Risk: MEDIUM

---

## 30. ROBUST_DECISION_MAKING

### Purpose

単一予測ではなく複数のplausible futureに戦略を当て、脆弱性を探す。

### Covers

```text
F05 F10 F14
```

### Applicable

すべて必要:

- 将来条件依存の戦略・方針
- 重要な不確実変数が2つ以上
- 複数Futureを構成する意味がある

### Procedure

不確実変数を2〜4個選ぶ。

最低限:

- 現在想定のFuture
- 不利方向Future
- 変数が逆方向へ振れたFuture

を作る。

Vulnerabilityは、

```text
X > A AND Y < B のとき成立しない
```

のような条件で書く。

### Evidence

**Robust Decision Making**

- Author: Robert J. Lempert
- DOI: 10.1007/978-3-030-05252-2_2
- Landing Page:
  https://link.springer.com/chapter/10.1007/978-3-030-05252-2_2
- PDF:
  https://link.springer.com/content/pdf/10.1007/978-3-030-05252-2_2.pdf
- Evidence Strength: MODERATE
- Transfer Risk: MEDIUM

本Skillでは原典の定量シミュレーションを再現せず、定性的Stress Testへ縮約する。

---

## 31. DEFEATER

### Purpose

回答の主要Claimを:

```text
CLAIM
ARGUMENT
EVIDENCE
```

へ分解し、Claimを覆しうる具体的なdoubtを検証する。

### Covers

```text
F08 F09 F16
```

### Applicable

- 高保証
- 見落とし許容度が低い
- 中心Claimが限定的Evidenceに依存

### Do Not Use

- Claim自体が不明確
- 探索的回答
- 具体的Claimなし
- 単純な事実確認
- 高保証要求がなくF08がMINOR

### Defeater Status

```text
DISMISSED
REFUTED
CONFIRMED
UNRESOLVED
```

`UNRESOLVED` を無理に消さない。

### Evidence

**Defeaters and Eliminative Argumentation in Assurance 2.0**

- arXiv:2405.15800
- Landing Page:
  https://arxiv.org/abs/2405.15800
- PDF:
  https://arxiv.org/pdf/2405.15800v1
- Evidence Strength: METHODOLOGICAL
- Transfer Risk: MEDIUM

---

## 32. Design Principles

### MARE_PROCESS_SEPARATION

生成する役割と検証する役割を分離する。

候補要件、仮説、失敗原因、defeaterは、生成時点では未採用とする。

---

### REQUIREMENTS_MAD

Requirements Elicitationでは、

```text
候補要件を必要とする立場
vs
候補要件を不要とする立場
```

を検討してから採否する。

候補数を品質指標にしない。

---

### ADVERSARIAL_COLLABORATION

`CONFLICT` Profileでは、各立場について:

```text
何が観測されたら
その立場を弱めるのか
```

を先に定義する。

単一LLMでこれを実行しても、独立した研究者によるAdversarial Collaborationを再現したとは表現しない。

---

### FORECAST_CALIBRATION

`FORECAST` / `UNCERTAINTY` では、判断に効く将来主張を可能な限り検証可能にする。

例:

```text
可能性が高い
```

だけで終わらず、

```text
確率
範囲
期限
観測条件
```

のいずれかを可能な範囲で示す。

根拠なしの数値化は禁止する。

---

### INDEPENDENT_FIRST

**全 Round に常時かかる。実行時の規則は `SKILL.md` §6 が正本** (§33)。

Reviewerは他Reviewerの判断を見る前に独立判断する。

CriticはReviewerの指摘を見る前にVnを独立確認する。

前担当者の非公開思考過程は渡さない。

---

### MINORITY_DISSENT

**全 Round の安定化工程に常時かかる。実行時の規則は `SKILL.md` §6 が正本** (§33)。

Consensusへ無理に収束させない。

残存する異論は異論として保持する。

削除したReview Issueには削除理由を残す。

---

## 33. Design Principle適用条件

次のいずれかに当たる場合に `DESIGN-PRINCIPLES.md` を読む。

1. Problem Profile に `CONFLICT` / `FORECAST` / `UNCERTAINTY` のいずれかが含まれる
2. `REQUIREMENTS_ELICITATION` を選択した (`REQUIREMENTS_MAD` がその Round にかかるため)
3. 要件・原因・対策を生成した同一役割が、そのまま妥当性判断を行いそうである

各原則が実際にかかる条件は次のとおり。**Failure Mode を検出しただけでは発火しない。**

| 原則 | かかる条件 |
|---|---|
| `MARE_PROCESS_SEPARATION` | 生成と検証が同一役割になりそうな場合 (条件 3) |
| `REQUIREMENTS_MAD` | `REQUIREMENTS_ELICITATION` を実行する Round に限る |
| `ADVERSARIAL_COLLABORATION` | Problem Profile に `CONFLICT` を含む場合に限る |
| `FORECAST_CALIBRATION` | Problem Profile に `FORECAST` / `UNCERTAINTY` を含む場合 |
| `INDEPENDENT_FIRST` / `MINORITY_DISSENT` | 上の条件に関わらず**全 Round に常時かかる** |

`INDEPENDENT_FIRST` と `MINORITY_DISSENT` は常時かかるため、**実行時の規則は `SKILL.md` §6 が正本**であり、`DESIGN-PRINCIPLES.md` を読まない Route でも §6 の記述だけで満たせる。`DESIGN-PRINCIPLES.md` 側はこの 2 原則について根拠と `Check` を持つ。

---

## 34. 実行モード

### independent_agents

独立subagentを利用可能な場合。

各Roundで新しいReviewer / Criticを使用する。

### role_separated_single_model

独立subagentが利用できない場合。

同じモデル内でReviewer / Criticを論理分離する。

この場合、

> 独立した複数Agentによる検証

とは記録しない。

処理停止やユーザー確認は行わない。

---

## 35. V0作成

回答仕様確定とRoute完了後に初めて回答案を生成する。

内部版:

```text
V0
```

V0をユーザーへ最終回答として提示しない。

項目10に従って必要な調査を行う。

方法論を探すためのWeb検索は行わない。

---

## 36. Review Round

必ず:

```text
3 Round
```

行う。

各Round:

```text
Method-specific Attack
+
CORE-AR
+
Invariant Gate
```

で構成する。

---

## 37. Round割当

```text
Round 1 = Primary Method

Round 2 = Secondary Method
           またはCORE-AR事実・根拠Attack

Round 3 = Third Method
           またはCORE-AR実行可能性・境界Attack
```

同じ批判の言い換えで3回を消化してはならない。

---

## 38. Critic

Criticは各Review Issueを:

```text
AGREE
DISAGREE EVIDENCE
DISAGREE CONCERN
```

へ分類する。

さらに:

- Review全体の網羅性
- MethodのApplicable When
- MethodのDo Not Use When

も検査する。

---

## 39. Stabilization

ReviewerとCriticがReview文だけをやり取りする。

最大:

```text
5回
```

回答案は変更しない。

`DISAGREE EVIDENCE`:

具体的Evidenceに従って修正または削除。

`DISAGREE CONCERN`:

Reviewerが追加根拠を示せる場合だけ維持。

示せない場合は:

- 範囲を狭める
- 削除する

---

## 40. Review Issue採否

各Issueについて:

```text
採用 / 不採用
理由
Evidence
```

を保持する。

推測的指摘を「念のため」で採用しない。

---

## 41. Invariant Gate

全Roundで必須。

### G1 SPEC

確定した回答仕様を満たすか。

### G2 LOGIC

内部矛盾がないか。

### G3 FACT

事実とEvidenceが一致するか。

### G4 UNCERTAINTY

推測を事実扱いしていないか。

### G5 CONSTRAINT

制約、安全要件、上位ルールを満たすか。

### G6 SOURCE

引用元が実際にClaimを支持するか。

### G7 OVERCORRECTION

Reviewによって正しい情報を弱めたり失ったりしていないか。

各Gateについて確認記録を残す。

記録がなければ未実施と扱う。

---

## 42. 最終回答

基本構成:

1. 最終回答
2. 重要な前提・不確実性
3. 根拠・出典
4. 検証サマリー

ユーザー指定形式がある場合はそちらを優先する。

---

## 43. 検証サマリー

最低限:

- Problem Profile
- 主なFailure Mode
- Severity
- 使用Method
- Method選択理由
- 各Roundの主な攻撃観点
- 採用した修正
- Coverage不能Failure Mode
- 残存リスク
- MethodのDomain Transfer制約
- 実行モード

を示す。

内部思考過程は開示しない。

---

## 44. Referenceの基本方針

PDFは:

```text
一次根拠
```

である。

Method Cardは:

```text
Canonical Execution Specification
```

である。

実行時順序:

```text
SKILL.md
↓
METHOD-ROUTING.md
↓
選択したMethod Card
↓
必要な場合のみPDF
```

禁止:

```text
references/papers/**/*.pdf
を毎回全部読む
```

---

## 45. PDF未存在時

PDFが無いこと自体はMethod実行障害ではない。

Method Cardだけで実行する。

Method Card自体が:

- 無い
- 読めない

場合にのみFallbackを使用する。

方法論PDFをWeb検索して補完しない。

---

## 46. Current Reference Manifest

### 同梱

#### PAPER-AR

- File: `references/papers/core/adversarial-review-2608.18167.pdf`
- Redistribution: UNKNOWN
- Bundled: YES

#### PAPER-MARE

- File: `references/papers/requirements/mare-2405.03256.pdf`
- Redistribution: UNKNOWN
- Bundled: YES

#### PAPER-ELICITRON

- File: `references/papers/requirements/elicitron.pdf`
- Redistribution: UNKNOWN
- Bundled: YES

#### PAPER-DEFEATERS

- File: `references/papers/assurance/defeaters-2405.15800.pdf`
- Redistribution: YES
- Bundled: YES

#### PAPER-RDM

- File: `references/papers/planning/robust-decision-making.pdf`
- Redistribution: YES
- Bundled: YES

#### PAPER-MAD-RE

- File: `references/papers/requirements/mad-re-2507.05981.pdf`
- Redistribution: UNKNOWN
- Bundled: YES

---

## 47. PDF同梱に関する現行仕様

通常原則として:

```text
Redistribution Allowed = NO / UNKNOWN
→ 自動同梱しない
```

とする。

ただし2026-09-16時点の現行仕様では、

```text
PAPER-AR
PAPER-MARE
PAPER-ELICITRON
PAPER-MAD-RE
```

の4件について、

```text
Redistribution Allowed = UNKNOWN
Bundled = YES
```

を正式な現状仕様として扱う。

これは現時点ではDeviationではない。

将来この扱いを変更する場合は仕様変更とする。

---

## 48. 非同梱Reference

### PREMORTEM

- DOI: 10.1002/bdm.3960020103
- Redistribution: NO

### ABP

- RAND MR-114
- Redistribution: NO

### ACH

- DOI: 10.1002/acp.3550
- Redistribution: NO

### CONSIDER_OPPOSITE

- DOI: 10.1037/0022-3514.47.6.1231
- Redistribution: NO

### SOCRATIC

- Elsevier PII: S0957417426011218
- Redistribution: NO

### ADVERSARIAL_COLLABORATION

- DOI: 10.1037/amp0001391
- Redistribution: UNKNOWN-RESTRICTED

### FORECAST_CALIBRATION

- DOI: 10.1177/0963721414534257
- Redistribution: UNKNOWN-RESTRICTED

---

## 49. Method Card Fallback

| Method                   | Fallback          |
| ------------------------ | ----------------- |
| CORE-AR                  | なし                |
| SOCRATIC                 | CORE-AR           |
| REQUIREMENTS_ELICITATION | SOCRATIC          |
| CONSIDER_OPPOSITE        | CORE-AR           |
| COMPETING_HYPOTHESES     | CONSIDER_OPPOSITE |
| PREMORTEM                | CORE-AR           |
| ABP                      | CORE-AR           |
| RDM                      | PREMORTEM         |
| DEFEATER                 | CORE-AR           |

Fallback使用時は記録する。

---

## 50. 禁止事項

以下を禁止する。

- Problem ProfileだけでMethodを決める
- Method選択を数値スコア化する
- 3 Methodを必ず埋める
- PDFを全件ロードする
- PDFを実行仕様にする
- PDFが無いだけでMethodを使用不能にする
- Missing PDFをWeb検索で自動補完する
- 研究対象外への一般化を原論文の結論として書く
- 単一モデルを独立multi-agentと表現する
- Persona生成要求を実要求と確定する
- Consensusを正しさとみなす
- 指摘数を品質指標にする
- 専門MethodによりInvariant Gateを省略する
- Failure Modeがないのに専門Methodを無理に選ぶ
- 回答仕様をReview中に暗黙変更する

---

## 51. Router Regression

Router変更時は必ずRegression Testを実施する。

現在のCanonical Test Set:

```text
36 cases
```

初回評価では3 FAILが発生し、DEFEATERの過剰適用を修正後:

```text
36 / 36 PASS
```

となっている。

---

## 52. Router Test判定

PASS:

- required_methodsをすべて選択
- 選択Methodがallowed_methods内
- Primaryがforbidden_primaryではない

FAIL:

上記を満たさない。

AMBIGUOUS:

仕様からMethod選択を一意または許容集合へ決められない。

FAIL時:

```text
テストを都合よく変える
```

のではなく、

```text
Routing Rule
または
Method Card
```

を修正する。

---

## 53. Canonical Router Test Matrix

| ID        | Profile              | Required           | 主なAllowed                  | Forbidden Primary                                    |
| --------- | -------------------- | ------------------ | -------------------------- | ---------------------------------------------------- |
| REQ-001   | REQ                  | —                  | REQ_ELICITATION / SOCRATIC | ACH / PREMORTEM / RDM                                |
| REQ-002   | REQ                  | SOCRATIC           | SOCRATIC                   | REQ_ELICITATION / DEFEATER / PREMORTEM               |
| REQ-003   | REQ                  | REQ_ELICITATION    | REQ_ELICITATION            | SOCRATIC / ACH / RDM                                 |
| DEC-001   | DECISION             | CONSIDER_OPPOSITE  | COTO / ABP                 | ACH / PREMORTEM                                      |
| DEC-002   | DECISION             | SOCRATIC           | SOCRATIC / COTO            | ACH / PREMORTEM / RDM                                |
| DEC-003   | DECISION             | COTO               | COTO / PREMORTEM           | ACH / RDM                                            |
| CAUSE-001 | CAUSE                | ACH                | ACH / SOCRATIC             | PREMORTEM / ABP / COTO / RDM                         |
| CAUSE-002 | CAUSE                | ACH                | ACH / COTO                 | PREMORTEM / ABP / REQ_ELICITATION                    |
| CAUSE-003 | CAUSE                | ACH                | ACH / DEFEATER / SOCRATIC  | PREMORTEM / RDM                                      |
| PLAN-001  | PLAN                 | —                  | ABP / PREMORTEM            | ACH / REQ_ELICITATION / DEFEATER                     |
| PLAN-002  | PLAN                 | PREMORTEM          | PREMORTEM / ABP            | RDM / ACH / COTO                                     |
| PLAN-003  | PLAN+UNCERTAINTY     | ABP                | ABP / RDM / PREMORTEM      | PREMORTEM Primary / ACH                              |
| UNC-001   | UNCERTAINTY+DECISION | RDM                | RDM / ABP                  | PREMORTEM / ACH / SOCRATIC                           |
| UNC-002   | UNCERTAINTY+PLAN     | RDM                | RDM / ABP                  | ACH / REQ_ELICITATION / PREMORTEM                    |
| UNC-003   | PLAN+UNCERTAINTY     | PREMORTEM          | PREMORTEM / ABP            | RDM / ACH                                            |
| CONF-001  | CONFLICT+DECISION    | COTO               | COTO / REQ_ELICITATION     | ACH / PREMORTEM / RDM                                |
| CONF-002  | CONFLICT+ASSURANCE   | DEFEATER           | DEFEATER / COTO            | ACH / REQ_ELICITATION / RDM                          |
| CONF-003  | CONFLICT+DECISION    | COTO               | COTO / SOCRATIC            | ACH / PREMORTEM / DEFEATER                           |
| ASSR-001  | ASSURANCE            | DEFEATER           | DEFEATER / SOCRATIC / COTO | SOCRATIC Primary / REQ_ELICITATION / ACH / PREMORTEM |
| ASSR-002  | ASSURANCE+FACT       | DEFEATER           | DEFEATER / SOCRATIC        | PREMORTEM / ACH / RDM                                |
| ASSR-003  | PLAN+ASSURANCE       | PREMORTEM+DEFEATER | PREMORTEM / DEFEATER / ABP | ACH / REQ_ELICITATION / RDM                          |
| FCST-001  | FORECAST             | —                  | DEFEATER / COTO            | RDM / PREMORTEM / ACH                                |
| FCST-002  | FORECAST+DECISION    | RDM                | RDM / ABP                  | ACH / REQ_ELICITATION / PREMORTEM                    |
| FCST-003  | FORECAST             | —                  | DEFEATER / COTO            | RDM / PREMORTEM / ABP                                |
| FACT-001  | FACT                 | —                  | COREのみ                     | DEFEATER / ACH / PREMORTEM / RDM / ABP               |
| FACT-002  | FACT                 | —                  | COREのみ                     | DEFEATER / ACH / PREMORTEM / RDM / COTO              |
| FACT-003  | FACT                 | —                  | SOCRATIC補助可                | ACH / PREMORTEM / DEFEATER                           |
| GEN-001   | GENERIC              | —                  | SOCRATIC                   | ACH / PREMORTEM / RDM / DEFEATER / ABP               |
| GEN-002   | GENERIC              | —                  | COREのみ                     | 全専門Method                                            |
| GEN-003   | GENERIC+DECISION     | SOCRATIC           | SOCRATIC / REQ_ELICITATION | ACH / PREMORTEM / RDM / DEFEATER                     |
| BND-001   | PLAN                 | ABP                | ABP / PREMORTEM            | PREMORTEM Primary / ACH / RDM                        |
| BND-002   | PLAN                 | PREMORTEM          | PREMORTEM / ABP            | ABP Primary / ACH / RDM                              |
| BND-003   | DECISION             | COTO               | COTO / SOCRATIC / ABP      | ACH / PREMORTEM                                      |
| BND-004   | CAUSE                | ACH                | ACH / SOCRATIC             | COTO / PREMORTEM / RDM                               |
| BND-005   | GENERIC              | —                  | SOCRATIC                   | DEFEATER / ACH / PREMORTEM / RDM                     |
| BND-006   | PLAN+UNCERTAINTY     | RDM                | RDM / ABP / PREMORTEM      | ACH / REQ_ELICITATION / DEFEATER                     |

---

## 54. Method Coverage Test

各Executable Methodは最低限:

```text
Positive >= 3
Negative >= 3
Boundary >= 2
```

を満たす。

必須Boundary:

- Premortem vs ABP
- Premortem vs RDM
- ACH vs 単純案比較
- Socratic vs Requirements Elicitation
- Defeater vs 一般批判
- FACT vs CAUSE
- PLAN vs UNCERTAINTY
- DECISION vs CONFLICT
- ASSURANCE Secondary
- GENERIC fallback

---

## 55. 既知の未解決仕様

### F13

CRITERIA専用Executable Methodが存在しない。

これは現行仕様上の既知制約である。

SOCRATIC / MARE / G1で部分的に扱う。

### Ambiguous Routing

`PLAN-001` のように、入力だけでは最重要Failure Modeが一意に決まらないケースが存在する。

その場合は複数MethodをAllowedとして扱う。

一意選択を無理に要求しない。

---

## 56. Acceptance Criteria

変更後、最低限次を満たす。

### Input

- 10項目が揃う前にV0を生成しない
- 未入力を自動補完しない
- `なし`を受理する
- 同じ項目を不要に再質問しない

### Routing

- Problem Profileから直接Methodを決めない
- Severity順にCoverageする
- Applicabilityを必ず評価する
- 最大3 Method
- 数値スコアなし
- RC1〜RC8実施
- 再Route最大1回

### Review

- 必ず3 Round
- Vn固定
- Reviewer / Critic分離
- Stabilization最大5
- Invariant Gate全Round
- 同じ批判の繰り返し禁止

### Evidence

- Method CardをCanonicalとする
- PDF全件ロード禁止
- Method researchとSkill-specific adaptationを区別する
- Domain Transferを隠さない

### Output

- 重要な不確実性を明示
- Coverage不能を明示
- role_separated時は独立Agentと表現しない
- 検証サマリーを出力

---

## 57. Size / Packaging

最終Skill ZIP:

```text
<= 25 MB
```

を必須とする。

現行保守ツールでは、参考実装上:

```text
20 MB以上 → WARN
25 MB超過 → ERROR
```

として扱う。

PDFを無制限に増やさない。

削減時の優先基準:

1. Failure Mode Coverage
2. Evidence Strength
3. 利用頻度
4. License / Redistribution
5. File Size

---

## 58. Reference Manifest検証

Bundled PDFについて:

- File exists
- Title一致
- Authors一致
- SHA256一致
- File Size一致
- Manifestとの一致

を確認する。

PDFが無いReferenceについて:

```text
Bundled: NO
```

を明記する。

別論文への無断置換は禁止する。

---

## 59. 変更時の保守手順

変更の基本手順と完了条件は [common.md](common.md) §4 / §5 が正本。本Skillでは Method を追加・変更する際、そこへ次を加える。

1. 本specを先に変更する
2. Failure Mode Coverage を定義する
3. `Applicable When` / `Do Not Use When` を定義する
4. Research-backed 部分と Skill-specific adaptation を分離する
5. Evidence Strength (§63) と Domain Transfer Risk (§64) を定義する
6. Fallback (§49) を定義する
7. `METHOD-ROUTING.md` を更新する
8. Method Card を更新する
9. Router Test (§53) を追加・修正し、全 Regression を実行する
10. 他 Method との Boundary Test (§54) を追加する
11. `SKILL.md` との整合性を確認する
12. `REFERENCE-MANIFEST.md` を更新する

**テストを通すためだけの例外ルール追加は禁止する。** Route の誤りが出たらテストではなく Routing Rule か Method Card を直す (§52)。

---

## 60. Method削除

Methodを削除する場合:

1. CoverageしていたFailure Modeを確認
2. Fallbackを確認
3. Routerから削除
4. Testを修正
5. Design Principleへの影響確認
6. PDF / Manifestの扱い確認
7. Regression Test
8. Coverage不能Failure Modeが増えた場合は仕様へ明記

---

## 61. Reference追加

新論文を追加しても、即座にMethodを追加しない。

まず:

```text
どのFailure Modeを解決するか
```

を定義する。

既存MethodとCoverageが同一なら、新Methodではなく既存MethodのEvidence強化を優先する。

---

## 62. 新Method採用基準

以下を満たす必要がある。

- 既存Methodで十分CoverできないFailure Modeがある
- 実行手順へ変換可能
- Applicabilityを書ける
- Do Not Useを書ける
- False Positive Guardを書ける
- Stop Conditionを書ける
- Fallbackを書ける
- 原典とSkill転用部分を区別できる
- 既存MethodとのBoundary Testを書ける

---

## 63. Evidence Strength

使用値:

```text
STRONG
MODERATE
LIMITED
METHODOLOGICAL
```

`METHODOLOGICAL` は実証効果ではなく方法論記述を意味する。

Evidence StrengthをMethod選択の数値スコアには使わない。

---

## 64. Domain Transfer Risk

使用値:

```text
LOW
MEDIUM
HIGH
```

HIGHだからMethodを禁止するわけではない。

最終検証サマリーで転用上の限界を示す。

---

## 65. 完了条件

[common.md](common.md) §5 が正本。本Skillでは、そこへ次を加える。

```text
[ ] SKILL.md 整合
[ ] METHOD-ROUTING 整合
[ ] 全 Method Card 整合
[ ] DESIGN-PRINCIPLES 整合
[ ] REFERENCE-MANIFEST 整合
[ ] Router Regression 36 ケース全 PASS
[ ] Boundary Test 全 PASS (§54)
[ ] 同梱 PDF の SHA256 一致
[ ] Package size 確認 (§57)
```

---

## 66. 設計上の最重要不変条件

以下を変更する場合は、単なるリファクタではなく仕様変更として扱う。

1. 10項目すべてをユーザーから明示取得する
2. 回答仕様確定前に回答案を作らない
3. 必ず3回Reviewする
4. CORE-ARを全Roundへ適用する
5. ReviewerとCriticを分離する
6. Review中は回答案を固定する
7. Problem ProfileからMethodを直接選ばない
8. Method最大3
9. Method選択へ数値スコアを使わない
10. Invariant Gateを全Roundで実施する
11. PDFではなくMethod Cardを実行仕様とする
12. Missing PDFをWebで自動補完しない
13. 研究結果を対象外へ無条件に一般化しない
14. Consensusを正解とみなさない
15. Overcorrectionを必ず検査する
16. 検証不能な重大事項を未解決として残せる
17. 単一モデル実行を独立multi-agentと表現しない
18. 検証結果の監査可能な要約を利用者へ示す
