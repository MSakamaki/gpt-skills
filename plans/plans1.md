# 敵対的検証スキル v2 更新仕様案

## 1. 設計方針

従来の「1つの敵対的レビュー論文を全回答へ適用する」方式を廃止し、依頼の性質と想定される失敗モードから、適切な検証方法を動的に選択する。

ただし、論文そのものを直接ルーティング対象にしない。

```text
回答仕様
  ↓
問題プロファイル
  ↓
Failure Mode
  ↓
適用条件を満たすMethod
  ↓
Method Card
  ↓
対応する原論文PDF
  ↓
敵対的検証
```

`Adversarial Review` は個別Methodではなく、全検証に共通する実行プロトコルとして扱う。

共通部分としてのみ次を維持する。

* 主回答、Reviewer、Criticの役割を分離する
* Review中は回答案を固定する
* CriticはReviewer自身を批判する
* 不同意には具体的根拠を要求する
* Consensusそのものを成功条件にしない
* Reviewが安定してから回答を変更する

---

# 2. 重要な変更点

## 2.1 「質問タイプ→論文」の直接ルーティングは禁止

例えば、

```text
PLAN → Premortem
```

とはしない。

同じPLANでも、

```text
暗黙前提が問題
→ Assumption-Based Planning

失敗原因の見落としが問題
→ Premortem

複数の将来条件への脆弱性が問題
→ Robust Decision Making
```

となるためである。

質問タイプは候補Methodを狭める用途にだけ使う。

Method決定の主軸はFailure Modeとする。

---

# 3. 問題プロファイル

回答仕様確定後、複数選択可能な問題タイプとして分類する。

| ID          | 分類       | 代表例                 |
| ----------- | -------- | ------------------- |
| REQ         | 要件・課題整理  | 要件定義、仕様整理、抜け漏れ      |
| DECISION    | 意思決定     | A/B比較、方針選択          |
| CAUSE       | 原因・仮説分析  | 障害原因、原因候補           |
| PLAN        | 計画・施策    | 導入計画、ロードマップ         |
| UNCERTAINTY | 不確実性     | 将来条件が変化する判断         |
| CONFLICT    | 意見・利害対立  | 複数案・複数ステークホルダー      |
| ASSURANCE   | 高保証      | 安全性、重大リスク、漏れの許容度が低い |
| FORECAST    | 予測       | 将来イベント、確率           |
| FACT        | 事実・根拠    | 正確性、出典確認            |
| GENERIC     | 上記に特化しない | 一般質問                |

Primaryを1つ選択してよいが、Secondaryを複数保持する。

分類できない依頼を無理に既存カテゴリへ入れない。

---

# 4. Failure Mode

質問タイプとは独立に、回答を誤らせる可能性が高い要因を抽出する。

| ID  | Failure Mode   |
| --- | -------------- |
| F1  | 暗黙の前提          |
| F2  | 反対可能性の未検討      |
| F3  | 代替仮説の不足        |
| F4  | 失敗条件の不足        |
| F5  | 将来条件変化への脆弱性    |
| F6  | ステークホルダー・視点の不足 |
| F7  | 初期回答・多数意見への同調  |
| F8  | 根拠不足           |
| F9  | 重大な反証が未解決      |
| F10 | 不確実性の過度な断定     |
| F11 | 曖昧な定義・概念       |
| F12 | 情報不足           |
| F13 | 評価基準そのものの不備    |
| F14 | 実行条件・制約の見落とし   |

Failure Modeは重要度を付ける。

```text
CRITICAL
MAJOR
MINOR
```

Method選択ではCRITICALとMAJORのCoverageを優先する。

---

# 5. Method Registry

各方法論をPDFだけで管理しない。

各Methodについて短いMethod Cardを作成する。

例：

```markdown
# PREMORTEM

## 目的
計画の失敗条件を発見する。

## 対象Failure Mode
F4
F14

## 適用条件
具体的な計画・施策・方針案が存在する。

## 適用しない
単純な事実確認。
原因がすでに発生している障害診断。

## 実行方法
「この計画は実施後に失敗した」と仮定し、
失敗原因候補を独立に生成する。

## 出力
- Failure scenario
- Cause
- Severity
- Preventive action
- Evidence status

## 注意
生成した失敗原因を事実として扱わない。

## Evidence
references/PAPER-PREMORTEM.pdf
該当ページ: xx-yy

## Fallback
CORE
```

