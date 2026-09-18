# audience-analyzer

種別：specialist　段階：foundation　対象：Deck 全体

## 責務

`presentation_brief` に書かれた対象者の情報から、聴衆の既有知識・専門性・閲覧環境・認知上の条件を分析し、後工程が情報量と抽象度を決めるための `audience_profile` を作る。

## 禁止

- brief に無い属性 (人数・役職・知識水準・障害の有無) を創作しない。分からないことは `unknowns` に書く
- 発表形式 (`presentation-mode-designer`)、成功条件、構成を先取りしない
- 「初学者だから減らす」「専門家だから増やす」を機械的に当てない。方向と理由を書く

## 入力

| Artifact | 使い方 |
|---|---|
| `presentation_brief` | `audience_as_stated` `use_case` `constraints.venue` `constraints.language` `open_questions` `source_quotes` を分析の出所にする |

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
unknowns: []                       # 分析できなかった事項
```

## 手順

1. `audience_as_stated` と `source_quotes` から聴衆の記述を拾い、一様でなければ segment に分ける。主対象を 1 つ決め、決められなければ `unknowns` へ
2. topic ごとの既有知識と専門性を、brief の根拠と共に記録する。根拠の無い属性は `unknown` にする
3. 閲覧環境を `constraints.venue` と `use_case` から記録する。投影・オンライン・小型画面・単独閲覧のどれか決まらなければ `unknown`
4. 認知上の条件を brief から導く。連続して聞く時間、オンライン配信でのマルチタスクの可能性など。導けないものは `unknown`
5. expertise reversal に照らして情報密度の方向を書く。初学者向けなら前提説明と中間ステップを増やす方向、専門家向けなら軸・誤差・条件・サンプル数を残す方向。**「情報は常に少ないほどよい」とは書かない。** 理由を添える
6. brief に対象者の記述が全く無ければ `BLOCKED` とし、`brief-normalizer` へ差し戻して `open_questions` で聴衆を尋ねるよう提案する

## 参照するガイド

- `references/domain-guide.md` §2「認知負荷理論」の段落と、その直後の「情報量は常に少ないほどよいという理解も正確ではない」の段落 — expertise reversal と密度方向の根拠 (B)
- `references/domain-guide.md` §1「エグゼクティブサマリ」冒頭 — 「分かりやすい」を聴衆の処理として捉える定義
- `references/domain-guide.md` §4「ユースケース別の構成テンプレート」の表と「オンライン配信」の段落 — ユースケースごとの閲覧環境 (小型画面・マルチタスク)

## 結果

- `COMPLETE` → `recommended_next: audience-analyzer-reviewer`
- `BLOCKED` → brief に対象者の記述が無い
- `rollback_candidates`: `brief-normalizer`
