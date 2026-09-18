# slide-studio — 受入基準の評価

[docs/spec/slide-studio.md](../spec/slide-studio.md) §17 受入基準 (AC-01〜31) の評価結果。

**評価の性質**: これは `SKILL.md` ほか配布物の記述が spec の要求を満たすかを読み合わせた**机上評価**と、Registry・ガイド・ZIP に対する**静的検査**の結果であり、ChatGPT / Codex 上で実際に走らせた結果ではない。判定 `PASS` は「spec の要求に対応する指示が配布物に存在する (静的検査項目は機械的に確認できた)」という意味で、**実行時にそのとおり振る舞うことを保証しない** (spec I-11 / common.md CINV-05)。本番環境での確認は別途必要。

評価日: 2026-09-19 / 対象: `src/slide-studio/` v1.2.0 (`dist/slide-studio/skill.zip` sha256 `7eadf43361912053fa88d647f67aef7d308c0baae10e216f460d75b1cac0b1b2`、78 ファイル、展開時 448.1KB、ZIP 215.6KB)

v1.0.0 の評価は同日に行い、AC-01〜24 が PASS だった。その後の実地検証で 3 件の問題が見つかり、v1.1.0 で是正した。ターン末の案内はさらに v1.2.0 で選択式へ変えた (下の「実地検証で見つかった問題」)。本書は v1.2.0 に対する再評価である。

---

## 受入基準

