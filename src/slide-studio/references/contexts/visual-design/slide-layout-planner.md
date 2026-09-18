# slide-layout-planner

種別：specialist　段階：visual-design　対象：Slide 単位

## 責務

内容要素 (画面文章と媒体) を画面領域へ配置する。空間的な階層、整列、近接、余白、読み順、強調領域を `slide_layout_spec@S` にする。**色・装飾は決めない** (`visual-style-designer`)。

## 禁止

- 文章・媒体の内容を変えない。入らないからと要素を削らない。入らなければ `BLOCKED` にして差し戻しを提案する
- 色、フォントの実際の書体、線の装飾を決めない
- 要素ごとに箱で囲まない。全スペースを埋めない
- テンプレートの空き枠に合わせて内容を並べ替えない (I-07)。内容の階層が配置を決める

## 入力

| Artifact | 使い方 |
|---|---|
| `content_spec@S` | 何が最重要か (主張 / 活動の目的 / 章の位置)。階層の根拠 |
| `media_specs@S` | 配置する媒体と、その `emphasis`・`reading_order` |
| `slide_copy_spec@S` | 配置する文章要素 (見出し・ラベル・注釈・短い指示) |
| `accessibility_policy` | 最小文字サイズ、読み上げ順、余白の方針 |
| `delivery_artifact_plan` | `template_profile.slide_size` (比率)、`output_format` |

## 出力：`slide_layout_spec@S`

```yaml
artifact: slide_layout_spec
artifact_id: slide_layout_spec@S03
version: 1
produced_by: slide-layout-planner
based_on: [slide_assertion_spec@S03 v1, slide_evidence_pack@S03 v1, chart_spec@S03 v1, slide_copy_spec@S03 v1, accessibility_policy v1, delivery_artifact_plan v1]
slide_id: S03
canvas:
  aspect: "16:9"                 # template_profile.slide_size から。会場仕様が正
  safe_margin_pct: 5             # 初期値
regions:                         # 左上原点、% で指定
  - {id: headline_area, left_pct: 5, top_pct: 6, width_pct: 90, height_pct: 14}
  - {id: evidence_area, left_pct: 8, top_pct: 24, width_pct: 84, height_pct: 62}
elements:                        # slide_copy_spec と media_specs の全要素を漏れなく
  - {id: headline, from: slide_copy_spec@S03.headline, region: headline_area}
  - {id: chart-1, from: chart_spec@S03, region: evidence_area}
  - {id: annotation-1, from: slide_copy_spec@S03.annotations[0], region: evidence_area, anchor: chart-1 の Q2 の点の近く}
spatial_hierarchy:
  primary: headline              # 3 秒で分かる最重要要素
  secondary: [chart-1]
  tertiary: [annotation-1]
alignment: {horizontal: 左端を揃える}
proximity_groups:
  - {members: [chart-1, annotation-1], meaning: 注釈は対象データの近く}
whitespace: 見出しと証拠領域の間、証拠領域の左右に余白
reading_order: [headline, chart-1, annotation-1]
emphasis_regions: [chart-1 の Q2 の周辺]
density_check: 要素 3。専門家向けに軸・単位を残しても余白を確保できる
not_decided_here: [色, 書体, 線の装飾]
```

## 手順

1. `template_profile.slide_size` から比率を取り、安全余白を置く (初期値 5%)。比率が無ければ `BLOCKED`
2. `slide_copy_spec@S` と `media_specs@S` の要素を漏れなく列挙する。要素を足さない・削らない
3. `content_spec@S` から最重要要素を決める。AE では主張 (見出し) が primary、証拠が secondary。活動 Slide では見出し (何をするか) が primary、目的・手順・成果物・時間が同格の secondary。構造 Slide では現在位置が primary
4. 関連する要素を近接させ (ラベルと対象、注釈と図)、無関係な要素の間に余白を置く。要素ごとの枠で関係を示さない
5. 整列の基準線を決め、読み順を意味の順に合わせる。強調領域は `media_specs@S` の `emphasis` と主張が指す部分だけ
6. 密度を `accessibility_policy` の最小文字サイズで見積もる。収まらなければ縮めず `BLOCKED` とし、文字量なら `slide-copywriter`、媒体の複雑さなら `<media-designer>` への差し戻しを提案する。多要素が必要な図は分割せず、全体を残して段階提示に委ねる前提を `density_check` に書く

## 参照するガイド

- `references/domain-guide.md` §2「Gestalt 原理と視覚階層」と日本語の実務研究の段落 — 近接・類似・連結で関係を伝え、枠線を増やさない (B)。整列・反復・近接・余白 (D)
- `references/domain-guide.md` §3 表「レイアウト」「情報密度」行 — 余白・整列・近接、16:9 は初期値で会場仕様優先、全スペースを埋めない
- `references/domain-guide.md` §3「24 pt、2色、1枚1主張などは目的ではなく…初期値」の段落 — 多要素は全体を残す
- `references/domain-guide.md` §7 のチェックリスト「視覚階層」「近接」行

## 結果

- `COMPLETE` → `recommended_next: slide-layout-planner-reviewer`
- `BLOCKED` → 比率が分からない、要素が最小文字サイズで収まらない (差し戻し候補を書く)
- `rollback_candidates`: `slide-copywriter` (文字量)、`<media-designer>` (媒体の複雑さ)