Method Cardには最低限次を持たせる。

```text
Method ID
目的
対応Failure Mode
適用条件
除外条件
必要入力
実行要件
攻撃手順
期待する出力
False-positive防止条件
終了条件
原論文
参照ページ
Evidence strength
Domain transfer risk
Fallback
```

---

# 6. Methodを3種類に分ける

すべての論文を「検証Round」として使ってはいけない。

## A. Core Protocol

常時使用。

```text
Adversarial Review
```

用途：

* Reviewer/Critic分離
* 回答案固定
* structured disagreement
* evidence requirement

一般回答での精度向上が論文によって実証済みとは扱わない。

---

## B. Executable Method

条件を満たした場合に検証Roundとして選択可能。

例：

```text
Socratic Examination
Consider-the-Opposite
Competing Hypotheses
Premortem
Assumption-Based Planning
Robust Decision Making
Assurance 2.0 / Defeaters
```

---

## C. Design Principle

原則として単独Roundとして選択しない。

例：

```text
Minority Dissent
Independent-first
Forecasting Tournament
Policy Delphi
```

これらは、

```text
Reviewer同士を最初から相互参照させない
初期回答を固定する
予測を可能なら数値化する
Consensusを正解とみなさない
```

など、Skill全体の設計原則へ変換する。

---

# 7. Methodの実行条件を厳密化する

以下は特に誤用しやすいため条件を付ける。

### Competing Hypotheses

使用条件：

```text
複数の説明仮説が存在
AND
仮説間を比較できるEvidenceが存在
```

単なる「案の比較」には使用しない。

### Premortem

使用条件：

```text
具体的な計画・施策・決定案が存在
```

### RDM

使用条件：

```text
複数の重要な不確実変数
AND
複数シナリオを考える意味がある
```

単一Failure scenarioならPremortemを優先する。

### Adversarial Collaboration

明確な対立する立場と、共通評価条件を設定できる場合だけ使用する。

単一モデルが双方を演じた場合、研究上の「独立した対立者」と同等とは扱わない。

### Policy Delphi

独立した複数参加者または独立agentを利用できる場合だけ本来のMethodとして扱う。

単一モデル環境ではDesign Principleへ降格する。

### Elicitron系Perspective Simulation

生成したペルソナから得た要件は、

```text
CONFIRMED REQUIREMENT
```

ではなく、

```text
CANDIDATE REQUIREMENT
```

として扱う。

---

# 8. Method Router

数値スコア方式は初期版では採用しない。

未検証の重み付け、

```text
Premortem = 8点
RDM = 7点
```

などが新しい恣意性を作るためである。

代わりに以下の順序で選択する。

```text
1. 確定した10項目から問題プロファイルを作る

2. CRITICAL / MAJOR Failure Modeを抽出する

3. Failure Modeに対応するMethod候補を取得する

4. 適用条件を満たさないMethodを除外する

5. 最重要Failure Modeに最も特化したMethodをPrimaryとする

6. Primaryでカバーできない重要Failure Modeについて
   補完Methodを追加する

7. 同一Failure Modeしか検査しないMethodの重複を避ける

8. 最大3 Methodまで選択する

9. 高保証案件ではDefeaterを優先候補にする。
   4つ目として追加するのではなく、
   Coverageの低いMethodと入れ替える

10. 適切な専門Methodが存在しない場合はCOREへFallbackする
```

---

# 9. Router自身を検証する

今回の仕様で特に重要。

Method RouterもLLMによる判断であるため、Router自体が誤る可能性がある。

選択後、次を1回確認する。

```text
ROUTE CHECK

- 最重要Failure Modeは何か？
- 選択Methodはそれを直接検査できるか？
- 適用条件を満たしているか？
- 選択Method同士が重複していないか？
- 選択されなかったMethodの中に、
  明らかにより具体的なものはないか？
- 重大なFailure Modeが未Coverageではないか？
```

