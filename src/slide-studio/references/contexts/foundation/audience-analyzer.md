# audience-analyzer

種別：specialist　段階：foundation　対象：Deck 全体

## 責務

`presentation_brief` に書かれた対象者の情報から、聴衆の既有知識・専門性・閲覧環境・認知上の条件を分析し、後工程が情報量と抽象度を決めるための `audience_profile` を作る。

## 禁止

- brief に無い属性 (人数・役職・知識水準・障害の有無) を創作しない。分からないことは `unknowns` に書く
- 発表形式 (`presentation-mode-designer`)、成功条件、構成を先取りしない
- 「初学者だから減らす」「専門家だから増やす」を機械的に当てない。方向と理由を書く
- **`deliverable_voice` のトーン・表記を本 Artifact の書き方へ持ち込まない** (I-15)。「幼稚園児向けにひらがなで」とあっても、この分析は作業言語 (日本語の常体) で書く

## 入力

| Artifact | 使い方 |
|---|---|
| `presentation_brief` | `audience_as_stated` `use_case` `constraints.venue` `open_questions` `source_quotes` を分析の出所にする。`deliverable_voice` は聴衆の属性を裏づける手がかりとして読むだけで、記述の書き方には使わない |

## 出力：`audience_profile`

```yaml
artifact: audience_profile
artifact_id: audience_profile
version: 1
produced_by: audience-analyzer
based_on: [presentation_brief v1]
segments:                          # 聴衆が一様でなければ複数。主対象を primary: true
  - id: A1
    label: 事業部門の意思決定者
    primary: true
    size: null                     # brief に無ければ null
    role_and_authority: |          # 役割・決定権 (brief の記述の範囲で)
    prior_knowledge:               # topic ごとの既有知識
      - topic: 当該プロジェクトの経緯
        level: high                # none | low | mixed | high | unknown
        source: source_quotes.audience
    expertise: mixed               # novice | mixed | expert | unknown
    language: ja
viewing_environment:
  mode: projection                 # projection | online | small_screen | self_read | mixed | unknown
  notes: |
accessibility_requirements:
  known: []                        # 既知の要件
  status: unknown                  # known | none_stated | unknown
cognitive_conditions:              # brief から導ける認知上の条件
  continuous_listening_minutes: null
  multitasking_likely: unknown     # yes | no | unknown
  notes: |
information_density_direction:     # expertise reversal から導く方向
  direction: add_prerequisites     # add_prerequisites | keep_conditions_and_detail | mixed_by_segment
  rationale: |
voice_consistency:                 # deliverable_voice と聴衆分析の整合
  consistent: true                 # 矛盾する場合 (専門家向けなのに幼児語彙 など) は false と理由
  note: |
unknowns: []                       # 分析できなかった事項
```

## 手順

1. `audience_as_stated` と `source_quotes` から聴衆の記述を拾い、一様でなければ segment に分ける。主対象を 1 つ決め、決められなければ `unknowns` へ
2. topic ごとの既有知識と専門性を、brief の根拠と共に記録する。根拠の無い属性は `unknown` にする
3. 閲覧環境を `constraints.venue` と `use_case` から記録する。投影・オンライン・小型画面・単独閲覧のどれか決まらなければ `unknown`
4. 認知上の条件を brief から導く。連続して聞く時間、オンライン配信でのマルチタスクの可能性など。導けないものは `unknown`
5. expertise reversal に照らして情報密度の方向を書く。初学者向けなら前提説明と中間ステップを増やす方向、専門家向けなら軸・誤差・条件・サンプル数を残す方向。**「情報は常に少ないほどよい」とは書かない。** 理由を添える
5a. `deliverable_voice.reading_level` と `expertise` / `information_density_direction` が矛盾しないかを見て `voice_consistency` に書く。矛盾する場合は `BLOCKED` にせず `false` と理由を記録し、Reviewer の判断に委ねる
6. brief に対象者の記述が全く無ければ `BLOCKED` とし、`brief-normalizer` へ差し戻して `open_questions` で聴衆を尋ねるよう提案する

## 確認しうる論点

`unknowns` へ落とす前に、埋め方で成果物が変わる点は確認ターンで聞く (I-17)。

| 論点 | なぜ埋め方で変わるか |
|---|---|
| 聴衆の既有知識の水準 | 情報密度の方向が反転する。前提を足すのか、条件と誤差を残すのか |
| 聴衆が一様か、分かれるか | segment が 1 つか複数かで、以降すべての「誰に向けるか」が変わる |
| 閲覧環境 (投影 / オンライン / 単独閲覧) | 文字サイズの初期値、1 画面の焦点、字幕の要否が変わる |
| アクセシビリティの要件 | 不明のまま「無し」とすると後付けになる。方針の必須項目が変わる |

聞いても分からない事項は `unknowns` に残す。**「分からない」も有効な回答である。** 推論で埋めた値を確定として書かない。

## 参照するガイド

- `references/domain-guide.md` §2「認知負荷理論」の段落と、その直後の「情報量は常に少ないほどよいという理解も正確ではない」の段落 — expertise reversal と密度方向の根拠 (B)
- `references/domain-guide.md` §1「エグゼクティブサマリ」冒頭 — 「分かりやすい」を聴衆の処理として捉える定義
- `references/domain-guide.md` §4「ユースケース別の構成テンプレート」の表と「オンライン配信」の段落 — ユースケースごとの閲覧環境 (小型画面・マルチタスク)

## 結果

- `COMPLETE` → `recommended_next: audience-analyzer-reviewer`
- `BLOCKED` → brief に対象者の記述が無い
- `rollback_candidates`: `brief-normalizer`
