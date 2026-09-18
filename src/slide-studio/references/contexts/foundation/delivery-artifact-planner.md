# delivery-artifact-planner

種別：specialist　段階：foundation　対象：Deck 全体

## 責務

最終的に必要な Delivery Artifact を定義する。出力形式、PPTX テンプレートの事実 (`template_profile`)、発表用・配布用・録画支援の要否と要件、画像の受け渡し方針を `delivery_artifact_plan` にまとめる。

## 禁止

- 発表用と配布用を無条件に同一 Artifact にしない
- テンプレートの配色・レイアウトから Slide の内容やスタイルを決めない (I-07)。ここではテンプレートの事実だけを記録する
- テンプレートを検査していないのに `inspected: true` と書かない。無いテンプレートを推測して作らない

## 入力

| Artifact | 使い方 |
|---|---|
| `presentation_brief` | `materials` (テンプレートの有無)、`constraints` (会場・配信・配布の希望・ブランド規則) |
| `presentation_mode_spec` | `delivery_mode` `standalone_reading` から配布形態を導く |
| `pptx_template` | 検査対象。無ければ `BLOCKED` |

## 出力：`delivery_artifact_plan`

```yaml
artifact: delivery_artifact_plan
artifact_id: delivery_artifact_plan
version: 1
produced_by: delivery-artifact-planner
based_on: [presentation_brief v1, presentation_mode_spec v1, pptx_template]
output_format: pptx                  # 既定。ユーザーが変えた場合はその形式と理由
template_profile:
  file: company-template.potx
  inspected: true                    # コード実行で中身を検査したか。false はユーザー説明の転記
  slide_size: {width_in: 13.333, height_in: 7.5, aspect: "16:9"}
  layouts:
    - name: タイトルとコンテンツ
      placeholders: [title, body]
  theme:
    fonts: {major: null, minor: null}
    colors: {dk1: null, lt1: null, accent1: null}
  sample_slides_to_remove: 0
  notes: |
variants:
  live_presentation:
    required: true
    requirements: |                  # 話者との協働前提。本文はキーワードと視覚証拠
  handout:
    required: false
    requirements: |                  # 注記・出典・補足を追加する。Live 用を報告書化しない
  recording_support:
    required: false
    requirements: |                  # 字幕要件、トランスクリプト、検索できる一意タイトル
image_handoff:
  policy: external_images_placed_by_user   # 画像は別スキルで作りユーザーがはめ込む
  notes: |
rationale: |
open_questions: []
```

## 手順

1. `pptx_template` が提供されているか確認する。brief の `materials` に無い、または実体を参照できないなら `BLOCKED` とし、テンプレートの提供を求める
2. コード実行機能でテンプレートを検査し、スライドサイズ・レイアウトとプレースホルダ・テーマのフォントと色・除くべきサンプル Slide を記録する (`inspected: true`)。コード実行が使えない環境では、ユーザーの説明を転記して `inspected: false` とし、不足する事実を `open_questions` に書く。推測で埋めない
3. `output_format` は `pptx` を既定にする。ユーザーが別形式を明示していればそれを記録する
4. `variants` を決める。発表があれば `live_presentation`。`standalone_reading` が真、または brief に配布の希望があれば `handout` を別要件で置く。`delivery_mode` が録画・オンラインで後日配布があるなら `recording_support` を置く
5. `image_handoff` を書く。本スキルは画像を生成せず、配置枠と受け渡し仕様を作ることを明記する
6. 各決定の出所を `rationale` に書く

## 参照するガイド

- `references/domain-guide.md` §4「社内報告」の段落末尾 (資料を単独閲覧させる場合は発表版と配布版を分ける) — 発表用≠配布用の根拠 (Mayer のモダリティ／冗長性原理、B)
- `references/domain-guide.md` §4「オンライン配信」の段落 — 字幕・トランスクリプト・検索できる一意タイトル (C)
- `references/domain-guide.md` §3「字幕と冗長性原理は区別する」の段落 — 字幕を別レイヤーとして提供する

## 結果

- `COMPLETE` → `recommended_next: delivery-artifact-planner-reviewer`
- `BLOCKED` → `pptx_template` が無い、または `delivery_mode` が決まらない
- `rollback_candidates`: `presentation-mode-designer`
