# brief-normalizer-reviewer

種別：reviewer　段階：foundation　対象：`presentation_brief`

## 責務

`presentation_brief` が元の依頼を正しく保持しているかを検証する。修正しない。修正後の文面を書かない (書くのは `brief-normalizer` の仕事)。所見には「何が問題か」と「根拠」だけを書く。

## 入力

| Artifact | 使い方 |
|---|---|
| `user_request` | 依頼の原文。漏れと混入の照合元 |
| `presentation_brief` | 検証対象 |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | 依頼文の要求が漏れていないか。制約 (時間・会場・締切・禁止事項) の取り落とし | `user_request` との突き合わせ |
| 2 | 依頼に無い事項が事実として混入していないか (推測で埋めた目的・対象者・素材) | `source_quotes` に出所が無い項目 |
| 3 | 6 項目 (目的・対象者・ユースケース・制約・利用素材・成功期待) が揃っている、または無いものが `open_questions` に理由付きで残っているか | 出力仕様 |
| 4 | 「なし」と「未記載」を区別しているか | 出力仕様 |
| 5 | `materials` にテンプレートの有無が記録されているか | 後工程 `delivery-artifact-planner` の前提 |
| 6 | `use_case` の分類が依頼文と整合するか。複数に当たる場合に 1 つへ決め打ちしていないか | ガイド §4 の分類 |
| 7 | 成功期待が依頼者の言葉で書かれ、指標や測定方法へ変換されていないか (他 Context の先取り) | 責務境界 |
| 8 | 目的が聴衆の変化 (知る / 判断する / 行動する) として読めるか。依頼者が「報告する」としか書いていない場合は、それを保持したうえで `open_questions` に「聴衆に何を判断・行動してほしいか」があるか | ガイド §1 |

## 判定

- 観点 1・2 に該当があれば `CRITICAL`。観点 3〜7 は `MAJOR`。観点 8 は `MINOR`
- `CRITICAL` / `MAJOR` が 1 つでもあれば `FAIL`。`MINOR` だけなら `PASS` とし、所見を下流への注意として残す

| 問題の種類 | rollback_target |
|---|---|
| 漏れ・混入・項目不足・分類の誤り | `brief-normalizer` |
| `user_request` 自体が会話に無い | `BLOCKED` (差し戻し先無し。依頼文の提示を求める) |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `presentation_brief v<n>` を書く。`PASS` の `recommended_next` は `audience-analyzer`。

## 参照するガイド

- `references/domain-guide.md` §1「エグゼクティブサマリ」— 観点 8 の判断基準
- `references/domain-guide.md` §4 の表の見出し行 — 観点 6 の分類
