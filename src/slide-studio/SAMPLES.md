# 進行例

ターンの並びを実物の形で示す。**実行時には読まない。** 利用者と保守者向けの読み物であり、動作の正本は [SKILL.md](SKILL.md)、工程の一覧と遷移は [Context Registry](references/REGISTRY.md)、各工程の手順は `references/contexts/` にある。例と正本が食い違ったら正本が正しい。

例の中の `> ` で始まる行が利用者の入力、それ以外がスキルの応答である。確認ターンでは YAML が出ず、完了ターンでだけ出ることに注意してほしい。応答は紙面の都合で短くしてあり、実際の Artifact はもっと項目が多い。選択肢の説明は、初めて出る工程を厚く、2 回目以降を薄くしてある。これも規定どおりである。

## 目次

- 1. 通しの進行 (起動から最初の Slide まで)
- 2. 確認ターンと完了ターン
- 3. FAIL と差し戻し
- 4. BLOCKED (テンプレートが無い)
- 5. 状況の確認
- 6. 記号の答え方
- 7. 人間承認
- 8. 作業言語と成果物の声
- 9. Slide の内容モデルで道が分かれる
- 10. Build から Validation、そして完成状態

---

## 1. 通しの進行 (起動から最初の Slide まで)

### ターン 1 — 起動、そして最初の確認

> slide-studio を使って。役員向け 10 分の社内報告を作りたい。Q2 の売上実績を報告して、Q3 も新規顧客の獲得施策を続ける承認をもらいたい。テンプレートと売上データを添付する。

依頼を読みました。構造化する前に 1 つだけ確認させてください。

役員に何を決めてもらう場かを確認させてください。依頼には「承認をもらいたい」とありますが、承認の対象が予算の継続なのか金額そのものなのかで、構成の骨格と、どの証拠を最初に出すかが変わります。

A. Q3 も同じ予算で施策を続けることへの承認（推奨）
   求める決定を最初の Slide に置き、Q2 の実績をその根拠として並べます。
   判断に要る材料は、継続した場合の見込みと、やめた場合の影響です。
   依頼文の「続ける承認」という書き方から、これが素直な読みです。

B. Q3 の予算額そのものの決定
   金額の選択肢を比較する構成になり、案ごとの効果と費用が要ります。
   Q2 の実績は前提の確認に下がります。
   添付の売上データだけでは足りず、費用の資料が要ります。

C. 決定は求めず、状況の共有だけ
   結論を先に置く構成ではなくなり、成功条件も「理解」に寄ります。
   10 分の使い方が変わります。

9. それぞれを詳しく説明して、もう一度選び直す

A などの記号でも、自由入力でも答えられます。

### ターン 2 — 回答を受けて工程が完了する

> A

`A` = Q3 継続の承認として受け取りました。

依頼を構造化しました。目的・対象者・ユースケース・制約・利用素材・成功期待を `presentation_brief` にまとめています。

```yaml
context: brief-normalizer
status: COMPLETE
inputs_used:
  - user_request
  - source_materials (company-template.potx, q2-sales.xlsx)
output_artifact: presentation_brief v1
clarifications:
  - field: purpose
    asked: 役員に何を決めてもらう場か
    state: answered
    value: Q3 継続の承認
issues:
  - 聴衆の人数と、承認に必要な決裁者が誰かが依頼に無い (open_questions に記録)
recommended_next: brief-normalizer-reviewer
```

```yaml
artifact: presentation_brief
artifact_id: presentation_brief
version: 1
produced_by: brief-normalizer
purpose: |
  Q3 も新規顧客獲得施策を続けることへの承認を、役員から得る
audience_as_stated: 役員
use_case: decision_meeting
deliverable_voice:
  language: <未回答>
  script: <未回答>
  tone: <未回答>
  reading_level: <未回答>
constraints:
  time_minutes: 10
materials:
  - {id: M1, type: pptx_template, name: company-template.potx, availability: provided}
  - {id: M2, type: data, name: q2-sales.xlsx, availability: provided}
open_questions:                    # <未回答> の項目と、それが何に効くか
  - {field: deliverable_voice, why_it_matters: 画面文章と話者の語調。slide-copywriter が要る}
  - {field: audience.size, why_it_matters: 進行と参加機会の設計}
```

