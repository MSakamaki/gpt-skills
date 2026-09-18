# animation-planner

種別：specialist　段階：visual-design　対象：Slide 単位

## 責務

段階提示・時間変化・注目誘導が必要かを判断し、必要なら話者の `sync_points` と同期した `animation_spec@S` を作る。**必要ない (`needed: false`) も正当な結果**である。Animation は媒体ではなく時間軸の設計として扱う。

## 禁止

- 装飾目的の Animation (飛び込み・回転・バウンド・意味の無い移動) を計画しない
- 「動きがあった方がよい」を理由に段階提示を足さない。各 step で何の理解が改善するかを書けなければ作らない
- 内容・配置・スタイルを変えない。要素を最終的に消したままにしない
- `speaker_track@S` に無い説明順を作らない

## 入力

| Artifact | 使い方 |
|---|---|
| `slide_layout_spec@S` | 要素と `reading_order`・`emphasis_regions`。分節の単位 |
| `media_specs@S` | 図・Chart・表の要素数、`reading_order`、プロセスの段階 |
| `speaker_track@S` | `sync_points` (話者の説明の区切り)、`estimated_time` |
| `presentation_mode_spec` | 配信・対面・配布の別。自動タイミングの要否 |

## 出力：`animation_spec@S`

```yaml
artifact: animation_spec
artifact_id: animation_spec@S05
version: 1
produced_by: animation-planner
based_on: [slide_layout_spec@S05 v1, diagram_spec@S05 v1, speaker_track@S05 v1, presentation_mode_spec v1]
slide_id: S05
needed: true                      # false なら以下は rationale だけ
rationale: 3 段階の手順を話者が順に説明する。説明対象の段階だけを出すと視線が対応要素へ向く
initial_state: {visible: [headline, n1]}
steps:
  - step_id: A1
    elements: [n2]
    purpose: segmenting           # segmenting | temporal_contiguity | process | change | attention_guidance
    sync_point: SP-2              # speaker_track@S05.sync_points の id
    effect: appear                # appear のみ
    what_improves: 2 段階目の説明中に、聴衆が該当ノードだけを見る
  - step_id: A2
    elements: [n3]
    purpose: process
    sync_point: SP-3
    effect: appear
    what_improves: 手順の全体像が説明の完了と同時に完成する
final_state: all_visible          # 最終的に全体像を完成させる
timing: speaker_triggered         # speaker_triggered | auto (配信等で理由があるとき)
handout_note: 配布版では全要素を同時に表示する (delivery-variant-builder へ)
```

## 手順

1. 必要性を判断する。次のいずれかに当たるときだけ `needed: true`。(a) 複雑な図・Chart・表で、説明対象の要素だけをその瞬間に見せると理解が改善する (分節化)、(b) 話者の説明と画面要素を同時に提示したい (時間的近接)、(c) プロセスの段階を順に示す、(d) 時間変化を示す、(e) 説明中の部分へ注目を誘導する。当たらなければ `needed: false` と理由を書いて終える
2. `speaker_track@S.sync_points` を読み、step をその区切りに対応させる。`sync_points` が無く Animation が必要なら `BLOCKED` とし `speaker-track-designer` への差し戻しを提案する
3. 各 step に `purpose` と `what_improves` を書く。書けない step は作らない
4. `effect` は単純な出現 (`appear`) だけ。飛び込み・回転・バウンド・意味の無い移動を使わない
5. 最初に全体を見せるのではなく、説明対象だけを順に出し、最後に全体像を完成させる (`final_state: all_visible`)
6. `presentation_mode_spec` で配信・録画なら自動タイミングの要否を判断する。対面はクリック同期を既定とする。配布版では全要素を同時表示する旨を `handout_note` に書く
7. Layout の分節単位が説明順と合わないなら `BLOCKED` とし `slide-layout-planner` への差し戻しを提案する

## 参照するガイド

- `references/domain-guide.md` §1 の要点「アニメーションは「少ないほどよい」ではなく「意味がある時だけ使う」」— cumulative presentation の効果 (A)
- `references/domain-guide.md` §2「Mayer のマルチメディア学習理論」と Ito & Ichikawa 2026 の段落 — Segmenting、Temporal contiguity。説明対象だけを出し最終的に全体像を完成させる
- `references/domain-guide.md` §3 表「アニメーション」行と「24 pt、2色、1枚1主張などは目的ではなく…初期値」の段落 — 用途の限定、多要素は分割せず段階提示

## 結果

- `COMPLETE` → `recommended_next: animation-planner-reviewer` (`needed: false` でも同じ)
- `BLOCKED` → `sync_points` が無い、Layout の分節単位が説明順と合わない (差し戻し候補を書く)
- `rollback_candidates`: `speaker-track-designer`、`slide-layout-planner`
