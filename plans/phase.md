# adversarial-answer v2 — Claude Code 段階実装プロンプト

## 全フェーズ共通の仕様優先順位

すべてのフェーズで、次の優先順位を厳守すること。

1. `plans/plans2.md`

   * 正本の仕様。
   * 原則として最優先する。

2. `plans/plans1.md`

   * `plans2.md` 作成前の仕様。
   * `plans2.md` に記載がない観点を補完する用途にのみ使用する。
   * `plans2.md` と矛盾する場合は必ず `plans2.md` を採用する。

3. 現在のSkill実装

   * 既存動作を確認するための資料。
   * 正本仕様と競合した場合は仕様を優先する。
   * ただし、仕様に変更指示がなく既存の有用な挙動がある場合は維持を優先する。

### plans1.md の採用ルール

`plans1.md` にしかない仕様を発見した場合、無条件に実装しない。

次の3種類に分類する。

* `SUPPLEMENT`: plans2.md と整合し、明らかに補完になる
* `CONFLICT`: plans2.md と競合するため採用しない
* `UNCERTAIN`: plans2.md の意図から採否を判断できない

`SUPPLEMENT` のみ実装候補として扱う。

### 共通禁止事項

* `plans/plans1.md` と `plans/plans2.md` を編集しない。
* plans1.md の内容で plans2.md を上書きしない。
* 仕様にない数値スコアリングを勝手に導入しない。
* PDFをすべて毎回ロードする設計にしない。
* Web検索をSkill実行時の必須依存にしない。
* ライセンス不明なPDFを配布物へ無条件に含めない。
* 単一モデルの役割分離を「独立した複数agent」と表現しない。
* 変更と無関係な既存コード・ファイルを整形・書換えしない。

---

# Phase 1 — 現状調査と仕様統合

このフェーズでは実装しない。

まず以下を完全に読んでください。

* `plans/plans2.md`
* `plans/plans1.md`
* 現在のSkillの `SKILL.md`
* `agents/openai.yaml`
* `references/` 以下
* `scripts/` が存在する場合はその内容
* その他Skillの動作に関係するファイル

## 目的

実装前に、

「正本仕様」
「plans1から補完可能な仕様」
「現在実装」
「不足」

を分離する。

## 作業

### 1. plans2.md を仕様項目へ分解する

各要件へ一時的にIDを付ける。

例：

* SPEC-001
* SPEC-002
* ...

### 2. plans1.md と突合する

plans1にしかない観点について、

* SUPPLEMENT
* CONFLICT
* UNCERTAIN

へ分類する。

### 3. 現行Skillと突合する

各仕様について、

* IMPLEMENTED
* PARTIAL
* MISSING
* CONFLICTING

を判定する。

### 4. 特に次を確認する

* 10項目確認フロー
* 確認質問フロー
* 3回Review
* Main / Reviewer / Critic
* 回答案固定
* Structured disagreement
* Web検索への依存
* 2608.18167固定参照
* referencesの現状
* PDFの有無
* package size
* 現行のfallback
* subagent利用条件

## 出力

このフェーズではファイルを変更しない。

最後に次を報告する。

1. 現在のSkill構成
2. plans2の主要要件
3. plans1から追加候補となるSUPPLEMENT
4. plans1とのCONFLICT
5. 現行実装との差分
6. 実装上のリスク
7. 次フェーズで変更予定のファイル

重大な仕様矛盾がない限り、質問せずに調査を完了する。

ここで停止する。

---

# Phase 2 — 実装計画と最終ファイル構成の確定

Phase 1の結果を前提として進める。

まだSkill本体の動作変更はしない。

## 目的

実装途中で構成がぶれないよう、最終構成と依存関係を確定する。

## 基本構成

plans2.mdを確認したうえで、少なくとも次の構成を検討する。

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

ただし既存構成との整合性を確認し、必要以上にディレクトリを増やさないこと。

## 作業

次を表として整理する。

| Method | Role | Failure Mode | Method Card | PDF | 導入Phase |
| ------ | ---- | ------------ | ----------- | --- | ------- |

