# delivery-variant-builder-reviewer

種別：reviewer　段階：delivery　対象：`delivery_artifacts`

## 責務

`delivery_artifacts` が `delivery_artifact_plan` の配布形態を揃え、Live と Handout を正しく分け、上流 Artifact の内容を改変・創作せずに反映しているかを検証する。修正しない。

## 入力

| Artifact | 使い方 |
|---|---|
| `deck_build` | Live 本文の照合元 |
| `delivery_artifact_plan` | 形態 (`variants`) と各形態の方針の照合元 |
| `delivery_artifacts` | 検証対象 (`files` `verification`) |
| `speaker_track@*` | トランスクリプト・ノート・補足の照合元 |
| `slide_evidence_pack@*` | Handout の出典の照合元 |
| `accessibility_policy` | 字幕方針との整合 |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | `files[].variant` が `delivery_artifact_plan.variants` と一致するか。無い形態を作っていないか、必要な形態を省いていないか | 計画どおり |
| 2 | Live の本文が `deck_build` と一致するか (`live_body_unchanged` を信用せず照合)。話者原稿が本文に入っていないか | I-03、I-08 |
| 3 | Handout が Live と別ファイルで、出典・注記・補足が追加されているか。逆に Live 用を単純に報告書化 (本文を文章で埋める) していないか | ガイド §4「社内報告」段落 |
| 4 | Handout の出典が `slide_evidence_pack@S.source_references` と一致し、補足が `speaker_track@S` に由来するか。創作した出典・注記が無いか | 推測・創作の禁止 |
| 5 | トランスクリプトが `speaker_track@*.spoken_message` と Slide 順に一致するか。`searchable_titles` が Deck の見出しと一致し一意か | ガイド §4「オンライン配信」段落 |
| 6 | 字幕要件が `accessibility_policy` の字幕方針と整合するか。字幕を「冗長」として省いていないか | ガイド §3「字幕と冗長性原理は区別する」 |
| 7 | ノートへの転記が計画の方針どおりか (求められていないのに転記、求められているのに未転記) | `delivery_artifact_plan` |
| 8 | `verification` と `download` が正直か。ファイルを作っていないのに作ったと書いていないか | 実行していないことを書かない |

## 判定

- 観点 1・2・4・8 は `CRITICAL`。観点 3・5〜7 は `MAJOR`
- `CRITICAL` / `MAJOR` が 1 つでもあれば `FAIL`。`MINOR` だけなら `PASS`

| 問題の種類 | rollback_target |
|---|---|
| 形態の欠落・本文改変・出典の不一致・トランスクリプトの不一致・記録の問題 | `delivery-variant-builder` |
| `deck_build` 自体の問題 (順序・欠落・破損)。本来は `deck-builder-reviewer` が検出するもの | `deck-builder` |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `delivery_artifacts v<n>`。`PASS` の `recommended_next` は `accessibility-validator`。

## 参照するガイド

- `references/domain-guide.md` §3「字幕と冗長性原理は区別する」の段落
- `references/domain-guide.md` §4「社内報告」段落 (発表用と配布用を分ける) と「オンライン配信」段落 (字幕・トランスクリプト・検索可能なタイトル)
