# Phase 7 — 旧 Skill との A/B と敵対的検証

## 0. この評価の位置付けと限界

ここで行ったのは **Claude Code 上の机上評価**であり、ChatGPT 上で動く本番 Skill の性能実証ではない。

- 同一モデル・同一セッション内で両仕様を適用しているため、評価者と被評価者が独立していない
- 盲検化していない。v2 を書いた立場で v2 を評価しているため、v2 に有利な方向へ偏りうる
- 各ケース 1 試行で、ばらつきを測っていない
- 実際の 3 Round 完全実行を行ったのは 3 ケースで、残り 9 ケースは Route と攻撃観点の差分追跡にとどめた

したがって本評価の目的は「v2 が優れていることの証明」ではなく、次を見つけることに限定する。

- 明らかな退行
- Router の破綻
- Method の過剰適用
- False Positive の増加
- 既存挙動の喪失

---

## 1. Baseline と Candidate

| | 内容 |
|---|---|
| Baseline | git `6e2a38b` の `SKILL.md` (11,272 B)。固定 3 Round (論理 / 事実 / 実用性)、実行前に指定論文をウェブ検索と PDF で確認 |
| Candidate | 現行 v2。Failure Mode Router + Method Card + Invariant Gate |

---

## 2. 評価ケースと Route 差分

| ID | 依頼 | Baseline の Round | Candidate の Route |
|---|---|---|---|
| AB-REQ-1 | 勤怠管理システム刷新の要件 10 項目の抜け漏れ検証 | 論理 / 事実 / 実用性 | REQ_ELICITATION → SOCRATIC → CORE-AR (事実) |
| AB-REQ-2 | 社内ヘルプデスク FAQ 整備の要件整理 | 同上 | REQ_ELICITATION → SOCRATIC → CORE-AR |
| AB-DEC-1 | 監視 SaaS 導入と内製の比較結論の妥当性 | 同上 | CONSIDER_OPPOSITE → ABP → CORE-AR |
| AB-DEC-2 | モノリス分割を実施するという判断の検証 | 同上 | CONSIDER_OPPOSITE → PREMORTEM → CORE-AR |
| AB-CAUSE-1 | API の p99 レイテンシ 3 倍の原因をインデックス不足と結論 | 同上 | ACH → CONSIDER_OPPOSITE → CORE-AR |
| AB-CAUSE-2 | 新規登録完了率の低下原因を UI 変更と結論 | 同上 | ACH → CONSIDER_OPPOSITE → CORE-AR |
| AB-PLAN-1 | 全社 SSO 導入計画の見落とし検証 | 同上 | ABP → PREMORTEM → CORE-AR |
| AB-PLAN-2 | レガシー DB 移行計画の失敗要因洗い出し | 同上 | PREMORTEM → ABP → CORE-AR |
| AB-UNC-1 | 為替と原材料価格が読めない中の調達戦略 | 同上 | RDM → ABP → CORE-AR |
| AB-UNC-2 | AI 規制が不透明な中の製品方針 | 同上 | RDM → ABP → CORE-AR |
| AB-ASSR-1 | 個人情報を含むログの分析基盤連携が法令適合と結論 | 同上 | DEFEATER → SOCRATIC → CORE-AR |
| AB-ASSR-2 | 決済システム移行手順書の破綻確認 | 同上 | PREMORTEM → DEFEATER → CORE-AR |

Baseline はすべてのケースで同じ 3 観点を適用する。Candidate は 12 ケースで 7 通りの Route を生成した。**Route が依頼によって変わっていること自体は確認できた。**

---

## 3. 深掘り比較 (3 ケース)

### AB-REQ-1 — 要件整理

V0 の要件: 打刻 / 申請承認 / 集計 / 給与連携 / 権限 / モバイル対応 / 監査ログ / SSO / 通知 / レポート。

**Baseline が出した指摘**

- Round 1 (論理): 打刻と申請承認の関係が未定義。集計の締め日が未定義
- Round 2 (事実): 労働基準法の要件を確認すべき。出典が示されていない
- Round 3 (実用性): 既存データの移行。運用負荷

**Candidate が出した指摘**