Roleは少なくとも、

* CORE_PROTOCOL
* EXECUTABLE_METHOD
* DESIGN_PRINCIPLE

を区別する。

さらに依存関係を整理する。

例：

```text
REFERENCE-MANIFEST
        ↓
METHOD CARD
        ↓
METHOD-ROUTING
        ↓
SKILL.md
        ↓
ROUTER TEST
```

## P0/P1/P2

plans2.mdに従って導入優先度を確認する。

P0を先に実装し、P1/P2はP0の構造を壊さず後から追加可能にする。

## 完了条件

* 最終ファイル構成が確定
* 各Methodの役割が確定
* P0/P1/P2が確定
* plans1由来SUPPLEMENTの採否が確定
* 実装順序が確定

ここでは大規模な実装を開始しない。

ここで停止する。

---

# Phase 3 — PDF / Reference Manifest 構築

Phase 2で確定したP0論文を対象にする。

このフェーズでは、まだSKILL.mdのRouter実装を行わない。

## 目的

Skillが実行時にWebへ依存しなくても方法論を参照できる状態を作る。

## PDF取得

`plans/plans2.md` に記載された論文リンクを正とする。

各論文について：

1. Landing Pageを確認
2. タイトル確認
3. 著者確認
4. DOI / arXiv ID確認
5. バージョン確認
6. PDF取得元確認
7. Open Access / ライセンス確認
8. 再配布条件確認
9. PDFダウンロード
10. SHA256計算
11. ファイルサイズ確認

arXiv、出版社のOpen Access版、著者公式公開版などを優先する。

## 重要

「Web上でダウンロードできる」

と

「Skill ZIPへ再配布できる」

を同一視しない。

再配布可否が、

* YES
* NO
* UNKNOWN

のいずれかを必ず記録する。

`NO` / `UNKNOWN` の場合、最終配布Skillへ自動的に同梱しない。

## Manifest

`references/REFERENCE-MANIFEST.md` を作成する。

各論文について最低限：

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
File Size
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

を記録する。

## 整合性確認

ダウンロードしたPDFについて、

* ファイル破損がない
* PDFタイトルがManifestと一致
* 著者が一致
* 想定論文と別論文ではない

ことを確認する。

## 完了条件

* P0論文の取得可否が全件判定済み
* 取得可能PDFが保存済み
* Manifestが完成
* SHA256が記録済み
* 再配布可否が記録済み

取得不能な論文があっても勝手に別論文へ置換しない。

不足として報告して停止する。

---

# Phase 4 — Method Card と Method Router 実装

Phase 3のReferencesを利用する。

このフェーズではまずMethod仕様を実装し、最後までSKILL.mdを大きく書き換えない。

## 目的

PDFを直接実行仕様として扱わず、

```text
PDF = 一次根拠
Method Card = Canonical実行仕様
```

へ分離する。

## Method Card

各P0 Methodについて、

`references/methods/METHOD-<ID>.md`

を作成する。

最低限：

```text
Method ID
Role
Purpose
Covers Failure Modes
Applicable When
Do Not Use When
Required Inputs
Procedure
Expected Output
False Positive Guard
Stop Condition
Evidence
Evidence Strength
Original Domain
Domain Transfer Risk
Fallback
```

を持たせる。

### 原則

Method Cardに、

「論文に直接書いてある内容」

と

「本Skill向けに転用したルール」

を混同して書かない。

必要なら、

```text
Research-backed
Skill-specific adaptation
```

として明示的に分ける。

## METHOD-ROUTING.md

次を実装する。

### Problem Profile

* REQ
* DECISION
* CAUSE
* PLAN
* UNCERTAINTY
* CONFLICT
* ASSURANCE
* FORECAST
* FACT
* GENERIC

### Failure Mode

plans2.md記載のF01〜F16をCanonicalとする。

### Routing

必ず、

```text
Problem Profile
    ↓
Failure Mode
    ↓
Applicability
    ↓
Method
```