**次にすること**

A. `次へ` — brief-normalizer-reviewer（推奨）
   いま作った整理を、別の Reviewer が検証します。依頼の要求を取りこぼして
   いないか、依頼に無い事実を混ぜていないか、6 項目が揃っているかを見ます。
   PASS すると `presentation_brief` v1 が承認済みになり、聴衆分析へ進めます。
   FAIL なら差し戻し先と所見が示されます。
   この工程は成果物を作らないので、いつ実行しても失うものはありません。

B. 聴衆の人数と決裁者を教える
   `open_questions` に残した 2 つが埋まります。誰が何を決める場かが
   はっきりすると、後の成功条件と構成の精度が上がります。
   いま答えなくても進めますが、`success-criteria-designer` までには
   あったほうがよい情報です。
   `presentation_brief` は v2 になり、まだ下流が無いので影響はありません。

C. `状況` — 進捗と実行できる工程の一覧
   何も実行せず、いまの状態だけを表示します。

9. それぞれを詳しく説明して、もう一度選び直す

A などの記号でも、工程名でも、自由入力でも答えられます。

### ターン 3 — Reviewer が PASS

> A

`A` = `次へ` として、brief-normalizer-reviewer を実行します。

`presentation_brief` v1 を検証しました。依頼の取りこぼしと、依頼に無い事実の混入はありません。

```yaml
context: brief-normalizer-reviewer
status: PASS
output_artifact: review_result
target: presentation_brief v1
findings:
  - severity: MINOR
    where: purpose
    issue: 目的が「承認を得る」で、役員が何を判断するかまでは書かれていない
    evidence: ガイド §1 / open_questions に関連する記述あり
recommended_next: audience-analyzer
```

`presentation_brief` v1 が承認済みになりました。MINOR の所見は下流への注意として残します。Reviewer は直しません。

**次にすること**

A. `次へ` — audience-analyzer（推奨）
   役員の既有知識、決定権、閲覧環境、認知上の条件を分析します。
   ここで決まる情報密度の方向が、後の Slide 1 枚あたりの情報量と、
   証拠にどこまで条件や誤差を残すかを左右します。
   `audience_profile` が生まれ、利用形態の設計へ進めます。
   依頼に無い属性は創作せず、分からないものは不明と記録します。
   作り直しは版が増えるだけです。

B. `brief-normalizer` — MINOR の所見を反映して v2 を作る
   「役員が何を判断するか」を目的へ書き足します。承認済みの v1 は残り、
   v2 を改めて Reviewer に通すことになります。後の工程でも書き足せるので、
   いま直さなくても構いません。

9. それぞれを詳しく説明して、もう一度選び直す

### ターン 4〜16 — Foundation を進める

`audience-analyzer` → `presentation-mode-designer` → `delivery-artifact-planner` → `success-criteria-designer` → `validation-plan-designer` → `accessibility-policy-designer` を、それぞれ Reviewer を挟んで 1 つずつ進める。各ターンの形は同じなので省略する。

### ターン 17 — Deck の構成

> A

`A` = `次へ` として、deck-outline-designer を実行します。

Deck 全体の論理構造を組みました。意思決定向けなので「結論 → 根拠 → 選択肢 → 推奨 → 求める決定」を骨格にしています。

```yaml
context: deck-outline-designer
status: COMPLETE
output_artifact: deck_outline v1
recommended_next: deck-outline-designer-reviewer
```

