# Method Routing

回答仕様が確定してから V0 を作るまでの間に、この文書だけを読んで検証戦略を決める。

読み込み順序は `SKILL.md` → 本書 → 選択した Method Card → 必要な場合だけ対応 PDF。**`references/papers/` 配下の PDF をすべて読むことはしない。** Method Card が実行仕様の正本であり、PDF は根拠の確認と Card 自体の監査にだけ使う。

---

## 1. ルーティングの順序

```text
Problem Profile
    ↓
Failure Mode
    ↓
Applicability
    ↓
Method
```

**Problem Profile から Method を直接決めてはならない。** 「PLAN だから PREMORTEM」「CAUSE だから COMPETING_HYPOTHESES」という決め方を禁止する。

同じ計画の依頼でも、暗黙前提が問題なら ASSUMPTION_BASED_PLANNING、失敗条件が問題なら PREMORTEM、多数の将来条件への脆弱性が問題なら ROBUST_DECISION_MAKING と、適切な Method が変わるため。

Problem Profile の役割は、Failure Mode を探す範囲を絞ることと、Method の適用条件を評価する材料を与えることに限る。

---

## 2. Problem Profile

確定した回答仕様を次へ分類する。複数選択できる。

| ID | 分類 | 代表例 |
|---|---|---|
| `REQ` | 要件・課題整理 | 要件定義、仕様整理、抜け漏れ確認 |
| `DECISION` | 意思決定・比較 | A/B 比較、方針選択、採否判断 |
| `CAUSE` | 原因・仮説分析 | 障害原因、不具合の切り分け |
| `PLAN` | 計画・施策 | 導入計画、ロードマップ、移行手順 |
| `UNCERTAINTY` | 深い不確実性 | 将来条件が変化する前提での判断 |
| `CONFLICT` | 意見・利害対立 | 複数案・複数ステークホルダーの衝突 |
| `ASSURANCE` | 高保証・重大リスク | 安全性、法令、不可逆な判断 |
| `FORECAST` | 将来予測 | 将来イベント、確率、見通し |
| `FACT` | 事実・根拠確認 | 正確性、出典確認 |
| `GENERIC` | 上記に特化しない | 一般的な質問 |

Primary を 0〜1 個、Secondary を 0 個以上持つ。分類できない場合は `GENERIC` とする。**無理に既存カテゴリへ押し込まない。**

---

## 3. Failure Mode

Problem Profile とは独立に、回答を誤らせうる要因を検出する。

| ID | Failure Mode | 内容 |
|---|---|---|
| `F01` | ASSUMPTION | 暗黙の前提 |
| `F02` | CONFIRMATION | 現在案を支持する情報へ偏る |
| `F03` | ALTERNATIVE | 代替仮説・代替案の不足 |
| `F04` | FAILURE | 失敗条件の不足 |
| `F05` | FUTURE | 将来条件変化への脆弱性 |
| `F06` | PERSPECTIVE | ステークホルダー・視点の不足 |
| `F07` | CONSENSUS | 初期回答・多数派・他 Agent への同調 |
| `F08` | EVIDENCE | 根拠不足 |
| `F09` | DEFEATER | 重大な反証が未解決 |
| `F10` | UNCERTAINTY | 不確実性を過度に断定 |
| `F11` | AMBIGUITY | 定義・概念の曖昧さ |
| `F12` | INFORMATION | 判断に必要な情報の不足 |
| `F13` | CRITERIA | 評価基準自体の不備 |
| `F14` | CONSTRAINT | 制約・実行条件の見落とし |
| `F15` | CAUSALITY | 因果関係の飛躍 |
| `F16` | OVERCORRECTION | 敵対的検証によって正しい内容を悪化させる |

### Severity

| 段階 | 判定基準 |
|---|---|
| `CRITICAL` | 回答仕様の成功条件を直接損なう。または安全・法令・不可逆な判断に関わる |
| `MAJOR` | 結論または主要な手順が変わる |
| `MINOR` | 表現・補足の水準にとどまる |

Method 選択では `CRITICAL` → `MAJOR` の順に Coverage する。`MINOR` を根拠に Method を追加しない。

