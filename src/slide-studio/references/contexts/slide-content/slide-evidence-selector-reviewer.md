# slide-evidence-selector-reviewer

種別：reviewer　段階：slide-content　対象：`slide_evidence_pack@S`

## 責務

選ばれた証拠が主張を実際に支え、元資料に辿れ、聴衆に必要な情報を落としていないかを検証する。修正しない。代わりの証拠を選び直さない。

## 入力

| Artifact | 使い方 |
|---|---|
| `slide_assertion_spec@S` | 主張と `evidence_needed` との対応 |
| `source_materials?` | 各証拠の `source_ref` を実際に照合する。無ければ照合不能として扱う |
| `audience_profile` | 残すべき情報量の適否 |
| `slide_evidence_pack@S` | 検証対象 |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | `required_evidence` が主張の各部分を実際に支えるか。主張と無関係、または主張より弱い証拠で「支えた」としていないか | `what_it_shows` と `assertion_ref` の対応 |
| 2 | 値・事例・引用が `source_materials` の `source_ref` に実在し一致するか。創作・改変が無いか | I-03 / 推測禁止。自分で照合する |
| 3 | `assertion_ref` が `slide_assertion_spec@S.assertion` と一致し、主張が変えられていないか | 責務境界 |
| 4 | `excluded_information` が意思決定・理解に必要な情報 (専門家向けの条件・誤差・n、初学者向けの前提) を落としていないか | ガイド §2 expertise reversal |
| 5 | 逆に、処理だけを要求する情報 (重複、無関係な数値) が `required_evidence` に混じっていないか | ガイド §2 Coherence、§3「情報密度」 |
| 6 | `gaps` に `required_evidence` 相当の欠落があるのに `COMPLETE` になっていないか | 出力仕様 |
| 7 | `source_references` が配布版で出典として使える形か | ガイド §4 社内報告の段落 (配布版) |
| 8 | 図表の種類・配置など後工程の判断を先取りしていないか | 責務境界 |

## 判定

- 観点 1・2・3・6 は `CRITICAL`。観点 4・5・7 は `MAJOR`。観点 8 は `MINOR`
- `CRITICAL` / `MAJOR` が 1 つでもあれば `FAIL`。`source_materials` が無く照合できない場合、観点 2 は「照合不能」として `MAJOR` に記録し、確認済みと書かない

| 問題の種類 | rollback_target |
|---|---|
| 証拠の選択・区分・出典記録の問題、創作、必要情報の除外 | `slide-evidence-selector` |
| 主張が元資料で支えられない、主張の粒度が証拠と合わない (主張側の問題) | `slide-assertion-designer` |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `slide_evidence_pack@S<nn> v<n>`。`PASS` の `recommended_next` は `visual-medium-router`。

## 参照するガイド

- `references/domain-guide.md` §2「認知負荷理論」「Mayer のマルチメディア学習理論」の段落
- `references/domain-guide.md` §3 の表「情報密度」行
- `references/domain-guide.md` §7 のチェックリスト「証拠」「削除」行
