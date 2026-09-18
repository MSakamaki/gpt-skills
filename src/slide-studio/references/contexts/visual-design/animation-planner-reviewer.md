# animation-planner-reviewer

種別：reviewer　段階：visual-design　対象：`animation_spec@S`

## 責務

各 step が理解の改善を説明でき、装飾でなく、話者の `sync_points` と同期し、最終的に全体像を完成させるかを検証する。修正しない。別の段階案を書かない。

## 入力

| Artifact | 使い方 |
|---|---|
| `slide_layout_spec@S` | 要素と `reading_order`、分節の妥当性 |
| `media_specs@S` | 図・Chart・表の要素数とプロセスの段階 |
| `speaker_track@S` | `sync_points` の存在・順序との照合 |
| `presentation_mode_spec` | 自動タイミングの要否 |
| `animation_spec@S` | 検証対象 |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | 各 step の `what_improves` が「この動きで何の理解が改善するか」を具体的に説明しているか。説明できない step が無いか | ガイド §7「アニメーション」チェック |
| 2 | 装飾的な効果 (飛び込み・回転・バウンド・意味の無い移動) や、`purpose` に当たらない動きが無いか | ガイド §3 表「アニメーション」行、禁止事項 (spec §18) |
| 3 | 各 step の `sync_point` が `speaker_track@S.sync_points` に存在し、順序が説明順と一致するか | ガイド §2 Temporal contiguity (B)、Ito & Ichikawa 2026 (A) |
| 4 | `final_state` が全体像を完成させるか。要素を消したままにしていないか | ガイド §2 Ito & Ichikawa 2026 の段落 (cumulative) |
| 5 | `needed: false` の判断が妥当か。要素が多い図・Chart・プロセスを一括提示にして分節化の機会を逃していないか | ガイド §1 要点「アニメーション」、§3 初期値の段落 |
| 6 | step の粒度が説明の区切りと合うか。過分割 (1 要素ずつの無意味な分割) や、1 step に無関係な要素の混在が無いか | ガイド §2 Segmenting |
| 7 | `timing` が `presentation_mode_spec` に合うか。配布版の扱い (`handout_note`) があるか | ガイド §4 配布用の段落 |
| 8 | 内容・配置・スタイルを変えていないか。`elements` が `slide_layout_spec@S.elements` に存在するか | I-03 |

## 判定

- 観点 1・2・4 は `CRITICAL` (装飾 Animation は FAIL)。観点 3・5・6・8 は `MAJOR`。観点 7 は `MINOR`
- `CRITICAL` / `MAJOR` が 1 つでもあれば `FAIL`

| 問題の種類 | rollback_target |
|---|---|
| 必要性の判断、step の目的・効果・同期・最終状態の問題 | `animation-planner` |

`sync_points` の不足や Layout の分節単位が原因と判断した場合も、Registry の `rollback_candidates` に従い `animation-planner` へ戻し、所見に上流 (`speaker-track-designer` / `slide-layout-planner`) の問題である旨を書く。`animation-planner` は所見を受けて `BLOCKED` で更に上流へ差し戻しを提案する。

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `animation_spec@S<nn> v<n>`。`PASS` の `recommended_next` は `media_specs@S` に対応する Renderer (`chart-renderer` / `table-renderer` / `diagram-renderer` / `image-generator`) を 1 つずつ。媒体が無ければ `slide-builder`。`needed: false` でも同じ。

## 参照するガイド

- `references/domain-guide.md` §1 の要点「アニメーションは「少ないほどよい」ではなく「意味がある時だけ使う」」
- `references/domain-guide.md` §2「Mayer のマルチメディア学習理論」と Ito & Ichikawa 2026 の段落
- `references/domain-guide.md` §3 表「アニメーション」行、§6 の表「アニメーション」行
- `references/domain-guide.md` §7 のチェックリスト「アニメーション」行
