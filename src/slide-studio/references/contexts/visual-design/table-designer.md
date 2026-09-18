# table-designer

種別：specialist　段階：visual-design　対象：Slide 単位

## 責務

表の意味構造を設計する。比較軸 (行・列の意味)、見出し、載せるデータ、強調セル、単純化の方針を `table_spec@S` にする。描画は `table-renderer`。

## 禁止

- `content_spec@S` のデータを改変しない。無いデータを補わない
- 結合セルや入れ子の見出しで表を複雑にしない
- 判断に寄与しない列・行を「あった方が丁寧」で載せない
- 色の実際の値 (`visual-style-designer`)、見出しの文面 (`slide-copywriter`) を確定しない

## 入力

| Artifact | 使い方 |
|---|---|
| `content_spec@S` | データの出所 (AE なら `slide_evidence_pack@S`、活動なら `activity_slide_spec@S` の項目) と、強調する結論 |
| `visual_medium_plan@S` | 該当 `media_id` の `what_to_read`・`reason` |

## 出力：`table_spec@S`

```yaml
artifact: table_spec
artifact_id: table_spec@S06
version: 1
produced_by: table-designer
based_on: [slide_assertion_spec@S06 v1, slide_evidence_pack@S06 v1, visual_medium_plan@S06 v1]
slide_id: S06
media_id: M1
judgment_to_enable: 3 案を利益率・導入期間・最大リスクで比べ、A 案が推奨である根拠を確認する
comparison_axes:
  rows: 選択肢 (A案 / B案 / C案)
  columns: 比較観点 (利益率 / 導入期間 / 最大リスク)
header:
  row: [観点, A案, B案, C案]
  has_header_row: true           # 読み上げ用の見出し行
rows:
  - [利益率, +4pt, +1pt, -2pt]
  - [導入期間, -2か月, ±0, +1か月]
source_refs: [slide_evidence_pack@S06.required_evidence[0]]
emphasis_cells: [{row: 1, col: 1, reason: 推奨の根拠になる差, marker: "▲"}]   # marker は色以外の印 (任意)
simplification:
  merged_cells: none             # 結合セルを使わない
  omitted_columns: [{name: 備考, reason: 判断に寄与しない}]
  number_alignment: right
  unit_in_header: true
size: {rows: 4, cols: 4}         # 聴衆と表示環境に相対的な目安
alt_text_intent: 3 案の利益率・導入期間・最大リスクの比較で、A 案が利益率と導入期間で最良であることを示す
```

## 手順

1. `visual_medium_plan@S.media[]` の `what_to_read` から `judgment_to_enable` を書き、何と何をどの観点で比べさせるかを `comparison_axes` にする
2. 行・列の意味が見出しだけで分かるようにし、見出し行を必ず持つ。単位は見出しへ寄せ、セルには値だけを置く
3. データを `content_spec@S` からそのまま写す。判断に寄与しない列・行は載せず、`omitted_columns` に理由を残す。データが無ければ `BLOCKED`
4. 結合セルを使わず、数値は桁を揃える。同じ役割の列は同じ形式にする (反復)
5. 強調するセルは結論に関わるものだけにし、理由を書く。全セルを強調しない
6. 行・列が多く小型画面や最遠席で読めない見込みなら、行を削らずに `issues` に書き、媒体の見直し (`visual-medium-router`) か全体を残した段階提示 (判断は `animation-planner`) を提案する

## 参照するガイド

- `references/domain-guide.md` §3 表「アクセシビリティ」行 — 単純な表、複雑な結合セルを避ける
- `references/domain-guide.md` §2「Gestalt 原理と視覚階層」の段落 — 同じ役割は同じ書式 (類似・反復)、近接
- `references/domain-guide.md` §2 日本語の実務研究の段落 — 整列・反復・近接・コントラスト
- `references/domain-guide.md` §3「図表は「何を読み取らせるか」から逆算する」の表 — 量の差を読ませるなら表より Chart が合う場合の判断
- `references/domain-guide.md` §7 のチェックリスト「視覚階層」行

## 結果

- `COMPLETE` → `recommended_next: table-designer-reviewer`
- `BLOCKED` → データが `content_spec@S` に無い
- `rollback_candidates`: `visual-medium-router` (表が不要、または Chart の方が合うと分かった)