| ID | 判定 | 配布物の根拠 |
|---|---|---|
| AC-01 明示起動のみ | PASS | `SKILL.md` frontmatter「明示起動専用。…スライドの話題が出ただけ、スキル名の引用・仕様確認・レビューだけでは起動しない」+「起動と継続」節 + `agents/openai.yaml` `allow_implicit_invocation: false` |
| AC-02 1 Turn = 1 Context | PASS | `SKILL.md` I-01 +「ユーザー操作の解釈」表「全部やって」行 (実行できる最初の 1 Context だけを実行) + Router の手順 7「次の Context を続けて実行しない」 |
| AC-03 `次へ` は recommended_next だけ | PASS | 「ユーザー操作の解釈」表「`次へ`」行 + Router の手順 7 |
| AC-04 requires 不足は BLOCKED | PASS | Router の手順 4「満たされなければ BLOCKED を返して終了する。不足を推測で補わない」+ Registry `visual-style-designer` の requires に `slide_layout_spec@S` (経路検査 Case 8 = true) |
| AC-05 Reviewer は修正せず FAIL で止まる | PASS | `SKILL.md` I-04 / I-05 + `review_result` 形式 (CRITICAL / MAJOR で FAIL、`rollback_target` 必須) + 全 Reviewer ファイルの責務「修正しない。代わりの…を書かない」 |
| AC-06 Router / Navigator は専門判断をしない | PASS | `SKILL.md` I-06 +「Router がやってはならないこと」+ `contexts/control/workflow-navigator.md` 禁止 (内容を生成しない・評価しない) |
| AC-07 上流を書き換えず新版にする | PASS | `SKILL.md`「Artifact の表現と承認」(作り直しは version を増やす、古い版を書き換えない、下流は要再確認) + `workflow-navigator.md` 手順 1 (`stale` の印) |
| AC-08 Case 1 の経路が成立する | PASS | Registry の `next` 連鎖で `slide-content-model-router` → … → `slide-builder-reviewer` の 23 辺がすべて解決 (経路検査 Case 1 = true) |
| AC-09 Case 2 活動 Slide は主張設計を通らない | PASS | `slide-content-model-router-reviewer.next` に `activity-slide-designer` があり、活動経路の到達集合 (次 Slide への遷移を除く) に `slide-assertion-designer` が含まれない (経路検査 Case 2) |
| AC-10 Case 3 証拠不備 | PASS | `slide-evidence-selector-reviewer.rollback_candidates[0] = slide-evidence-selector` + `slide-layout-planner.md` 禁止「文章・媒体の内容を変えない」+ requires に `content_spec@S` (承認済み証拠が無ければ BLOCKED) |
| AC-11 Case 4 描画エラー | PASS | `chart-renderer-reviewer.md` 判定表「描画・書式・配置・記録の実装問題 → `chart-renderer`」 |
| AC-12 Case 5 Chart 選択の誤り | PASS | Registry `chart-renderer-reviewer.rollback_candidates = chart-renderer, chart-designer, visual-medium-router` + `presentation-quality-auditor.md` 判定表「図表の種類が不適切 / 図表を使うべきでなかった → `chart-designer` / `visual-medium-router`」 |
| AC-13 Case 6 話者と画面が同じ文章 | PASS | `slide-copywriter-reviewer.md` 観点 4 (Redundant text、MAJOR) + `speaker-track-designer-reviewer.md` 観点 1 (朗読化、CRITICAL) |
| AC-14 Case 7 装飾 Animation | PASS | `animation-planner-reviewer.md` 観点 2 CRITICAL「装飾 Animation は FAIL」+ `animation-planner.md` 禁止 |
| AC-15 Case 9 実機未確認 | PASS | `presentation-preflight-reviewer.md` 判定「`environment_facts` が無い → BLOCKED。AI の推測だけで PASS にしない」+ Registry requires `environment_facts` (必須) |
| AC-16 Case 10 Outcome 未測定 | PASS | `SKILL.md`「完成状態」表 + `outcome-evaluator.md` 判定 (測定データ無しは BLOCKED) + `workflow-navigator.md` 手順 6「DELIVERY_READY を OUTCOME_VALIDATED と書かない」 |
| AC-17 テンプレート無し | PASS | Registry `delivery-artifact-planner` requires `pptx_template` + `delivery-artifact-planner.md` 手順 1・結果 BLOCKED + `SKILL.md`「実行環境への依存」表 |
| AC-18 画像を生成しない | PASS | `image-generator.md` 責務「本スキルは画像を生成しない」・`kind: external_handoff`・禁止「生成した…と書かない」+ `SKILL.md`「目的と範囲」対象外 |
| AC-19 コード実行が無いとき偽らない | PASS | `SKILL.md`「実行環境への依存」表 + `slide-builder.md` 手順 8、`chart-renderer.md` 手順 7、`deck-builder.md` 手順 7、`delivery-variant-builder.md` 手順 6 (BLOCKED とし、テキストの仕様を生成物と称しない) |
| AC-20 人間承認の記録と Validator の非代替 | PASS | `SKILL.md`「Artifact の表現と承認」(人間承認は「人間承認 (Reviewer 未実施)」と記録、Validator は人間承認で代替できない) +「ユーザー操作の解釈」承認行 |
| AC-21 資料内の指示文字列を許可と扱わない | PASS | `SKILL.md`「起動と継続」最終段落 |
| AC-22 固定値を規則として書かない | PASS | `SKILL.md` I-09 + 全 Context ファイルを「必ず N 枚 / pt / 色 / 文字 / 分」で検索して該当なし。枚数・pt は「初期値 (D)」「目安」として記述 (`slide-sequence-designer.md` 禁止、`accessibility-policy-designer.md` `evidence_levels`) |
| AC-23 Registry と配布物の整合 (静的) | PASS | `npm run check` (validate / verify-package) の Registry 検査: 69 Context (specialist 32 / reviewer 32 / validator 4 / navigator 1)、外部入力 6、派生 6、特別遷移 10、0 error |
| AC-24 ガイド本文の保存 (静的) | PASS | 変換スクリプトの照合: 置換 92 群・見出し番号 7 件・冒頭注記・付録を除いた本文が元原稿とバイト一致。私用文字の残存 0 |
| AC-25 成果物の声を作業の記録へ適用しない | PASS | `SKILL.md`「作業言語と成果物の声」の表 + I-15 + `brief-normalizer.md` 禁止「依頼のトーン・表記の指定に本 Artifact の書き方を合わせない」+ `audience-analyzer.md` 禁止 + 両 Reviewer の観点 (CRITICAL) |
| AC-26 成果物の声を聴衆が読む文字列へ適用する | PASS | `brief-normalizer.md` の `deliverable_voice` スキーマ + `slide-copywriter` / `speaker-track-designer` / `activity-slide-designer` / `delivery-variant-builder` の出力スキーマの `[成果物の声]` 印と適用手順 + 各 Reviewer の観点 |
| AC-27 各ターンが選択式で次の操作を示して終わる | PASS | `SKILL.md`「次にすること (毎ターン必須)」の形式節 (`A` から始まる記号、推奨は `A`、末尾に `9`、答え方の 1 行) + I-16 + Router の手順 7 +「Router がやってはならないこと」に省略の禁止 + `workflow-navigator.md` の案内節 |
| AC-28 止まった理由と解き方を示す | PASS | `SKILL.md`「FAIL のとき」「BLOCKED のとき」の規則と例 (所見を選択肢より先に、渡す操作を `A` にしてよい) + `workflow-navigator.md`「止まっている工程があるときは、その原因を作業の言葉で 1 行にする」 |
| AC-29 選択肢に 4 観点を書く | PASS | `SKILL.md`「説明の深さ」の表と、行数で決めない旨・初出は厚く再出は薄く・30 行超は `9` へ回す規定 + `SAMPLES.md` が初出と再出で厚みを変えた例を持つ |
| AC-30 記号の解釈が安定している | PASS | `SKILL.md`「回答の解釈」の表 (`A`/`a`/`Ａ`、`9`、`0`、自由入力、提示が無いときの裸の記号) +「実行前に何を選んだと解釈したかを 1 行返す」+「ユーザー操作の解釈」表の記号 3 行 + `SAMPLES.md` §5 |
| AC-31 継承元の変更を検出できる | PASS | `tools/check-spec-contracts.mjs` + spec §13.14 の契約依存の表 + `guided-clarification.md` のマーカー。継承元を 1 箇所変更して ERROR と実際のハッシュが出ることを実行して確認した |

