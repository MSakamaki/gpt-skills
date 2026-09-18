# image-generator

種別：specialist　段階：rendering-build　対象：Slide 単位

## 責務

承認済みの `image_spec@S` から、画像の受け渡し仕様 (`handoff_brief`) と、Slide 上の配置枠 (`placeholder`) を `image_asset@S` として作る。**本スキルは画像を生成しない。** 画像は別の画像作成スキルや画像生成機能で作り、ユーザーがはめ込む。

## 禁止

- 画像を生成した、取得した、挿入したと書かない
- `image_spec` の意味的役割を変えない。装飾のためだけの画像を追加しない
- 画像内に画面文章 (見出し・説明文) を入れる指示を書かない。画面上の文章は `slide_copy_spec` が担う (I-08)
- 元の内容に無い因果・順序・優劣を示す構図を指示しない

## 入力

| Artifact | 使い方 |
|---|---|
| `image_spec@S` | 画像の意味的役割・主題・必須要素・避ける要素・`alt_text` の元 |
| `slide_layout_spec@S` | 配置領域・大きさ・比率 |
| `visual_style_spec@S` | 色調・画風との整合 (外部スキルに固定スタイルがある場合はその範囲で) |

## 出力：`image_asset@S`

```yaml
artifact: image_asset
artifact_id: image_asset@S03
version: 1
produced_by: image-generator
based_on: [image_spec@S03 v1, slide_layout_spec@S03 v1, visual_style_spec@S03 v1]
slide_id: S03
kind: external_handoff                 # 本スキルは生成しない
placeholder:                           # slide-builder がテンプレート上に置く枠
  id: IMG-S03-1
  region: right_half
  left_pct: 52
  top_pct: 22
  width_pct: 40
  height_pct: 60
  aspect_ratio: "2:3"
  label: "[画像 IMG-S03-1: 新規顧客の導入現場]"   # 枠に表示する識別ラベル
  alt_text: |                          # image_spec の意味的役割を 1 文で。「画像」「イラスト」と書かない。装飾なら空
handoff_brief:                         # 別の画像作成スキル / 画像生成機能へ渡す条件
  role: |                              # この画像が伝えること (装飾でない理由)
  subject: |
  must_include: []
  must_avoid: []                       # 元の内容に無い因果・優劣、装飾、文字
  style_constraints: |                 # visual_style_spec との整合 (色調・フラットな画風など)
  text_in_image: none                  # none | labels_only
  target_size_px: {width: 1024, height: 1536}   # 配置枠と想定表示幅から
  transparency: preferred              # preferred | not_needed
  file_format: png
insertion_instruction: |               # ユーザーが枠を画像に置き換える手順と、代替テキストの設定
verification:
  - checked: placeholder_fits_layout
    result: true
```

## 手順

1. `image_spec@S` の役割・主題・必須要素・避ける要素を読む。役割が「装飾」しか無いと分かった場合は `BLOCKED` とし、`image-planner` への差し戻し候補として理由を書く
2. `slide_layout_spec@S` の領域から配置枠 (`placeholder`) の位置・大きさ・比率を決める。`target_size_px` は、配置枠の割合と想定表示幅 (初期値 1920 px。実測値があればそれ) から計算した目安であり保証値ではない
3. `handoff_brief` を書く。`visual_style_spec` の色調・画風方針と整合させ、外部スキルに固定スタイルがあるならその範囲で指定する。画像内の文字は原則 `none`
4. `alt_text` を `image_spec` の意味的役割から 1 文で書く。装飾画像 (役割が無い) は本来この工程へ来ないが、来た場合は空にせず手順 1 で止める
5. ユーザーがはめ込む手順 (`insertion_instruction`) を書く。枠の置き換え、比率の維持、代替テキストの設定、読み上げ順の位置
6. 画像を生成しない。生成済みのように書かない

## 参照するガイド

- `references/domain-guide.md` §2「Mayer のマルチメディア学習理論」の段落 (Coherence: 不要な画像を除く) — 役割の無い画像を止める根拠
- `references/domain-guide.md` §3 の表「情報密度」「アクセシビリティ」行 — 装飾の排除、alt text
- `references/domain-guide.md` §7 のチェックリスト「削除」「字幕・alt」行

## 結果

- `COMPLETE` → `recommended_next: image-generator-reviewer`
- `BLOCKED` → `image_spec` に意味的役割が無い、配置領域が `slide_layout_spec` に無い
- `rollback_candidates`: `image-planner`
