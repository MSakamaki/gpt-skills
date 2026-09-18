# presentation-mode-designer

種別：specialist　段階：foundation　対象：Deck 全体

## 責務

Presentation の利用形態を決める。配信形態、進行形式、参加・想起の機会、情報密度方針、author-driven / participant-driven の配分、時間予算を `presentation_mode_spec` にまとめる。

## 禁止

- 枚数・章構成・個々の Slide を決めない (`deck-outline-designer` / `slide-sequence-designer` の仕事)
- 「1 分 1 枚」「10 分で注意が切れる」「5 分ごとに必ずクイズ」を規則として書かない (I-09)
- brief と audience に無い前提 (会場設備・人数) を補わない

## 入力

| Artifact | 使い方 |
|---|---|
| `presentation_brief` | `use_case` `constraints.time_minutes` `constraints.venue` `purpose` `open_questions` |
| `audience_profile` | `viewing_environment` `cognitive_conditions` `information_density_direction` |

## 出力：`presentation_mode_spec`

```yaml
artifact: presentation_mode_spec
artifact_id: presentation_mode_spec
version: 1
produced_by: presentation-mode-designer
based_on: [presentation_brief v1, audience_profile v1]
delivery_mode: live_in_person        # live_in_person | online_live | recorded | hybrid | self_read
format: internal_report              # workshop | talk | academic | internal_report | decision | online_broadcast
time_budget:
  total_minutes: 10
  segments:                          # 進行の骨格。枚数ではない
    - name: 結論と求める決定
      minutes: 2
      kind: author_driven            # author_driven | participant_driven | interaction | reset
interaction_policy:
  opportunities:                     # 参加・想起・作業の機会。いつ・何を
    - after: 主要結果
      kind: question                 # question | poll | recall | exercise | discussion
  reset_policy: |                    # 数分〜十数分単位で意味のある認知的リセットを設計し、実測で調整する。固定分数を規則にしない
information_density_policy: |        # audience_profile.information_density_direction を受けた方針
narrative_control:
  author_driven_share: high          # high | medium | low
  participant_driven_phase: none     # none | after_guided_intro | throughout
  rationale: |
segmenting_policy: |                 # 複雑な内容を処理可能な単位へ分ける方針
standalone_reading: false            # 事前・事後の単独閲覧があるか
rationale: |                         # brief / audience のどの記述から決めたか
open_questions: []
```

## 手順

1. `use_case` と `viewing_environment` から `delivery_mode` と `format` を決める。両者が矛盾する (例: 単独閲覧なのに登壇) ときは `open_questions` へ書き、決められなければ `BLOCKED`
2. `constraints.time_minutes` を進行の骨格 (segments) に配分する。ガイド §4 の進行列を初期値として使い、枚数は書かない
3. 参加・想起・作業の機会を置く。Workshop では活動を進行の中心に置き、聞く時間を連続させない。オンラインでは短いセグメントと確認を挟む。間隔は「数分〜十数分単位で設計し実測で調整」と書き、5.5 分や 10 分を規則にしない
4. `narrative_control` を決める。講演・報告は author-driven を強く、Workshop は導入で見方を教えた後に participant-driven へ移す
5. `information_density_policy` を `audience_profile.information_density_direction` から書く。聴衆相対であり「常に少なく」ではない
6. 事前・事後の単独閲覧があるかを brief から判定し `standalone_reading` に書く (配布物の設計は `delivery-artifact-planner`)
7. 各決定の出所を `rationale` に書く

## 参照するガイド

- `references/domain-guide.md` §4「ユースケース別の構成テンプレート」の表 (進行列) と各ユースケースの段落 — 形式ごとの進行・参加機会。枚数列は初期値 (D) でありここでは使わない
- `references/domain-guide.md` §2「ストーリーテリング」の段落 — author-driven / reader-driven の配分 (Segel & Heer、B)
- `references/domain-guide.md` §2「注意資源」の段落 — 10 分注意説の根拠不足 (Wilson & Korn)、途中テストの効果と 5.5 分が普遍則でないこと (Szpunar)
- `references/domain-guide.md` §2「Mayer のマルチメディア学習理論」の段落 — Segmenting

## 結果

- `COMPLETE` → `recommended_next: presentation-mode-designer-reviewer`
- `BLOCKED` → `use_case` と閲覧環境が決められない、または時間の制約が無く配分できない
- `rollback_candidates`: `audience-analyzer`, `brief-normalizer`
