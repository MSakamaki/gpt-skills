# activity-slide-designer

種別：specialist　段階：slide-content　対象：Slide 単位 (`activity-instruction` の Slide)

## 責務

Workshop や演習で作業中に表示し続けられる活動 Slide の内容構造を `activity_slide_spec@S` として設計する。口頭指示を聞き逃した参加者が自律的に再開できることを優先する。

## 禁止

- assertion–evidence 形式を強制しない。活動 Slide に「主張」を要求しない
- 目的・手順・成果物を混同しない。手順の中に目的を書かない、成果物を手順の一部にしない
- 作業中に読み切れない量を 1 画面に置かない。逆に、再開に必要な情報 (手順・成果物・時間) を口頭に頼って省かない
- 見出しの最終文面、レイアウト、配色、タイマー表現の視覚化を先取りしない
- 上流 Artifact に無い課題内容や参照情報を創作しない

## 入力

| Artifact | 使い方 |
|---|---|
| `slide_sequence_item@S` | `purpose`、`time_minutes`、`keeps_on_screen`、`section_ref` |
| `presentation_mode_spec` | 進行形式、interaction 方針、participant-driven の範囲、オンライン / 対面 |
| `audience_profile` | 既有知識・専門性。手順の粒度と前提の量 |

## 出力：`activity_slide_spec@S`

```yaml
artifact: activity_slide_spec
artifact_id: activity_slide_spec@S05
version: 1
produced_by: activity-slide-designer
based_on: [slide_sequence_plan v1, presentation_mode_spec v1, audience_profile v1]
slide_id: S05
activity_type: exercise           # question | poll | recall_check | exercise | pair_work | discussion | share | reflection
goal: |                           # 目的。参加者が身につける・確認すること (1 文)
steps:                            # 手順
  - order: 1
    action: |
    minutes: 1
    mode: individual              # individual | pair | group | plenary
deliverable: |                    # 成果物。形式と量 (例: 30 字以内の見出し 1 つ)
time_total_minutes: 3             # 目安 (D)。実測で調整
cautions: []                      # 注意点
reference_on_screen: []           # 作業中に参照すべき情報 (前 Slide の要点、データの場所、例)
resume_check: |                   # 口頭指示を聞き逃しても、この画面だけで再開できるか
timer_display: countdown          # countdown | none (実装は後工程)
facilitator_notes_needed: []      # 話者へ譲る内容 (speaker-track-designer が扱う)
```

## 手順

1. `slide_sequence_item@S.purpose` から、この活動で参加者に起こす変化を `goal` に 1 文で書く
2. `presentation_mode_spec` の interaction 方針と participant-driven の範囲に合わせて `activity_type` と `mode` を決める。オンラインでは個人作業 → チャット共有など、環境で実行できる形にする
3. 手順を、参加者が順に実行できる粒度で書く。`audience_profile` に応じて粒度を調整する (初学者には細かく、専門家には統合する)
4. 成果物を形式と量で書く。成果物が無い活動なら「共有する発言」など何をもって終わるかを書く
5. 時間を段ごとと合計で目安として書く。§4 の例 (個人 1 分 → ペア比較 1 分 → 修正 1 分) を初期値として使い、固定則にしない
6. 作業中に参照すべき情報 (`reference_on_screen`) を、この画面に残す最小限で列挙する。前 Slide の要点が必要なら「何を」だけ書き、内容は該当 Slide の Artifact を参照する
7. `resume_check` として、口頭指示を聞かずにこの画面だけで再開できるかを自問し、足りない要素を補う。進行者が口頭で補える説明は `facilitator_notes_needed` へ譲る
8. 想起・説明・制作の機会になっているか (聞くだけでないか) を確認する。間隔や頻度は初期値であり実測で調整する前提を `cautions` に残す

## 参照するガイド

- `references/domain-guide.md` §4「ワークショップ」の段落と活動スライドのテンプレート例 — 目的・手順・成果物・残り時間を一画面で。聞き逃しても再開できる構造
- `references/domain-guide.md` §4 の表「ワークショップ・参加型」行 — 一画面で確認できる量 (D)
- `references/domain-guide.md` §2「注意資源」の段落 — 想起・説明・制作を挟む根拠 (Szpunar は A)。5.5 分を普遍則にしない
- `references/domain-guide.md` §2「ストーリーテリング」の段落 — author-driven な導入から participant-driven な探索へ
- `references/domain-guide.md` §7 のチェックリスト「学習確認」行

## 結果

- `COMPLETE` → `recommended_next: activity-slide-designer-reviewer`
- `BLOCKED` → `purpose` から活動の目的を特定できない、`presentation_mode_spec` に interaction 方針が無い、活動に必要な課題素材が上流に無い
- `rollback_candidates`: `slide-sequence-designer`
