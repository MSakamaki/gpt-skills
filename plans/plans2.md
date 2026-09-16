# adversarial-answer Skill v2

## Method Routing / Local Research References 実装仕様

## 0. この仕様の位置付け

既存Skill `adversarial-answer` を改修する。

目的は、現在の単一論文ベースの敵対的検証から、ユーザー依頼の性質に応じて適切な検証方法論を選択する方式へ拡張すること。

重要：

* 既存Skillの「10項目確認」は維持する。
* 既存Skillの「3回の敵対的検証」も維持する。
* Web検索によって検証方法論を毎回探さない。
* 検証方法論の一次資料は `references/` にローカル保持する。
* 実行時に全PDFを読むことは禁止する。
* PDFは方法論の根拠であり、実際の実行仕様はMethod Cardに固定する。
* 論文の研究対象外へ一般化するときは、その転用を明示する。

---

# 1. 目標

次のフローを実現する。

```text
User Request
    ↓
10項目確認
    ↓
回答仕様確定
    ↓
Problem Profile
    ↓
Failure Mode Detection
    ↓
Method Routing
    ↓
Route Check
    ↓
必要なMethod Cardのみロード
    ↓
必要な原論文PDFのみ参照
    ↓
V0作成
    ↓
Review #1
    ↓
Review #2
    ↓
Review #3
    ↓
Final Answer
```

「この質問はPLANだからPremortem」のような単純分類はしない。

---

# 2. 最重要設計原則

ルーティングは次の順序にする。

```text
Question Type
    ↓
Failure Mode
    ↓
Applicability
    ↓
Method
```

Methodを直接Question Typeから決定してはならない。

理由：

同じ「計画」でも、

```text
暗黙前提が問題
→ Assumption-Based Planning

失敗条件が問題
→ Premortem

多数の将来条件への脆弱性が問題
→ Robust Decision Making
```

と適切なMethodが異なるため。

---

# 3. Adversarial Reviewの位置付け

`Adversarial Review: Structured Disagreement for Grounded Agentic Code Review`

を全Methodの共通実行プロトコル `CORE-AR` とする。

ただし、一般的な回答精度向上が同論文によって実証されたとは扱わない。

採用するのは次の構造のみ。

```text
Main
↓
Reviewer
↓
Critic
↓
Structured Disagreement
↓
Review Stabilization
↓
Main Revision
```

以下を必須とする。

* Main / Reviewer / Criticを論理的に分離する。
* Review中は対象回答を固定する。
* Criticは回答だけではなくReviewerの指摘も検証する。
* 不同意には根拠を要求する。
* Consensus自体を成功条件にしない。
* Reviewが安定してから回答を変更する。

論文：

Adversarial Review: Structured Disagreement for Grounded Agentic Code Review
arXiv:2608.18167

