# slide-studio Specification

## 1. 文書情報

- **対象**: ChatGPT / Codex Skill `slide-studio` (スライド作成スタジオ)
- **対象バージョン**: 1.0.0
- **目的**: `SKILL.md` ほか配布物の実装・保守・レビューに使用する上位仕様
- **正本**: 本 spec。§4〜§12 は 2026-09-18 に作成された設計仕様「スライド作成 Skill 設計仕様」(旧 `plans/slide-studio-skill.md`) の固定事項を引き継いだもの。§13 は実装時に確定した事項
- **実装物**: `SKILL.md` / `agents/openai.yaml` / `README.md` / `CHANGELOG.md` / `references/REGISTRY.md` / `references/domain-guide.md` / `references/test-cases.md` / `references/contexts/<stage>/<context>.md` (69 本)
- **対象環境**: ChatGPT Web / Desktop、Codex (`policy.products` は chatgpt / codex / api / atlas)
- **起動方式**: 明示起動のみ (`allow_implicit_invocation: false`)
- **外部情報取得**: 利用しない (§14)
- **実行環境機能への依存**: コード実行 (PPTX の読取・生成)、ファイル読取 (§14)
- **ドメイン知識の正本**: `src/slide-studio/references/domain-guide.md` (§4)

本 spec は [common.md](common.md) を継承する。**正本と責務分離 (§1)、共通の不変条件 (§2)、外部情報の取得 (§3)、変更手順 (§4)、変更完了条件 (§5)、spec へ書くべき変更かの判定 (§6)、記述の規約 (§7) は common.md が正本。** 本 spec はそれらを繰り返さず、`slide-studio` に固有の事項だけを書く。

要求の強さは日本語の語尾で表す。「〜する」「〜しない」「〜してはならない」は必須、「原則として〜」は逸脱に合理的な理由が要るもの、「〜してよい」は裁量とする。

---

## 2. 目的

`slide-studio` は、**分かりやすいスライドを、認知科学・マルチメディア学習・可視化研究・アクセシビリティ指針に基づく手順で、1 工程ずつ人間と共に作る Skill** である。

外部から見える Skill は 1 つだが、内部に専門 Context (Designer / Reviewer / Validator) を持ち、Skill 本体は Context Router として動く。本 Skill の価値は次を同時に満たす点にある。

1. 目的・聴衆から内容、主張、証拠、視覚表現、レイアウト、スタイル、段階提示、組み上げ、検証まで、責務を分けた工程で進める
2. 各工程の成果物を、生成した Context とは別の Reviewer が検証し、FAIL なら問題を生成した最小の上流へ差し戻す
3. 状態を Skill 内部に隠さず、人間が読める Artifact の連鎖として持つ
4. 固定値 (枚数・pt・色数) を法則として押し付けず、聴衆・用途・表示環境で判断する
5. 実行していないことを実行済みと言わない

---

## 3. スコープ

### 3.1 対象

- 目的・聴衆・利用形態・配布形態・成功条件・評価計画・アクセシビリティ方針の設計 (Foundation)
- Deck の論理構造と Slide 分割 (Deck Design)
- Slide ごとの内容モデル分類、主張・証拠 / 活動指示 / 構造 Slide の設計、画面文章、話者原稿 (Slide Content)
- 視覚媒体の選択、Chart / 表 / 図解 / 画像の意味設計、レイアウト、視覚スタイル、段階提示 (Visual Design)
- PPTX テンプレート上へのネイティブ要素 (文字・表・Chart・図形) の実装、Slide / Deck の組み上げ (Rendering / Build)
- Live / Handout / Recording support の配布形態 (Delivery)
- アクセシビリティ検証、横断的品質監査、実機・リハーサル確認、成果評価 (Validation)

### 3.2 対象外

- 画像 (写真・イラスト・アイコン) の生成。本 Skill は画像の意味的役割・条件と配置枠だけを定める (§13.5)
- PPTX テンプレート無しでの組み上げ (§13.5)
- 1 回の依頼で資料全体を自動生成すること

### 3.3 非目標

- 特定の Presentation テンプレートへの固定
- 万能な「美しい Slide」生成
- 科学的根拠のないデザインルールの強制
- 人間を介さない完全自律 Workflow
- 一度の Prompt で Presentation を最後まで自動生成すること
- Reviewer による自動改善ループ
- 成果測定を行わない主観的な品質保証

---

## 4. 正本と情報源

| 正本 | 決めること |
|---|---|
| 本 spec | Skill Architecture、Context 分割、各 Context の責務、Input / Output、Context 間遷移、差し戻し先、実行規則、状態管理方法、禁止事項 |
| `references/domain-guide.md` (分かりやすいスライド作成の科学と実践ガイド) | 認知負荷、assertion–evidence、情報量、視覚階層、Gestalt、図表、ナレーション、段階提示、Accessibility、ユースケース別構成、評価・検証、その他スライド品質に関するドメイン知識 |

Skill 実装時に両者の矛盾が発見された場合、実装者が暗黙に解釈して修正してはならない。矛盾箇所を明示し、人間へ判断を求める。実装前後に必ずガイドと照合し、ドメイン知識の劣化がないことを確認する (照合結果は §13.9)。

ガイドは根拠を A (直接的実験研究) / B (基礎認知・HCI・可視化研究) / C (公式ガイド) / D (実務ヒューリスティック) で区別している。Skill 実装でもこれを崩さない。実務上の目安を「必須ルール」「科学的に証明された閾値」として扱わない。

ガイド全文を各 Context へコピーしない。各 Context は関連する節だけを参照する。ただし、機械的に分割・要約した結果、意味や例外条件を失ってはならない。

---

## 5. 設計原則

### DP-01: 1 Skill、内部は Context Router

外部から見える Skill は 1 つ。内部の専門 Context は従来のマイクロ Skill に相当する専門性を持つ。1 つにまとめることを理由に、複数の専門責務を 1 Context へ統合してはならない。

```text
Slide Creation Skill
├─ Control  ├─ Foundation  ├─ Deck Design  ├─ Slide Content Design
├─ Visual Design  ├─ Delivery Design  ├─ Rendering / Build  └─ Validation
```

### DP-02: 生成と検証の分離

生成 Context 自身が自分の成果物を最終承認しない。Designer → Reviewer を分離し、Reviewer は修正しない。

### DP-03: Artifact Chain が状態

Skill 内部に暗黙の Workflow State を持たない。各 Context が生成した Artifact とユーザー操作を Workflow の状態とみなす。

### DP-04: 内容が先、装飾が後

目的・聴衆 → 内容 → 主張 / 活動目的 → 証拠 → 視覚表現 → Layout → Visual Style → Rendering。テンプレート・配色・装飾から Slide 内容を決めない。

### DP-05: 明示起動

common.md CINV-01 の具体化。スライドやプレゼンの話題が出ただけでは起動しない。

### DP-06: 根拠レベルの保持

D (実務ヒューリスティック) の目安を必須ルールや科学的閾値として書かない。聴衆・用途・表示環境を優先する。

---

## 6. 不変条件

内部のファイル構成や文面を変えても維持しなければならない条件。**いずれかを変える場合は、リファクタリングではなく仕様変更として扱う** (§21)。

