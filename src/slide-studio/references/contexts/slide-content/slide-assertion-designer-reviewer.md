# slide-assertion-designer-reviewer

種別：reviewer　段階：slide-content　対象：`slide_assertion_spec@S`

## 責務

主要主張が 1 つで、トピック名ではなく、聴衆に残したい意味が明確かを検証する。修正しない。代わりの主張文を書かない。

## 入力

| Artifact | 使い方 |
|---|---|
| `slide_sequence_item@S` | Slide の `purpose` と位置との整合 |
| `audience_profile` | 用語と前提知識の適合 |
| `success_criteria` | 寄与の確認 |
| `slide_assertion_spec@S` | 検証対象 |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | 主要主張が原則 1 つか。複数の結論が 1 文に詰め込まれていないか | ガイド §1 要点、§3「見出し」行。1 枚 1 主張は初期値だが、複数主張は分割候補 |
| 2 | トピック名だけになっていないか (「〜について」「〜の推移」「結果」) | ガイド §6 の表「タイトル」行 |
| 3 | `takeaway` が「知る / 判断する / 行動する」で書かれ、聴衆に残したい意味が明確か | ガイド §7 の「目的」チェック |
| 4 | `slide_sequence_item@S.purpose` と一致し、Deck の因果チェーン上の位置に合うか | ガイド §2 因果チェーン |
| 5 | `success_criteria` のどれかに寄与するか。寄与しないなら Slide 自体の役割を疑う | `supports_success_criteria` |
| 6 | `audience_profile` の既有知識・専門性に合うか (専門用語の前提、条件の有無) | ガイド §2 expertise reversal |
| 7 | 上流 Artifact に無い数値・固有の事実を主張に書いていないか | I-03 / 推測禁止 |
| 8 | 証拠の選択・見出し文面・話者説明・視覚表現など他 Context の領分を先取りしていないか | 責務境界 |
| 9 | 内容モデルが `assertion-evidence` で正しいか。実際は活動指示や区切りの Slide ではないか | `slide_content_model@S` |

## 判定

- 観点 2・4・7 は `CRITICAL`。観点 1・3・5・6・9 は `MAJOR`。観点 8 は `MINOR` (先取りした部分は下流が無視すればよい)
- `CRITICAL` / `MAJOR` が 1 つでもあれば `FAIL`

| 問題の種類 | rollback_target |
|---|---|
| 主張の書き方 (複数主張、トピック名、意味不明確、聴衆不適合、根拠のない事実) | `slide-assertion-designer` |
| Slide そのものの役割が誤っている (この位置に不要、別の Slide と重複、成功条件に寄与しない) | `slide-sequence-designer` |
| 内容モデルの分類が誤っている (活動指示や構造 Slide が主張型に分類された) | `slide-content-model-router` |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `slide_assertion_spec@S<nn> v<n>`。`PASS` の `recommended_next` は `slide-evidence-selector`。

## 参照するガイド

- `references/domain-guide.md` §1 の要点「「1枚1テーマ」より「1枚1主張」」
- `references/domain-guide.md` §3 の表「見出し」行、および「24 pt、2色、1枚1主張などは目的ではなく…初期値」の段落
- `references/domain-guide.md` §6 の表「タイトル」行
- `references/domain-guide.md` §7 のチェックリスト「目的」「1枚の役割」行
