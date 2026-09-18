# validation-plan-designer-reviewer

種別：reviewer　段階：foundation　対象：`validation_plan`

## 責務

`validation_plan` が成功条件を確認できる方法へ変換され、測れないものを測れると書かず、過剰でも不足でもないかを検証する。修正しない。

## 入力

| Artifact | 使い方 |
|---|---|
| `success_criteria` | 条件と測定の対応 |
| `presentation_mode_spec` | 形式で実施できる方法か |
| `validation_plan` | 検証対象 |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | `must` の条件すべてに測定が対応する、または `not_measured` に理由があるか | 出力仕様 |
| 2 | 指標が条件の区分と合っているか (判断の条件を満足度で測っていないか) | ガイド §5 表 |
| 3 | 注意の測定 (視線・probe・ログ) を理解の測定として扱っていないか。理解テストと組み合わせているか | ガイド §5「視線＝理解とみなしてはいけない」 |
| 4 | 代理指標 (離脱率など) に `proxy: true` が付いているか | ガイド §5 |
| 5 | 方法が形式で実施できるか (オンラインで eye tracker 前提になっていないか、5 分の役員報告に週後の遅延テストを必須にしていないか) | `presentation_mode_spec` |
| 6 | A/B があるなら統制 (話者・台本・時間・情報内容) と効果量の記録があるか | ガイド §5「推奨するA/B実験例」 |
| 7 | 固定値 (問題数・間隔) を規則として書いていないか。目安と書かれているか | I-09 |
| 8 | 目的に不要な指標まで必須にしていないか | ガイド §5 |
| 9 | 発表前の実測項目 (リハーサル時間・可読性) が `delivery_readiness_checks` にあるか | preflight の前提 |

## 判定

- 観点 1・3 は `CRITICAL`。観点 2・4・5・6・7 は `MAJOR`。観点 8・9 は `MINOR`
- `CRITICAL` / `MAJOR` が 1 つでもあれば `FAIL`

| 問題の種類 | rollback_target |
|---|---|
| 対応漏れ・指標の取り違え・混同・実施不能・過剰 | `validation-plan-designer` |
| 成功条件自体が測定できない形で書かれている | `success-criteria-designer` |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `validation_plan v<n>`。`PASS` の `recommended_next` は `accessibility-policy-designer`。

## 参照するガイド

- `references/domain-guide.md` §5 の表と「推奨するA/B実験例」以降の段落 — 観点 2・6
- `references/domain-guide.md` §5「注意を測る際、視線＝理解とみなしてはいけない」の段落と次の段落 — 観点 3・4