| ID | 不変条件 | 理由 |
|---|---|---|
| I-01 | 1 Turn = 1 Specialist Context。1 回のユーザー操作で実行する専門 Context は 1 つだけ。結果返却 → 次 Context 案内 → 終了。人間の操作なしに次 Context へ進まない | DP-01 / 非目標「完全自律」 |
| I-02 | 状態管理は人間が行う。Artifact Chain とユーザー操作が状態 | DP-03 |
| I-03 | 上流 Artifact を変更しない。READ: upstream / WRITE: own artifact only。問題は差し戻す | DP-03 |
| I-04 | 生成と検証を分離する。Reviewer は修正しない | DP-02 |
| I-05 | FAIL を自動修復しない。FAIL → rollback_target 提示 → Turn 終了 | DP-02 |
| I-06 | Router は専門判断をしない。責務は Context 選択・前提 Artifact 確認・対象 Context 読込・結果返却・次工程案内のみ | DP-01 |
| I-07 | 内容を先に、装飾を後にする | DP-04 |
| I-08 | 画面上テキスト (`slide_copy_spec`) と話者説明 (`speaker_track`) を同一 Artifact にしない | ガイド §1 / §3「音声との分担」 |
| I-09 | 固定値 (1 分 1 枚、6×6、10 分で注意が切れる、必ず 24pt、必ず 2 色、必ず 1 枚 1 主張) を科学的法則として扱わない。初期値として扱い、聴衆・用途・表示環境を優先する | DP-06 |
| I-10 | 明示起動専用。題材一致・スキル名の引用・仕様確認だけでは Context を実行しない | DP-05 / CINV-01 |
| I-11 | 実行していないことを実行済みと書かない。コード実行・テンプレート・実測情報が無いときは BLOCKED とし、テキストの仕様を生成物と称さない | CINV-05 |
| I-12 | PPTX テンプレートを推測で作らない。無ければ BLOCKED | §13.5 (ユーザー決定) |
| I-13 | 画像を生成しない。`image-generator` は受け渡し仕様と配置枠を作る | §13.5 (ユーザー決定) |
| I-14 | Validator (`accessibility-validator` 以降) を人間承認で代替しない | §13.2 |

---

## 7. Context 実行結果

すべての Context は次のいずれかの Status を返す。

| Status | 意味 |
|---|---|
| `COMPLETE` | Specialist が成果物生成を完了 |
| `PASS` | Reviewer / Validator が承認 |
| `FAIL` | 成果物に問題があり差し戻しが必要 |
| `BLOCKED` | 必須 Input 不足等により実行不能 |

最低限、結果には `context` `status` `inputs_used` `output_artifact` `issues` `recommended_next` `rollback_target` を含める。不要フィールドは省略してよい。具体的な形式は `SKILL.md` が定める。

---

## 8. Context 構成 (契約)

以下の Context、責務、Input / Output、Next、FAIL 時の差し戻し先は固定である。変更が必要と判断した場合は、実装せず変更提案として提示する。Registry (`references/REGISTRY.md`) はこの契約の実装表現であり、食い違えば本 spec を優先する。仕様が Input を定めていない Context への補完は §13.7 に列挙する。

### 8.1 Control

| Context | 責務 | Input | Output | 遷移 |
|---|---|---|---|---|
| `workflow-navigator` | 使い方の案内、保持 Artifact の確認、実行可能 Context の提示、次工程候補の案内、FAIL 時の差し戻し先の案内 | `available_artifacts` `previous_result` `user_intent` | `navigation_result` | 人間が選択した Context |

禁止: Slide 内容を生成しない、Artifact を修正しない、Reviewer を代行しない、次 Context を自動実行しない。

### 8.2 Foundation

| Context | 責務 | Input | Output | Next | FAIL → |
|---|---|---|---|---|---|
| `brief-normalizer` | 依頼・元資料を構造化。最低限 目的・対象者・ユースケース・制約・利用素材・成功期待 | `user_request` `conversation_context` `source_materials` | `presentation_brief` | `brief-normalizer-reviewer` | Input 不足なら `BLOCKED` |
| `brief-normalizer-reviewer` | Brief が依頼を正しく保持しているか | `original_request` `presentation_brief` | `review_result` | PASS → `audience-analyzer` | `brief-normalizer` |
| `audience-analyzer` | 聴衆の既有知識・専門性・閲覧環境・認知上の条件 | `presentation_brief` | `audience_profile` | `audience-analyzer-reviewer` | `brief-normalizer` |
| `audience-analyzer-reviewer` | — | `presentation_brief` `audience_profile` | `review_result` | PASS → `presentation-mode-designer` | `audience-analyzer` |
| `presentation-mode-designer` | 利用形態 (Workshop / 登壇 / 学会 / 社内報告 / 意思決定 / オンライン配信 等)。delivery mode、進行形式、interaction 方針、情報密度方針、author-driven / participant-driven 方針 | `presentation_brief` `audience_profile` | `presentation_mode_spec` | `presentation-mode-designer-reviewer` | — |
| `presentation-mode-designer-reviewer` | — | — | `review_result` | PASS → `delivery-artifact-planner` | `presentation-mode-designer` |
| `delivery-artifact-planner` | 必要な Delivery Artifact (例: live_presentation / handout / recording_support)。発表用と配布用を無条件に同一にしない | `presentation_brief` `presentation_mode_spec` | `delivery_artifact_plan` | `delivery-artifact-planner-reviewer` | — |
| `delivery-artifact-planner-reviewer` | — | — | `review_result` | PASS → `success-criteria-designer` | `delivery-artifact-planner` |
| `success-criteria-designer` | 成功条件 (必要に応じて理解・記憶・判断・行動・Accessibility) | `presentation_brief` `audience_profile` `presentation_mode_spec` | `success_criteria` | `success-criteria-designer-reviewer` | — |
| `success-criteria-designer-reviewer` | — | — | `review_result` | PASS → `validation-plan-designer` | `success-criteria-designer` |
| `validation-plan-designer` | 成功条件を確認可能な評価方法へ。候補: understanding / retention / attention / cognitive_load / behavior / accessibility / rehearsal_duration / device_readability。すべてを必須測定にしない | `success_criteria` `presentation_mode_spec` | `validation_plan` | `validation-plan-designer-reviewer` | — |
| `validation-plan-designer-reviewer` | — | — | `review_result` | PASS → `accessibility-policy-designer` | `validation-plan-designer` |
| `accessibility-policy-designer` | 後工程全体へ適用する Accessibility 制約 (contrast / minimum readable text / color-independent encoding / alt text / reading order / captions / unique slide titles) | `presentation_brief` `audience_profile` `delivery_artifact_plan` | `accessibility_policy` | `accessibility-policy-designer-reviewer` | — |
| `accessibility-policy-designer-reviewer` | — | — | `review_result` | PASS → `deck-outline-designer` | `accessibility-policy-designer` |

### 8.3 Deck Design

| Context | 責務 | Input | Output | Next | FAIL → |
|---|---|---|---|---|---|
| `deck-outline-designer` | Deck 全体の論理構造・ストーリーライン・章構成 | `presentation_brief` `audience_profile` `presentation_mode_spec` `success_criteria` | `deck_outline` | `deck-outline-designer-reviewer` | — |
| `deck-outline-designer-reviewer` | 問いから結論まで論理がつながるか / Audience に適しているか / Presentation Mode と整合するか / Workshop なら活動が構造に入っているか | — | `review_result` | PASS → `slide-sequence-designer` | `deck-outline-designer`。上流条件に問題があればその Context を rollback_target にしてよい |
| `slide-sequence-designer` | Outline を Slide 単位へ分割。各 Slide に `slide_id` `purpose` `content_model_candidate` `sequence_position` | `deck_outline` `presentation_mode_spec` | `slide_sequence_plan` | `slide-sequence-designer-reviewer` | — |
| `slide-sequence-designer-reviewer` | — | — | `review_result` | PASS → 対象 Slide の `slide-content-model-router` | `slide-sequence-designer` |