```yaml
artifact: deck_outline
version: 1
storyline: |
  Q2 の売上は伸びた。伸びを作ったのは新規顧客である。同じ施策は Q3 でも効く見込みがある。
  だから予算を継続してほしい。
template_basis: decision_meeting
sections:
  - {id: SEC-1, role: so_what, purpose: 求める決定を最初に示す, supports_success_criteria: [SC-1]}
  - {id: SEC-2, role: evidence, purpose: Q2 の実績を示す, supports_success_criteria: [SC-1]}
  - {id: SEC-3, role: finding, purpose: 伸びの内訳が新規顧客であることを示す}
  - {id: SEC-4, role: so_what, purpose: Q3 の継続判断に必要な材料を示す}
```

**次にすること**

A. `次へ` — deck-outline-designer-reviewer（推奨）
   問いから結論まで論理がつながるか、聴衆と利用形態に合うか、成功条件が
   すべて章に対応しているかを検証します。
   PASS すると Slide 単位への分割へ進めます。
   構成は後の工程すべての土台なので、ここで通しておくと手戻りが減ります。

B. `deck-outline-designer` — 構成を作り直す
   章の並びや粒度を変えたいときに選びます。v2 になります。

C. `presentation-mode-designer` — 進行形式そのものを見直す
   「意思決定向け」という前提が違っていたときに選びます。戻す範囲が広く、
   成功条件とアクセシビリティ方針も要再確認になります。

9. それぞれを詳しく説明して、もう一度選び直す

---

## 2. 確認ターンと完了ターン

工程の実行は 1 ターンで終わるとは限らない。推論で埋めるしかない点が残っていれば、確認ターンを挟む。確認ターンでは YAML を出さない。まだ工程が終わっておらず、記録すべき結果が無いためである。

### 確認が続く

> 次へ

Slide 3 の主張を決める前に確認させてください。

`slide_sequence_plan` の S03 には「Q2 の実績を示す」とありますが、実績を示した結果として聴衆に何を残したいかまでは書かれていません。ここが見出しになり、どの証拠を選ぶかも決まります。

A. 売上が計画を上回った
   計画対比のグラフが主役になります。差がどれだけかを読ませます。

B. 伸びを作ったのは新規顧客である
   顧客区分別の寄与を見せる構成になります。Q3 の継続判断に直結します。

C. 特定の地域が牽引した
   地域別の内訳が主役になります。施策の継続とはつながりが弱くなります。

9. それぞれを詳しく説明して、もう一度選び直す

A などの記号でも、自由入力でも答えられます。

### もう 1 つ確認する

> B

`B` = 新規顧客が伸びを作った、として受け取りました。もう 1 点あります。

この主張をどの強さで書くかを確認させてください。断定するか、可能性として示すかで、要る証拠の水準が変わります。ここは発表者としてどこまで責任を持つかの判断なので、こちらからは推奨しません。

A. 断定する (「新規顧客が伸びを作った」)
   寄与度の内訳が要ります。添付データで裏づけられます。

B. 傾向として示す (「新規顧客の寄与が大きい」)
   同じデータで足りますが、Q3 の判断材料としてはやや弱くなります。

9. それぞれを詳しく説明して、もう一度選び直す

### 確認が終わり、工程が完了する

> A

`A` = 断定する、として受け取りました。残る不明点はありません。

Slide 3 の主張を決めました。

```yaml
context: slide-assertion-designer
slide_id: S03
status: COMPLETE
output_artifact: slide_assertion_spec@S03 v1
clarifications:
  - field: assertion
    asked: S03 で聴衆に残したいこと
    state: answered
    value: 新規顧客が伸びを作った
  - field: assertion_strength
    asked: 主張の強さ
    state: answered
    value: 断定する
recommended_next: slide-assertion-designer-reviewer
```

```yaml
artifact: slide_assertion_spec
artifact_id: slide_assertion_spec@S03
version: 1
slide_id: S03
assertion: |
  Q2 の売上の伸びは、新規顧客の獲得が作った
takeaway: 役員が「新規獲得の施策には効果がある」と判断できる
evidence_needed:
  - {type: data, what: 顧客区分別の寄与}
```

**次にすること**

A. `次へ` — slide-assertion-designer-reviewer（推奨）
   主張が 1 つか、トピック名になっていないか、聴衆に残したい意味が明確かを
   検証します。確認で決めた内容も、上流と矛盾しないかを見られます。
   PASS すると証拠の選定へ進みます。