- Round 1 (REQ_ELICITATION): 運用・保守側 (人事の月次締め)、例外対応側 (打刻漏れの修正申請)、決裁側 (承認者不在時の代理承認)、想定外利用 (直行直帰・シフト勤務)、影響を受ける非当事者 (派遣・業務委託) の 5 視点から、`MISSING` の候補要件 5 件 — 打刻修正フロー / 代理承認 / シフト勤務の扱い / 雇用形態別の集計 / 締め後修正の扱い
- Round 2 (SOCRATIC): 「勤怠」「承認」「締め」の定義、「モバイル対応」の範囲 (閲覧のみか打刻も含むか)、監査ログの保持期間が未定義、「刷新」が移行を含むか
- Round 3 (CORE-AR 事実観点): 労基法・36 協定の要件、給与システムの IF 仕様

**差分**: Baseline の Round 2 (事実) は、出典がほとんど存在しない要件整理タスクに対して空振りに近い。Candidate は同じ 3 Round のうち 2 Round を要件整理に有効な攻撃へ振り替えており、`MISSING` 要件を具体名で 5 件出した。Baseline は「未定義」を 2 件指摘したが、雇用形態別集計や代理承認には到達していない。

**Candidate 側のリスク**: 候補要件が多いため、回答仕様が対象外とした範囲 (例: 派遣社員を対象外と明示している場合) の要件を挙げてしまう恐れがある。Method Card の False Positive Guard がこれを禁じているが、実際に守られるかは実行時の判断に依存する。

### AB-CAUSE-1 — 原因分析

V0: p99 レイテンシ 3 倍の原因はインデックス不足。対策はインデックス追加。

**Baseline**: 「根拠が弱く、他の原因も検討すべき」「スロークエリログを提示すべき」「インデックス追加による書き込み性能への影響」。

**Candidate (ACH)**: 仮説を 6 つ並置 (インデックス不足 / デプロイによる実装変更 / 依存サービスの劣化 / トラフィック増 / インフラ側の競合 / 観測系の変更)。証拠マトリクスで「先週から」という時間的一致はどの仮説とも整合するため `N` (識別しない) と判定し、**デプロイ履歴とトラフィック量が仮説を識別する証拠**であることを特定。V0 が示した根拠は仮説を区別しないと指摘した。

**差分**: これが最も大きい差。Baseline の「他の原因も検討すべき」は正しいが行動につながらない。Candidate は「どの観測を取れば絞り込めるか」を出す。`F15 CAUSALITY` (因果の飛躍) に対する検出力が実質的に上がっている。

### AB-ASSR-1 — 高保証

V0: 個人情報を含むログを分析基盤へ連携する設計。法令・社内規程に適合していると結論。

**Baseline**: 「同意取得の範囲は」「保持期間は」「アクセス制御は」— 妥当だが、指摘は解消されるか落とされるかのどちらかになる。

**Candidate (DEFEATER)**: `CLAIM` = 「本設計は個人情報保護法および社内規程に適合する」。`ARGUMENT` / `EVIDENCE` を分離したうえで defeater を 4 件立て、判定を付けた。

- 委託先が海外リージョンを使う場合の越境移転 → `UNRESOLVED` (契約書の確認が必要)
- 仮名加工情報として扱うなら加工基準を満たすか → `CONFIRMED` (加工基準が設計に書かれていない)
- 分析目的が当初の利用目的の範囲内か → `UNRESOLVED` (利用目的の記載を確認する必要)
- 削除要求時に分析基盤側から削除できるか → `CONFIRMED`

**差分**: Baseline は未解決事項を残す仕組みを持たない。Candidate は `UNRESOLVED` を最終回答へ反映する規則があり、`Residual Risk Capture` が構造的に改善する。これは Method 由来というより、**未解決を残す出力規約**の効果。

---

## 4. 評価軸

| 軸 | 判定 | 根拠 |
|---|---|---|
| Critical Issue Recall | ↑ | AB-CAUSE-1 で識別証拠の特定、AB-REQ-1 で `MISSING` 要件 5 件、AB-ASSR-1 で `CONFIRMED` 2 件。いずれも Baseline は到達していない |
| False Critique Rate | = (改善なし・悪化なし) | Phase 6 で DEFEATER の過剰適用を 1 件検出し仕様修正した。修正後の 36 ケースで Forbidden Primary 違反 0。ただし候補要件・失敗原因の生成量が増えるため、実行時の Guard 遵守に依存する |
| Overcorrection Rate | ↓ (小) | `G7 OVERCORRECTION` を明示的な Gate として追加。Baseline は「情報損失がないか」という一般的な再確認のみ |
| Requirement Coverage | ↑ | AB-REQ-1 / AB-REQ-2 で視点起点の網羅が加わる |
| Evidence Quality | ↑ | 各指摘に根拠 (該当箇所・出典・仕様項目) を添えることを SKILL.md で義務化。Baseline は Critic 側の不同意にのみ根拠を求めていた |
| Residual Risk Capture | ↑ | `UNRESOLVED` の保持、Coverage できなかった Failure Mode の記録、転用上の限界の明示 |
| Route Accuracy | 36/36 (Phase 6) | CRITICAL な誤 Route 0、Forbidden Primary 違反 0 |
| Token / context 増加 | 固定読み込みは増加、変動読み込みは減少 | 下表 |
| 実行手順の複雑化 | ↑ (最大のリスク) | §6 参照 |

