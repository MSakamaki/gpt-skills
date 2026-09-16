# Phase 2 — 実装計画と最終ファイル構成

正本仕様は `plans/plans2.md`。本書はそれを実装可能な粒度へ落としたもので、仕様と矛盾した場合は `plans/plans2.md` を優先する。

---

## 1. 最終ファイル構成

> **後日の変更**: Phase 8 完了後、`src/` 直下を複数 Skill 対応にした。以下の `src/` は現在 `src/adversarial-answer/` に、成果物 `dist/skill.zip` は `dist/adversarial-answer/skill.zip` に相当する。現行の構成は [../plans/handoff.md](../plans/handoff.md) §2 と [../README.md](../README.md) を参照。Skill の中身と ZIP のバイト列は変わっていない。

```text
adversarial-answer/                 リポジトリルート (git 管理)
├── README.md
├── package.json / package-lock.json
├── .gitignore / .gitattributes
│
├── src/                            ← Skill 本体 (ZIP 化される範囲)
│   ├── SKILL.md
│   ├── agents/openai.yaml
│   ├── assets/icon.svg
│   └── references/
│       ├── METHOD-ROUTING.md       Problem Profile / Failure Mode / Routing / Route Check
│       ├── REFERENCE-MANIFEST.md   論文メタデータ・ライセンス・SHA256
│       ├── DESIGN-PRINCIPLES.md    Round へ割り当てない原則群
│       ├── ROUTER-TEST-CASES.md    Router Regression (30 件以上)
│       ├── methods/
│       │   ├── METHOD-CORE-AR.md
│       │   ├── METHOD-SOCRATIC.md
│       │   ├── METHOD-REQ-ELICITATION.md
│       │   ├── METHOD-CONSIDER-OPPOSITE.md
│       │   ├── METHOD-ACH.md
│       │   ├── METHOD-PREMORTEM.md
│       │   ├── METHOD-ABP.md
│       │   ├── METHOD-RDM.md
│       │   └── METHOD-DEFEATER.md
│       └── papers/
│           ├── core/ requirements/ planning/ assurance/
│           └── collaboration/ forecasting/       ※ P2 で実体が入る場合のみ作成
│
├── tools/                          ← 配布物に含まれない
│   ├── lib.mjs / validate.mjs / build.mjs / hash.mjs
├── docs/                           ← 配布物に含まれない
├── plans/                          ← 正本仕様。編集禁止・eol 正規化対象外
└── dist/skill.zip                  ← 成果物 (git 管理外)
```

`papers/causal/` は plans2 §22 の推奨に含まれるが、ACH の原論文 (Wiley) が同梱不可のため実体を持たない。空ディレクトリは作成しない。

### 決定事項

| 項目 | 決定 |
|---|---|
| ZIP 名 | `dist/skill.zip` |
| ZIP 構造 | トップレベルに `adversarial-answer/` を持つ (v1 配布物と同形式) |
| PDF 同梱方針 | arXiv / 著者公開版は同梱。出版社有料版は同梱しない。Manifest に License と Redistribution Allowed を正直に記録する |
| Method Card | CORE-AR + EXECUTABLE 8 の計 9 枚を今回作成する |
| DESIGN_PRINCIPLE | 個別 Card を作らず `DESIGN-PRINCIPLES.md` へ集約する |
| Baseline 保存 | git commit `6e2a38b` (v1 as-is)。Phase 7 A/B の Baseline とする |

---

## 2. Method 一覧

Role は plans2 §18 の 3 分類に従う。