31 件すべて PASS。**spec の要求に対して配布物へ加えるべき不足は見つからなかった。** 読み合わせで見つけた Registry と Context ファイルの不整合 (Reviewer が requires 外で読んでいた Artifact、`sync_points` の id、項目名の対応) は spec §13.7 / §13.8 へ記録したうえで是正済み。

---

## 実地検証で見つかった問題

ChatGPT 上で v1.0.0 を走らせて見つかった 3 件と、その是正を読み直して見つけた 1 件。いずれも spec を先に更新してから実装へ反映した。F-01〜F-03 は v1.1.0、F-04 は v1.2.0 で是正している。

| # | 観測された振る舞い | 原因 | 是正 |
|---|---|---|---|
| F-01 | 「対象者は幼稚園児、トーンは明るく楽しくひらがなで」と依頼したところ、`audience_profile` の分析文までひらがなになり、作業の記録が読みにくくなった | 成果物のトーン指定と作業の記述に境界が無かった。`presentation_brief` は `constraints.language` しか持たず、トーン・表記・読解水準の置き場が無かった | DP-07 / I-15 を追加。`deliverable_voice` を `presentation_brief` へ追加し、適用先を「聴衆が読む・聞く文字列」に限定。Context の出力スキーマへ `[成果物の声]` の印を付け、8 つの Context と 6 つの Reviewer に規定と観点を追加 (spec §13.11) |
| F-02 | `次へ` で工程が切り替わったとき、現在の状況は出るが「利用者が何をすればよいか」「何が問題か」「何ができるか」が案内されず作業が止まった | 結果ブロックは `recommended_next` を持つが、それは Context 名であって操作ではない。ターン末に利用者向けの案内を置く規定が無かった | DP-08 / I-16 を追加。結果ブロックの直後に「次にすること」を必須化し、形式・規則・`FAIL` と `BLOCKED` の書き方を `SKILL.md` に規定。`workflow-navigator` の案内も操作へ翻訳する形へ変更 (spec §13.12) |
| F-03 | 操作の型が文章の規定だけでは伝わらなかった | 実物のターンの並びを示す資料が無かった | `SAMPLES.md` を追加。通しの進行と、FAIL・BLOCKED・状況確認・人間承認・言語分離・内容モデルの分岐を実物の形で示す。実行時には読まない (spec §13.13) |
| F-04 | 1 行の案内でも、利用者は操作を自分で組み立てる必要があった | 操作を列挙するだけで、選ばせる形になっていなかった | ターン末を選択式へ変更 (v1.2.0)。記号はアルファベットにして Slide 番号との衝突を避け、`0` は使わず、`9` で深掘りし、各選択肢に 4 観点を書く。`guided-clarification` とは継承ではなく参照として整理し、継承元の変更を検出する仕組みを入れた (spec §13.12 / §13.14) |

