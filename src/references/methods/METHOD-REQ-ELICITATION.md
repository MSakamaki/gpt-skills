# METHOD: REQUIREMENTS_ELICITATION

## Role

EXECUTABLE_METHOD

## Purpose

利用者・関係者の視点を明示的に立て、回答案が取りこぼしている候補要件と、言語化されていない需要 (latent need) を洗い出す。

## Covers

- F06 PERSPECTIVE — ステークホルダー・視点の不足
- F11 AMBIGUITY — 定義・概念の曖昧さ
- F12 INFORMATION — 判断に必要な情報の不足
- F14 CONSTRAINT — 制約・実行条件の見落とし

## Applicable When

次のいずれかを満たす。

- 回答案が要件・仕様・課題の一覧を含む
- 対象者 (回答仕様の項目 4) が複数種類いる、または回答案が単一の利用者像しか想定していない
- 「抜け漏れ」「見落とし」の検出が依頼の主目的である

## Do Not Use When

- 対象者が 1 種類に確定しており、その利用文脈も回答仕様で固定されている
- 問題の中心が「既にある要件の定義の曖昧さ」だけである (この場合は SOCRATIC)
- 事実確認・原因分析であり、要件を立てる段階にない

## Inputs

- 固定済み `V(i-1)`
- 回答仕様の対象者 (項目 4)、入力情報 (項目 5)、制約条件 (項目 6)
- 回答案が挙げている要件・課題の一覧

## Procedure

1. 対象領域から、互いに異なる利用者・関係者を 3〜6 種類立てる。回答案が想定している利用者に加えて、次を必ず検討する。
   - 運用・保守を担当する側
   - 例外・失敗時に対応する側
   - 決裁・承認する側
   - 想定外の使い方をする利用者
   - 影響を受けるが当事者ではない関係者
2. 各利用者について、対象物を使う場面を時系列で追い、各段階を次の 3 点で記述する。
   - **Action** — その利用者が何をするか
   - **Observation** — その結果として何が起きるか
   - **Challenge** — そこで何に詰まるか
3. 詰まりの箇所に対して、なぜそれが問題になるかを掘り下げる質問を当て、表面的な要望の背後にある需要を取り出す。
4. 取り出した需要を候補要件として書き出す。すべて `CANDIDATE_REQUIREMENT` として扱う。
5. 各候補要件を、回答案の既存要件と突き合わせる。
   - `COVERED` — 既存要件が実質的に満たしている
   - `PARTIAL` — 一部しか満たしていない。不足している条件を示す
   - `MISSING` — 対応する要件がない
6. `MISSING` と `PARTIAL` のうち、回答仕様の成功条件・制約に関係するものを Review Issue とする。
7. 判断に必要な情報が不足していて候補要件の要否を決められない場合は、その不足自体を指摘として記録する。

### Research-backed

多様な利用者エージェントを生成し、製品体験のシミュレーションを Action / Observation / Challenge として記録し、インタビューによって latent need を抽出したうえで、基準に照らして latent need を特定するという Elicitron の構成。

### Skill-specific adaptation

- 手順 1 の利用者 5 分類、手順 5 の `COVERED` / `PARTIAL` / `MISSING` 判定、手順 6 の採用規則は本 Skill の運用規則。
- 原典は製品設計の要求抽出を対象とする。本 Skill は回答一般の要件レビューへ適用するため、これは転用である。
- 原典は複数の LLM エージェントを生成して並列にシミュレートする。単一モデルで役割を切り替える場合、独立した複数エージェントによる多様性の再現とは扱わない。

## Output

- Persona — 立てた利用者・関係者
- Scenario — Action / Observation / Challenge
- Candidate requirement — 取り出した候補要件 (すべて `CANDIDATE_REQUIREMENT`)
- Coverage — `COVERED` / `PARTIAL` / `MISSING`
- Gap — 回答案に不足している要件・条件
- Information gap — 要否を判断できない場合の不足情報

## False Positive Guard

- 生成した利用者は仮想であり、実在の利用者の要求ではない。`CONFIRMED_REQUIREMENT` として確定しない。最終回答では候補であることを明示する。
- 回答仕様が明示的に対象外とした利用者・範囲の要件を指摘しない。
- 候補要件の数を成果にしない。既存要件と実質的に重複するものは統合する。
- 「あると良い」水準の要望を、成功条件に関わる不足として扱わない。

## Stop Condition

新しい利用者を立てても、既出の候補要件と同じ不足しか出なくなった時点で終了する。

## Evidence

- `PAPER-ELICITRON` — Ataei, Cheong, Grandi, Wang, Morris, Tessier: Elicitron: An LLM Agent-Based Simulation Framework for Design Requirements Elicitation (arXiv:2404.16045 / Autodesk Research 公開版)
- 参照箇所: p.2 Fig.1 caption (エージェント生成と diversity sampling、Action / Observation / Challenge、agent interview、基準に基づく latent need の特定、レポート生成)
- Local Path: references/papers/requirements/elicitron.pdf

## Evidence Strength

MODERATE。

複数製品で latent need を抽出できることを示した枠組みだが、本 Skill の適用対象 (回答の要件レビュー) での有効性を測定したものではない。

## Domain Transfer

MEDIUM。

製品設計の要求抽出から、回答一般の要件レビューへの転用である。対象が物理的な製品体験でない場合、Action / Observation / Challenge の記述粒度が粗くなりやすい点に注意する。

## Fallback

SOCRATIC。

視点の追加ではなく定義の明確化で足りる場合は SOCRATIC へ切り替える。切り替えたことを記録する。
