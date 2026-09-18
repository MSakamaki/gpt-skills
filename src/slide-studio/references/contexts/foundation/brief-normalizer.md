# brief-normalizer

種別：specialist　段階：foundation　対象：Deck 全体

## 責務

ユーザーの依頼と元資料を、後工程が読める形の `presentation_brief` へ構造化する。依頼者の言葉を保ち、書かれていないことを推測で埋めない。

## 禁止

- 目的・対象者・制約を推測で補わない。無い項目は `open_questions` に残す
- **依頼のトーン・表記の指定に本 Artifact の書き方を合わせない** (I-15)。記録するだけで、記録自体は作業言語で書く
- 聴衆分析 (`audience-analyzer`)、成功条件の指標化 (`success-criteria-designer`)、構成案 (`deck-outline-designer`) を先取りしない
- 元資料の内容を要約して事実を作らない。素材は「何があるか」を記録する

## 入力

| Artifact | 使い方 |
|---|---|
| `user_request` | 6 項目の出所。引用を `source_quotes` に残す |
| `conversation_context?` | 依頼より前の会話で確定した事項。無ければ空 |
| `source_materials?` | 利用素材の一覧化。テンプレート (`.pptx` / `.potx`) の有無を必ず記録する |

## 出力：`presentation_brief`

```yaml
artifact: presentation_brief
artifact_id: presentation_brief
version: 1
produced_by: brief-normalizer
based_on: [user_request, conversation_context, source_materials]
purpose: |                 # 目的。発表後に聴衆が「知る / 判断する / 行動する」こと。依頼者の言葉で
audience_as_stated: |      # 対象者 (依頼に書かれた範囲だけ。分析は audience-analyzer)
use_case: internal_report  # workshop | conference_talk | internal_report | decision_meeting | online_broadcast | other
use_case_notes: |          # 分類の根拠となる依頼文。複数に当たるなら候補を併記し open_questions へ
deliverable_voice:         # 成果物 (聴衆が読む・聞く文字列) に適用する声。作業の記録には適用しない
  language: ja             # 聴衆が読む言語
  script: なし             # 表記の制約 (ひらがな中心、漢字にふりがな など)。無ければ「なし」
  tone: |                  # 明るく楽しく、落ち着いて など。無ければ「指定なし」
  reading_level: |         # 想定読解水準 (幼稚園児、非専門の管理職 など)
  stated_by_user: true     # 依頼に明示があったか。false なら対象者に合わせた既定である旨を書く
  source_quote: |          # 依頼文からの引用 (stated_by_user が true のとき)
constraints:
  time_minutes: 10         # 未記載なら null
  venue: |                 # 会場・配信・画面環境
  language: ja             # 成果物の言語。正本は deliverable_voice.language
  slide_count_request: |   # 依頼者の希望 (あれば)。枚数は初期値であり規則ではない
  brand_or_template_rules: |
  deadline: |
  other: []
materials:                 # 利用素材。テンプレートを含む
  - id: M1
    type: pptx_template    # pptx_template | data | document | url | image | other
    name: company-template.potx
    availability: provided # provided | referenced_only | missing
    notes: |
success_expectation: |     # 依頼者が期待する成功 (依頼者の言葉。指標化しない)
open_questions:            # 依頼に無く、推測で埋めなかった事項
  - 聴衆の人数と役職
source_quotes:             # 各項目の出所 (依頼文からの引用)
  purpose: "..."
```

## 手順

1. `user_request` と `conversation_context` から、目的・対象者・ユースケース・制約・利用素材・成功期待に当たる記述を拾う。言い換えるときは元の引用を `source_quotes` に残す
1a. トーン・表記・読解水準・言語の指定 (「明るく楽しく」「ひらがなで」「英語のスライドで」など) を `deliverable_voice` へ記録する。**これは成果物の声であり、本 Artifact 自身の書き方ではない。** 依頼がひらがな指定でも、この Artifact は作業言語 (日本語の常体) で書く。指定が無ければ `stated_by_user: false` とし、対象者から導いた既定であることを書く
2. `source_materials` を `materials` へ列挙する。`pptx_template` があるか、参照だけか、無いかを必ず記録する。無ければ `open_questions` に「PPTX テンプレート未提供 (後工程 `delivery-artifact-planner` で必要)」と書く。ここでは BLOCKED にしない
3. 依頼に無い項目は `open_questions` へ。「なし」と明示された項目は「なし」と書く。**未記載と「なし」を区別する**
4. `use_case` はガイド §4 の分類に照らして決める。複数に当たる、または判断できないときは候補を併記して `open_questions` へ入れる。枚数や時間配分の目安をここで書かない
5. 目的が依頼から読み取れない、または `user_request` が無いときは `BLOCKED` とし、何を教えてほしいかを `issues` に書く

## 参照するガイド

- `references/domain-guide.md` §1「エグゼクティブサマリ」— 「分かりやすい」を聴衆の処理 (どこを見る・何が重要・何を意味する) として捉える定義。目的を「発表すること」ではなく聴衆の変化として書き取るために読む
- `references/domain-guide.md` §4「ユースケース別の構成テンプレート」の表の見出し行と各ユースケースの段落 — `use_case` の分類に使う。枚数列は読まない (ここでは使わない)

## 結果

- `COMPLETE` → `recommended_next: brief-normalizer-reviewer`
- `BLOCKED` → `user_request` が無い、または目的を読み取れない。`issues` に必要な入力を書く
- `rollback_candidates`: 無し (最上流)
