# chart-designer

種別：specialist　段階：visual-design　対象：Slide 単位

## 責務

Chart の意味構造を設計する。何を読み取らせるかから種類・符号化・尺度・強調・ラベルを決め、`chart_spec@S` にする。描画 (実装) は `chart-renderer`。

## 禁止

- `slide_evidence_pack@S` のデータを改変しない (値・順序・単位・系列名)。証拠が足りなければ `BLOCKED`
- 精密な量を角度・面積・体積・色相で符号化しない。3D・装飾グラフを使わない
- 主張を変えない。主張と合わないデータになったら `BLOCKED` にして差し戻しを提案する
- 見出し・注釈の文面 (`slide-copywriter`)、色の実際の値 (`visual-style-designer`) を確定しない。色は役割で書く

## 入力

| Artifact | 使い方 |
|---|---|
| `slide_evidence_pack@S` | データの出所。`required_evidence` は必ず載せ、`excluded_information` は載せない |
| `slide_assertion_spec@S` | 強調する結論部分と、読み取らせたい判断 |
| `visual_medium_plan@S` | 該当 `media_id` の `what_to_read`・`reason` |

## 出力：`chart_spec@S`

```yaml
artifact: chart_spec
artifact_id: chart_spec@S03
version: 1
produced_by: chart-designer
based_on: [slide_evidence_pack@S03 v1, slide_assertion_spec@S03 v1, visual_medium_plan@S03 v1]
slide_id: S03
media_id: M1
judgment_to_enable: 前年Q2 に対する Q2 の増加幅を読み取る
chart_type: bar                  # bar | dot_plot | line | scatter | stacked_bar_100 | slope | small_multiples
data:                            # slide_evidence_pack からそのまま
  source_refs: [slide_evidence_pack@S03.required_evidence[0]]
  unit: 指数 (前年Q2 = 100)
  categories: [前年Q2, Q1, Q2]
  series:
    - {name: 売上指数, values: [100, 110, 118]}
  omitted_supporting: [{ref: supporting_evidence[1], reason: 判断に効かない}]
encoding:
  primary_quantity: position_on_common_scale   # position_on_common_scale | length
  color_role: emphasis_only                    # 色は強調・区別・状態にだけ
scale:
  y_min: 0                       # 共通のゼロ・尺度。ゼロを切るなら理由を書く
  shared_with: [S04]             # before/after 等で同一尺度が要る Slide
emphasis: {target: Q2, reason: 主張が指す結論部分}
labels: {direct: true, legend: none, show_values: [Q2], axis_titles: {x: 期, y: 売上指数}}
no_3d: true
no_decoration: true
alt_text_intent: Q2 の売上指数が前年Q2 の 100 から 118 へ増えたことを示す
```

## 手順

1. `visual_medium_plan@S.media[]` の該当 `what_to_read` と `slide_assertion_spec@S` から `judgment_to_enable` を 1 文で書く
2. 種類を判断から逆算する。精密比較 → 棒・ドットプロット (共通のゼロ／尺度)、時系列 → 折れ線 (注目系列を強調し他を抑える)、2 変数 → 散布図 (回帰線は目的があるときだけ)、構成比 → 100% 積み上げ棒 (精密比較では円より位置比較)、before/after → 同一尺度の並列 (軸やサイズを変えない)
3. データを `slide_evidence_pack@S` からそのまま写す。`required_evidence` は必ず載せ、`supporting_evidence` は判断に効くときだけ載せ、載せないものを `omitted_supporting` に理由付きで記す。`excluded_information` は載せない。データが無ければ `BLOCKED` → `slide-evidence-selector`
4. 量は位置・長さで符号化する。色は強調・区別・状態にだけ使い、精密な量を色だけで符号化しない。強調は主張が指す結論部分だけ。凡例より直接ラベル
5. 専門家向けに軸・誤差・条件・サンプル数が要るなら残す。1 枚に多くの要素が要る場合は分割せず全体を残し、段階提示の可能性を `issues` に残す (判断は `animation-planner`)
6. `alt_text_intent` を、読み取らせたい判断で 1 文にする。「グラフ」と書かない

## 参照するガイド

- `references/domain-guide.md` §3「図表は「何を読み取らせるか」から逆算する」の表と表「図表」行 — 種類の逆算、直接ラベル、結論部分だけ強調
- `references/domain-guide.md` §2「情報可視化」の段落 — 位置・長さ > 角度・面積・体積・色相 (B)
- `references/domain-guide.md` §2「認知負荷理論」の expertise reversal と続く段落 — 専門家向けの軸・誤差・条件
- `references/domain-guide.md` §6 の表「グラフ」行 — 円＋離れた凡例から棒／ドット＋直接ラベルへの変換例

## 結果

- `COMPLETE` → `recommended_next: chart-designer-reviewer`
- `BLOCKED` → データが `slide_evidence_pack@S` に無い、主張とデータが合わない。`issues` に差し戻し候補を書く
- `rollback_candidates`: `visual-medium-router` (Chart が不要と分かった)、`slide-evidence-selector` (データ不足)