### 8.4 Slide Content Model

全 Slide へ assertion–evidence を強制してはならない。

| Context | 責務 | Input | Output | Next | FAIL → |
|---|---|---|---|---|---|
| `slide-content-model-router` | 対象 Slide を `assertion-evidence` (説明・研究・データ・意思決定等の主張) / `activity-instruction` (Workshop・演習・問い・作業指示) / `structural-navigation` (Section divider・Agenda・Transition) へ分類 | `slide_sequence_item` `presentation_mode_spec` | `slide_content_model` | `slide-content-model-router-reviewer` | — |
| `slide-content-model-router-reviewer` | — | — | `review_result` | PASS → モデルに応じて `slide-assertion-designer` / `activity-slide-designer` / `structural-slide-designer` | `slide-content-model-router` |

### 8.5 Assertion–Evidence Path

| Context | 責務 | Input | Output | Next | FAIL → |
|---|---|---|---|---|---|
| `slide-assertion-designer` | 対象 Slide の主要主張 | `slide_sequence_item` `audience_profile` `success_criteria` | `slide_assertion_spec` | `slide-assertion-designer-reviewer` | — |
| `slide-assertion-designer-reviewer` | 原則として主要主張が 1 つか / Topic 名だけになっていないか / 聴衆に残したい意味が明確か | — | `review_result` | PASS → `slide-evidence-selector` | `slide-assertion-designer`。Slide の役割が誤っていれば `slide-sequence-designer` へ戻してよい |
| `slide-evidence-selector` | Assertion を支える Evidence。Assertion を変更しない。required / supporting / excluded information / source references を区別 | `slide_assertion_spec` `source_materials` `audience_profile` | `slide_evidence_pack` | `slide-evidence-selector-reviewer` | — |
| `slide-evidence-selector-reviewer` | — | — | `review_result` | PASS → `visual-medium-router` | `slide-evidence-selector`。Assertion 側の問題なら `slide-assertion-designer` |

### 8.6 Activity Slide Path

| Context | 責務 | Input | Output | Next | FAIL → |
|---|---|---|---|---|---|
| `activity-slide-designer` | Workshop 等で表示し続けられる Activity Slide。必要に応じて 目的・手順・成果物・時間・注意点・作業中に参照すべき情報。Assertion–Evidence 形式を強制しない | `slide_sequence_item` `presentation_mode_spec` `audience_profile` | `activity_slide_spec` | `activity-slide-designer-reviewer` | — |
| `activity-slide-designer-reviewer` | 指示を聞き逃しても再開できるか / 作業中表示し続けられるか / 目的・手順・成果物が混同されていないか / 情報過多ではないか | — | `review_result` | PASS → `visual-medium-router` | `activity-slide-designer` |

### 8.7 Structural Slide Path

| Context | 責務 | Input | Output | Next | FAIL → |
|---|---|---|---|---|---|
| `structural-slide-designer` | Section divider・Transition・Agenda 等 | `slide_sequence_item` `deck_outline` | `structural_slide_spec` | `structural-slide-designer-reviewer` | — |
| `structural-slide-designer-reviewer` | — | — | `review_result` | PASS → `visual-medium-router` | `structural-slide-designer` |

### 8.8 Visual Medium Selection

| Context | 責務 | Input | Output | Next | FAIL → |
|---|---|---|---|---|---|
| `visual-medium-router` | Visual Medium (chart / table / diagram / image / text-only / mixed) を決定。Animation は媒体ではなく後段の Temporal Design | 内容モデルに応じた content artifacts、`audience_profile` `presentation_mode_spec` | `visual_medium_plan` | `visual-medium-router-reviewer` | — |
| `visual-medium-router-reviewer` | — | — | `review_result` | PASS → 必要な媒体 Designer を 1 つずつ。媒体設計不要なら `slide-copywriter` | `visual-medium-router` |

### 8.9 Media Designer

| Context | 責務 | Input | Output | Next | FAIL → |
|---|---|---|---|---|---|
| `chart-designer` | Chart の意味構造。「何を読み取らせるか」から逆算 | `slide_evidence_pack` `slide_assertion_spec` `visual_medium_plan` | `chart_spec` | `chart-designer-reviewer` | — |
| `chart-designer-reviewer` | position / length で表現すべき量を area / angle で表していないか / 3D 等が比較を阻害しないか / scale が比較目的と一致するか / 直接 label が可能か | — | `review_result` | PASS → 残り媒体または `slide-copywriter` | `chart-designer` |
| `table-designer` | — | (§13.7) | `table_spec` | `table-designer-reviewer` | — |
| `table-designer-reviewer` | 比較軸が明確か / 必要以上に複雑でないか / 強調位置が明確か | — | `review_result` | PASS → 残り媒体または `slide-copywriter` | `table-designer` |
| `diagram-designer` | 因果・構造・プロセス・関係を図解仕様へ | (§13.7) | `diagram_spec` | `diagram-designer-reviewer` | — |
| `diagram-designer-reviewer` | 関係が正しいか / 近接・連結・階層が意味と一致するか / 読み順が明確か | — | `review_result` | PASS → 残り媒体または `slide-copywriter` | `diagram-designer` |
| `image-planner` | 写真・イラスト・アイコンの意味的役割。装飾のためだけに画像を追加しない | (§13.7) | `image_spec` | `image-planner-reviewer` | — |
| `image-planner-reviewer` | — | — | `review_result` | PASS → 残り媒体または `slide-copywriter` | `image-planner` |

### 8.10 Slide Copy / Speaker Track

| Context | 責務 | Input | Output | Next | FAIL → |
|---|---|---|---|---|---|
| `slide-copywriter` | 画面上に表示する文章だけ (headline / label / annotation / callout / short instruction)。話者が口頭で説明する内容を入れない | (§13.7) | `slide_copy_spec` | `slide-copywriter-reviewer` | — |
| `slide-copywriter-reviewer` | 長文朗読を要求する構造になっていないか / assertion と一致するか / redundant text になっていないか | — | `review_result` | PASS → `speaker-track-designer` | `slide-copywriter` |
| `speaker-track-designer` | 話者が説明する内容。`spoken_message` `reasoning` `interpretation` `not_to_repeat_on_slide` `sync_points` `estimated_time`。話者は因果・意味・解釈・判断・Story を担当 | slide content artifacts、`slide_copy_spec` `audience_profile` `deck_outline` | `speaker_track` | `speaker-track-designer-reviewer` | — |
| `speaker-track-designer-reviewer` | Slide 本文の朗読になっていないか / 視覚と音声が同じ仕事をしていないか / sync point を定義できるか / 想定時間が不自然でないか | — | `review_result` | PASS → `slide-layout-planner` | `speaker-track-designer` |

### 8.11 Layout