| ID | Method | Role | Covers (Failure Mode) | Method Card | PDF | PDF 優先度 |
|---|---|---|---|---|---|---|
| CORE-AR | Adversarial Review | CORE_PROTOCOL | F07 / F16 (全Round共通) | `METHOD-CORE-AR.md` | `papers/core/adversarial-review-2608.18167.pdf` | P0 (取得済) |
| M01 | Socratic Examination | EXECUTABLE_METHOD | F01 F11 F12 F15 | `METHOD-SOCRATIC.md` | 同梱しない (SEIMAD は Elsevier 有料) | P2 |
| M02 | Requirements Elicitation | EXECUTABLE_METHOD | F06 F11 F12 F14 | `METHOD-REQ-ELICITATION.md` | `papers/requirements/elicitron.pdf` | P0 |
| M03 | Requirements Process (MARE) | DESIGN_PRINCIPLE | F06 F12 F13 F14 | `DESIGN-PRINCIPLES.md` | `papers/requirements/mare-2405.03256.pdf` | P0 |
| M04 | Consider the Opposite | EXECUTABLE_METHOD | F02 F03 F07 | `METHOD-CONSIDER-OPPOSITE.md` | 同梱しない (APA 1984 有料) | P1 |
| M05 | Competing Hypotheses (ACH) | EXECUTABLE_METHOD | F02 F03 F08 F15 | `METHOD-ACH.md` | 同梱しない (Wiley 有料) | P1 |
| M06 | Premortem | EXECUTABLE_METHOD | F04 F14 | `METHOD-PREMORTEM.md` | 同梱しない (Wiley 1989 有料) | P0 |
| M07 | Assumption-Based Planning | EXECUTABLE_METHOD | F01 F05 F14 | `METHOD-ABP.md` | `papers/planning/assumption-based-planning.pdf` (RAND / Phase 3 で可否判定) | P0 |
| M08 | Robust Decision Making | EXECUTABLE_METHOD | F05 F10 F14 | `METHOD-RDM.md` | `papers/planning/robust-decision-making.pdf` (Springer OA) | P1 |
| M09 | Defeater / Assurance 2.0 | EXECUTABLE_METHOD | F08 F09 F16 | `METHOD-DEFEATER.md` | `papers/assurance/defeaters-2405.15800.pdf` (CC BY-NC-ND 4.0) | P0 |
| M10 | Requirements MAD | DESIGN_PRINCIPLE | F06 F07 | `DESIGN-PRINCIPLES.md` | `papers/requirements/mad-re-2507.05981.pdf` | P1 |
| M11 | Adversarial Collaboration | DESIGN_PRINCIPLE | F02 F07 | `DESIGN-PRINCIPLES.md` | `papers/collaboration/adversarial-collaboration.pdf` | P2 |
| M12 | Forecast Calibration | DESIGN_PRINCIPLE | F10 | `DESIGN-PRINCIPLES.md` | `papers/forecasting/forecasting-tournaments.pdf` | P2 |
| — | Independent First | DESIGN_PRINCIPLE | F07 | `DESIGN-PRINCIPLES.md` | 根拠は CORE-AR | P0 |
| — | Minority Dissent | DESIGN_PRINCIPLE | F07 | `DESIGN-PRINCIPLES.md` | 根拠は CORE-AR | P0 |

### Role の意味

- `CORE_PROTOCOL` — 常時使用。Round の枠組みそのもの。選択対象ではない。
- `EXECUTABLE_METHOD` — Route により Review Round へ割り当て可能。最大 3。
- `DESIGN_PRINCIPLE` — Skill 全体の挙動へ反映する。単独 Round へ割り当てない。独立した複数参加者を本質的に要求する Method は plans2 §28 に従いここへ降格する。

### Failure Mode 被覆状況

| Failure Mode | 主担当 Method |
|---|---|
| F01 ASSUMPTION | M07 ABP / M01 SOCRATIC |
| F02 CONFIRMATION | M04 CONSIDER-OPPOSITE / M05 ACH |
| F03 ALTERNATIVE | M05 ACH / M04 CONSIDER-OPPOSITE |
| F04 FAILURE | M06 PREMORTEM |
| F05 FUTURE | M08 RDM / M07 ABP |
| F06 PERSPECTIVE | M02 REQ-ELICITATION |
| F07 CONSENSUS | CORE-AR + Independent First / Minority Dissent |
| F08 EVIDENCE | M09 DEFEATER / M05 ACH |
| F09 DEFEATER | M09 DEFEATER |
| F10 UNCERTAINTY | M08 RDM (+ Forecast Calibration) |
| F11 AMBIGUITY | M01 SOCRATIC / M02 REQ-ELICITATION |
| F12 INFORMATION | M01 SOCRATIC / M02 REQ-ELICITATION |
| F13 CRITERIA | MARE Process Separation (原則) — 専任 EXECUTABLE なし |
| F14 CONSTRAINT | M06 PREMORTEM / M07 ABP / M08 RDM / M02 |
| F15 CAUSALITY | M05 ACH / M01 SOCRATIC |
| F16 OVERCORRECTION | CORE-AR + Invariant Gate G7 / M09 DEFEATER |

F13 は単独の EXECUTABLE_METHOD を持たない。Invariant Gate G1 (SPEC) と MARE 由来の「要件生成と検証を同一役割にさせない」原則で扱う。この非対称性は Method Card と ROUTING に明記する。

---

## 3. 依存関係

```text
plans/plans2.md              仕様正本
        ↓
REFERENCE-MANIFEST.md        論文 ID・ライセンス・SHA256・Method 対応
        ↓
methods/METHOD-*.md          実行仕様の正本 (Canonical)
        ↓
METHOD-ROUTING.md            Profile / Failure Mode / Applicability / Route Check
        ↓
SKILL.md                     実行フロー本体。Router の詳細は ROUTING へ委譲
        ↓
ROUTER-TEST-CASES.md         Route の回帰検証
        ↓
tools/validate.mjs           構造・参照・SHA256・サイズの機械検証
```