とする。

以下は禁止：

```text
PLAN → PREMORTEM
CAUSE → ACH
```

のようなQuestion TypeからMethodへの直接決定。

## 最大Method数

最大3 Method。

ただし3 Method使用を目標にしない。

重要Failure ModeをCoverageできるなら、

* 1 Method + CORE
* 2 Method + CORE

でもよい。

## Route Check

plans2.md記載のRC1〜RC8を実装する。

Routeの再選択は最大1回。

無限再評価は禁止。

## 完了条件

* P0 Method Card完成
* METHOD-ROUTING完成
* PDFを読まなくてもMethod手順を実行可能
* PDFとの根拠対応がManifest経由で追跡可能

ここで停止する。

---

# Phase 5 — SKILL.md 統合

Phase 4まで完成した状態から開始する。

## 目的

既存Skillの有用なフローを維持しながら、Method Router方式へ切り替える。

## 必ず維持するもの

* 10項目確認
* 不足項目確認
* 追加確認質問
* 回答仕様確定
* V0作成
* 3回Review
* Main / Reviewer / Critic
* Review中のVn固定
* structured disagreement
* review stabilization
* 採否記録
* 最終回答
* 検証サマリー

既存のこれらを不要に書き換えない。

## 主な変更

現在の、

```text
指定論文をWeb検索で確認する
```

フローを、

```text
問題プロファイル作成
↓
Failure Mode抽出
↓
METHOD-ROUTING参照
↓
Applicability確認
↓
最大3 Method選択
↓
Route Check
↓
Method Card読込
↓
必要時のみ対応PDF確認
```

へ置き換える。

## CORE-AR

2608.18167は全質問で効果が証明されたMethodとして扱わない。

利用するのは主に、

* Main / Reviewer / Critic分離
* 回答案固定
* 根拠付き不同意
* Consensusを正しさとしない
* Review stabilization

という共通プロトコル。

## Review Round

各Round：

```text
Method-specific Attack
+
Invariant Gate
```

とする。

Invariant Gateは最低限：

* SPEC
* LOGIC
* FACT
* UNCERTAINTY
* CONSTRAINT
* SOURCE
* OVERCORRECTION

を確認する。

専門MethodによってInvariant Gateを省略しない。

## Agent fallback

独立subagent利用可能：

```text
independent_agents
```

利用不可：

```text
role_separated_single_model
```

単一モデル時も処理を停止せず、役割分離で継続する。

ただし独立agent実行とは表現しない。

独立した複数参加者を本質的に必要とするMethodはDesign Principleとして扱う。

## Progressive Loading

実行時に読む順序：

```text
SKILL.md
↓
METHOD-ROUTING.md
↓
選択Method Card
↓
必要な場合だけPDF
```

全PDFロードは禁止。

## 完了条件

* Web検索必須依存が除去されている
* Routerが組み込まれている
* 既存10項目フローが維持されている
* 既存3回Reviewが維持されている
* Invariant Gateが追加されている
* single-model fallbackが存在する
* SKILL.mdが不必要にKnowledge Dump化していない

完了後、変更diffを自己レビューして停止する。

---

# Phase 6 — Router Regression Test

実装済みSkillを対象にテスト仕様を作成する。

## 目的

Routerが「それっぽいMethod」を適当に選んでいないことを確認する。

## ROUTER-TEST-CASES.md

最低30ケース作成する。

カテゴリ間の件数を可能な限り均等にする。

各ケース：

```yaml
id:
prompt:

expected_profile:

expected_failure_modes:

required_methods:

allowed_methods:

forbidden_primary:

expected_design_principles:

reason:
```

を持たせる。

## 必須Boundary Test

特に以下を重点的に用意する。

* Premortem vs ABP
* Premortem vs RDM
* ACH vs 単純な案比較
* Socratic vs Requirements Elicitation
* Defeater vs Generic Critique
* FACT vs CAUSE
* PLAN vs UNCERTAINTY
* DECISION vs CONFLICT
* ASSURANCEをSecondaryに持つケース
* GENERIC fallback