F-01・F-02・F-04 は spec §6 の不変条件と §7 の出力形式に関わるため、実装だけの変更ではなく仕様変更として扱った。

---

## 静的検査の結果 (test-cases.md S01〜S12)

| ID | 結果 | 方法 |
|---|---|---|
| S01 YAML と識別子 | PASS | `npm run check` (name / description / display_name / フォルダ名) |
| S02 起動ポリシー | PASS | `npm run check` (`allow_implicit_invocation` が真偽値 false)。description に題材一致の起動条件なし |
| S03 Registry の閉包 | PASS | `npm run check` (`tools/lib.mjs` `checkRegistry`) |
| S04 Designer / Reviewer の対 | PASS | 同上 (I-04 / I-05 の構造検査) |
| S05 Context ファイル | PASS | 同上 (69 行 ↔ 69 ファイル、見出し・種別の一致) |
| S06 ドメインガイド | PASS | 変換時の照合スクリプト (本文一致 true、私用文字 0、H2 番号 7) |
| S07 受入テストの遷移 | PASS | Registry を辿る検査スクリプト (Case 1 / 2 / 3 / 5 / 8 / 9 / 10 / B01) |
| S08 配布 ZIP | PASS | `npm run check` の verify-package (ZIP 内の Registry 検査・内部参照 235 件・SKILL.md 1 つ) |
| S09 言語分離の記述 | PASS | `SKILL.md` の表と I-15、`brief-normalizer` の `deliverable_voice`、`[成果物の声]` の印を 4 つの Context の出力スキーマで確認 |
| S10 案内の記述 | PASS | `SKILL.md`「次にすること (毎ターン必須)」の形式・説明の深さ・回答の解釈、Router の手順 7、`workflow-navigator.md` の案内節 |
| S11 SAMPLES.md | PASS | 使用している Context 名が Registry に存在。Artifact 名・Status・遷移が Registry と一致。全 13 の案内が `A` から始まり `9` で終わる |
| S12 契約依存 | PASS | `npm run check` の spec-contracts。定義 1・宣言 2 で一致。継承元を変更すると 2 件の ERROR が出ることを実行して確認した |

---

## 回帰確認チェックリスト (spec §19)

- [x] 明示起動のみが維持されている — `agents/openai.yaml` / frontmatter
- [x] 1 Turn = 1 Context の規則と「全部やって」への扱いが `SKILL.md` に残っている
- [x] Router の手順に「対象 Context だけを読む」「次 Context を続けて実行しない」が残っている
- [x] Status が 4 種で、結果ブロックの項目が spec §7 を満たす
- [x] 承認 = Reviewer PASS、人間承認の記録、Validator の非代替が残っている
- [x] Registry の行数・Context 名・stage が spec §8 / §13.4 に一致し、`npm run check` の Registry 検査が通る
- [x] 全 specialist に Reviewer が対で存在し、Reviewer の rollback に Designer が含まれる (`checkRegistry`)
- [x] 差し戻し原則の表が `SKILL.md` に残っている
- [x] `slide_copy_spec` と `speaker_track` が別 Artifact のまま
- [x] `animation-planner` が装飾を禁止し、段階提示を推奨している
- [x] PPTX 既定・テンプレート必須・画像は外部・コード実行無しは BLOCKED が `SKILL.md` と該当 Context に残っている
- [x] `presentation-preflight-reviewer` と `outcome-evaluator` の BLOCKED 条件が残っている
- [x] 固定値を規則として書く表現が Context ファイルに入っていない (検索で該当なし)
- [x] `domain-guide.md` に私用文字が無く、見出し番号 §1〜§7 がある
- [x] `src/` からリポジトリ内部のパスを参照していない — 内部参照 81 件はすべて `references/` `agents/` `assets/` と README / CHANGELOG
- [x] 実行できていないことを実行済みと書く表現が入っていない — 各 Renderer / Builder の `preview: not_rendered` と `verification`、README「検証状況」、CHANGELOG「検証の区別」
- [x] 作業言語と成果物の声の分離が `SKILL.md` と spec §13.11 の表の各 Context に残っている
- [x] `deliverable_voice` が `brief-normalizer` の出力スキーマにあり、適用先の Context が `[成果物の声]` の印を持つ
- [x] 選択式の「次にすること」が `SKILL.md` の結果形式と Router の手順に残っている
- [x] 選択肢の記号がアルファベットで、`0` を使わず、`9` の意味が変わっていない
- [x] 4 観点の規定が残り、行数による下限が入っていない
- [x] 実行前に解釈を 1 行返す規定が残っている
- [x] §13.14 の契約依存が `npm run check` で照合され、共通と書いた 5 項目が継承元でまだ成立している
- [x] `SAMPLES.md` の例が `SKILL.md` / `REGISTRY.md` / Context ファイルと矛盾しない