実行時のロード順序は `SKILL.md → METHOD-ROUTING.md → 選択 Method Card → 必要時のみ PDF`。全 PDF ロードは禁止 (plans2 §29)。

---

## 4. P0 / P1 / P2

plans2 §34 の優先度は **PDF 導入順**であり、Method Card 作成順ではない。今回は Card 9 枚を一括作成し、PDF のみ優先度に従う。

- **P0** — Adversarial Review / MARE / Elicitron / Premortem / ABP / Defeaters
- **P1** — Considering the Opposite / ACH / RDM / Requirements MAD
- **P2** — Adversarial Collaboration / Forecasting Tournaments / Socratic Elenchus

P1/P2 の PDF は P0 の構造を壊さずに `papers/<category>/` へ追加でき、追加時の変更は Manifest の 1 エントリと該当 Card の Evidence 欄のみで完結する。

---

## 5. plans1 由来 SUPPLEMENT の採否

| ID | 内容 | 採否 | 反映先 |
|---|---|---|---|
| S1 | `INDEPENDENT_FIRST` / `MINORITY_DISSENT` の定義 (Reviewer 同士を最初から相互参照させない / 初期回答を固定 / Consensus を正解としない) | 採用 | `DESIGN-PRINCIPLES.md` |
| S2 | Method Card に参照ページを記録 | 採用 | Card の Evidence 欄 |
| S3 | Reference 障害時の Fallback 手順 (PDF 不在 → Manifest の Fallback → 無ければ当該 Method 不使用 + 最終回答へ制約記録。Web へ自動切替しない) | 採用 | `METHOD-ROUTING.md` / 各 Card の Fallback |
| S4 | 高保証時は Defeater を 4 つ目として足さず、Coverage の低い Method と入れ替える | 採用 | `METHOD-ROUTING.md` Routing 手順 |
| S5 | 論理 / 事実 / 実用性の 3 観点を完全廃止しない | 採用 | Invariant Gate + Round 補助観点として `SKILL.md` |
| S6 | Invariant Gate G5 に安全・上位ルールへの適合を含める | 採用 | `SKILL.md` G5 の定義 |
| S7 | Manifest に `Required` / `Method Card` 欄 | 採用 | `REFERENCE-MANIFEST.md` |
| S8 | 「最大 3 Method は上限であり目標ではない」 | 採用 | `METHOD-ROUTING.md` / `SKILL.md` |
| C1 | Failure Mode 番号体系 F1–F14 | 不採用 | plans2 の F01–F16 を採用 |
| C2 | `references/` 直下に Method Card と PDF を平置き | 不採用 | plans2 §22 の `methods/` + `papers/<category>/` を採用 |
| C3 | plans1 の Method Card 見出し体系 | 不採用 | plans2 §19 テンプレートを採用 |
| U1 | Policy Delphi | 不採用 | plans2 の Registry に存在しない |
| U2 | Router 不確実時にユーザー確認質問へ戻る | 不採用 | plans2 §24 の「再選択 1 回」に従う。残存不確実性は最終回答へ記録 |
| U3 | `package_skill.py` | 不採用 | 存在しないツール。node ビルドを使用 |

---

## 6. 実装順序

| Phase | 作業 | 主な変更ファイル |
|---|---|---|
| 3 | P0 論文の取得・ライセンス確認・SHA256 記録 | `src/references/papers/**`, `src/references/REFERENCE-MANIFEST.md` |
| 4 | Method Card 9 枚 + ROUTING + DESIGN-PRINCIPLES | `src/references/methods/**`, `METHOD-ROUTING.md`, `DESIGN-PRINCIPLES.md` |
| 5 | SKILL.md 統合 (§4 差替 / Invariant Gate / fallback) | `src/SKILL.md` |
| 6 | Router Regression 30 件以上 | `src/references/ROUTER-TEST-CASES.md` |
| 7 | 旧 Skill との A/B・敵対的検証 | 修正が出た場合のみ Card / ROUTING |
| 8 | 最終検証・`dist/skill.zip` 生成 | `tools/`, `dist/` |

Phase 3 で P0 論文が取得できない場合、別論文へ置換せず「不足」として Manifest と報告に記録する (phase.md Phase 3)。

---

## 7. Phase 2 完了条件

- [x] 最終ファイル構成が確定
- [x] 各 Method の Role が確定
- [x] P0 / P1 / P2 が確定
- [x] plans1 由来 SUPPLEMENT の採否が確定
- [x] 実装順序が確定
