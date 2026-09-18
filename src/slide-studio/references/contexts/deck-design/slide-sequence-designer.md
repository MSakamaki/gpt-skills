# slide-sequence-designer

種別：specialist　段階：deck-design　対象：Deck 全体

## 責務

承認済みの `deck_outline` を Slide 単位へ分割し、各 Slide の目的・内容モデル候補・順序を `slide_sequence_plan` として定める。Slide の内容そのものは設計しない。

## 禁止

- 主張の文面、証拠の選択、見出し、視覚表現を先取りしない
- 1 枚に複数の結論を置かない。逆に、1 つの結論を根拠なく細切れにしない
- 枚数を「1 分 1 枚」などの固定値から機械的に決めない。§4 の枚数はリハーサル前の初期値 (D)
- 区切り (Section divider / Agenda / Transition) を増やして枚数を埋めない
- `deck_outline` の章・message を変えない。分割できない章があれば `BLOCKED` にして `deck-outline-designer` への差し戻しを提案する

## 入力

| Artifact | 使い方 |
|---|---|
| `deck_outline` | 章・message・参加機会・時間配分・つなぎ。分割の元 |
| `presentation_mode_spec` | 情報密度方針、進行形式 (活動 Slide の要否、画面更新の頻度) |

## 出力：`slide_sequence_plan`

```yaml
artifact: slide_sequence_plan
artifact_id: slide_sequence_plan
version: 1
produced_by: slide-sequence-designer
based_on: [deck_outline v1, presentation_mode_spec v1]
slide_count: 9                   # 結果としての枚数。初期値でありリハーサルで変わる
count_rationale: |               # 章数・情報密度方針・時間から導いた理由。固定則を根拠にしない
slides:
  - slide_id: S01                # S01 から連番。以降の全 Artifact がこの ID を使う
    section_ref: SEC-1
    purpose: |                   # この 1 枚が聴衆に起こす変化 (1 文)
    content_model_candidate: assertion-evidence   # assertion-evidence | activity-instruction | structural-navigation (確定は slide-content-model-router)
    sequence_position: 1
    position_role: opening       # opening | body | activity | check | divider | closing
    time_minutes: 1              # 目安 (D)
    density_note: |              # 情報密度方針に基づく注意 (例: 専門家向けに条件・n を残す)
    keeps_on_screen: false       # 作業中に表示し続ける Slide か
    depends_on: []               # 先に見せておく必要がある Slide
backup_slides: []                # 質疑用など本編に含めない Slide
open_questions: []
```

## 手順

1. `deck_outline.sections` を順に読み、章ごとに「聴衆に残したい変化」を数える。1 つの変化 = 1 Slide を初期値とし、`purpose` を 1 文で書く。地図や系統図のように 1 枚に多くの要素が必要な内容は機械的に分割せず、`density_note` に「段階提示の候補」と書く (判断は後工程)
2. `content_model_candidate` を仮に付ける。説明・研究・データ・意思決定の主張は `assertion-evidence`、演習・問い・作業指示は `activity-instruction`、区切り・Agenda・Transition は `structural-navigation`。確定は `slide-content-model-router`
3. `presentation_mode_spec` の情報密度方針を `density_note` へ写す。専門家向けでは軸・誤差・条件・n を残す Slide が、初学者向けでは前提や中間ステップの Slide が増える
4. Workshop では `deck_outline.participation` に対応する活動 Slide を必ず置き、作業中に表示し続ける Slide を `keeps_on_screen: true` にする
5. 構造 Slide は聴衆が位置を失う箇所にだけ置く。章ごとに機械的に区切りを挟まない
6. `deck_outline.time_share_minutes` を Slide へ目安として配分する。§4 の枚数表は照らし合わせるだけで、合わせるために内容を増減しない。大きく外れるなら `count_rationale` に理由を書く
7. `slide_id` を `S01` から連番で付け、順序は `deck_outline.transitions` に従う。先に見せる必要がある Slide を `depends_on` に書く
8. 分割できない章、message が複数の結論を含む章があれば `BLOCKED` とし、`deck-outline-designer` への差し戻し候補と理由を書く

## 参照するガイド

- `references/domain-guide.md` §4 の冒頭段落と枚数表 — 枚数は「リハーサル前の初期値」(D)。「1 枚に 1 メッセージ」を優先する
- `references/domain-guide.md` §3 の表「情報密度」行と「24 pt、2色、1枚1主張などは目的ではなく…初期値」の段落 — 多要素 Slide を機械的に分割しない
- `references/domain-guide.md` §2「認知負荷理論」の段落 — 情報量は聴衆相対
- `references/domain-guide.md` §4「ワークショップ」の段落と活動スライドの例 — 活動 Slide の配置と表示し続ける要件
- `references/domain-guide.md` §7 のチェックリスト「1枚の役割」「時間」行

## 結果

- `COMPLETE` → `recommended_next: slide-sequence-designer-reviewer`
- `BLOCKED` → 章の message が複数の結論を含み分割の基準を決められない、`presentation_mode_spec` の情報密度方針が無い
- `rollback_candidates`: `deck-outline-designer`