### 読み込み量の実測

| | Baseline | Candidate |
|---|---|---|
| 固定 | `SKILL.md` 11,272 B | `SKILL.md` 16,002 B + `METHOD-ROUTING.md` 13,008 B + `METHOD-CORE-AR.md` 6,265 B |
| 選択 Method Card | — | 1〜3 枚 × 約 5,000〜6,800 B |
| 条件付き | — | `DESIGN-PRINCIPLES.md` 7,454 B (CONFLICT / FORECAST / UNCERTAINTY 時) |
| 変動 | ウェブ検索 + 27 ページ PDF の確認 (毎回必須) | 原則なし。Card に疑義がある場合のみ PDF |

Method を 2 つ選ぶ典型ケースで固定読み込みは約 46 KB。Baseline の 11 KB に対し約 4 倍だが、Baseline は毎回ウェブ検索と PDF 確認を必須としていたため、**総コストが増えるとは限らない**。正確な比較には本番環境での計測が必要で、本評価では確定できない。

---

## 5. 敵対的レビュー

Candidate に対し、v2 を良いと仮定せずに攻撃した。

### 5.1 Router そのものが誤っていないか

§4 の候補表の「第一候補 / 次候補」の順序は、根拠のある重み付けではなく設計判断である。たとえば `F14 CONSTRAINT` の第一候補を PREMORTEM にしているが、REQ 文脈では REQUIREMENTS_ELICITATION が適切になる。実際には各 Method の `Applicable When` (PREMORTEM は具体的な計画を要求する) が働いて自己修正されるため、36 ケースでは誤 Route は出なかった。

**残るリスク**: 適用条件が緩い Method が候補表の上位にいると、フィルタをすり抜ける。Phase 6 の DEFEATER がまさにこの形で顕在化した。同じ構造の欠陥が他の Method にも潜在しうる。

### 5.2 Method Card が原論文を過剰一般化していないか

**発見 1**: ページ引用が PDF ページか印刷ページか区別されていなかった。RDM は章が印刷 p.23 から始まるため、引用が実際と 22 ページずれて読める状態だった。→ **修正済み**。すべて `PDF p.N (印刷 p.M)` 形式へ統一した。

**発見 2**: `METHOD-ABP.md` の `Research-backed` は「load-bearing / vulnerable」という区分を原典由来として書いているが、根拠は RAND の Landing Page と plans2 の記述だけで、原典本文は未参照 (PDF が暗号化されており抽出不能)。Card はその旨を `Evidence` と `Evidence Strength` に明記しており、過剰一般化には至っていないと判断する。ただし **本 Skill で最も根拠が薄い Card** である。

**発見 3**: `METHOD-DEFEATER.md` は原典が defeater の体系的探索を扱っていないことを明記し、探索手順を Skill 固有として分離している。これは適切。

### 5.3 PDF が無くても誤って Method を実行しないか

PDF 未同梱の 5 Method (PREMORTEM / ABP / ACH / CONSIDER_OPPOSITE / SOCRATIC) は、いずれも Card 単体で実行できる手順を持ち、`Evidence Strength` を `LIMITED` または `METHODOLOGICAL` と宣言している。原典の実験条件・効果量に基づく主張は書いていない。

**残るリスク**: 利用者が Method 名 (Premortem、ACH) から「その研究手法を実装している」と受け取る可能性。Card には書いてあるが、最終回答に毎回出るわけではない。SKILL.md の検証サマリーで「転用上の限界」を併記する規則がこれを部分的に緩和する。

### 5.4 3 Method 制限で重要 Failure Mode を落としていないか

