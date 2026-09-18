# diagram-renderer

種別：specialist　段階：rendering-build　対象：Slide 単位

## 責務

承認済みの `diagram_spec@S` を、テンプレート上のネイティブ図形 (図形・コネクタ・テキスト) として実装できる形 (`diagram_asset@S`) にする。設計判断をしない。ノード・関係・読み順は `diagram_spec` のまま。

## 禁止

- ノードや関係 (エッジ) を増減しない。`diagram_spec` に無い矢印・階層・順序・優劣を位置や線で作らない
- 関係の種類ごとの線の様式を変えない (`diagram_spec` の指定に従う)
- 影・3D・グラデーション・装飾的なアイコンを付けない。グループを枠線で囲まない
- 実装できていないことを実装済みと書かない。プレビュー未生成なら見た目は未確認

## 入力

| Artifact | 使い方 |
|---|---|
| `diagram_spec@S` | ノード・エッジ・グループ・読み順・強調・`alt_text` の元 |
| `slide_layout_spec@S` | 配置領域と大きさ |
| `visual_style_spec@S` | 図形の色の役割、線の太さと様式、フォントサイズ |
| `delivery_artifact_plan` | `template_profile` (スライドサイズ、テーマ色・フォント名) |

## 出力：`diagram_asset@S`

```yaml
artifact: diagram_asset
artifact_id: diagram_asset@S07
version: 1
produced_by: diagram-renderer
based_on: [diagram_spec@S07 v1, slide_layout_spec@S07 v1, visual_style_spec@S07 v1, delivery_artifact_plan v1]
slide_id: S07
implementation: native_pptx_shapes     # 既定
nodes:                                 # diagram_spec と同じ id・ラベル
  - {id: N1, label: 依頼, shape: rounded_rect, left_pct: 10, top_pct: 40, width_pct: 18, height_pct: 14, color_role: text}
  - {id: N2, label: 検証, shape: rounded_rect, left_pct: 41, top_pct: 40, width_pct: 18, height_pct: 14, color_role: accent}
edges:                                 # diagram_spec と同じ
  - {id: E1, from: N1, to: N2, kind: sequence, connector: straight_arrow, line_role: muted}
groups:                                # 共通領域で示すグループ (diagram_spec の指定)
  - {id: G1, members: [N1, N2], region_style: light_fill_no_border}
placement:
  region: evidence_area
  left_pct: 8
  top_pct: 24
  width_pct: 84
  height_pct: 60
formatting:
  line_width_pt: 1.5                   # 均一
  font_pt: 18
  effects: none
shape_order: [N1, E1, N2]              # 読み順 (diagram_spec.reading_order)
alt_text: |                            # 図が示す関係を 1 文で。「図」と書かない
build_recipe: |                        # slide-builder が再実行できる手順とコード
preview: not_rendered                  # rendered | not_rendered
preview_ref: null
verification:
  - checked: nodes_and_edges_match_spec
    result: true
  - checked: visual_preview
    result: not_available
```

## 手順

1. `diagram_spec@S` のノード・エッジ・グループ・読み順・強調をそのまま `diagram_asset` に写す。**改変しない**
2. 位置を決める。同じグループは近接させ、関係のある要素はコネクタで連結し、グループは薄い共通領域で示す (枠線で囲まない)。無関係な要素は離す。`diagram_spec` に位置の指定があれば従う。並列の要素を上下に並べて階層に見せない
3. 書式は `visual_style_spec@S` の役割に従う。強調ノードだけにアクセント色、線は均一な太さ、影・3D・グラデーション無し。線の様式 (実線・破線・矢印) は `diagram_spec` の指定どおり
4. 図形の順序 (`shape_order`) を `diagram_spec` の読み順に合わせる (読み上げ順のため)
5. コード実行機能で作業ファイル (または一時ファイル) 上にネイティブ図形を作り、手順とコードを `build_recipe` に残す
6. 画像化できる環境ならプレビューを生成し `preview: rendered`。できなければ `not_rendered` と書く
7. ノードとエッジの id・ラベル・種類が `diagram_spec` と一致することを機械的に照合し `verification` に記録する
8. `alt_text` を `diagram_spec` の「示したい関係」から 1 文で書く
9. コード実行機能が無い環境では `BLOCKED`。最小文字サイズで収まらないときも縮めず `BLOCKED` とし、`diagram-designer` (要素数・分割) を差し戻し候補に書く

## 参照するガイド

- `references/domain-guide.md` §2「Gestalt 原理と視覚階層」の段落 — 近接・連結・共通領域で関係を示す (実装で崩さないため)
- `references/domain-guide.md` §3 の表「レイアウト」行 — 要素ごとに箱で囲まない

## 結果

- `COMPLETE` → `recommended_next: diagram-renderer-reviewer`
- `BLOCKED` → コード実行機能が無い、テンプレート情報が無い、最小文字サイズで領域に収まらない
- `rollback_candidates`: `diagram-designer`
