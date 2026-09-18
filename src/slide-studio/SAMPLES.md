# 進行例

ターンの並びを実物の形で示す。**実行時には読まない。** 利用者と保守者向けの読み物であり、動作の正本は [SKILL.md](SKILL.md)、工程の一覧と遷移は [Context Registry](references/REGISTRY.md)、各工程の手順は `references/contexts/` にある。例と正本が食い違ったら正本が正しい。

例の中の `> ` で始まる行が利用者の入力、それ以外がスキルの応答である。応答は紙面の都合で短くしてあり、実際の Artifact はもっと項目が多い。

## 目次

- 1. 通しの進行 (起動から最初の Slide まで)
- 2. FAIL と差し戻し
- 3. BLOCKED (テンプレートが無い)
- 4. 状況の確認
- 5. 人間承認
- 6. 作業言語と成果物の声
- 7. Slide の内容モデルで道が分かれる
- 8. Build から Validation、そして完成状態

---

## 1. 通しの進行 (起動から最初の Slide まで)

### ターン 1 — 起動

> slide-studio を使って。役員向け 10 分の社内報告を作りたい。Q2 の売上実績を報告して、Q3 も新規顧客の獲得施策を続ける承認をもらいたい。テンプレートと売上データを添付する。

依頼を構造化しました。目的・対象者・ユースケース・制約・利用素材・成功期待を `presentation_brief` にまとめています。

```yaml
context: brief-normalizer
status: COMPLETE
inputs_used:
  - user_request
  - source_materials (company-template.potx, q2-sales.xlsx)
output_artifact: presentation_brief v1
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
  language: ja
  script: なし
  tone: 指定なし
  reading_level: 非専門の意思決定者
  stated_by_user: false
constraints:
  time_minutes: 10
materials:
  - {id: M1, type: pptx_template, name: company-template.potx, availability: provided}
  - {id: M2, type: data, name: q2-sales.xlsx, availability: provided}
open_questions:
  - 聴衆の人数と決裁者
```

**次にすること**

- `次へ` — brief-normalizer-reviewer が、この整理が依頼を取りこぼしていないか検証する ← 推奨
- 聴衆の人数や決裁者を教える — `open_questions` が埋まり、後の工程の精度が上がる
- `状況` — 進捗と、いま実行できる工程の一覧

### ターン 2 — Reviewer が PASS

> 次へ

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

`presentation_brief` v1 が承認済みになりました。MINOR の所見は下流への注意として残します (Reviewer は直しません)。

**次にすること**

- `次へ` — audience-analyzer が、役員の既有知識・決定権・閲覧環境を分析する ← 推奨
- `brief-normalizer` — MINOR の所見を反映して v2 を作る (任意)

### ターン 3〜14 — Foundation を進める

`audience-analyzer` → `presentation-mode-designer` → `delivery-artifact-planner` → `success-criteria-designer` → `validation-plan-designer` → `accessibility-policy-designer` を、それぞれ Reviewer を挟んで 1 つずつ進める。各ターンの形は同じなので省略する。

### ターン 15 — Deck の構成

> 次へ

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

- `次へ` — deck-outline-designer-reviewer が、問いから結論まで論理がつながるかを検証する ← 推奨
- `deck-outline-designer` — 構成を作り直す
- `presentation-mode-designer` — 進行形式そのものを見直す

---

## 2. FAIL と差し戻し

> 次へ

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

- `戻す` — slide-assertion-designer S03 が、所見を反映した v2 を作る ← 推奨
- `slide-evidence-selector S03` — 先に証拠を確かめてから主張を決め直す
- `slide-sequence-designer` — この Slide の役割自体を見直す

### 差し戻しの後

> 戻す

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

- `次へ` — slide-assertion-designer-reviewer が v2 を検証する ← 推奨
- `状況` — ほかに進められる Slide の一覧

---

## 3. BLOCKED (テンプレートが無い)

> delivery-artifact-planner

PPTX テンプレートがまだ無いため、配布形態を決められません。テンプレートの中身 (スライドサイズ、レイアウト名、テーマの色とフォント) が分からないと、後の組み上げで置き場所を決められないからです。推測で作ることはしません。

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

- テンプレート (`.pptx` / `.potx`) をこの会話へ添付する ← 推奨。添付したらもう一度 `delivery-artifact-planner`
- `deck-outline-designer` — テンプレート無しでも進む Deck 構成を先にやる
- `状況` — テンプレート無しで進められる工程の一覧