B. `slide-assertion-designer S03` — 決め直す
   確認の答えを変えたいときに選びます。v2 になります。

9. それぞれを詳しく説明して、もう一度選び直す

### 未回答をそのまま渡す

依頼にトーンの指定が無いとき、「指定なし」とは書きません。未回答のまま残し、その値が必要になった工程が聞きます。

```yaml
deliverable_voice:
  language: <未回答>
  script: <未回答>
  tone: <未回答>
  reading_level: <未回答>
```

依頼の整理の時点では文字を書かないので、ここで聞く必要はありません。後で画面文章を書く工程に入ったとき、はじめてこう聞かれます。

> 画面に出す文章の語調を確認させてください。役員向けという以外に指定が無いので、
> まだ決まっていません。
>
> A. 事実を淡々と述べる
>    …
>
> B. 決定を促す語調にする
>    …
>
> 9. それぞれを詳しく説明して、もう一度選び直す

「指定はありません」と答えれば、そこで初めて「なし」が確定した答えとして記録されます。未回答のままとは区別されます。

### まとめて委任する

> 細かいところは任せる。次へ

残る論点をこちらで埋めて進めます。埋めた内容は記録に残します。ただし、聴衆に何を判断してほしいかは発表者の決定なので、そこだけは改めて確認させてください。

（この論点だけの選択肢を提示する）

---

## 3. FAIL と差し戻し

> A

`A` = `次へ` として、slide-assertion-designer-reviewer を実行します。

S03 の主張が「売上推移」というトピック名のままで、聴衆に何が残るかが読めません。数値の裏づけも上流の Artifact に無いものが入っています。

```yaml
context: slide-assertion-designer-reviewer
status: FAIL
target: slide_assertion_spec@S03 v1
findings:
  - severity: CRITICAL
    where: assertion
    issue: 「Q2 の売上推移」はトピック名であり、結論が読めない
    evidence: ガイド §3 見出し行 / slide_sequence_item@S03.purpose
    rollback_target: slide-assertion-designer
  - severity: CRITICAL
    where: assertion
    issue: 「前年比 18% 増」が slide_sequence_item にも source_materials の確認済み範囲にも無い
    evidence: I-03
    rollback_target: slide-assertion-designer
recommended_next: slide-assertion-designer
rollback_target: slide-assertion-designer
```

**次にすること**

A. `戻す` — slide-assertion-designer S03（推奨）
   所見を読んだうえで、同じ工程が v2 を作ります。トピック名を結論文に直し、
   裏づけの無い数値は「必要な証拠の種類」として証拠の選定へ回します。
   v2 を改めて Reviewer に通すことになります。
   所見が具体的なので、まずこれで解けるかを見るのが早道です。
   v1 は残るので、後から比べ直せます。

B. `slide-evidence-selector S03` — 先に証拠を確かめてから主張を決め直す
   元資料に何があるかを見てから主張を書きたいときに選びます。
   ただしこの工程は承認済みの主張を前提にするので、いまは実行できず
   BLOCKED になります。先に A が要ります。

C. `slide-sequence-designer` — この Slide の役割自体を見直す
   主張が立たないのは Slide の切り方が原因かもしれないときに選びます。
   `slide_sequence_plan` が v2 になり、S03 以降の Slide 単位の成果物は
   すべて要再確認になります。戻す範囲が広いので、A で解けないと分かって
   から選ぶほうが早く済みます。

9. それぞれを詳しく説明して、もう一度選び直す

### 差し戻しの後

> A

`A` = `戻す` として、slide-assertion-designer を S03 で実行します。

所見を反映して S03 の主張を作り直しました。数値は `slide_evidence_pack` で確定させるため、いまは定性的に書いています。

```yaml
context: slide-assertion-designer
slide_id: S03
status: COMPLETE
output_artifact: slide_assertion_spec@S03 v2
issues:
  - v1 の所見 2 件に対応。数値は evidence_needed へ回した
recommended_next: slide-assertion-designer-reviewer
```