---

## 未実施の検証

| 対象 | 状態 | 理由 |
|---|---|---|
| `references/test-cases.md` A01〜A10 (受入テストの会話動作) | **未実施** | ChatGPT / Codex 上での実地確認が必要。机上評価と Registry の経路検査は「指示と遷移が書かれていること」までしか担保しない |
| 同 T01〜T16 (Router と Turn) | **未実施** | 同上。特に「全部やって」で 1 Context に留まるか、`次へ` で 1 つだけ進むかは実行環境で確認する |
| 同 B01〜B09 (Build と実行環境) | **未実施** | PPTX テンプレートとコード実行のある環境で、実ファイルの生成・BLOCKED の挙動・プレビュー未生成時の記録を確認する |
| 同 L01〜L07 (言語とトーン) | **未実施** | v1.1.0 の是正が実行時に効くかは再検証が必要。F-01 を再現する入力 (幼稚園児・ひらがな) で `audience_profile` が作業言語のままか確認する |
| 同 N01〜N15 (ターン末の案内) | **未実施** | F-02 と F-04 を再現する操作で、選択式の案内が出るか、記号 1 文字で進めるか、`9` と `0` が規定どおりかを確認する |
| Progressive Loading | **未実施** | `SKILL.md` から `REGISTRY.md` と Context ファイル 1 本だけが読み込まれるか。毎 Turn の読込量は `SKILL.md` 22.2KB + `REGISTRY.md` 22.3KB + Context 2.4〜6.4KB + ガイドの指定節 |
| 同 S01〜S08 (静的検査) | 実施 | 上表 |

**静的検査の結果を A / T / B / L / N の合格として報告しない** (spec §18)。v1.1.0 の是正は記述の追加であり、実行時にそのとおり振る舞うことは確認していない。

---

## 運用上の注意 (評価時に気づいたこと)

- Context ファイル 69 本のうち 12 本が 5KB を超える (最大 6.4KB `presentation-quality-auditor.md`)。実行時に読むのは 1 本なので読込量への影響は小さいが、肥大化させない
- `SKILL.md` (22.2KB) と `REGISTRY.md` (22.3KB) は毎 Turn 読む。v1.1.0 で `SKILL.md` が 3.8KB 増えた。検証の WARN は 40KB なので余地はあるが、規定を足すときは読込量も見る
- `SAMPLES.md` (17.5KB) は実行時に読まない。読み込ませる規定を足さない
- 秘密情報スキャンは、Artifact 参照 `名前@S<nn>.項目` をメールアドレスから除外する規則を持つ (`tools/scan-secrets.mjs` `ARTIFACT_REF`、自己テストに見本あり)

---

## 再評価の手順

`SKILL.md` ほかを変更したら、本書の AC 表を読み直して根拠列が成立するかを確認する。根拠にしていた記述を消した場合は判定を下げ、spec 側と突き合わせる。Registry や Context を変更したときは `npm run check` の Registry 検査に加え、S07 の経路検査 (Case 1 / 2 / 5 / 8 / 9 / 10) と S11 (SAMPLES の Context 名) を再実行して結果を更新する。spec §17 に受入基準を追加したときは、本書と `references/test-cases.md` の対応 (spec §18) も更新する。

実地検証で新たな問題が見つかったら、「実地検証で見つかった問題」の表へ追記し、spec のどの節を変えたかを残す。**実装だけを直して表を更新しない。**