`F07` と `F16` は常に検出対象とする。この 2 つは CORE-AR と Invariant Gate が担当するため、専門 Method の選択理由にはしない。

---

## 4. Failure Mode → Method 候補

**この表は候補を出すためのものであり、選択結果ではない。** 候補は必ず §5 の適用条件評価を通す。

| Failure Mode | 第一候補 | 次候補 | 担当する原則 |
|---|---|---|---|
| `F01` ASSUMPTION | `ASSUMPTION_BASED_PLANNING` | `SOCRATIC` | — |
| `F02` CONFIRMATION | `CONSIDER_OPPOSITE` | `COMPETING_HYPOTHESES` | `ADVERSARIAL_COLLABORATION` (Profile に `CONFLICT` を含む場合) |
| `F03` ALTERNATIVE | `COMPETING_HYPOTHESES` (説明仮説) | `CONSIDER_OPPOSITE` (結論・案) | — |
| `F04` FAILURE | `PREMORTEM` | — | — |
| `F05` FUTURE | `ROBUST_DECISION_MAKING` (変数 2 つ以上) | `ASSUMPTION_BASED_PLANNING` (前提単位) | — |
| `F06` PERSPECTIVE | `REQUIREMENTS_ELICITATION` | — | `MARE_PROCESS_SEPARATION` / `REQUIREMENTS_MAD` |
| `F07` CONSENSUS | — (CORE-AR が担当) | `CONSIDER_OPPOSITE` | `INDEPENDENT_FIRST` / `MINORITY_DISSENT` / `ADVERSARIAL_COLLABORATION` / `REQUIREMENTS_MAD` |
| `F08` EVIDENCE | `DEFEATER` (※) | `COMPETING_HYPOTHESES` | — |
| `F09` DEFEATER | `DEFEATER` | — | — |
| `F10` UNCERTAINTY | `ROBUST_DECISION_MAKING` | — | `FORECAST_CALIBRATION` |
| `F11` AMBIGUITY | `SOCRATIC` | `REQUIREMENTS_ELICITATION` | — |
| `F12` INFORMATION | `SOCRATIC` (論点の不足) | `REQUIREMENTS_ELICITATION` (視点の不足) | — |
| `F13` CRITERIA | — (専任 Method なし) | `SOCRATIC` (基準の定義を検査) | `MARE_PROCESS_SEPARATION` + Invariant Gate G1 |
| `F14` CONSTRAINT | `PREMORTEM` | `ASSUMPTION_BASED_PLANNING` / `ROBUST_DECISION_MAKING` / `REQUIREMENTS_ELICITATION` | — |
| `F15` CAUSALITY | `COMPETING_HYPOTHESES` | `SOCRATIC` | — |
| `F16` OVERCORRECTION | — (Invariant Gate G7 が担当) | `DEFEATER` | — |

### 担当する原則の読み方

この列は Method 候補ではない。その Failure Mode を検出したとき、`references/DESIGN-PRINCIPLES.md` のどの原則が併せてかかるかを示す。原則は Round へ割り当てず、選択した Method の実行のしかたを縛る。

- `REQUIREMENTS_MAD` がかかるのは `REQUIREMENTS_ELICITATION` を実行する Round に限る。`F06` / `F07` を検出しても、この Method を選ばなかった場合は適用しない
- `ADVERSARIAL_COLLABORATION` がかかるのは Problem Profile に `CONFLICT` が含まれる場合に限る。`F02` / `F07` の検出だけでは発火しない
- `INDEPENDENT_FIRST` / `MINORITY_DISSENT` は `F07` の有無に関わらず全 Round にかかる。実行時の規則は `SKILL.md` §6 が正本で、この列は原則側の記述への案内にすぎない

### ※ F08 EVIDENCE の扱い

`F08` を検出しただけで `DEFEATER` を当てない。次のいずれかを満たす場合に限る。

- 回答仕様が高保証を求めている (Problem Profile に `ASSURANCE` が含まれる)
- `F08` または `F09` の Severity が `CRITICAL`
- 覆ると結論が変わる主張が特定でき、その反証条件を書ける