**次にすること**

A. `次へ` — slide-assertion-designer-reviewer（推奨）
   v2 を検証します。前回の所見 2 件が解けているかと、新しい問題が
   入っていないかを見ます。

B. `状況` — ほかに進められる Slide の一覧

9. それぞれを詳しく説明して、もう一度選び直す

---

## 4. BLOCKED (テンプレートが無い)

> delivery-artifact-planner

PPTX テンプレートがまだ無いため、配布形態を決められません。テンプレートの中身が分からないと、後の組み上げで置き場所を決められないからです。推測で作ることはしません。

```yaml
context: delivery-artifact-planner
status: BLOCKED
inputs_used:
  - presentation_brief v1
  - presentation_mode_spec v1
issues:
  - 外部入力 pptx_template が無い。presentation_brief.materials にも記載が無い
  - この工程が終わるまで、Rendering / Build / Delivery の全工程は実行できない
recommended_next: null
```

**次にすること**

A. テンプレート (`.pptx` / `.potx`) をこの会話へ添付する（推奨）
   スライドサイズ、レイアウト名とプレースホルダ、テーマの色とフォント、
   除くべきサンプル Slide を読み取り、`delivery_artifact_plan` に記録します。
   これが揃うと配布形態を決められ、後の組み上げが解けます。
   ここで止めているのは、テンプレートを推測して作ると、実際のテンプレートと
   食い違ったまま全 Slide を組んでしまうからです。
   添付したらもう一度この工程を実行します。

B. `deck-outline-designer` — テンプレート無しでも進む構成設計を先にやる
   内容の設計はテンプレートに依存しません。並行して進められます。
   ただし Build 系は結局テンプレートを待つので、先送りにしかなりません。

C. `状況` — テンプレート無しで進められる工程の一覧

9. それぞれを詳しく説明して、もう一度選び直す

テンプレートを用意できない場合は、そう伝えてください。出力形式を変えるかどうかの判断材料を整理します。形式の変更は仕様上の決定なので、こちらでは決めません。

---

## 5. 状況の確認

> C

`C` = `状況` として、workflow-navigator を実行します。

Foundation は終わり、Deck の構成まで承認済みです。いまは Slide 単位の設計に入ったところです。

```yaml
context: workflow-navigator
status: COMPLETE
output_artifact: navigation_result
recommended_next: visual-medium-router (S01)
```

```yaml
artifact: navigation_result
completion_level: IN_PROGRESS
deck_level:
  - {artifact: presentation_brief, version: 1, approval: approved(brief-normalizer-reviewer)}
  - {artifact: audience_profile, version: 1, approval: approved(audience-analyzer-reviewer)}
  - {artifact: deck_outline, version: 1, approval: approved(deck-outline-designer-reviewer)}
  - {artifact: slide_sequence_plan, version: 1, approval: approved(slide-sequence-designer-reviewer)}
slides:
  - {slide_id: S01, content_model: assertion-evidence, last_approved: slide_evidence_pack@S01 v1, default_next: visual-medium-router}
  - {slide_id: S02, content_model: null, last_approved: null, default_next: slide-content-model-router}
  - {slide_id: S03, content_model: assertion-evidence, last_approved: slide_assertion_spec@S03 v2, default_next: slide-evidence-selector}
executable_now:
  - {context: visual-medium-router, slide_id: S01}
  - {context: slide-content-model-router, slide_id: S02}
  - {context: slide-evidence-selector, slide_id: S03}
external_inputs_missing: []
```

S01 は証拠まで決まっているので次は見せ方の段階、S02 はまだ手つかず、S03 は差し戻しから主張が固まったところです。

**次にすること**

実行できる工程は 3 つあります。既定の順に並べます。

