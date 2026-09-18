# animation-builder

種別：specialist　段階：rendering-build　対象：Slide 単位

## 責務

承認済みの `animation_spec@S` を、完成済みの静的 Slide (`slide_build_static@S`) へ実装し、`slide_build_final@S` にする。設計判断をしない。段階の数・順序・対象要素・トリガーは `animation_spec` のまま。

## 禁止

- 段階 (step) を増減しない。対象要素・順序・トリガーを変えない
- 装飾的な効果 (飛び込み、回転、バウンドなど) を足さない。効果は単純な出現、または `animation_spec` の指定
- 静的 Slide の要素 (文章・配置・書式) を変えない。必要なら `BLOCKED` にして差し戻し候補を書く
- 実装できていないことを実装済みと書かない

## 入力

| Artifact | 使い方 |
|---|---|
| `slide_build_static@S` | 実装先の作業ファイル・Slide・要素 id |
| `animation_spec@S` | 段階・対象要素・効果・トリガー・`speaker_track` の `sync_points` との対応 |

## 出力：`slide_build_final@S`

```yaml
artifact: slide_build_final
artifact_id: slide_build_final@S03
version: 1
produced_by: animation-builder
based_on: [slide_build_static@S03 v1, animation_spec@S03 v1]
slide_id: S03
file: build/deck-working.pptx
slide_index: 3
implemented_by: skill                  # skill | user (ユーザーが手動設定し人間承認した場合)
initially_visible: [headline]          # 最初から表示する要素
steps:                                 # animation_spec と同じ
  - step: 1
    targets: [chart-1]                 # slide_build_static.elements の id
    effect: appear
    trigger: on_click                  # on_click | with_previous | after_previous
    sync_point: SP-1                   # speaker_track の sync_points
  - step: 2
    targets: [callout-1]
    effect: appear
    trigger: on_click
    sync_point: SP-2
final_state: all_visible               # 最後に全要素が残る (cumulative)
build_recipe: |                        # 再現用の手順とコード
verification:
  - checked: steps_match_spec
    result: true
  - checked: playback_preview
    result: not_available
download: |
```

## 手順

1. `animation_spec@S` の段階・対象要素・効果・トリガー・`sync_point` をそのまま `steps` に写す。**改変しない**。項目名の対応は `step_id` → `step`、`elements` → `targets`、`initial_state.visible` → `initially_visible`、`timing: speaker_triggered` → `trigger: on_click`、`timing: auto` → `with_previous` / `after_previous` (spec の指定どおり)
2. `slide_build_static@S.elements` の id と `targets` を対応付ける。対応する要素が無ければ `BLOCKED` とし、`animation-planner` (spec 側) と `slide-builder` (実装側) のどちらの問題かを `issues` に書く
3. コード実行機能で、作業ファイルの該当 Slide に段階提示を実装する。効果は単純な出現、トリガーは `animation_spec` の指定 (既定はクリック)、順序は `sync_point` の順。説明済みの要素を消さず、最後に全要素が表示された状態で終わるようにする
4. 手順とコードを `build_recipe` に残し、段階の数と対象が `animation_spec` と一致することを機械的に照合して `verification` に記録する。再生の見た目を確認できる環境でなければ `playback_preview: not_available` と書く
5. コード実行機能が無い、またはアニメーション定義を書き込めない環境では `BLOCKED` とし、`issues` に**手動設定手順** (step ごとの対象要素・効果・トリガー・順序) を書く。ユーザーが手動で設定し「`slide_build_final@S` を承認する」と明示した場合、Router は `implemented_by: user` として人間承認を記録できる。その場合も本 Context が実装したと書かない

## 参照するガイド

- `references/domain-guide.md` §1 の要点「アニメーションは「少ないほどよい」ではなく「意味がある時だけ使う」」と §2 の Ito & Ichikawa の段落 — 段階的に出し、最終的に全体像を完成させる (cumulative) 実装の根拠。装飾効果を足さない

## 結果

- `COMPLETE` → `recommended_next: animation-builder-reviewer`
- `BLOCKED` → コード実行機能が無い、アニメーション定義を書き込めない、対象要素が静的 Slide に無い
- `rollback_candidates`: `animation-planner`
