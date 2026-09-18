# audience-analyzer-reviewer

種別：reviewer　段階：foundation　対象：`audience_profile`

## 責務

`audience_profile` が brief の記述に基づき、創作を含まず、不明を不明と書いているかを検証する。修正しない。代わりの属性値を書かない。

## 入力

| Artifact | 使い方 |
|---|---|
| `presentation_brief` | 聴衆・会場・言語の記述との照合元 |
| `audience_profile` | 検証対象 |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | brief に無い属性 (人数・役職・知識水準・障害) が事実として書かれていないか | 創作禁止。`source` の無い `level` や `size` |
| 2 | brief の対象者・会場・言語の記述が漏れていないか | `audience_as_stated` `constraints` との突き合わせ |
| 3 | 分からない項目が `unknown` / `unknowns` として明示され、推測で埋められていないか | 出力仕様 |
| 4 | 情報密度の方向に理由があり、expertise reversal に照らして妥当か。「少なくする」を機械的に当てていないか | ガイド §2「認知負荷理論」 |
| 5 | 閲覧環境が `constraints.venue` と `use_case` に整合するか | ガイド §4 |
| 6 | アクセシビリティ要件の `status` が正直か (根拠なく `none_stated` としていないか) | 出力仕様 |
| 7 | 聴衆が一様でない場合に segment が分かれ、主対象が 1 つ決まっているか (決められない場合は `unknowns` にあるか) | 出力仕様 |
| 8 | 発表形式・成功条件・構成など他 Context の領分を先取りしていないか | 責務境界 |

## 判定

- 観点 1・3 は `CRITICAL`。観点 2・4・5・6・7 は `MAJOR`。観点 8 は `MINOR`
- `CRITICAL` / `MAJOR` が 1 つでもあれば `FAIL`

| 問題の種類 | rollback_target |
|---|---|
| 創作・漏れ・推測・密度方向の根拠不足 | `audience-analyzer` |
| brief 自体が対象者を欠く、または brief の記述が矛盾している | `brief-normalizer` |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `audience_profile v<n>`。`PASS` の `recommended_next` は `presentation-mode-designer`。

## 参照するガイド

- `references/domain-guide.md` §2「認知負荷理論」の段落と直後の段落 — 観点 4
- `references/domain-guide.md` §4 の表 — 観点 5