A. `次へ` — visual-medium-router S01（推奨）
   S01 の証拠を、図表・表・図解・文字のどれで見せるかを決めます。
   聴衆にしてほしい判断から逆算するので、証拠が確定している S01 から
   始めるのが順当です。
   決まると媒体ごとの設計工程が開きます。
   やり直しは版が増えるだけで、下流はまだ無いので影響しません。

B. `slide-evidence-selector S03` — Slide 3 の証拠を選ぶ
   差し戻しから主張が固まったので、次は証拠です。S01 より S03 を
   先に片付けたいときに選びます。

C. `slide-content-model-router S02` — Slide 2 の内容モデルを決める
   まだ手つかずの Slide です。主張型・活動型・構造型のどれかを決めます。

9. それぞれを詳しく説明して、もう一度選び直す

Slide を 1 枚ずつ仕上げても、全 Slide の同じ工程をまとめて進めても構いません。前提となる成果物が揃っていれば、どの順でも実行できます。

---

## 6. 記号の答え方

### `9` で深掘りする

> 9

選択肢を詳しく説明します。何も実行していません。

A. `次へ` — visual-medium-router S01（推奨）
   この工程は「聴衆にこの Slide で何を判断してほしいか」を先に言葉にし、
   それを読み取らせるのに向いた媒体を選びます。精密な量の比較なら棒や
   ドット、時系列なら折れ線、複数項目を複数観点で参照させるなら表、
   因果やプロセスなら図解、という逆算です。
   「文字だけでは寂しい」という理由では媒体を足しません。役割を書けない
   画像は計画しません。
   決まると、選んだ媒体ごとの設計工程が 1 つずつ開きます。媒体が不要なら
   画面文章の設計へ直行します。
   S01 の証拠は承認済みなので、いま実行できます。
   結果に納得できなければ作り直せます。版が増えるだけで、下流はまだ
   無いので影響しません。

B. `slide-evidence-selector S03` — Slide 3 の証拠を選ぶ
   (同様に詳しく)

C. `slide-content-model-router S02` — Slide 2 の内容モデルを決める
   (同様に詳しく)

9. さらに知りたい点があれば、具体的に聞いてください

### `0` を打ったとき

> 0

`0` はこのスキルでは使いません。他のスキルの「AI に任せる」に当たる入力ですが、ここで AI が選べるのは既定の次工程だけで、それは `A` と同じものです。推奨は `A` です。

**次にすること**

（同じ選択肢を再提示）

### 記号が紛らわしいとき

> B

`B` = `slide-evidence-selector S03` として解釈しました。この Slide で比較している「B案」のことでしたら、そう書いてください。実行します。

このように、実行前に何を選んだと解釈したかを 1 行返します。記号は短いぶん取り違えが起きやすく、案の名前や Slide 番号と紛れることがあるためです。

---

## 7. 人間承認

> presentation_brief を承認する

`presentation_brief` v1 を承認済みとして記録しました。Reviewer は実行していません。

```yaml
context: (router)
status: COMPLETE
output_artifact: presentation_brief v1
issues:
  - 人間承認 (Reviewer 未実施)。brief-normalizer-reviewer の観点は確認されていない
recommended_next: audience-analyzer
```

**次にすること**

A. `次へ` — audience-analyzer（推奨）
   聴衆を分析します。承認済みの `presentation_brief` を前提にします。

B. `brief-normalizer-reviewer` — やはり検証を通す
   人間承認を取り消す必要はありません。Reviewer を後から通せます。
   FAIL が出れば、そこから差し戻せます。

9. それぞれを詳しく説明して、もう一度選び直す

`accessibility-validator` 以降の検証工程は、この方法では飛ばせません。アクセシビリティ・品質・実機の確認は人間承認で置き換えないことにしてあります。

---

## 8. 作業言語と成果物の声

> slide-studio を使って。幼稚園の保護者会で使う 5 分の説明資料。対象者は幼稚園児にも分かるように、トーンは明るく楽しく、ひらがなで。

依頼を構造化しました。トーン・表記の指定は**成果物の声**として記録しています。スライドに出る文字と話す言葉がひらがなになり、作業の記録はこの応答を含めて通常の日本語のままです。