各Methodについて、

* Positive >= 3
* Negative >= 3
* Boundary >= 2

を可能な限り満たす。

## 評価

各ケースについて現在のRouter仕様を適用し、

* PASS
* FAIL
* AMBIGUOUS

を記録する。

FAILの場合：

1. 原因特定
2. Method CardまたはRouting Ruleを修正
3. 全ケース再確認

局所修正で過学習しない。

## 完了条件

* 30件以上
* CRITICALな誤Routeが0
* Forbidden Primary違反が0
* 不明ケースを無理にPASSにしない

結果を報告して停止する。

---

# Phase 7 — 旧SkillとのA/B・敵対的検証

このフェーズでは「新仕様だから良い」と仮定しない。

## Baseline

変更前のSkill仕様を使用する。

Git履歴、バックアップ、またはPhase 1で保存した旧内容から再現する。

## Candidate

現在のv2 Skill。

## 評価ケース

Router Testとは別に、実際の回答生成を伴う代表ケースを用意する。

最低：

* 要件整理
* 意思決定
* 原因分析
* 計画
* 不確実性
* 高保証

各2ケース程度。

## 評価軸

* Critical Issue Recall
* False Critique Rate
* Overcorrection Rate
* Requirement Coverage
* Evidence Quality
* Residual Risk Capture
* Route Accuracy
* Token / context増加
* 実行手順の複雑化

## 注意

Claude Code上で行う擬似評価を、

「ChatGPT本番Skillの性能実証」

とは扱わない。

この段階の目的は、

* 明らかな退行
* Routerの破綻
* Methodの過剰適用
* False Positive
* 既存挙動の喪失

を見つけること。

## 敵対的レビュー

Candidateについて最後に別視点で以下を攻撃する。

1. Routerそのものが誤っていないか
2. Method Cardが原論文を過剰一般化していないか
3. PDFがなくても誤ってMethodを実行しないか
4. 3 Method制限で重要Failure Modeを落としていないか
5. Invariant Gateが形骸化していないか
6. 3回Reviewが同じ批判の言い換えになっていないか
7. False Critiqueを増やしていないか
8. 正しいV0をReviewで悪化させていないか

問題を修正した場合は関連Regression Testを再実行する。

ここで停止する。

---

# Phase 8 — 最終検証・Package

これまでの全フェーズ完了後に実施する。

## 最終チェック

次を検証する。

### Skill構造

* `SKILL.md`
* `agents/openai.yaml`
* required references
* Method Cards
* Manifest
* Router Tests

### SKILL.md

* YAML frontmatterが正しい
* nameがlowercase
* descriptionにSkillのtriggerが適切に書かれている
* 本文が過度に巨大化していない
* referencesへの参照が壊れていない

### References

* Manifestに存在しないPDFがない
* Manifestから参照されるファイルが存在する
* SHA256一致
* Redistribution Allowedを確認
* UNKNOWN / NOを配布物へ混入させていない

### Behavior

* 10項目確認
* Route
* Route Check
* 3回Review
* Critic
* Invariant Gate
* fallback
* final verification

がすべて繋がっている。

### Size

Skill全体のサイズを測定する。

25MB上限に十分注意する。

### Validation

リポジトリに既存のSkill validator / package scriptが存在する場合は、それを使用する。

存在しないツールを勝手に捏造しない。

validatorが存在しない場合は、

* 必須ファイル
* YAML
* references
* dangling links
* file size
* ZIP structure

の構造検証を実施する。

## Package

既存の正式なpackage scriptがあれば使用する。

最終成果物：

```text
skill.zip
```

とする。

## 最終報告

最後に次だけを簡潔に報告する。

1. 変更ファイル
2. 導入Method
3. 同梱PDF
4. 同梱できなかったPDFと理由
5. Regression Test結果
6. A/B検証結果
7. 残存リスク
8. Skillサイズ
9. validator結果
10. `skill.zip` の場所

未解決問題が残っている場合は隠さず明示する。