論文ページ：
[Adversarial Review — arXiv](https://arxiv.org/abs/2608.18167?utm_source=chatgpt.com)

PDF：
[Adversarial Review PDF](https://arxiv.org/pdf/2608.18167?utm_source=chatgpt.com)

保存候補：

```text
references/papers/core/adversarial-review-2608.18167.pdf
```

Role:

```text
CORE_PROTOCOL
```

---

# 4. Problem Profile

10項目確定後、依頼を以下へ分類する。

複数選択可能。

```text
REQ          要件・課題整理
DECISION     意思決定・比較
CAUSE        原因・仮説分析
PLAN         計画・施策
UNCERTAINTY  深い不確実性
CONFLICT     意見・利害対立
ASSURANCE    高保証・重大リスク
FORECAST     将来予測
FACT         事実・根拠確認
GENERIC      その他
```

Primaryを0～1個、Secondaryを0～複数保持する。

分類できない場合は `GENERIC` とする。

無理に既存カテゴリへ押し込まない。

---

# 5. Failure Mode

Problem Profileとは独立に検出する。

```text
F01 ASSUMPTION
    暗黙の前提

F02 CONFIRMATION
    現在案を支持する情報へ偏る

F03 ALTERNATIVE
    代替仮説・代替案不足

F04 FAILURE
    失敗条件不足

F05 FUTURE
    将来条件変化への脆弱性

F06 PERSPECTIVE
    ステークホルダー・視点不足

F07 CONSENSUS
    初期回答・多数派・他Agentへの同調

F08 EVIDENCE
    根拠不足

F09 DEFEATER
    重大な反証が未解決

F10 UNCERTAINTY
    不確実性を過度に断定

F11 AMBIGUITY
    定義・概念の曖昧さ

F12 INFORMATION
    判断に必要な情報不足

F13 CRITERIA
    評価基準自体の不備

F14 CONSTRAINT
    制約・実行条件の見落とし

F15 CAUSALITY
    因果関係の飛躍

F16 OVERCORRECTION
    敵対的検証によって正しい内容を悪化させる危険
```

Severity：

```text
CRITICAL
MAJOR
MINOR
```

Method選択ではCRITICAL → MAJORの順でCoverageする。

---

# 6. Method Registry

以下を初期Methodとして実装する。

## M01 SOCRATIC

用途：

```text
F01
F11
F12
F15
```

主な対象：

```text
REQ
DECISION
GENERIC
```

問いによって、

* 定義
* 前提
* 矛盾
* 因果
* 反例

を検査する。

Socratic Elenchus系研究は、単純なdebateではなくcritical questioningとconceptual clarificationを中心にしている。

参考論文：

Socratic Elenchus-inspired multi-agent debate for mitigating hallucinations in large language models

論文ページ：
[SEIMAD — ScienceDirect](https://www.sciencedirect.com/science/article/pii/S0957417426011218?utm_source=chatgpt.com)

PDFについては出版社ライセンスを確認すること。

購入・組織アクセスしかない場合は自動ダウンロード/再配布しない。

---

# 7. M02 REQUIREMENTS-ELICITATION

用途：

```text
F06
F11
F12
F14
```

主な対象：

```text
REQ
```

候補要件や未考慮ステークホルダーを探索する。

参考論文：

Elicitron: An LLM Agent-Based Simulation Framework for Design Requirements Elicitation

論文ページ：
[Elicitron — Autodesk Research](https://www.research.autodesk.com/publications/elicitron-llm-based-simulation-framework-design-requirements/?utm_source=chatgpt.com)

PDF：
[Elicitron PDF](https://www.research.autodesk.com/app/uploads/2024/11/Elicitron.pdf?utm_source=chatgpt.com)

保存候補：

```text
references/papers/requirements/elicitron.pdf
```

注意：

LLMが生成したユーザー要求は、

```text
CONFIRMED_REQUIREMENT
```

ではなく、

```text
CANDIDATE_REQUIREMENT
```

として扱う。

Elicitronは多様なagentを生成し、Action / Observation / Challengeとインタビューからlatent needsを抽出する構造を採る。

---

# 8. M03 REQUIREMENTS-PROCESS

用途：

```text
F06
F12
F13
F14
```

対象：

```text
REQ
```

参考論文：

MARE: Multi-Agents Collaboration Framework for Requirements Engineering

論文ページ：
[MARE — arXiv](https://arxiv.org/abs/2405.03256?utm_source=chatgpt.com)

PDF：
[MARE PDF](https://arxiv.org/pdf/2405.03256?utm_source=chatgpt.com)

保存候補：

```text
references/papers/requirements/mare-2405.03256.pdf
```

MAREの

```text
elicitation
modeling
verification
specification
```

という工程分離を参考にする。

MAREはREプロセスを4タスク、5 agentに分離している。

ただし本SkillでMAREそのものを再現する必要はない。

主に「要件生成と検証を同じ役割にさせない」というDesign Principleとして利用する。

---

# 9. M04 CONSIDER-THE-OPPOSITE

用途：

```text
F02
F03
F07
```

対象：

```text
DECISION
FACT
GENERIC
```

現在の結論と反対の可能性を成立させる。

参考論文：

Lord, Lepper, Preston
Considering the opposite: a corrective strategy for social judgment

論文ページ：
[Considering the opposite — PubMed](https://pubmed.ncbi.nlm.nih.gov/6527215/?utm_source=chatgpt.com)

DOI:

```text
10.1037/0022-3514.47.6.1231
```

同研究では、現在の信念と食い違う可能性を意図的に考えさせることで、biased assimilationやbiased hypothesis testingへの補正を検討している。

PDFを同梱する場合はライセンスを確認する。

再配布条件が不明ならPDFをSkill ZIPに含めずMethod Cardのみ使用する。

---

# 10. M05 COMPETING-HYPOTHESES

用途：

```text
F02
F03
F08
F15
```

対象：

```text
CAUSE
```

適用条件：

```text
候補仮説 >= 2
AND
仮説を区別するEvidenceが存在
```

単なる案比較では使用しない。

参考論文：

Dhami, Belton, Mandel
The “analysis of competing hypotheses” in intelligence analysis

論文ページ：
[Analysis of Competing Hypotheses — Wiley](https://onlinelibrary.wiley.com/doi/10.1002/acp.3550?utm_source=chatgpt.com)

PDF：
[ACH PDF — Wiley](https://onlinelibrary.wiley.com/doi/pdf/10.1002/acp.3550?utm_source=chatgpt.com)

保存候補：

```text
references/papers/causal/analysis-competing-hypotheses.pdf
```

重要：

この研究ではACHの有効性について単純な万能性は確認されておらず、mixed evidenceが報告されている。したがって、

```text
ACH = guaranteed debiasing
```

とは扱わない。

---

# 11. M06 PREMORTEM

用途：

```text
F04
F14
```

対象：

```text
PLAN
DECISION
```

適用条件：

```text
具体的な計画
OR
具体的な決定案
```

実行：

```text
この計画は実行後に失敗した
```

と仮定し、その原因を探索する。

基礎研究：

Mitchell, Russo, Pennington
Back to the Future: Temporal Perspective in the Explanation of Events

論文ページ / PDF：
[Back to the Future — Wiley PDF](https://onlinelibrary.wiley.com/doi/pdf/10.1002/bdm.3960020103?utm_source=chatgpt.com)

DOI:

```text
10.1002/bdm.3960020103
```

保存候補：

```text
references/papers/planning/prospective-hindsight.pdf
```

同論文はprospective hindsightを「未来の出来事が既に発生したものとして説明する」方法として扱う。

注意：

生成されたFailure Causeは仮説であり、事実ではない。

---

# 12. M07 ASSUMPTION-BASED-PLANNING

用途：

```text
F01
F05
F14
```

対象：

```text
PLAN
DECISION
UNCERTAINTY
```

特に、

```text
load-bearing assumption
+
vulnerable assumption
```

を探す。

参考資料：

Dewar, Builder, Hix, Levin
Assumption-Based Planning: A Planning Tool for Very Uncertain Times

RANDページ：
[Assumption-Based Planning — RAND](https://www.rand.org/pubs/monograph_reports/MR114.html?utm_source=chatgpt.com)

RANDでは長期・戦略計画向けのAssumption-Based Planningとして公開されている。

保存候補：

```text
references/papers/planning/assumption-based-planning.pdf
```

ダウンロード時はRANDページ上の正式PDFリンクを取得すること。

---

# 13. M08 ROBUST-DECISION-MAKING

用途：

```text
F05
F10
F14
```

対象：

```text
UNCERTAINTY
PLAN
DECISION
```

適用条件：

```text
重要な不確実変数 >= 2
AND
複数のplausible futureを考える意味がある
```

単一の失敗シナリオのみならPremortemを優先する。

参考論文：

Robert J. Lempert
Robust Decision Making

論文ページ：
[Robust Decision Making — Springer Open Access](https://link.springer.com/chapter/10.1007/978-3-030-05252-2_2?utm_source=chatgpt.com)

同論文はRDMを、予測精度そのものではなくdeep uncertainty下でより良い意思決定を行うための方法として説明し、多数のplausible futureに対するstrategy stress testを含む。

保存候補：

```text
references/papers/planning/robust-decision-making.pdf
```

SpringerのOpen Access PDFを使用する。

---

# 14. M09 DEFEATER

用途：

```text
F08
F09
F16
```

対象：

```text
ASSURANCE
DECISION
REQ
FACT
```

高保証要求では優先候補にする。

構造：

```text
CLAIM
├─ ARGUMENT
├─ EVIDENCE
└─ DEFEATER
```

未解決Defeaterを残す。

参考論文：

Bloomfield, Netkachova, Rushby
Defeaters and Eliminative Argumentation in Assurance 2.0

論文ページ：
[Assurance 2.0 Defeaters — arXiv](https://arxiv.org/abs/2405.15800?utm_source=chatgpt.com)

PDF：
[Assurance 2.0 Defeaters PDF](https://arxiv.org/pdf/2405.15800?utm_source=chatgpt.com)

保存候補：

```text
references/papers/assurance/defeaters-2405.15800.pdf
```

同研究ではDefeaterをargumentに対するdoubtとして明示し、そのdoubtをconfirm/refuteするsubcaseへ展開する。

---

# 15. M10 REQUIREMENTS-MAD

これはPrimary MethodではなくSupporting Evidence / Design Principleとする。

参考論文：

Multi-Agent Debate Strategies to Enhance Requirements Engineering with Large Language Models

論文ページ：
[Requirements MAD — arXiv](https://arxiv.org/abs/2507.05981?utm_source=chatgpt.com)

Open repository：
[Requirements MAD — Zenodo](https://zenodo.org/records/17226506?utm_source=chatgpt.com)

PDFはZenodoまたはarXivから取得する。

保存候補：

```text
references/papers/requirements/mad-re-2507.05981.pdf
```

同研究はREにMADを適用し、少なくともRE classificationで実現可能性を評価しているが、あらゆる要件整理タスクへの有効性を証明したものとは扱わない。

---

# 16. M11 ADVERSARIAL-COLLABORATION

Primary Review Methodとしてではなく、対立構造を扱うDesign Principleとする。

対象：

```text
CONFLICT
DECISION
```

参考論文：

Ceci, Clark, Jussim, Williams
Adversarial Collaboration: An Undervalued Approach in Behavioral Science

論文ページ：
[Adversarial Collaboration — PubMed](https://pubmed.ncbi.nlm.nih.gov/39146049/?utm_source=chatgpt.com)

著者公開PDF：
[Adversarial Collaboration PDF](https://sites.rutgers.edu/lee-jussim/wp-content/uploads/sites/135/2026/02/adversarial-collaborations-2024.pdf?utm_source=chatgpt.com)

保存候補：

```text
references/papers/collaboration/adversarial-collaboration.pdf
```

利用原則：

対立する立場に、

```text
何が観測されたら自分の案を弱めるか
```

を先に定義させる。

単一LLMが双方を演じる場合、独立した研究参加者によるAdversarial Collaborationを再現したとは主張しない。

---

# 17. M12 FORECAST-CALIBRATION

原則としてReview MethodではなくDesign Principle。

対象：

```text
FORECAST
UNCERTAINTY
```

曖昧な、

```text
可能性が高い
```

を可能なら、

```text
70%
```

のような検証可能な主張へ変換する。

参考論文：

Tetlock, Mellers, Rohrbaugh, Chen
Forecasting Tournaments: Tools for Increasing Transparency and Improving the Quality of Debate

論文ページ：
[Forecasting Tournaments — SAGE](https://journals.sagepub.com/doi/10.1177/0963721414534257?utm_source=chatgpt.com)

著者公開PDF：
[Forecasting Tournaments PDF](https://faculty.wharton.upenn.edu/wp-content/uploads/2015/07/2014---forecasting-tournaments-tools-for-increasing-transparency-and-improving-debate.pdf?utm_source=chatgpt.com)

保存候補：

```text
references/papers/forecasting/forecasting-tournaments.pdf
```

研究はforecastを明示的な確率として比較可能にし、予測精度を追跡する枠組みを扱っている。

---

# 18. Methodの分類

Methodは必ず3種類へ分類する。

## CORE_PROTOCOL

常時使用。

```text
CORE-AR
```

## EXECUTABLE_METHOD

Review Roundへ直接割当可能。

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

## DESIGN_PRINCIPLE

Skill全体へ反映するが、原則Review Roundとして直接割り当てない。

```text
MARE_PROCESS_SEPARATION
REQUIREMENTS_MAD
ADVERSARIAL_COLLABORATION
FORECAST_CALIBRATION
INDEPENDENT_FIRST
MINORITY_DISSENT
```

---

# 19. Method Card

各Methodについて、

```text
references/methods/METHOD-<ID>.md
```

を作る。

PDFそのものを実行指示として使用してはならない。

Template：

```markdown
# METHOD: PREMORTEM

## Role
EXECUTABLE_METHOD

## Purpose
計画の失敗条件を探索する。

## Covers
F04
F14

## Applicable When
具体的な計画または決定案が存在する。

## Do Not Use When
単純な事実確認。
既に発生済みの原因診断。

## Inputs
固定済みVn
回答仕様
Evidence

## Procedure
1. 計画が実行後に失敗したと仮定する。
2. 独立した失敗原因候補を生成する。
3. 各原因に根拠状態を付ける。
4. 高影響の原因だけReview Issue候補とする。

## Output
Failure scenario
Cause
Evidence status
Impact
Suggested mitigation

## False Positive Guard
想像可能であるだけのFailureを事実扱いしない。

## Stop Condition
新しい重大Failureが追加されなくなった。

## Evidence
PAPER-PREMORTEM

## Evidence Strength
...

## Domain Transfer
...

## Fallback
CORE-AR
```

---

# 20. Reference Manifest

必須：

```text
references/REFERENCE-MANIFEST.md
```

各論文について記録する。

```text
ID
Title
Authors
Year
DOI / arXiv ID
Landing Page
Download Source
Local Path
SHA256
Role
Method IDs
Original Domain
Evidence Strength
Transfer Risk
License
Redistribution Allowed
Version
Retrieved Date
```

特に、

```text
License
Redistribution Allowed
```

は必須。

---

# 21. PDFダウンロードルール

Claude Codeは以下を実施する。

1. 上記Landing Pageを確認する。
2. Open Access / arXiv / 著者公式公開版を優先する。
3. PDFをダウンロードする。
4. PDFタイトル・著者が期待値と一致することを確認する。
5. SHA256を計算する。
6. Manifestへ登録する。
7. 再配布ライセンスを確認する。
8. 再配布可否が不明の場合：

```text
Redistribution Allowed: UNKNOWN
```

とする。

9. `UNKNOWN` / `NO` のPDFを最終配布Skillへ自動同梱しない。
10. 必要なら利用者のローカル環境だけに保持する。

「WebでPDFが読める」は、

```text
Skillへ再配布可能
```

を意味しない。

---

# 22. 推奨ディレクトリ

```text
adversarial-answer/
├── SKILL.md
├── agents/
│   └── openai.yaml
│
└── references/
    ├── METHOD-ROUTING.md
    ├── REFERENCE-MANIFEST.md
    ├── ROUTER-TEST-CASES.md
    │
    ├── methods/
    │   ├── METHOD-CORE-AR.md
    │   ├── METHOD-SOCRATIC.md
    │   ├── METHOD-REQ-ELICITATION.md
    │   ├── METHOD-CONSIDER-OPPOSITE.md
    │   ├── METHOD-ACH.md
    │   ├── METHOD-PREMORTEM.md
    │   ├── METHOD-ABP.md
    │   ├── METHOD-RDM.md
    │   └── METHOD-DEFEATER.md
    │
    └── papers/
        ├── core/
        ├── requirements/
        ├── planning/
        ├── causal/
        ├── assurance/
        ├── collaboration/
        └── forecasting/
```

SkillのReferencesは必要なものだけ追加ロードする設計に向いているため、SKILL.mdへ論文本文を詰め込まない。

---

# 23. Method Router

疑似コード：

```text
profile = classify_problem(answer_spec)

failures = detect_failure_modes(
    answer_spec,
    profile
)

failures = rank(
    failures,
    CRITICAL > MAJOR > MINOR
)

candidates = methods_covering(failures)

candidates = remove_if_not_applicable(candidates)

primary = most_specific_method_for(
    highest_priority_uncovered_failure
)

selected = [primary]

while important_uncovered_failures_exist:
    select method that covers
    the most important uncovered Failure Mode

    reject near-duplicate methods

    stop at 3 methods

if no applicable specialist:
    use CORE-AR

route_check(selected)
```

数値スコア方式はv2では導入しない。

未知の重みによって、

```text
Method A = 8
Method B = 7
```

とすること自体が新たな恣意性になるため。

---

# 24. Route Check

Method選択後、回答を作る前に必ず実施する。

```text
RC1
最重要Failure Modeは何か？

RC2
Primary Methodはそれを直接検査するか？

RC3
各MethodのApplicable Whenを満たしているか？

RC4
Do Not Use Whenへ該当しないか？

RC5
Methods同士のCoverageがほぼ重複していないか？

RC6
CRITICAL Failure Modeが未Coverageではないか？

RC7
より具体的なMethodを見落としていないか？

RC8
今回Methodを適用することで新しいFalse Positiveを
増やす可能性はないか？
```

問題があればRouteを1回だけ再選択する。

無限ループさせない。

---

# 25. Review Round

3回固定は維持する。

ただし、

```text
Round 1 = 論理
Round 2 = 事実
Round 3 = 実用性
```

だけではなく、

```text
Method-specific Attack
+
Invariant Gate
```

とする。

例：

要件整理：

```text
Round 1
SOCRATIC

Round 2
REQUIREMENTS_ELICITATION

Round 3
PREMORTEM
```

原因分析：

```text
Round 1
COMPETING_HYPOTHESES

Round 2
CONSIDER_OPPOSITE

Round 3
CORE-AR general attack
```

戦略計画：

```text
Round 1
ASSUMPTION_BASED_PLANNING

Round 2
ROBUST_DECISION_MAKING

Round 3
PREMORTEM
```

---

# 26. Invariant Gate

すべてのRound終了後に必ず確認する。

```text
G1 SPEC
回答仕様を満たすか

G2 LOGIC
内部矛盾がないか

G3 FACT
事実とEvidenceが一致するか

G4 UNCERTAINTY
推測を事実としていないか

G5 CONSTRAINT
制約違反がないか

G6 SOURCE
引用が実際の主張を裏付けるか

G7 OVERCORRECTION
Reviewによって正しかった内容を悪化させていないか
```

専門MethodはInvariant Gateを置き換えない。

---

# 27. Reviewer / Critic

各Roundで：

```text
Vnを固定
↓
Reviewer
↓
Critic
↓
Review stabilization
↓
Main修正
↓
Invariant Gate
↓
Vn+1
```

Criticは追加で、

```text
このMethodは今回の依頼に本当に適用可能か
```

も確認する。

---

# 28. Agent能力によるFallback

複数の独立subagentを利用できる場合：

```text
execution_mode = independent_agents
```

利用できない場合：

```text
execution_mode = role_separated_single_model
```

として続行する。

その場合、

```text
独立した複数agentによる検証
```

とは主張しない。

単一モデルによる役割分離であることだけ記録する。

Methodが「独立した複数参加者」を本質的に要求する場合、そのMethodをDesign Principleへ降格する。

---

# 29. PDFを毎回全部読まない

禁止：

```text
references/**/*.pdf をすべて読む
```

実行：

```text
METHOD-ROUTING.md
↓
選択Method Card
↓
必要時のみ対応PDF
```

PDFから必要箇所を再解釈するより、Method CardをCanonicalな実行仕様とする。

PDFは：

```text
一次根拠
研究の適用範囲確認
Method Card監査
```

に使用する。

---

# 30. Router Regression Test

作成：

```text
references/ROUTER-TEST-CASES.md
```

最低30 case用意する。

各Category最低3件。

Example：

```yaml
case: PLAN-001
prompt: >
  新サービスを全社導入する計画の
  見落としを検証したい。

expected_profile:
  - PLAN

expected_failures:
  - F01
  - F04
  - F14

allowed_primary:
  - ASSUMPTION_BASED_PLANNING
  - PREMORTEM

forbidden_primary:
  - COMPETING_HYPOTHESES
```

原因分析：

```yaml
case: CAUSE-001
prompt: >
  DNS、Network、DBのどれが障害原因か
  ログから分析したい。

expected_profile:
  - CAUSE

expected_failures:
  - F03
  - F08
  - F15

required:
  - COMPETING_HYPOTHESES

forbidden_primary:
  - PREMORTEM
```

要件：

```yaml
case: REQ-001
prompt: >
  新サービスの要件を整理した。
  抜け漏れと曖昧さを検証したい。

expected_profile:
  - REQ

expected_failures:
  - F06
  - F11
  - F12

allowed:
  - SOCRATIC
  - REQUIREMENTS_ELICITATION
```

---

# 31. Method Cardのテスト

各Methodについて、

```text
positive examples >= 3
negative examples >= 3
boundary examples >= 2
```

を作成する。

特に、

```text
Premortem vs ABP
Premortem vs RDM
ACH vs alternative comparison
Socratic vs requirement elicitation
Defeater vs generic critique
```

を重点テストする。

---

# 32. A/B Regression

Baseline：

```text
既存adversarial-answer
```

Candidate：

```text
v2 Method Router
```

同じ問題セットを両方へ入力する。

評価：

```text
Critical Issue Recall
False Critique Rate
Overcorrection Rate
Requirement Coverage
Evidence Quality
Residual Risk Capture
Route Accuracy
Token Cost
Latency
```

最低限、

```text
Candidateが重大問題の検出を改善
AND
False Critique / Overcorrectionを悪化させない
```

ことを確認する。

単純に文章量が増えたことを改善と判定しない。

---

# 33. 成功条件

「以前より精度が高い」を次のように具体化する。

Primary：

```text
Critical Issue Recall ↑
False Critique Rate ↓ or =
Overcorrection Rate ↓ or =
```

Secondary：

```text
Requirement Coverage ↑
Evidence Quality ↑
Residual Risk Capture ↑
```

Guardrail：

```text
Token Costが極端に増えない
Routing failureが許容範囲
```

---

# 34. 初期導入するPDF優先度

## P0 — 最初に導入

```text
Adversarial Review
MARE
Elicitron
Premortem / Prospective Hindsight
Assumption-Based Planning
Assurance 2.0 / Defeaters
```

理由：

```text
CORE
要件
不足要求
計画失敗
暗黙前提
反証
```

という互いに異なるFailure Modeをカバーできる。

## P1 — 次に追加

```text
Considering the Opposite
Analysis of Competing Hypotheses
Robust Decision Making
Requirements MAD
```

## P2 — Design Principleとして追加

```text
Adversarial Collaboration
Forecasting Tournaments
Socratic Elenchus
```

PDFのサイズ・ライセンス・実運用効果を確認しながら増やす。

---

# 35. SKILL.md変更

現在の

```text
4. 指定論文を確認する
```

を削除する。

新規：

```text
4. 検証戦略を選択する

4.1 Problem Profileを作成する
4.2 Failure Modeを抽出する
4.3 METHOD-ROUTING.mdを確認する
4.4 Method候補を抽出する
4.5 Applicable / Do Not Use条件を評価する
4.6 最大3 Methodを選択する
4.7 Route Checkを実施する
4.8 選択Method Cardだけを読む
4.9 必要な場合だけ対応PDFを確認する
4.10 3 Review RoundへMethodを割り当てる
```

---

# 36. 実装手順

Claude Codeは次の順で作業する。

1. 現在のSkillをバックアップする。
2. 現在のSKILL.mdを解析する。
3. `references/` の既存構成を確認する。
4. 上記ディレクトリを作成する。
5. `REFERENCE-MANIFEST.md` を作る。
6. P0論文の正式Landing Pageを確認する。
7. ライセンスを確認する。
8. 許可されたPDFのみダウンロードする。
9. SHA256を記録する。
10. P0 Method Cardを作る。
11. METHOD-ROUTING.mdを作る。
12. SKILL.mdへRouterを組み込む。
13. Invariant Gateを追加する。
14. Route Checkを追加する。
15. `ROUTER-TEST-CASES.md` を作成する。
16. 最低30 caseを作成する。
17. Router Regression Testを実施する。
18. 現行SkillとのA/B Testを行う。
19. 問題のあるMethodの適用条件を狭める。
20. P1 Methodを順次追加する。
21. validatorを実行する。
22. Skill全体サイズを確認する。
23. packageする。
24. `skill.zip` を生成する。

---

# 37. Size Guard

Skill全体のpackage sizeを確認する。

PDFを無制限に増やさない。

25MB制限へ近づいた場合は、

```text
方法論のCoverage
研究根拠の強さ
利用頻度
ライセンス
```

を基準にPDFを削減する。

SkillではSupporting Resourcesを必要時に読み込む構造が推奨されており、SKILL.md自体をKnowledge Dumpにしない。

---

# 38. 完了条件

以下すべてを満たしたら完了。

```text
[ ] CORE-ARが実装されている
[ ] Question TypeからMethodを直接決定していない
[ ] Failure Mode Routerが存在する
[ ] Applicability checkが存在する
[ ] Route Checkが存在する
[ ] Invariant Gateが存在する
[ ] Method CardがCanonical仕様になっている
[ ] PDFを全件毎回ロードしない
[ ] Manifestが存在する
[ ] PDF license / redistribution状態を記録している
[ ] Missing PDFでWebへ自動Fallbackしない
[ ] Router regression >= 30 cases
[ ] A/B regressionを実施している
[ ] False Critiqueを評価している
[ ] Overcorrectionを評価している
[ ] Skill package sizeを確認している
[ ] validator成功
[ ] skill.zip生成成功
```

---

# 39. やってはいけないこと

```text
NG:
「PLANだからPremortem」

NG:
PDF全文を毎回すべて読む

NG:
論文に書かれていない一般化を
論文の結論として記述する

NG:
単一LLMの役割演技を
独立した複数agent研究の再現と呼ぶ

NG:
生成したpersona要求を
実ユーザー要求として確定する

NG:
敵対的指摘が多いほど
高品質と判断する

NG:
Consensusを正解とみなす

NG:
ライセンス不明PDFを
自動的に配布Skillへ同梱する

NG:
専門Methodによって
事実確認・制約確認を省略する
```

---

# 40. 最終設計

最終的な考え方は、

```text
Adversarial Review
     │
     │ 共通プロトコル
     ▼
Failure Mode Router
     │
     ├─ Socratic
     ├─ Requirements Elicitation
     ├─ Consider Opposite
     ├─ Competing Hypotheses
     ├─ Premortem
     ├─ Assumption-Based Planning
     ├─ Robust Decision Making
     └─ Defeater
              │
              ▼
        Reviewer / Critic
              │
              ▼
        Invariant Gate
              │
              ▼
           Revised Vn
```

とする。

「3回反論するSkill」から、

**「回答が失敗しそうな理由を分類し、そのFailure Modeに適した敵対的検証を3回行うSkill」**

へ変更する。
