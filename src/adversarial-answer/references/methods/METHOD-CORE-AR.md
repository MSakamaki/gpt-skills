# METHOD: CORE-AR

## Role

CORE_PROTOCOL

常時使用する。Route の選択対象ではなく、すべての Review Round が従う枠組みそのもの。

## Purpose

回答案に対する検証を、主回答・レビュー・批判の 3 役へ分離し、根拠を伴う不同意を経てからのみ回答を変更する。合意それ自体を成功条件にしない。

## Covers

- F07 CONSENSUS — 初期回答・多数派・他 Agent への同調
- F16 OVERCORRECTION — 検証によって正しい内容を悪化させる

他の Failure Mode は専門 Method が担当する。CORE-AR は「検証の進め方」を規定するだけで、何を攻撃するかは規定しない。

## Applicable When

常に。

## Do Not Use When

なし。

## Inputs

- 確定した回答仕様 (10 項目 + 合意済みの仮定・優先順位)
- 固定した回答案 `V(i-1)`
- その Round に割り当てられた Method とその Method Card
- 回答案が依拠する根拠・出典

## Procedure

各 Round `i` で次を実行する。

1. **固定** — `V(i-1)` を固定する。内側のやり取りの間、回答案を編集しない。
2. **Review** — Reviewer `Ri` が、その Round の Method に従って固定された回答案を検査し、指摘リストを作る。各指摘に、根拠 (回答案中の該当箇所・出典・仕様項目) を必ず添える。
3. **Critique** — Critic `Ci` が、回答案と Reviewer の指摘の両方を独立に検査する。各指摘へ次のいずれかの判定を返す。
   - `AGREE` — 指摘を受け入れる。
   - `DISAGREE EVIDENCE: <根拠>` — 指摘と矛盾する具体的な出典または回答案中の記述を示す。
   - `DISAGREE CONCERN: <異議>` — 直接矛盾する根拠は示せないが、認識上・方法上の具体的な異議がある。
   Critic は指摘の妥当性に加えて、レビュー全体の網羅性と、**その Round の Method が今回の依頼に適用可能か**も検査する。
4. **Stabilization** — 不同意を Reviewer へ返す。Reviewer の応答規則は判定の種類で決まる。
   - `AGREE` → 指摘をそのまま維持する。
   - `DISAGREE EVIDENCE` → 示された根拠に従って指摘を修正または削除する。
   - `DISAGREE CONCERN` → 指摘を裏付ける具体的な根拠を示せる場合だけ維持し、示せない場合は範囲を狭めるか削除する。
   レビュー文だけをやり取りし、最大 5 回の内側反復で内容を安定させる。
5. **判定** — 安定した各指摘について `採用` / `不採用` と理由を記録する。
6. **修正** — 主回答者が採用した指摘だけを反映して `Vi` を作り、変更記録を残す。
7. **Invariant Gate** — `SKILL.md` の G1〜G7 を確認する。専門 Method はこの Gate を置き換えない。

### Research-backed

手順 1〜4 と 3 判定の区分、内側反復の上限 5 は原論文の AR プロトコルに対応する。原論文は、回答案 (artifact) を固定したまま Reviewer と Critic がレビュー文だけをやり取りする内側ループと、レビューが安定してから主回答者が編集する外側ループを分離している。

### Skill-specific adaptation

- 原論文の first-pass termination (初回で不同意も欠陥もなければ終了) は採用しない。本 Skill はユーザー指定の 3 Round 固定を優先する。
- Critic に「その Round の Method の適用可否」を検査させる点は本 Skill の追加。Router の誤判定を Review 内で再検出するため。
- 対象をコードから一般の回答へ広げている。根拠は「コード中の該当箇所」ではなく「出典・仕様項目・回答案中の記述」へ読み替える。

## Output

- Round ごとの指摘リスト (根拠付き)
- 各指摘への Critic 判定と安定化後の結論
- 採否と理由
- `Vi` の変更記録
- 残存リスク

## False Positive Guard

- 根拠を示せない指摘を採用しない。
- 網羅的に見せる目的で推測的な指摘を積み増さない。
- 指摘の件数を品質の指標にしない。
- Critic が Reviewer に合わせて `AGREE` へ流れていないか、Round ごとに確認する。原論文は、2 つの LLM Agent に合意を求めると互いに同調する傾向があり、`DISAGREE` の区分を明示的に設けない限り false consensus が起きることを報告している。

## Stop Condition

内側のやり取りでレビュー内容が変化しなくなる、または内側反復が 5 回に達する。

## Evidence

- `PAPER-AR` — Adversarial Review: Structured Disagreement for Grounded Agentic Code Review (arXiv:2608.18167v1)
- 参照箇所: PDF p.1 Abstract (プロトコル構成と false-consensus failure mode)、PDF p.4 §3.5 (内側ループ・外側ループ・内側反復上限 5・first-pass termination)、PDF pp.5-6 (AGREE / DISAGREE EVIDENCE / DISAGREE CONCERN の 3 判定と Reviewer の応答規則)
- Local Path: references/papers/core/adversarial-review-2608.18167.pdf

## Evidence Strength

LIMITED。

原論文が測定しているのは LiveCodeBench / SWE-PRBench / SWE-bench Verified におけるコーディングとコードレビューの成績である。一般的な回答精度の向上を示した研究ではない。本 Skill が採用しているのは「役割分離と根拠付き不同意という構造」であり、その構造が一般の回答でも精度を上げるという主張は本 Skill 側の仮定である。

## Domain Transfer

HIGH。

原論文の対象はコードレビューで、根拠はコード断片という検証しやすい形を取る。一般の回答では根拠が出典や仕様項目になり、検証の確実性が下がる。したがって `DISAGREE EVIDENCE` の「具体的な根拠」の水準を Round ごとに明示する必要がある。

## Fallback

なし。CORE-AR 自体が最終的な Fallback である。独立した subagent を利用できない場合も停止せず、単一モデルの役割分離として続行する。その場合は独立した複数 Agent による検証とは記録しない。