いずれも満たさない場合、根拠不足は Invariant Gate の `G3 FACT` と `G6 SOURCE` で扱う。出典との突き合わせで決着する事実確認に `DEFEATER` を当てると、確認で済む事項を過剰な指摘へ膨らませ、`RC8` が問う False Positive を増やす。

### F13 に専任 Method がないこと

`F13` CRITERIA を直接検査する EXECUTABLE_METHOD は存在しない。評価基準そのものの不備は、Invariant Gate G1 (回答仕様への適合) と `MARE_PROCESS_SEPARATION` (基準を作った役割に基準を検証させない) で扱い、基準の定義が曖昧な場合に限り `SOCRATIC` を使う。`F13` が `CRITICAL` の場合は、Method を無理に当てるのではなく、評価基準の確認自体を最終回答へ未解決事項として残す。

---

## 5. 適用条件の評価

候補の各 Method について、その Method Card の `Applicable When` と `Do Not Use When` を読み、次を判定する。

- `Applicable When` をすべて満たさない候補は落とす
- `Do Not Use When` に 1 つでも該当する候補は落とす
- 判定に必要な情報が回答仕様に無い場合、その Method は「適用条件を確認できない」として落とす。推測で適用しない

特に誤用しやすい境界を明示する。**この表は要約であり、適用境界の正本は各 Method Card の `Applicable When` / `Do Not Use When`。** 食い違った場合は Card を採り、この表を直す。

| 境界 | 判定の分かれ目 |
|---|---|
| `PREMORTEM` vs `ASSUMPTION_BASED_PLANNING` | 失敗という結果から遡るなら PREMORTEM。計画が依存する前提を洗うなら ABP |
| `PREMORTEM` vs `ROBUST_DECISION_MAKING` | 重要な不確実変数が 1 つで単一の失敗シナリオを詰めるなら PREMORTEM。変数が 2 つ以上で複数の将来を構成する意味があるなら RDM |
| `COMPETING_HYPOTHESES` vs 単純な案比較 | 観測事実を説明する仮説が 2 つ以上あり、仮説を区別できる証拠があるなら ACH。どの案を採るかの選好比較なら ACH を使わない |
| `SOCRATIC` vs `REQUIREMENTS_ELICITATION` | 概念・定義・因果を明確にするなら SOCRATIC。視点を増やして候補要件を出すなら REQUIREMENTS_ELICITATION |
| `DEFEATER` vs 一般的な批判 | 覆ると結論が変わる具体的な主張があり、その反証条件を書けるなら DEFEATER。漠然とした懐疑なら CORE-AR の一般攻撃 |

---

## 6. Method の選択

1. `CRITICAL` → `MAJOR` の順に、未 Coverage の Failure Mode を取る。
2. その Failure Mode に **最も特化した** 適用可能 Method を Primary とする。特化の判定は次の順で行う。
   1. その Failure Mode を Method Card の `Covers` に持つ
   2. `Applicable When` が今回の状況を直接記述している
   3. 適用条件がより具体的な Method を優先する (条件が緩い Method は後回し)
3. 未 Coverage の重要 Failure Mode が残る限り、それを最も多く Cover する適用可能 Method を追加する。
4. 既に選択した Method と Coverage がほぼ重複する Method は追加しない。
5. 選択は最大 3 Method で打ち切る。
6. 適用可能な専門 Method が 1 つも無い場合は CORE-AR だけで進む。

**数値スコアは使わない。** 重み付けの根拠が無い以上、点数化は新しい恣意性を作るだけであるため。

### Covers に無い Method を当てる場合

手順 2 の第 1 基準 (`Covers` に持つ) を満たす Method が 1 つも無い Failure Mode がある。`F13 CRITERIA` がそれにあたる。

この場合、**その Failure Mode の一部分を検査できると Method Card が明示している Method** を次候補として選んでよい。ただし次を守る。