Routerの判断に重大な不確実性があり、その違いで結果が大きく変わる場合だけ、既存の確認質問フェーズへ戻る。

それ以外ではCOREへFallbackする。

---

# 10. 3回検証の扱い

現行の3回固定は維持する。

ただし、

```text
Round 1 = 論理
Round 2 = 事実
Round 3 = 実用性
```

を完全に廃止してはいけない。

専門Methodだけに置き換えると、例えばPremortemを実行している間に誤引用を見逃す可能性がある。

そのため、

```text
Method-specific Attack
+
Invariant Verification
```

という構造に変更する。

例：

```text
Round 1
Method: Socratic Examination

Round 2
Method: Assumption-Based Planning

Round 3
Method: Premortem
```

各Round終了時に必ず共通確認する。

```text
Invariant Gate

G1 回答仕様への適合
G2 論理的一貫性
G3 事実・Evidenceの整合性
G4 不確実性の適切な表現
G5 制約・安全・上位ルールへの適合
```

専門MethodはこのGateを置き換えない。

---

# 11. PDFの扱い

PDFをルータそのものには使用しない。

```text
Method Router
   ↓
Method Card
   ↓
必要なPDF
```

とする。

理由：

* 長いPDF全体を毎回読むと実行が不安定になる
* 該当Methodの手順を毎回異なる箇所から抽出する可能性がある
* コンテキスト消費が増える
* 原論文の「実験結果」と「本Skill独自の転用」を混同しやすい

Method Cardには論文から採用した手順と、その転用部分を明確に分離する。

PDFは一次根拠として保持する。

---

# 12. Reference Manifest

`references/REFERENCE-MANIFEST.md` を作成する。

例：

```text
ID: AR
File: PAPER-AR-2608.18167v1.pdf
Title: Adversarial Review...
Version: v1
Year: 2026
Role: CORE
Domain: Code Review
Transfer: Generalized protocol only
License: ...
SHA256: ...
Method Card: METHOD-AR.md
Required: true
```

これにより、

* PDF取り違え
* バージョン不明
* 更新による内容差
* 出典不明

を防ぐ。

---

# 13. Reference障害時

Web検索へ自動Fallbackしない。

```text
Selected PDFが存在しない
↓
ManifestにFallback Methodがある
↓
そのローカルMethodへFallback
```

Fallbackが存在しない場合：

```text
対象Methodを使用しない
+
その制約を最終回答に記録
```

ユーザーの明示許可なしにWeb検索へ切り替えない。

---

# 14. 推奨Skill構成

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
    ├── METHOD-AR.md
    ├── METHOD-SOCRATIC.md
    ├── METHOD-COTO.md
    ├── METHOD-ACH.md
    ├── METHOD-PREMORTEM.md
    ├── METHOD-ABP.md
    ├── METHOD-RDM.md
    ├── METHOD-DEFEATER.md
    │
    ├── PAPER-AR.pdf
    ├── PAPER-SOCRATIC.pdf
    ├── PAPER-COTO.pdf
    ├── PAPER-ACH.pdf
    ├── PAPER-PREMORTEM.pdf
    ├── PAPER-ABP.pdf
    ├── PAPER-RDM.pdf
    └── PAPER-DEFEATER.pdf
```

PDF数は最初から最大化しない。

異なるFailure Modeを明確にカバーする少数Methodから開始する。

---

# 15. SKILL.mdの主な変更

現行の

```text
4. 指定論文を確認する
```

を削除する。

代わりに、

```text
4. 検証戦略を選択する

4.1 問題プロファイルを作成
4.2 Failure Modeを抽出
4.3 METHOD-ROUTING.mdを読む
4.4 Method候補の適用条件を確認
4.5 最大3 Methodを選択
4.6 ROUTE CHECKを行う
4.7 Method Cardを読む
4.8 対応するローカルPDFを必要な範囲だけ確認
4.9 各Methodを3回のReviewへ割り当てる
```

へ変更する。

---

# 16. 3回レビュー工程の変更

現行のReviewer/Criticプロトコルは維持する。

変更するのは「攻撃」の内容だけ。

```text
R_i
↓
selected Method_i に従って攻撃