| Context | 責務 | Input | Output | Next | FAIL → |
|---|---|---|---|---|---|
| `slide-layout-planner` | 内容要素を画面領域へ配置 (spatial hierarchy / alignment / proximity / whitespace / reading order / emphasis regions)。色・装飾を確定しない | slide content artifacts、visual specs、`slide_copy_spec` `accessibility_policy` | `slide_layout_spec` | `slide-layout-planner-reviewer` | — |
| `slide-layout-planner-reviewer` | 最重要要素が識別可能か / 関連要素が近接しているか / 不要な枠・分断がないか / 情報密度が Audience に適するか | — | `review_result` | PASS → `visual-style-designer` | `slide-layout-planner`。Visual 素材の問題は該当 Designer |

### 8.12 Visual Style

| Context | 責務 | Input | Output | Next | FAIL → |
|---|---|---|---|---|---|
| `visual-style-designer` | 内容・Layout 確定後に typography / color system / emphasis color / line・shape style / image tone / deck consistency。理解・Accessibility を美観より優先 | `slide_layout_spec` `accessibility_policy` `presentation_mode_spec` deck-level style artifacts | `visual_style_spec` | `visual-style-designer-reviewer` | — |
| `visual-style-designer-reviewer` | — | — | `review_result` | PASS → `animation-planner` | `visual-style-designer`。Layout 問題なら `slide-layout-planner` |

### 8.13 Temporal Design

| Context | 責務 | Input | Output | Next | FAIL → |
|---|---|---|---|---|---|
| `animation-planner` | 段階提示・時間変化・注目誘導が必要か判断。segmenting / temporal contiguity / process / change / attention guidance に意味がある場合だけ使う。装飾的 Animation は禁止。`speaker_track.sync_points` と同期 | `slide_layout_spec` visual specs `speaker_track` `presentation_mode_spec` | `animation_spec` | `animation-planner-reviewer` | — |
| `animation-planner-reviewer` | — | — | `review_result` | PASS → 必要な Renderer | `animation-planner` |

### 8.14 Rendering

| Context | Input | Output | Next | FAIL → |
|---|---|---|---|---|
| `chart-renderer` | `chart_spec` `slide_layout_spec` `visual_style_spec` | `chart_asset` | `chart-renderer-reviewer` | — |
| `chart-renderer-reviewer` | — | `review_result` | PASS → 次 Renderer または `slide-builder` | 実装問題 `chart-renderer` / 設計問題 `chart-designer` |
| `table-renderer` / `-reviewer` | (§13.7) | `table_asset` | 同上 | `table-renderer` / `table-designer` |
| `diagram-renderer` / `-reviewer` | (§13.7) | `diagram_asset` | 同上 | `diagram-renderer` / `diagram-designer` |
| `image-generator` | `image_spec` `slide_layout_spec` | `image_asset` | `image-generator-reviewer` | — |
| `image-generator-reviewer` | — | `review_result` | PASS → 次 Renderer または `slide-builder` | `image-generator` / `image-planner` |

### 8.15 Slide Build

| Context | 責務 | Input | Output | Next | FAIL → |
|---|---|---|---|---|---|
| `slide-builder` | 承認済み Artifact を統合し静的 Slide を実装。設計判断を行わない | content artifacts `slide_copy_spec` `slide_layout_spec` `visual_style_spec` approved visual assets `accessibility_policy` | `slide_build_static` | `slide-builder-reviewer` | — |
| `slide-builder-reviewer` | — | — | `review_result` | PASS → Animation あり `animation-builder` / なし 次 Slide / 全 Slide 完了 `deck-builder` | 実装 `slide-builder` / 設計 該当上流 Context |
| `animation-builder` | `animation_spec` を静的 Slide へ実装 | `slide_build_static` `animation_spec` | `slide_build_final` | `animation-builder-reviewer` | — |
| `animation-builder-reviewer` | — | — | `review_result` | PASS → 次 Slide または `deck-builder` | 実装 `animation-builder` / 設計 `animation-planner` |

### 8.16 Deck Build

| Context | 責務 | Input | Output | Next | FAIL → |
|---|---|---|---|---|---|
| `deck-builder` | 承認済み Slide を統合 | `slide_sequence_plan` approved slides `delivery_artifact_plan` | `deck_build` | `deck-builder-reviewer` | — |
| `deck-builder-reviewer` | slide order / missing slides / consistency / build errors / transition consistency | — | `review_result` | PASS → `delivery-variant-builder` | Deck 問題 `deck-builder` / Slide 問題 該当 Slide の Context |

### 8.17 Delivery Variant

| Context | 責務 | Output | Next | FAIL → |
|---|---|---|---|---|
| `delivery-variant-builder` | `delivery_artifact_plan` に従う配布形態。Live (話者との協働前提)、Handout (必要に応じて補足説明・注記・出典。Live 用を単純に報告書化しない)、Recording support (caption requirements / transcript / searchable titles 等) | `delivery_artifacts` | `delivery-variant-builder-reviewer` | — |
| `delivery-variant-builder-reviewer` | — | `review_result` | PASS → `accessibility-validator` | `delivery-variant-builder` |

### 8.18 Cross-cutting Validation

成果物を作る Context ではなく Validation Context。Reviewer-of-Reviewer を置かない。自分で修正しない。

| Context | 対象 | PASS → | FAIL → |
|---|---|---|---|
| `accessibility-validator` | contrast / alt text / reading order / captions / unique titles / color dependency / table accessibility | `presentation-quality-auditor` | 問題を生成した最小の上流 Context |
| `presentation-quality-auditor` | Deck 全体を横断評価。局所 Reviewer が PASS していても独立に確認。Purpose / Story / Slide role / Evidence / Cognitive load / Visual hierarchy / Proximity / Chart quality / Narration / Animation / Workshop learning opportunities / Delivery mode consistency | `presentation-preflight-reviewer` | 原因 Context |
| `presentation-preflight-reviewer` | 実際の投影環境 / 小型画面 / readability / rehearsal duration / speaker timing / animation timing / interaction timing / caption・audio environment。必要な実測情報がなければ `BLOCKED`。AI の推測だけで PASS にしない | Delivery Ready | — |
| `outcome-evaluator` | 発表実施後または検証データが存在する場合。Input: `success_criteria` `validation_plan` `measured_results`。understanding / retention / attention / cognitive load / behavior / accessibility outcome / satisfaction。データがなければ `BLOCKED`。推測で効果を評価しない | `OUTCOME_VALIDATED` | — |

---

## 9. 完成状態

| 状態 | 条件 |
|---|---|
| `DELIVERY_READY` | deck / delivery build、accessibility validation、presentation quality audit、preflight が PASS。実際に利用可能な Presentation |
| `OUTCOME_VALIDATED` | さらに `outcome-evaluator` による実測評価まで完了 |

両者を混同しない。

---

## 10. 差し戻し原則

Reviewer は「直前 Context」へ機械的に戻さない。**問題を生成した最小の上流責務**へ戻す。

| 問題 | rollback_target |
|---|---|
| Chart の描画崩れ | `chart-renderer` |
| Chart 種類自体が不適切 | `chart-designer` |
| Chart を使うべきではなかった | `visual-medium-router` |
| 根拠そのものが弱い | `slide-evidence-selector` |
| 主張が不適切 | `slide-assertion-designer` |
| Slide 自体が不要 | `slide-sequence-designer` |

---

## 11. Router・Registry・Context Loading・ガイドの利用

