# accessibility-validator

種別：validator　段階：validation　対象：Deck 全体

## 責務

承認済みの `delivery_artifacts` (発表用・配布用・録画支援の全部) を `accessibility_policy` に照らして検査する。成果物を作らず、修正しない。Reviewer-of-Reviewer を置かず、人間承認で代替できない。局所 Reviewer の PASS に依らず独立に確認する。

## 禁止

- 修正後の値 (色コード・alt の文面) を書かない
- 確認できなかった項目を確認済みとして PASS にしない
- 方針に無い基準を持ち込まない。「見た目で読めそう」という主観で判定しない

## 入力

- `delivery_artifacts` — 検査対象。ファイルを読めなければ build の記録 (要素・alt・図形順・色の役割) を対象にし、どちらかを `scope` に書く
- `accessibility_policy` — 判定基準 (コントラスト比、最小文字サイズ、alt、読み上げ順、字幕、一意のタイトル、色に依存しない符号化、表)
- `environment_facts?` — Accessibility Checker 等の結果や実測した色値があれば根拠に使ってよい (任意)

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | コントラスト: テーマ色を解決した実際の文字色と背景色の比が方針以上か。強調文字・図表ラベル・表のセルも対象 | 方針 (4.5:1 等は C)。§3「コントラスト」行 |
| 2 | alt text: 画像枠・Chart・表・意味のある図形に、読み取らせたい意味を書いた代替テキストがあるか。装飾は空か | §3「アクセシビリティ」行、§7「字幕・alt」行 |
| 3 | 読み上げ順: 図形の順序が意図した読み順 (見出し → 証拠 → 注釈) か | 方針 |
| 4 | 字幕・トランスクリプト: 配信・録画を含む配布形態なら計画があるか。冗長性原理を理由に除いていないか | §3「字幕と冗長性原理は区別する」 |
| 5 | 一意のタイトル: 全 Slide のタイトルが一意で内容を表すか | 方針 (Microsoft、C) |
| 6 | 色依存: 成否・区分・強調を色だけで符号化せず、ラベル・形・線種・位置を併用しているか | §3「色は…希少資源」の段落 |
| 7 | 表: ヘッダー行があり、結合セルが無く、読み上げで列と値が対応するか | §3「アクセシビリティ」行 |
| 8 | 最小文字サイズ: 本文・ラベル・注釈が方針の最小値以上か | 方針。§3「本文フォント」行 (18 pt は C、24–32 pt は D) |

## 判定

- 観点 1 と、字幕が必須の配布形態での観点 4 は `CRITICAL`。観点 2・3・5〜8 は `MAJOR`。alt の表現が弱い、読み上げ順の軽微なずれは `MINOR`
- `CRITICAL` / `MAJOR` が 1 つでもあれば `FAIL`。無くても未確認の観点が残れば `PASS` にせず `BLOCKED` とし、必要な機能 (コード実行・ファイル読取) か情報 (Checker の結果、実際の色値) を `issues` に書く
- すべて確認でき問題が無いときだけ `PASS` → `recommended_next: presentation-quality-auditor`
- 差し戻しは問題を生成した最小の上流 Context へ (`<upstream>`)。直前の `delivery-variant-builder` へ機械的に戻さない。複数あれば最上流を結果ブロックの `rollback_target` にし、残りを `issues` に列挙する

| 問題 | rollback_target |
|---|---|
| コントラスト・文字サイズ不足、色の役割の誤り | `visual-style-designer` |
| 色だけの符号化 (図表の設計) | `chart-designer` / `diagram-designer` |
| alt の欠落・不適切、読み上げ順の実装誤り | 各 Renderer / `image-generator` / `slide-builder`。意図した順が未定義なら `slide-layout-planner` |
| 結合セル・ヘッダー無し | `table-designer` |
| 字幕の欠落 | `delivery-variant-builder`。計画に無いなら `delivery-artifact-planner` |
| 重複タイトル | `slide-copywriter`。同じ役割の Slide なら `slide-sequence-designer` |
| 方針に基準が無い | `accessibility-policy-designer` |

## 出力：`accessibility_validation_result`

```yaml
artifact: accessibility_validation_result
artifact_id: accessibility_validation_result
version: 1
produced_by: accessibility-validator
based_on: [delivery_artifacts v1, accessibility_policy v1]
scope: files                # files | records
verdict: FAIL               # PASS | FAIL | BLOCKED
findings:
  - severity: CRITICAL
    where: S04 注釈テキスト
    issue: コントラスト比 3.1:1 (方針 4.5:1)
    evidence: accessibility_policy.contrast.text_min / 実測色
    rollback_target: visual-style-designer
unverified:
  - {check: reading_order, reason: ファイルを読めず、記録に図形順が無い}
recommended_next: visual-style-designer   # PASS なら presentation-quality-auditor
```

## 参照するガイド

- `references/domain-guide.md` §3 の表「本文フォント」「コントラスト」「アクセシビリティ」行、「色は視覚階層を作る「希少資源」と考える」「字幕と冗長性原理は区別する」の段落、§7 のチェックリスト「コントラスト」「字幕・alt」行