```yaml
context: brief-normalizer
status: COMPLETE
output_artifact: presentation_brief v1
recommended_next: brief-normalizer-reviewer
```

```yaml
deliverable_voice:
  language: ja
  script: ひらがな中心。漢字を使う場合はふりがな
  tone: 明るく楽しく
  reading_level: 幼稚園児
  source_quote: 対象者は幼稚園児にも分かるように、トーンは明るく楽しく、ひらがなで
```

この分離があるので、後の工程はこうなります。

| 成果物 | 書き方 |
|---|---|
| `slide_copy_spec.headline` = 「たのしく あそぶと からだが つよくなるよ」 | ひらがな (成果物の声) |
| `speaker_track.spoken_message` = 「きょうは からだの はなしを します」 | ひらがな (成果物の声) |
| `audience_profile` の分析、`review_result` の所見、この選択肢の説明 | 通常の日本語 (作業言語) |
| `speaker_track.estimated_time` = 45、`not_to_repeat_on_slide` = [headline] | 通常の記録 (作業言語) |

**次にすること**

A. `次へ` — brief-normalizer-reviewer（推奨）
   依頼の取りこぼしに加えて、成果物の声が正しく記録されているか、
   この整理自体がひらがなになっていないかも検証します。

B. `状況` — 進捗と実行できる工程の一覧

9. それぞれを詳しく説明して、もう一度選び直す

成果物だけ別の言語にしたい場合も同じ扱いです。`deliverable_voice.language` を `en` にすれば、画面文章と話す内容だけが英語になり、やり取りは日本語のままです。

---

## 9. Slide の内容モデルで道が分かれる

> slide-content-model-router S05

S05 を活動指示の Slide に分類しました。`purpose` が「参加者が自分の資料の見出しを書き直す」で、主張を伝えるのではなく作業をさせる Slide だからです。

```yaml
context: slide-content-model-router
slide_id: S05
status: COMPLETE
output_artifact: slide_content_model@S05 v1
recommended_next: slide-content-model-router-reviewer
```

```yaml
artifact: slide_content_model
slide_id: S05
content_model: activity-instruction
rationale: |
  purpose が「参加者が自分の資料の見出しを書き直す」で、聴衆の作業が中心。
  presentation_mode_spec の interaction_policy にも対応する機会がある
candidate_agreed: true
next_designer: activity-slide-designer
```

**次にすること**

A. `次へ` — slide-content-model-router-reviewer（推奨）
   分類が `purpose` と利用形態に合うかを検証します。
   PASS すると `activity-slide-designer` へ進み、主張と証拠の工程は
   通りません。すべての Slide に「主張 + 証拠」を強制しない設計です。
   区切りや目次の Slide なら `structural-slide-designer` へ進みます。
   分類を誤ると Slide の作り方ごと変わるので、ここは通しておきます。

B. `slide-content-model-router S05` — 分類をやり直す
   活動ではなく説明の Slide だと考え直したときに選びます。v2 になります。

9. それぞれを詳しく説明して、もう一度選び直す

---

## 10. Build から Validation、そして完成状態

### Slide の組み上げ

> A

`A` = `次へ` として、slide-builder を S03 で実行します。

Slide 3 をテンプレート上に組み上げました。Chart はネイティブの図表として作ってあります。画像は枠だけを置いたので、あとで差し込んでください。

```yaml
context: slide-builder
slide_id: S03
status: COMPLETE
output_artifact: slide_build_static@S03 v1
issues:
  - IMG-S03-1 は画像の枠のみ。実画像は別途はめ込みが必要
  - プレビュー画像を生成できない環境のため、見た目は未確認
recommended_next: slide-builder-reviewer
```