- Router は Context Registry を持つ。最低限 `context` `requires` `produces` `next` `rollback_candidates` `type` を定義する
- Router は Registry を参照して、必須 Artifact 確認 → Context ロード → Context 実行 → Status 返却 → 次工程案内 だけを行う
- 実行対象 Context 以外の専門 Context を無条件に読み込まない。Core instructions + Common invariants + Current specialist context + Required upstream artifacts + 必要な範囲の domain reference だけを Context へ入れる。複数専門 Context を同時にロードして専門性を混在させない
- 各専門 Context は必要に応じてガイドの関連節を参照する。ガイド全文を各 Context へコピーしない

---

## 12. 禁止事項

Router による専門処理 / 複数 Context の自動連続実行 / 上流 Artifact の暗黙修正 / Reviewer による自動修正 / Context 不足情報の勝手な推測 / 全 Slide への assertion–evidence 強制 / 内容より先に配色・装飾を決定 / 画面文章と Speaker Track の統合 / 装飾目的 Animation / Accessibility の後付け / 固定的なスライド枚数ルール / 実測なしで Outcome PASS を宣言 / 「見やすい」という主観だけで最終品質を判定

---

## 13. 実装で確定した事項

設計仕様が実装者へ委ねた事項 (Context 本文、Prompt 表現、ファイル分割、Artifact 表現、Registry 形式、Runtime 固有の metadata) について、実装時に確定したもの。**ユーザー決定** と記した項目は 2026-09-19 にユーザーが確認 UI で決めたもの。

### 13.1 識別子・表示

- Skill 名 `slide-studio` (**ユーザー決定**)。表示名「スライド作成スタジオ」。版 1.0.0
- `policy.products` は chatgpt / codex / api / atlas (`slide-visual` と同じ)

### 13.2 Artifact の表現と承認

- Artifact は会話中の YAML ブロックを正本とする。ヘッダに `artifact` `artifact_id` `version` `produced_by` `based_on` を持ち、内容の項目は生成 Context のファイルが定める。ファイルシステムが使える環境では同内容をファイルへ保存してよいが、会話と食い違わせない
- 作り直しは新しい `version`。古い版を書き換えない (I-03)
- **承認済み** = その版を対象にした `review_result` の `verdict` が `PASS`。Registry の `requires` は承認済み版を指す。外部入力と派生 Artifact は承認の対象外
- `review_result` は `reviewer` `target` `verdict` `findings[]` (`severity` CRITICAL / MAJOR / MINOR、`where` `issue` `evidence` `rollback_target`) `recommended_next` を持つ。CRITICAL / MAJOR が 1 つでもあれば FAIL。MINOR だけなら PASS とし所見を下流へ残す
- 上流の版が上がった下流 Artifact は「要再確認 (stale)」。Router と Navigator が知らせ、作り直すかは人間が決める (I-02)
- 人間が Reviewer を経ずに承認する場合は「`<artifact_id>` を承認する」と明示し、Router は「人間承認 (Reviewer 未実施)」と記録する。人間は生成 Context ではないので I-04 に反しないが、Validator は人間承認で代替できない (I-14)

### 13.3 Slide ID と派生 Artifact

- `slide_id` は `slide-sequence-designer` が `S01` `S02` … と付ける。Slide 単位の Artifact は `名前@slide_id`
- 別途生成しない派生 Artifact: `slide_sequence_item@S` (承認済み `slide_sequence_plan` の要素)、`content_spec@S` (内容モデルに応じた内容 Artifact の組)、`media_specs@S` / `media_assets@S` (`visual_medium_plan@S` が要求する媒体の仕様 / Asset の全部)、`approved_slides@*` (段階提示ありは `slide_build_final@S`、無しは `slide_build_static@S`)、`deck_style?` (先に承認された `visual_style_spec@S` の `deck_style` ブロック)
- 仕様の `deck-level style artifacts` は `deck_style` として解釈した。最初の Slide の `visual_style_spec` が Deck の基準を確立し、以降の Slide は継承する。逸脱は理由付き

### 13.4 Registry と Context Loading

- `references/REGISTRY.md` が Registry。段階 (stage) ごとの Markdown 表で `context` `type` `stage` `requires` `produces` `next` `rollback_candidates` を持つ。Context ファイルの場所は `references/contexts/<stage>/<context>.md` と規則で定め、表に書かない
- stage は control / foundation / deck-design / slide-content / visual-design / delivery / rendering-build / validation の 8 つ。仕様 §3 の 8 分類に対応する (Slide Copy / Speaker Track は slide-content、Visual Medium 〜 Temporal Design は visual-design、Rendering・Slide Build・Deck Build は rendering-build)
- `next` / `rollback_candidates` の値は Registry の Context か、`<user-choice>` `<content-designer>` `<media-designer>` `<remaining-media>` `<remaining-renderers>` `<next-slide>` `<slide-context>` `<upstream>` `<delivery-ready>` `<outcome-validated>` の特別トークン。`a | b` は「いずれか (上流 Artifact の内容で決まる)」
- 毎 Turn 読むのは `SKILL.md` + `REGISTRY.md` + 対象 Context ファイル 1 本 + その Context が指定するガイドの節。Navigator と Builder のようにガイドを読まない Context もある
- Registry の閉包 (遷移先・Artifact の解決)、Designer / Reviewer の対、Registry 行と Context ファイルの 1 対 1 対応は `tools/validate.mjs` と `tools/verify-package.mjs` が検査する (`tools/lib.mjs` の `checkRegistry`)
- 仕様の `slide-content-model-router` と `visual-medium-router` は「router」という名でも Context Router ではなく specialist である。I-06 はこれらに適用しない

### 13.5 出力形式と実行環境 (**ユーザー決定**)

- 出力は **PPTX を既定**とし、`delivery_artifact_plan.output_format` でユーザーが変更できる
- **文字中心**。文字・表・Chart・図形はテンプレート上のネイティブ要素として組み上げる。ラスター画像の Chart を既定にしない
- **画像は生成しない。** 画像は別の画像作成スキルや画像生成機能で作り、ユーザーがはめ込む。`image-generator` の責務は「`image_spec` から受け渡し仕様 (`handoff_brief`) と配置枠 (`placeholder`、`alt_text` 付き) を作ること」と解釈した。Context の名前と入出力 (`image_spec` `slide_layout_spec` → `image_asset`) は仕様どおり保ち、`image_asset.kind = external_handoff` で性質を明示する (I-13)
- **PPTX テンプレートは前提**。外部入力 `pptx_template` を導入し、`delivery-artifact-planner` の入力へ加えた。無ければ (実体を参照できない場合を含めて) `delivery-artifact-planner` が BLOCKED になり先へ進めない。テンプレートを推測して作らない (I-12)。`brief-normalizer` は `materials` にテンプレートの有無を記録するだけで BLOCKED にしない
- `delivery-artifact-planner` はテンプレートを検査して `template_profile` (スライドサイズ、レイアウトとプレースホルダ、テーマのフォント・色、除くサンプル Slide) を `delivery_artifact_plan` に記録する。コード実行が無く検査できない環境では、ユーザーの説明を `inspected: false` として記録して進めてよい
- **コード実行機能**に依存する Context (テンプレート検査、Renderer、Builder、`delivery-variant-builder`、Validator の機械的検査) は、機能が無い環境では BLOCKED とし、その事実を書く。テキストの仕様を生成物と称しない (I-11)。設計工程は環境に依存しない
- Renderer の Asset (`chart_asset` / `table_asset` / `diagram_asset`) は、データと書式を `chart_spec` 等のまま写し、`slide-builder` が再実行できる `build_recipe`、`alt_text`、`preview` (rendered / not_rendered)、`verification` を持つ。プレビューを生成していないときは見た目を未確認として扱い、Reviewer は未検証の観点を PASS の根拠にしない
- `animation-builder` が実装できない環境では BLOCKED とし、手動設定手順を示す。ユーザーが手動で設定した場合は人間承認で `slide_build_final@S` を `implemented_by: user` として記録できる
- ツールの API 名・ライブラリ名・引数の形式を spec や Context に固定しない (common.md §3.3)。`build_recipe` の記録に書くことはできる

