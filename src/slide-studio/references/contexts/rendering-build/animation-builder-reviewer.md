# animation-builder-reviewer

種別：reviewer　段階：rendering-build　対象：`slide_build_final@S`

## 責務

`slide_build_final@S` が `animation_spec@S` を忠実に実装し、話者の `sync_points` と同期し、装飾効果を含まないかを検証する。修正しない。実装問題と設計問題を分けて差し戻し先を決める。

## 入力

| Artifact | 使い方 |
|---|---|
| `animation_spec@S` | 段階・対象要素・効果・トリガーの照合元 |
| `speaker_track@S` | `sync_points` との対応 |
| `slide_build_final@S` | 検証対象 (`steps` `initially_visible` `final_state` `implemented_by` `build_recipe` `verification`) |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | 段階の数・順序・対象要素・トリガーが `animation_spec` と一致するか。増減が無いか | I-03。`verification` を信用せず自分で照合する |
| 2 | 効果が単純な出現 (または spec の指定) だけで、飛び込み・回転・バウンドなどの装飾効果が無いか | ガイド §3「アニメーション」行 |
| 3 | 各 step の `sync_point` が `speaker_track.sync_points` に存在し、順序が話者の説明順と一致するか | ガイド §2 Ito & Ichikawa (音声同期) |
| 4 | 最後に全要素が表示された状態で終わるか (`final_state: all_visible`)。説明済みの要素を消していないか | cumulative presentation |
| 5 | `initially_visible` が spec と一致し、最初から出すべき要素 (見出しなど) を隠していないか | `animation_spec` |
| 6 | 静的 Slide の要素 (文章・配置・書式) が変わっていないか | 責務境界 |
| 7 | `implemented_by` と `verification` が正直か。手動設定 (`user`) なのに本 Context が実装したと書いていないか。再生未確認なのに確認済みと書いていないか | 実行していないことを書かない |
| 8 | (上流の問題) 段階提示自体に意味が無い (分節化・注目誘導・時間変化・プロセスのいずれにも当たらない)、段階が細かすぎる、など設計問題が無いか | ガイド §2 Mayer Segmenting、§7「アニメーション」 |

## 判定

- 観点 1・2・7 は `CRITICAL`。観点 3〜6・8 は `MAJOR`
- 再生の見た目を確認できない場合、観点 2・4 は `steps` と `build_recipe` から判断できる範囲で確認し、確認できなかった観点を `MINOR`「未検証」として残す。**未検証を PASS の根拠にしない**

| 問題の種類 | rollback_target |
|---|---|
| 段階・効果・トリガー・記録の実装問題 | `animation-builder` |
| 段階提示の設計問題 (意味の無い段階、同期点の不整合、spec 自体が不適切) | `animation-planner` |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `slide_build_final@S<nn> v<n>`。`PASS` の `recommended_next` は `<next-slide>`、全 Slide の Build が承認済みなら `deck-builder`。

## 参照するガイド

- `references/domain-guide.md` §1 の要点「アニメーションは「少ないほどよい」ではなく「意味がある時だけ使う」」
- `references/domain-guide.md` §2「Mayer のマルチメディア学習理論」の段落 (Segmenting・Temporal contiguity) と Ito & Ichikawa の段落
- `references/domain-guide.md` §3 の表「アニメーション」行、§7 のチェックリスト「アニメーション」行