落としうる。`F01 + F04 + F05 + F06 + F09` が同時に `CRITICAL` になるケースでは 3 Method で覆えない。`METHOD-ROUTING.md` §7 と `SKILL.md` §4 が「Coverage できなかった Failure Mode を制約として記録する」と定めており、**隠さずに残す**設計になっている。制限そのものは plans2 §23 の仕様であり変更しない。

### 5.5 Invariant Gate が形骸化していないか

**発見 4**: 初版では Gate の実施結果を記録する規定がなく、「確認する」とだけ書かれていた。記録義務がない確認は素通りしやすい。→ **修正済み**。`SKILL.md` の Gate へ「どの Gate に該当があり、どう処理したかを記録する。記録のない Gate は実施していないものとして扱う」を追加した。

### 5.6 3 回 Review が同じ批判の言い換えになっていないか

Method が 2 つ以上選ばれるケースでは、Round ごとに攻撃対象が構造的に変わるため Baseline より言い換えが起きにくい。Method が 0 個のケース (GEN-002 型) では 3 Round とも CORE-AR の一般攻撃になるため、Baseline と同じリスクが残る。`SKILL.md` は「その回までに使っていない観点を選ぶ」と定めているが、これは Baseline の固定 3 観点と実質的に同等の担保しかない。

### 5.7 False Critique を増やしていないか

増やす方向の圧力はある。REQUIREMENTS_ELICITATION は候補要件を、PREMORTEM は失敗原因を、RDM は脆弱性を、それぞれ生成する Method であり、生成量が増える。対抗手段は 3 つ置いた。

- 各 Card の `False Positive Guard` (SPECULATIVE を指摘にしない、数を成果にしない等)
- `RC8` (Method 適用が新たな False Positive を増やさないか)
- Critic による Method 適用可否の検査

Phase 6 で実際に 1 件 (DEFEATER) 検出できたので、機構としては働いている。ただし本番環境での False Critique 率は測定していない。

### 5.8 正しい V0 を Review で悪化させていないか

`G7` と、各 Card の「断定を避けるだけの書き換えを修正として採用しない」規定で対処している。AB-DEC-1 の追跡では、CONSIDER_OPPOSITE が反対結論を構成したものの成立しないと確認できたケースで、Card の False Positive Guard (「反対の結論が成立しないことを確認できた場合、それを指摘にしない」) が働き、元の結論を弱めない挙動になった。

---

## 6. 最大のリスク — 実行手順の複雑化

Baseline は 7 工程だった。Candidate は §4 に 10 手順、Route Check 8 項目、Invariant Gate 7 項目が加わる。

LLM が長い手順書の一部を飛ばす可能性は、Method の精度以前の問題として残る。特に飛ばされやすいのは次と考えている。

- Route Check `RC5` / `RC8` (選択を否定する方向の確認)
- Invariant Gate の記録 (修正 4 で記録義務を課したのはこのため)
- Method Card の `False Positive Guard`

構造的な緩和として、Critic に Method 適用可否を検査させることで Route の誤りを Review 内で再検出できるようにしている。ただし Route Check 自体の実施漏れは検出できない。**これは v2 の残存リスクとして受け入れる。**

---

## 7. 修正と再検証

| # | 発見 | 修正 |
|---|---|---|
| 1 | DEFEATER が単純な事実確認へも適用される (Phase 6) | `METHOD-DEFEATER.md` の Do Not Use When に 2 条件、`METHOD-ROUTING.md` の F08 に適用 3 条件 |
| 2 | ページ引用が PDF ページか印刷ページか不明 | 4 Card の引用を `PDF p.N (印刷 p.M)` 形式へ統一 |
| 3 | Invariant Gate の実施結果に記録義務がない | `SKILL.md` の Gate へ記録規定を追加 |

修正 2 と 3 は Route の判定に影響しないが、念のため Router Regression 36 ケースを再確認し、全件 PASS を維持していることを確認した。

---

## 8. 結論

明らかな退行は見つからなかった。Router の破綻もなく、Method の過剰適用は 1 件検出して仕様側で修正した。既存挙動 (10 項目、確認質問、3 回固定、Main / Reviewer / Critic、Vn 固定、structured disagreement、安定化、採否記録、出力 4 部構成) はすべて維持されている。

一方で、次は本評価では確認できていない。

- 本番環境 (ChatGPT) での動作とコスト
- False Critique 率と Overcorrection 率の定量値
- 手順の複雑化による実行漏れの実際の発生率
- 盲検・独立評価による比較