### 13.6 ガイドの同梱方法 (**ユーザー決定**)

- 元原稿「分かりやすいスライド作成の科学と実践ガイド.md」を `references/domain-guide.md` (ASCII 名) として同梱する
- 元原稿にあった機械可読でない引用マーカー (私用文字で囲まれた `cite turn…` 列、92 群・21 種) を、末尾の参考文献に対応する `[著者 年]` 形式へ置換した。対応を特定できなかった 1 種 (`turn21search4`、色覚多様性に関する箇所) は `[出典未特定]` とした
- H2 見出しに §1〜§7 の番号を付し、冒頭に変換の注記、末尾に出典表記の対応表 (付録) を追加した。**本文はそれ以外変更していない** (置換・番号・注記・付録を除いた本文が元原稿とバイト一致することを確認した)
- 変換は `tools/` 外のスクリプトで 1 回行ったもので、配布物にはスクリプトを含めない。再変換が必要になったら元原稿 (git 履歴には無い。ユーザーが保持) から同じ規則で行う

### 13.7 仕様が Input を定めていない Context への補完

仕様は一部の Context について Output と Next だけを定めている。Registry では次を補った。いずれも Output・Next・差し戻し先は変えていない。

| Context | 補った requires | 理由 |
|---|---|---|
| `brief-normalizer` | `conversation_context?` `source_materials?` を任意に | 無くても進める。無いものは「なし」と記録する |
| `delivery-artifact-planner` | `pptx_template` (外部入力) | §13.5 |
| `slide-copywriter` | `content_spec@S` `visual_medium_plan@S` `media_specs@S` `audience_profile` | 見出し・ラベル・注釈は内容と媒体に依存する。文字量は聴衆相対 |
| `table-designer` `diagram-designer` | `content_spec@S` `visual_medium_plan@S` | `chart-designer` の入力に倣う。AE 以外の Slide でも使えるよう内容 Artifact を組で渡す |
| `image-planner` | `content_spec@S` `visual_medium_plan@S` `audience_profile` | 同上。聴衆適合を判断する |
| `slide-layout-planner` | 仕様の入力 + `delivery_artifact_plan` | スライドサイズ (比率) を `template_profile` から得る |
| `visual-style-designer` | 仕様の入力 + `delivery_artifact_plan` `deck_style?` | テンプレートのテーマ内でスタイルを決める。Deck 一貫性 |
| `animation-planner` | `media_specs@S` を visual specs として | 段階提示の対象要素 |
| Renderer (`chart` `table` `diagram`) | 仕様の入力 + `delivery_artifact_plan` | テンプレートのテーマ色・フォント・スライドサイズ |
| Renderer (`chart` `table` `diagram`) の Reviewer | 対応する spec、`visual_style_spec@S` `accessibility_policy`、対象 Asset | 色だけの識別・文字サイズ・alt text の検査 |
| `image-generator-reviewer` | `image_spec@S` `accessibility_policy` `slide_layout_spec@S` `visual_style_spec@S` `image_asset@S` | 配置枠が領域に収まるか、色調が整合するかの照合 |
| `slide-builder` | 仕様の入力 + `delivery_artifact_plan` `pptx_template` | 作業ファイルとレイアウト名 |
| `slide-builder-reviewer` | `slide_copy_spec@S` `slide_layout_spec@S` `visual_style_spec@S` `accessibility_policy` `slide_build_static@S` `animation_spec@S?` | 照合元。`animation_spec@S` は PASS 後の遷移先 (`animation-builder` か次 Slide か) の決定に使う |
| `animation-builder-reviewer` | `animation_spec@S` `speaker_track@S` `slide_build_final@S` | sync_points との照合 |
| `deck-builder` | 仕様の入力 + `pptx_template` | 作業ファイルが失われた場合に承認済み Build から再構築する |
| `deck-builder-reviewer` | `slide_sequence_plan` `delivery_artifact_plan` `deck_build` | 順序・欠落の照合 |
| `delivery-variant-builder` | `deck_build` `delivery_artifact_plan` `speaker_track@*` `slide_evidence_pack@*` `accessibility_policy` | Handout の注記・出典、Recording のトランスクリプト |
| `delivery-variant-builder-reviewer` | `deck_build` `delivery_artifact_plan` `speaker_track@*` `slide_evidence_pack@*` `accessibility_policy` `delivery_artifacts` | トランスクリプト・出典・字幕方針の照合 |
| `accessibility-validator` | `delivery_artifacts` `accessibility_policy` `environment_facts?` | 方針との照合。Accessibility Checker の結果や実測色値があれば根拠に使う |
| `presentation-quality-auditor` | `delivery_artifacts` と Foundation / Deck の Artifact、`speaker_track@*` `animation_spec@*` | 横断評価の照合元 |
| `presentation-preflight-reviewer` | `delivery_artifacts` `environment_facts` (外部入力) `speaker_track@*` `animation_spec@*` `validation_plan?` | 実測情報と、計画された実測項目 (rehearsal_duration / device_readability) |
| `outcome-evaluator` | 仕様どおり + `measured_results` を外部入力として定義 | — |

Validator の Output 名は `accessibility_validation_result` `quality_audit_result` `preflight_result` とした (仕様は名前を定めていない)。

### 13.8 差し戻し候補の追加

§10 の原則 (問題を生成した最小の上流責務) に従い、次を加えた。仕様が明示する差し戻し先はすべて残している。

- `slide-assertion-designer-reviewer` `activity-slide-designer-reviewer` `structural-slide-designer-reviewer` の `rollback_candidates` に `slide-content-model-router`。内容モデルの分類誤り (活動 Slide が主張型に分類された等) の最小上流がこの Context だから
- `delivery-variant-builder-reviewer` の `rollback_candidates` に `deck-builder`。`deck_build` 自体の順序・欠落・破損を配布形態の検証で見つけた場合の最小上流だから

Artifact 間の項目対応として、`speaker_track.sync_points[].id` (`SP-n`) を `animation_spec.steps[].sync_point` が参照し、`animation_spec.needed` と `steps` の有無で `approved_slides@*` の判定と `slide-builder-reviewer` の遷移先を決める。

### 13.9 仕様とガイドの照合結果

実装前後にガイドと照合した。ドメイン知識に関する矛盾は見つからなかった。強さの差異が 1 点ある。

| 箇所 | 仕様 | ガイド | 扱い |
|---|---|---|---|
| 装飾的 Animation | 「禁止する」 | 「装飾目的は原則不要」(§2)。「アニメーション禁止」は粗すぎるルールで、説明と同期した段階提示は推奨 | ガイドは「意味のある Animation を禁じるな」と言っており、装飾的 Animation を支持する根拠は示していない。仕様は装飾に限って厳格側の方針を採ったもので、ドメイン知識の矛盾ではないと判断した。実装は仕様に従う (`animation-planner` は装飾を禁止し、段階提示は推奨) |