```yaml
artifact: slide_build_static
slide_id: S03
file: build/deck-working.pptx
slide_index: 3
layout_used: タイトルとコンテンツ
elements:
  - {id: headline, type: title_placeholder, reading_order: 1}
  - {id: chart-1, type: chart, from: chart_asset@S03 v1, reading_order: 2}
  - {id: IMG-S03-1, type: image_placeholder, reading_order: 3}
preview: not_rendered
verification:
  - {checked: all_copy_strings_match_spec, result: true}
  - {checked: visual_preview, result: not_available}
download: build/deck-working.pptx をこの会話から取得できます
```

**次にすること**

A. `次へ` — slide-builder-reviewer（推奨）
   文字列が画面文章の設計と一致するか、要素が配置の設計どおりか、
   一意のタイトルと代替テキストと読み上げ順が揃っているかを検証します。
   プレビューが無いので、見た目に依存する観点は未検証として残ります。
   未検証を合格の根拠にはしません。
   PASS すると、段階提示があれば `animation-builder`、無ければ次の Slide、
   全 Slide が終わっていれば `deck-builder` へ進みます。

B. 作業ファイルをダウンロードして、実際の見た目を確認する
   プレビューを出せない環境なので、目視は人手になります。
   気になる点があれば、それを伝えてから差し戻し先を選べます。

C. `IMG-S03-1` の画像を作って添付する
   受け渡し条件は `image_asset@S03` の `handoff_brief` にあります。
   このスキルは画像を作らないので、別のスキルか画像生成機能で作って
   枠と入れ替えてください。組み上げの検証とは独立です。

9. それぞれを詳しく説明して、もう一度選び直す

### 実機確認で止まる

> A

`A` = `次へ` として、presentation-preflight-reviewer を実行します。

実測の情報がないため、実機とリハーサルの確認ができません。ここは推測で合格にしない工程です。

```yaml
context: presentation-preflight-reviewer
status: BLOCKED
verdict: BLOCKED
issues:
  - environment_facts が無い
unverified:
  - {check: far_seat_readability, reason: 最遠席または想定最小画面での確認結果が無い}
  - {check: rehearsal_duration, reason: 通しリハーサルの実測時間が無い}
  - {check: animation_timing, reason: 段階提示が話と合ったかの確認が無い}
recommended_next: null
```

**次にすること**

A. 実測して伝える（推奨）
   会議室の一番後ろの席から S03 と S07 の注釈が読めたか、通しリハーサルの
   実測時間 (持ち時間は 10 分)、段階提示が話す速さと合ったか、の 3 点です。
   伝えてもらえればこの工程を再実行し、すべて確認できれば
   `DELIVERY_READY` に到達します。
   ここで止めているのは、pt 数や枚数から「読めるはず」「収まるはず」と
   推定しても、それは実測の代わりにならないからです。
   読めなかった項目があれば、文字サイズか密度か文章量のどれが原因かで
   差し戻し先が変わります。

B. `状況` — ほかに残っている作業の一覧

9. それぞれを詳しく説明して、もう一度選び直す

### 完成状態

> 最遠席から読めた。通しは 9 分 20 秒。段階提示は問題なし。

実測をもとに確認しました。すべての項目が実測で確認でき、`DELIVERY_READY` に到達しました。

```yaml
context: presentation-preflight-reviewer
verdict: PASS
environment_facts_used: [far_seat_readability, rehearsal_duration, animation_timing]
measured: {rehearsal_total_minutes: 9.33, time_limit_minutes: 10}
findings: []
recommended_next: <delivery-ready>
```

配布物は使える状態です。ただし `OUTCOME_VALIDATED` ではありません。発表後に理解や行動を測って初めてそちらになります。

**次にすること**

A. 発表を実施する（推奨）
   `validation_plan` に沿って測定する項目を用意してあります。
   直後の理解テストと、数日後の行動指標です。

B. 発表後に測定データを渡して `outcome-evaluator`
   成功条件が実際に満たされたかを評価します。効果量と信頼区間まで見ます。
   データが無いうちは BLOCKED になります。推測で効果を評価しません。
   ここまで通ると `OUTCOME_VALIDATED` になります。

C. `状況` — 残っている配布形態や未実施の作業の一覧

9. それぞれを詳しく説明して、もう一度選び直す
