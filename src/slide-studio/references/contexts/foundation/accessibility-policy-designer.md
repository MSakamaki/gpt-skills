# accessibility-policy-designer

種別：specialist　段階：foundation　対象：Deck 全体

## 責務

後工程全体に適用する Accessibility 制約を `accessibility_policy` として定める。コントラスト、最小可読文字、色に依存しない符号化、代替テキスト、読み上げ順、字幕、一意のタイトル、表の単純さを、根拠レベルを区別して書く。

## 禁止

- 実務上の目安 (投影 24〜32 pt 開始) を必須ルールや科学的閾値として書かない。公式基準 (C) と初期値 (D) を区別する
- 字幕を冗長性原理を理由に排除しない
- 「後工程で対応する」と先送りしない。ここで決めたものが以降の全 Context を拘束する

## 入力

| Artifact | 使い方 |
|---|---|
| `presentation_brief` | `constraints.brand_or_template_rules` `constraints.venue` |
| `audience_profile` | `accessibility_requirements` `viewing_environment` `language` |
| `delivery_artifact_plan` | `variants` (配信・録画なら字幕)、`template_profile.theme.fonts` |

## 出力：`accessibility_policy`

```yaml
artifact: accessibility_policy
artifact_id: accessibility_policy
version: 1
produced_by: accessibility-policy-designer
based_on: [presentation_brief v1, audience_profile v1, delivery_artifact_plan v1]
applies_to: all_downstream_contexts
contrast:
  normal_text_min_ratio: 4.5        # WCAG 2.2 / デジタル庁 (C)
  non_text_min_ratio: 3.0           # デジタル庁 (C)
  important_text: さらに余裕を持たせる
text:
  minimum_pt: 18                    # Microsoft の基準 (C)
  projection_start_pt: 24           # 初期値 (D)。最遠席テストで調整
  online_start_pt: 24               # 初期値 (D)
  adjust_by: 最遠席テスト・小型端末での実機確認 (preflight)
  typefaces:
    policy: 視認性の高いサンセリフ系を 1〜2 書体に統一
    template_fonts: []              # template_profile.theme.fonts。方針に合わないなら notes へ
color_independence:
  rule: 色だけで意味を符号化しない。ラベル・形・線種・位置を併用する
  accent_use: 重要な箇所だけ
alt_text:
  rule: 何を読み取るかを 1 文で。装飾は空。「画像」「グラフ」と書かない
reading_order:
  rule: 視覚的な読み順と一致させる
captions:
  required: false                   # 配信・録画・聴覚要件があれば true
  layer: separate                   # 本文に全文を置かず別レイヤーで提供
  rationale: |
unique_slide_titles: true
tables:
  rule: 単純な表。結合セルを避け、見出し行を明示する
media:
  rule: 字幕の無い動画・音声を置かない
evidence_levels: {contrast: C, minimum_pt: C, start_pt: D, typefaces: C/D}
rationale: |
open_questions: []
```

## 手順

1. `audience_profile.accessibility_requirements` と `viewing_environment` から、必須となる要件を拾う。不明な要件は `open_questions` に残し、無いと決めつけない
2. コントラストと最小文字サイズは公式基準 (C) を最低線に置き、投影・オンラインの開始サイズは初期値 (D) として書き、preflight の実測で調整すると明記する
3. `delivery_artifact_plan.variants` に配信・録画があれば `captions.required: true`。字幕は本文とは別レイヤーとし、冗長性原理を理由に外さない
4. 色に依存しない符号化、代替テキスト、読み上げ順、一意のタイトル、単純な表の規則を書く
5. `template_profile.theme.fonts` を方針と照らし、装飾書体や細すぎるウェイトなら `notes` と `open_questions` に書く (テンプレートを勝手に変えない)
6. 各基準の根拠レベルを `evidence_levels` に書き、出所を `rationale` に残す

## 参照するガイド

- `references/domain-guide.md` §3 の表「本文フォント」「書体」「色」「コントラスト」「アクセシビリティ」行 — 基準値と根拠レベル (C / D の区別)
- `references/domain-guide.md` §3「色は視覚階層を作る「希少資源」と考える」の段落 — 色覚多様性、色以外の符号の併用
- `references/domain-guide.md` §3「字幕と冗長性原理は区別する」の段落 — 字幕を別レイヤーで提供する根拠
- `references/domain-guide.md` §1 の要点「アクセシビリティは「特別対応」ではなく、通常の可読性設計として組み込む」
- `references/domain-guide.md` §7 のチェックリスト「コントラスト」「字幕・alt」行

## 結果

- `COMPLETE` → `recommended_next: accessibility-policy-designer-reviewer`
- `BLOCKED` → `delivery_artifact_plan` が無く配信・録画の有無が分からない
- `rollback_candidates`: `audience-analyzer`, `delivery-artifact-planner`