テンプレートが本当に用意できない場合は、そう伝えてください。出力形式を変えるかどうかの判断材料を整理します (形式の変更は仕様上の決定なので、こちらでは決めません)。

---

## 4. 状況の確認

> 状況

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

S01 は証拠まで決まっているので、次は見せ方を決める段階です。S02 はまだ手つかず、S03 は差し戻しから主張が固まったところです。

**次にすること**

- `次へ` — visual-medium-router S01: Slide 1 の証拠を図表 / 表 / 図解 / 文字のどれで見せるか決める ← 推奨
- `slide-evidence-selector S03` — Slide 3 の証拠を選ぶ
- `slide-content-model-router S02` — Slide 2 の内容モデルを決める

Slide を 1 枚ずつ仕上げても、全 Slide の同じ工程をまとめて進めても構いません。前提となる Artifact が揃っていれば、どの順でも実行できます。

---

## 5. 人間承認

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

- `次へ` — audience-analyzer が聴衆を分析する ← 推奨
- `brief-normalizer-reviewer` — やはり検証を通す

`accessibility-validator` 以降の検証工程は、この方法では飛ばせません。アクセシビリティ・品質・実機の確認は人間承認で置き換えないことにしてあります。

---

## 6. 作業言語と成果物の声

> slide-studio を使って。幼稚園の保護者会で使う 5 分の説明資料。対象者は幼稚園児にも分かるように、トーンは明るく楽しく、ひらがなで。

依頼を構造化しました。トーン・表記の指定は**成果物の声**として記録しています。スライドに出る文字と話す言葉がひらがなになり、作業の記録 (この応答や Artifact) は通常の日本語のままです。

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
  stated_by_user: true
  source_quote: 対象者は幼稚園児にも分かるように、トーンは明るく楽しく、ひらがなで
```

この分離があるので、後の工程はこうなります。

| Artifact | 書き方 |
|---|---|
| `audience_profile` の分析、`review_result` の所見、この「次にすること」 | 通常の日本語 (作業言語) |
| `slide_copy_spec.headline` = 「たのしく あそぶと からだが つよくなるよ」 | ひらがな (成果物の声) |
| `speaker_track.spoken_message` = 「きょうは からだの はなしを します」 | ひらがな (成果物の声) |
| `speaker_track.estimated_time` = 45、`not_to_repeat_on_slide` = [headline] | 通常の記録 (作業言語) |

**次にすること**

- `次へ` — brief-normalizer-reviewer が、依頼の取りこぼしと、成果物の声の記録を検証する ← 推奨
- `状況` — 進捗と、いま実行できる工程の一覧

成果物だけ別の言語にしたい場合 (日本語で作業して英語のスライドを作る) も同じ扱いです。`deliverable_voice.language` を `en` にすれば、画面文章と話す内容だけが英語になります。

---

## 7. Slide の内容モデルで道が分かれる

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

- `次へ` — slide-content-model-router-reviewer が分類を検証する ← 推奨
- `slide-content-model-router S05` — 分類をやり直す

分類が `activity-instruction` のまま承認されると、次は `activity-slide-designer` へ進みます。主張と証拠の工程 (`slide-assertion-designer` / `slide-evidence-selector`) は通りません。すべての Slide に「主張 + 証拠」を強制しない設計です。区切りや目次の Slide なら `structural-slide-designer` へ進みます。

---

## 8. Build から Validation、そして完成状態

### Slide の組み上げ

> 次へ

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

- `次へ` — slide-builder-reviewer が、文字列と配置が承認済みの設計どおりか検証する ← 推奨
- 作業ファイルをダウンロードして、実際の見た目を確認する — プレビューを出せない環境なので、目視は人手で
- `IMG-S03-1` の画像を作って添付する — 受け渡し条件は `image_asset@S03` にあります

### 実機確認で止まる

> 次へ

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

- 次を実測して伝える ← 推奨
  - 会議室の一番後ろの席から S03 と S07 の注釈が読めたか
  - 通しリハーサルの実測時間 (持ち時間は 10 分)
  - 段階提示が話す速さと合ったか
- `状況` — ほかに残っている作業の一覧

実測を伝えてもらえれば、この工程を再実行します。実測なしで `DELIVERY_READY` にはしません。

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

- 発表を実施する — `validation_plan` に沿って測定する項目を用意してあります
- 発表後に測定データを渡して `outcome-evaluator` — 成功条件が実際に満たされたかを評価する
- `状況` — 残っている配布形態や未実施の作業の一覧