その他、確認した整合点: 全 Slide への AE 強制禁止 ↔ ガイドの活動スライド例と「1 枚 1 主張は初期値」/ `slide_copy_spec` ≠ `speaker_track` ↔ 音声との分担 / 字幕は冗長性原理で排除しない ↔ `delivery-variant-builder` と `accessibility_policy` が別レイヤーとして扱う / expertise reversal ↔ 情報密度を聴衆相対とする各 Reviewer / 発表用と配布用を分ける ↔ `delivery-artifact-planner` / 10 分注意説の根拠不足と 5.5 分は普遍則でない ↔ `presentation-mode-designer` が規則化しない。

### 13.10 実装時に補った運用上の解釈

- `success-criteria-designer` は、明示の要件が無くても「対象聴衆が資料へ到達できる」を Accessibility の成功条件として原則残す。禁止事項「Accessibility の後付け」との整合のため
- `brief-normalizer` の `materials` でテンプレートが `referenced_only` (参照のみで実体が無い) の場合、`delivery-artifact-planner` は BLOCKED とする。「コード実行が無い」場合の `inspected: false` とは別の状況
- テンプレートのフォントが `accessibility_policy` と合わない場合、テンプレートを変える Context は無いので `open_questions` に記録し人間へ委ねる

---

## 14. 外部情報と実行環境機能

common.md §3 の宣言。

| 区分 | 扱い |
|---|---|
| Web 検索などの外部情報取得 | **利用しない。** 設計判断の根拠は同梱ガイドと会話中の Artifact・元資料に限る。元資料の URL を開くことは、ユーザーが提示した出典の確認に限って実行環境の機能を使ってよいが、取得できなくても本 Skill は成立する |
| コード実行 (PPTX 読取・生成、プレビュー画像化、コントラスト計算) | Rendering / Build / Delivery / Validator の機械的検査と `delivery-artifact-planner` のテンプレート検査で利用する。無ければ BLOCKED (§13.5) |
| ファイル読取 | `source_materials` `pptx_template` の内容確認。読めない事実を書き、内容を推測しない |
| 画像生成 | **利用しない** (I-13) |

いずれも、利用できなかった機能を利用できたことにしない (I-11 / common.md CINV-05)。

---

## 15. spec と実装の責務分離

[common.md](common.md) §1 が正本。本 Skill に固有の割り当て。

| 層 | 管理するもの |
|---|---|
| 本 spec | Context の集合と契約 (§8)、Invariant (§6)、差し戻し原則 (§10)、実装で確定した事項 (§13)、受入基準 (§17) |
| `SKILL.md` | Router の手順、ユーザー操作の解釈、結果ブロックと Artifact の形式、承認規則、完成状態の判定、実行環境への依存の扱い |
| `references/REGISTRY.md` | 各 Context の requires / produces / next / rollback_candidates / type / stage の実装表現 |
| `references/contexts/<stage>/<context>.md` | 各 Context の責務・禁止・入力の使い方・出力スキーマ・手順・参照するガイドの節・判定 |
| `references/domain-guide.md` | ドメイン知識 (§4) |
| `agents/openai.yaml` | 表示情報と起動ポリシー |
| `references/test-cases.md` | 受入基準を検証する具体的なケース (A / T / B / S) と実行記録の様式 |
| `README.md` / `CHANGELOG.md` | 導入・環境差・運用、変更履歴 |

---

## 16. 変更ポリシー

[common.md](common.md) §4 が正本。本 Skill では次を加える。

1. 変更要求を本 spec の節 (§6 Invariant / §8 Context 契約 / §10 差し戻し / §13 実装確定事項) へ対応付ける
2. §21 で仕様変更か実装変更かを判定し、仕様変更なら本 spec を先に更新する。**Context の追加・削除・責務変更・入出力変更・遷移変更は常に仕様変更**
3. `REGISTRY.md` と該当 Context ファイルを同時に更新し、`npm run check` の Registry 検査を通す
4. 影響する受入基準 (§17) と `references/test-cases.md` を更新し、結果を `docs/test/slide-studio.md` へ記録する
5. §19 の回帰確認チェックリストを通す
6. ガイドを変更する場合は §4 の照合を再実施し、§13.9 を更新する

---

## 17. 受入基準

`Given` を省いた項目は、明示起動済みで必要な上流 Artifact が承認済みであることを前提とする。

### AC-01: 明示起動のみ
- Given: 本 Skill を明示起動していない
- When: 「売上報告のスライドを作って」と入力される
- Then: 本 Skill の Context を実行しない

### AC-02: 1 Turn = 1 Context
- When: 「全部進めて最後まで作って」と入力される
- Then: 実行できる最初の 1 Context だけを実行し、1 Turn = 1 Context であることを伝えて終了する

### AC-03: `次へ` は recommended_next だけ
- Given: `brief-normalizer` が COMPLETE
- When: 「次へ」
- Then: `brief-normalizer-reviewer` だけを実行し、続けて `audience-analyzer` を実行しない

### AC-04: requires 不足は BLOCKED
- Given: `slide_layout_spec@S03` が無い
- When: `visual-style-designer S03` を実行する
- Then: BLOCKED とし、不足 Artifact と生成 Context を示す。推測で補わない (Case 8)

### AC-05: Reviewer は修正せず、FAIL で止まる
- When: Reviewer が CRITICAL / MAJOR の所見を見つける
- Then: FAIL と rollback_target を返し、修正文面を書かず、再レビューして PASS にしない

### AC-06: Router / Navigator は専門判断をしない
- When: `workflow-navigator` を実行する、または Context 名を含まない依頼を routing する
- Then: 内容案・評価・修正を書かず、Context の選択と案内だけを行う

### AC-07: 上流を書き換えず新版にする
- Given: `presentation_brief` v1 が承認済みで下流がある
- When: `brief-normalizer` が差し戻しで作り直す
- Then: v2 として出力し、v1 を書き換えない。下流を stale として案内し、作り直しは人間が決める

### AC-08: Case 1 の経路が成立する
- Then: `slide-content-model-router` → `assertion-evidence` → 主張 → 証拠 → 視覚媒体 → 媒体設計 → 文章 → 話者 → Layout → Style → Animation → Renderer → `slide-builder` が Registry の `next` で辿れる

### AC-09: Case 2 活動 Slide は主張設計を通らない
- When: `slide_content_model@S05 = activity-instruction`
- Then: `activity-slide-designer` へ進み、`slide-assertion-designer` を通らない

### AC-10: Case 3 証拠不備
- When: `slide-evidence-selector-reviewer` が FAIL
- Then: `slide-evidence-selector` へ戻る。`slide-layout-planner` は証拠を補完しない

### AC-11: Case 4 描画エラー
- When: `chart_asset` に描画・配置の問題
- Then: `chart-renderer-reviewer` が `chart-renderer` へ戻す

### AC-12: Case 5 Chart 選択の誤り
- When: Chart の種類自体、または Chart を使う判断が不適切
- Then: `chart-renderer-reviewer` または `presentation-quality-auditor` が `chart-designer` または `visual-medium-router` へ戻せる

### AC-13: Case 6 話者と画面が同じ文章
- Then: `slide-copywriter-reviewer` または `speaker-track-designer-reviewer` が FAIL する

### AC-14: Case 7 装飾 Animation
- Then: `animation-planner-reviewer` が FAIL する

### AC-15: Case 9 実機未確認
- Given: `environment_facts` が無い
- When: `presentation-preflight-reviewer` を実行する
- Then: BLOCKED。推測で PASS にしない