C_i
↓
回答案だけでなく
Methodの適用条件とR_iのMethod遵守も確認

↓
Structured disagreement

↓
安定化

↓
Invariant Gate

↓
V_i
```

Criticには、

```text
このMethod自体が今回の問題に不適切ではないか
```

も検証させる。

これによりRouterの誤判定がReview内でも再検出可能になる。

---

# 17. 「最大3 Method」は上限であり目標ではない

必ず3種類の論文を使う必要はない。

例：

```text
Method 1: Premortem
Method 2: Defeater
Method 3: CORE
```

または、

```text
Method 1: ACH
Method 2: CORE
Method 3: CORE
```

でもよい。

重要なのは、

```text
3種類使ったか
```

ではなく、

```text
重要Failure ModeをCoverageできたか
```

である。

3回のReview自体は現行仕様どおり実施する。

---

# 18. 成功条件を再定義する

「回答精度が向上した」だけでは評価できない。

特に要件整理には単一の正解が存在しない場合がある。

最低限以下を評価する。

| 指標                    | 内容                    |
| --------------------- | --------------------- |
| Route Accuracy        | 適切なMethodを選択したか       |
| Critical Issue Recall | 重大な問題を発見できたか          |
| False Critique Rate   | 誤った批判を増やしていないか        |
| Overcorrection Rate   | 正しい回答を検証によって悪化させていないか |
| Evidence Quality      | 根拠のない主張を減らせたか         |
| Requirement Coverage  | 要件・制約の見落としを減らせたか      |
| Residual Risk Capture | 未解決事項を適切に残せたか         |
| Cost                  | トークン・時間増加             |

---

# 19. Regression Test

`references/ROUTER-TEST-CASES.md` を追加する。

例：

```text
Case:
「新システムの導入計画に問題がないか」

Expected profile:
PLAN

Expected Failure Modes:
F1 / F4

Allowed Methods:
ABP
PREMORTEM

Must not select:
ACH
```

別例：

```text
Case:
「障害原因としてDB、Network、DNSが考えられる。
ログから原因を分析したい」

Expected:
CAUSE

Required:
ACH

Must not use as Primary:
PREMORTEM
```

要件、原因分析、意思決定、計画、不確実性、高保証など複数カテゴリでRegression Caseを作る。

---

# 20. A/B評価

旧SkillをBaselineとする。

```text
Baseline
現行Adversarial Review固定方式

Candidate
Method Router方式
```

同じ質問群へ両方を適用する。

人間評価ではどちらの回答かを隠して、

```text
重大な見落とし
誤った指摘
根拠
実用性
要件Coverage
最終回答の悪化
```

を比較する。

「新方式の方が複雑だから良い」と判断しない。

改善が確認できないMethodは削除または適用条件を狭める。

---

# 21. 実際の更新手順

1. 現行Skillをそのままバックアップする。

2. 採用予定の論文について、再配布可能なOpen Access / arXiv PDFを優先して取得する。

3. PDFを `references/PAPER-*.pdf` として配置する。

4. 各PDFについて `REFERENCE-MANIFEST.md` へメタデータを登録する。

5. 各Methodについて短い `METHOD-*.md` を作成する。

6. `METHOD-ROUTING.md` にFailure Mode、適用条件、除外条件、Fallbackを記述する。

7. 現行SKILL.mdの「Webで指定論文を確認」の工程をLocal Reference Routerへ置き換える。

8. 現行3回ReviewのReviewer/Critic構造は残し、RoundのAttack Strategyのみ動的化する。

9. Invariant Gateを追加する。

10. ROUTER-TEST-CASESで誤振り分けを検証する。

11. 旧SkillとのA/B評価を行う。

12. PDFを含めたSkill全体がアップロード上限内に収まっていることを確認する。PDFを増やしすぎない。

13. Skill validatorを実行する。

14. `package_skill.py` で完全なSkillを再packageする。

15. 出力を `skill.zip` とする。