- **Primary は `Covers` に持つ Method を優先する。** 他の Failure Mode を `Covers` に持つ適用可能 Method が選択集合にあるなら、そちらを Primary とし、この例外で選んだ Method は次候補に置く
- `Covers` に持つ適用可能 Method が 1 つも無い場合に限り、この例外で選んだ Method を Primary にしてよい。CORE-AR だけで進むより、部分的にでも検査できる Method を当てる方を採る
- Cover が部分的であることを §10 の記録へ残す。未 Coverage の扱いは変えない
- §5 の適用条件評価は通常どおり通す。この例外は特化の判定を緩めるだけで、`Do Not Use When` を免除しない

`F13` に `SOCRATIC` を当てるのはこの規則による (§4「F13 に専任 Method がないこと」)。個別ケースを通すための例外を新たに足さない。

### 最大 3 は上限であり目標ではない

重要な Failure Mode を Cover できるなら、`1 Method + CORE-AR` でも `2 Method + CORE-AR` でもよい。3 つ埋めるために適用条件の合わない Method を足さない。

### 高保証案件での DEFEATER

Problem Profile に `ASSURANCE` が含まれ、`DEFEATER` の適用条件を満たす場合、`DEFEATER` を優先候補とする。ただし **4 つ目として追加しない。** 既に選択した Method のうち Coverage が最も低いものと入れ替える。

---

## 7. Route Check

Method を選択した後、V0 を作る前に必ず実施する。

| ID | 確認事項 |
|---|---|
| `RC1` | 最重要の Failure Mode は何か |
| `RC2` | Primary Method はそれを直接検査するか |
| `RC3` | 各 Method の `Applicable When` を満たしているか |
| `RC4` | `Do Not Use When` に該当していないか |
| `RC5` | Method 同士の Coverage がほぼ重複していないか |
| `RC6` | `CRITICAL` な Failure Mode が未 Coverage で残っていないか |
| `RC7` | より具体的な Method を見落としていないか |
| `RC8` | 今回 Method を適用することで新しい False Positive を増やす可能性はないか |

問題があれば Route を **1 回だけ** 再選択する。再選択後も問題が残る場合は、Coverage できない Failure Mode を制約として記録したうえで進む。**無限に再評価しない。**

`RC8` で False Positive の増加が見込まれる場合、その Method を外して CORE-AR へ寄せる判断を優先する。指摘の数は品質ではない。

---

## 8. Review Round への割り当て

Round は 3 回で固定する。各 Round は次の 2 つで構成する。

```text
Method-specific Attack  +  Invariant Gate
```

| Round | 割り当て |
|---|---|
| Round 1 | Primary Method |
| Round 2 | 2 番目の Method。無ければ CORE-AR の一般攻撃 (事実・出典・最新性・反例) |
| Round 3 | 3 番目の Method。無ければ CORE-AR の一般攻撃 (対象者適合・実行可能性・境界事例) |

Method が 3 つに満たない Round では、CORE-AR の一般攻撃を行う。その際も Round ごとに観点を変え、同じ批判の言い換えを繰り返さない。

Invariant Gate は **すべての Round で必ず実施する。** 専門 Method が Gate を置き換えることはない。**G1〜G7 の定義は `SKILL.md` §6 が正本**で、本書と `DESIGN-PRINCIPLES.md` は参照するだけ。

---

## 9. Reference 障害時の扱い

選択した Method の Method Card が存在しない、または読めない場合は次の順で対処する。

1. その Method Card の `Fallback` に指定された Method へ切り替える
2. `Fallback` が無い、または Fallback も利用できない場合は、その Method を使わない
3. 使わなかったことと、Cover できなかった Failure Mode を最終回答の制約として記録する

PDF が同梱されていないことは障害ではない。Method Card が実行仕様の正本であり、PDF が無くても Method は実行できる。

**ユーザーの明示的な許可なしに Web 検索へ切り替えない。** 方法論を Web から取得し直すことはしない。

---

## 10. 記録する内容

Route の決定について、次を検証サマリーへ出せる形で保持する。

- Problem Profile (Primary / Secondary)
- 検出した Failure Mode と Severity
- 選択した Method と、それぞれが Cover する Failure Mode
- 選択しなかった主要候補と、外した理由 (適用条件・重複)
- Route Check の結果と、再選択を行った場合はその理由
- Cover できなかった Failure Mode
- 実行モード (`independent_agents` / `role_separated_single_model`)