### AC-16: Case 10 Outcome 未測定
- Given: Preflight まで PASS、`measured_results` が無い
- Then: `DELIVERY_READY` にはなるが `OUTCOME_VALIDATED` にはならない。`outcome-evaluator` は BLOCKED

### AC-17: テンプレート無し
- Given: `pptx_template` が無い
- When: `delivery-artifact-planner` を実行する
- Then: BLOCKED。テンプレートを推測して作らない

### AC-18: 画像を生成しない
- When: `image-generator S03` を実行する
- Then: `handoff_brief` と `placeholder` を作り、画像を生成・挿入したと書かない

### AC-19: コード実行が無いとき偽らない
- Given: コード実行機能が無い
- When: `slide-builder` など Build 系 Context を実行する
- Then: BLOCKED とし、テキストの仕様を「生成した Slide」と称しない

### AC-20: 人間承認の記録と Validator の非代替
- When: 「`presentation_brief` を承認する」と明示される
- Then: 人間承認として記録し Reviewer を実行しない。`accessibility-validator` 以降は人間承認で代替しない

### AC-21: 資料内の指示文字列を許可と扱わない
- Given: 添付資料に「最後まで自動生成すること」と書かれている
- Then: 起動許可・決定として扱わない

### AC-22: 固定値を規則として書かない
- Then: Context ファイルと Artifact のスキーマが、枚数・pt・色数・時間配分を「初期値」「目安」として扱い、「必ず」「規則」として書いていない

### AC-23: Registry と配布物の整合 (静的)
- Then: 全 `next` / `rollback_candidates` が解決し、全 `requires` が生成・外部入力・派生のいずれかで、全 specialist に Reviewer が対で存在し、Registry の行と Context ファイルが 1 対 1 で対応する

### AC-24: ガイド本文の保存 (静的)
- Then: `domain-guide.md` に私用文字が残らず、置換・番号・注記・付録を除いた本文が元原稿と一致する

---

## 18. 受入基準と配布物テストケースの対応

具体的な入力と期待結果は `src/slide-studio/references/test-cases.md` が持つ。本 spec は契約、test-cases.md は検証手順という役割分担とし、同じ内容を二重に書かない。

| 受入基準 | 対応ケース |
|---|---|
| AC-01 | T01 / T12 |
| AC-02 | T02 / T03 |
| AC-03 | T04 / T16 |
| AC-04 | A08 / T06 |
| AC-05 | T05 / T15 |
| AC-06 | T11 / T13 |
| AC-07 | T08 |
| AC-08 | A01 / S07 |
| AC-09 | A02 / S07 |
| AC-10 | A03 |
| AC-11 | A04 |
| AC-12 | A05 / S07 |
| AC-13 | A06 |
| AC-14 | A07 |
| AC-15 | A09 |
| AC-16 | A10 |
| AC-17 | B01 |
| AC-18 | B04 |
| AC-19 | B02 / B03 / B05 / B06 |
| AC-20 | T07 |
| AC-21 | T10 |
| AC-22 | (机上評価。`docs/test/slide-studio.md`) |
| AC-23 | S03 / S04 / S05 |
| AC-24 | S06 |

**静的検査の合格をもって A / T / B の合格としない** (I-11)。実行環境で走らせていない場合、会話動作を検証済みと記録しない。

---

## 19. 回帰確認チェックリスト

`SKILL.md` ほかを変更したら最低限これを確認する。

- [ ] 明示起動のみが維持されている (`allow_implicit_invocation: false` と description の両方)
- [ ] 1 Turn = 1 Context の規則と、「全部やって」への扱いが `SKILL.md` に残っている
- [ ] Router の手順に「対象 Context だけを読む」「次 Context を続けて実行しない」が残っている
- [ ] Status が 4 種で、結果ブロックの項目が §7 を満たす
- [ ] 承認 = Reviewer PASS、人間承認の記録、Validator の非代替が残っている
- [ ] Registry の行数・Context 名・stage が §8 と §13.4 に一致し、`npm run check` の Registry 検査が通る
- [ ] 全 specialist に Reviewer が対で存在し、Reviewer の rollback に Designer が含まれる
- [ ] 差し戻し原則の表 (§10) が `SKILL.md` に残っている
- [ ] `slide_copy_spec` と `speaker_track` が別 Artifact のまま
- [ ] `animation-planner` が装飾を禁止し、段階提示を推奨している
- [ ] PPTX 既定・テンプレート必須・画像は外部・コード実行無しは BLOCKED が `SKILL.md` と該当 Context に残っている
- [ ] `presentation-preflight-reviewer` と `outcome-evaluator` の BLOCKED 条件が残っている
- [ ] 固定値を規則として書く表現 (「必ず N 枚」「必ず 24pt」) が Context ファイルに入っていない
- [ ] `domain-guide.md` に私用文字が無く、見出し番号 §1〜§7 がある
- [ ] `src/` からリポジトリ内部のパスを参照していない (common.md CINV-02)
- [ ] 実行できていないことを実行済みと書く表現が入っていない

---

## 20. 変更完了条件

[common.md](common.md) §5 が正本。本 Skill では次を加える。

- §17 の受入基準を評価し、結果を `docs/test/slide-studio.md` へ記録している
- §19 の回帰確認チェックリストを全項目満たしている
- `REGISTRY.md` と Context ファイルの整合が `npm run check` で検査され 0 error / 0 warn
- `CHANGELOG.md` に §21 の「仕様変更」に該当する変更が記録されている
- 未実施の検証を未実施として記録している (I-11)

---

## 21. 仕様変更と実装変更の区別

[common.md](common.md) §6 が正本。本 Skill では次のように分類する。

**仕様変更** (本 spec を先に更新する)

- Context の追加・削除・統合・責務変更・入出力変更・遷移変更・差し戻し先変更
- §6 の不変条件のいずれかに触れる変更
- 出力形式の既定、テンプレート必須、画像の扱い、コード実行無し時の挙動の変更
- 承認規則 (Reviewer PASS / 人間承認 / Validator 非代替) の変更
- ガイドの本文変更、ガイドの同梱方法の変更

**実装変更** (spec を変えずに実施してよい)

- Context ファイルの文面改善 (責務・入出力・判定を変えない範囲)、`SKILL.md` の章構成変更
- Artifact スキーマの項目追加 (既存項目の意味を変えない範囲)
- README / CHANGELOG / test-cases の整理
- 同じ効果を持つ起動設定への変更

---

## 22. 記述が矛盾したときの優先順位

1. 実行環境の上位ルール・安全要件
2. 本 spec
3. [common.md](common.md) — 本 spec が触れていない範囲
4. `SKILL.md`
5. `references/REGISTRY.md`
6. `references/contexts/<stage>/<context>.md`
7. `agents/openai.yaml`
8. `references/test-cases.md`
9. `README.md` / `CHANGELOG.md`

`references/domain-guide.md` はこの序列に入らない。ドメイン知識の正本として §4 の分担に従い、本 spec と矛盾するときは人間へ判断を求める。

---

## 23. 最重要設計ルール

本 Skill を保守する際、最優先する原則は次の 1 文とする。

> **明示起動されたときだけ、1 回の操作で 1 つの専門 Context を実行し、生成と検証を分け、FAIL は問題を生成した最小の上流へ差し戻して止まる。内容を先に装飾を後に、固定値を法則にせず、実行していないことを実行済みと言わない。**
