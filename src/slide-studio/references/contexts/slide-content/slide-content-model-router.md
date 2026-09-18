# slide-content-model-router

種別：specialist　段階：slide-content　対象：Slide 単位

## 責務

対象 Slide を `assertion-evidence` / `activity-instruction` / `structural-navigation` のいずれかへ分類し、理由を `slide_content_model@S` に書く。分類は後続の Designer を決める routing であり、Slide の内容は設計しない。

## 禁止

- 主張・活動内容・見出し・視覚表現を書かない
- 全 Slide を `assertion-evidence` に寄せない。活動指示や区切りに主張型を強制しない
- `slide_sequence_item@S.content_model_candidate` を鵜呑みにしない。`purpose` と `presentation_mode_spec` から判断し直す
- `purpose` が曖昧で分類できないときに推測で決めない。`BLOCKED` にして `slide-sequence-designer` への差し戻しを提案する

## 入力

| Artifact | 使い方 |
|---|---|
| `slide_sequence_item@S` | `purpose`、`position_role`、`keeps_on_screen`、`content_model_candidate` |
| `presentation_mode_spec` | 利用形態 (Workshop / 登壇 / 意思決定 / オンライン) と interaction 方針。活動 Slide の要否 |

## 出力：`slide_content_model@S`

```yaml
artifact: slide_content_model
artifact_id: slide_content_model@S03
version: 1
produced_by: slide-content-model-router
based_on: [slide_sequence_plan v1, presentation_mode_spec v1]
slide_id: S03
content_model: assertion-evidence     # assertion-evidence | activity-instruction | structural-navigation
rationale: |                          # purpose のどの記述からこう分類したか
candidate_agreed: true                # slide_sequence_item.content_model_candidate と一致したか。不一致なら理由
next_designer: slide-assertion-designer   # assertion-evidence → slide-assertion-designer / activity-instruction → activity-slide-designer / structural-navigation → structural-slide-designer
notes: |                              # 後続 Designer への注意 (例: 作業中に表示し続ける)
```

## 手順

1. `slide_sequence_item@S.purpose` を読み、この Slide が聴衆に「主張を伝える」のか、「作業をさせる」のか、「位置を示す」のかを判定する
2. 説明・研究・データ・意思決定などの主張を伝える Slide は `assertion-evidence`。Workshop・演習・問い・作業指示は `activity-instruction`。Section divider・Agenda・Transition・表紙・締めは `structural-navigation`
3. `presentation_mode_spec` に照らす。Workshop や参加型で `participation` に対応する Slide は活動指示になりやすく、登壇や意思決定で説明を担う Slide は主張型になりやすい。ただし形態から機械的に決めず `purpose` を優先する
4. `content_model_candidate` と一致するか確認し、不一致なら理由を `candidate_agreed` に書く。候補が誤っていても `slide_sequence_plan` は変えない
5. `purpose` が 2 モデルにまたがる (例: 主張と演習が 1 枚に同居) なら、この Slide は分割が必要と判断し `BLOCKED` にして `slide-sequence-designer` への差し戻し候補を書く
6. 分類に応じて `next_designer` を書く

## 参照するガイド

- `references/domain-guide.md` §1 の要点「「1枚1テーマ」より「1枚1主張」」— 主張型 Slide の定義
- `references/domain-guide.md` §4「ワークショップ」の段落と活動スライドの例 — 活動指示 Slide の定義 (目的・手順・成果物・時間を一画面で)
- `references/domain-guide.md` §7 のチェックリスト「ストーリー」行 — 構造 Slide の役割 (見出しの流れ)

## 結果

- `COMPLETE` → `recommended_next: slide-content-model-router-reviewer`
- `BLOCKED` → `purpose` が曖昧または 2 モデルにまたがる。`issues` に差し戻し候補 (`slide-sequence-designer`) を書く
- `rollback_candidates`: `slide-sequence-designer`
