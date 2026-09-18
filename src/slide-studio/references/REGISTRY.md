# Context Registry

Router が毎ターン参照する Context の一覧。**Context の追加・削除・責務変更・入出力変更・遷移変更は仕様変更**であり、この表だけを書き換えてはならない。各 Context の実行手順は `references/contexts/` 配下の `<stage>/<context>.md` にある (stage 列がディレクトリ名)。

## 記法

| 記法 | 意味 |
|---|---|
| `requires` | 実行に必要な Artifact。**生成 Context の Reviewer が PASS した版 (承認済み)** を指す。外部入力と派生 Artifact は承認の対象外 |
| `a, b` | すべて必要 |
| `a \| b` | いずれか 1 つ。どれかは上流 Artifact の内容で決まる |
| `x?` | 任意。無い場合は「無し」として進める (推測で補わない) |
| `name@S` | 対象 Slide (`slide_id`) のもの。`name@*` は全 Slide 分 |
| `<token>` | 特別な遷移先。§「特別な遷移先」を参照 |

Reviewer の `produces` はすべて `review_result` で、対象 Artifact と版を `target` に記録する。

## 外部入力 (ユーザーが提供する。Context は生成しない)

| artifact | 内容 | 無い場合 |
|---|---|---|
| `user_request` | 依頼文 | `brief-normalizer` が BLOCKED |
| `conversation_context` | 会話上の文脈 (無ければ空) | 空として扱う |
| `source_materials` | 元資料 (データ、原稿、既存資料、URL など) | 「なし」を明示して進める。証拠が必要な工程では BLOCKED になり得る |
| `pptx_template` | 配布先の PPTX テンプレートファイル (`.pptx` / `.potx`) | `delivery-artifact-planner` が BLOCKED。**テンプレート無しで進めない** |
| `environment_facts` | 実環境の実測情報 (投影環境、最遠席での可読性、小型画面、リハーサル時間、字幕・音声環境) | `presentation-preflight-reviewer` が BLOCKED |
| `measured_results` | 発表後または検証で得た測定データ | `outcome-evaluator` が BLOCKED |

## 派生 Artifact (別途生成しない。承認済み Artifact から読み取る)

| artifact | 定義 |
|---|---|
| `slide_sequence_item@S` | 承認済み `slide_sequence_plan` のうち対象 Slide の要素 |
| `content_spec@S` | 対象 Slide の内容 Artifact。`slide_content_model@S` に応じて `slide_assertion_spec@S` + `slide_evidence_pack@S` / `activity_slide_spec@S` / `structural_slide_spec@S` のいずれか |
| `media_specs@S` | `visual_medium_plan@S` が要求する媒体仕様 (`chart_spec@S` / `table_spec@S` / `diagram_spec@S` / `image_spec@S`) の全部。0 個のこともある |
| `media_assets@S` | `media_specs@S` に対応する `chart_asset@S` / `table_asset@S` / `diagram_asset@S` / `image_asset@S` の全部 |
| `approved_slides@*` | 全 Slide について、`animation_spec@S` の `needed` が true (step あり) なら `slide_build_final@S`、そうでなければ `slide_build_static@S` |
| `deck_style?` | 先に承認された `visual_style_spec@S` の `deck_style` ブロック。最初の Slide では無い |

## Context 一覧

### control

| context | type | stage | requires | produces | next | rollback_candidates |
|---|---|---|---|---|---|---|
| `workflow-navigator` | navigator | control | (会話中の全 Artifact, 直前の結果, ユーザーの意図) | `navigation_result` | `<user-choice>` | - |

### foundation

| context | type | stage | requires | produces | next | rollback_candidates |
|---|---|---|---|---|---|---|
| `brief-normalizer` | specialist | foundation | `user_request`, `conversation_context?`, `source_materials?` | `presentation_brief` | `brief-normalizer-reviewer` | - |
| `brief-normalizer-reviewer` | reviewer | foundation | `user_request`, `presentation_brief` | `review_result` | `audience-analyzer` | `brief-normalizer` |
| `audience-analyzer` | specialist | foundation | `presentation_brief` | `audience_profile` | `audience-analyzer-reviewer` | `brief-normalizer` |
| `audience-analyzer-reviewer` | reviewer | foundation | `presentation_brief`, `audience_profile` | `review_result` | `presentation-mode-designer` | `audience-analyzer`, `brief-normalizer` |
| `presentation-mode-designer` | specialist | foundation | `presentation_brief`, `audience_profile` | `presentation_mode_spec` | `presentation-mode-designer-reviewer` | `audience-analyzer`, `brief-normalizer` |
| `presentation-mode-designer-reviewer` | reviewer | foundation | `presentation_brief`, `audience_profile`, `presentation_mode_spec` | `review_result` | `delivery-artifact-planner` | `presentation-mode-designer`, `audience-analyzer` |
| `delivery-artifact-planner` | specialist | foundation | `presentation_brief`, `presentation_mode_spec`, `pptx_template` | `delivery_artifact_plan` | `delivery-artifact-planner-reviewer` | `presentation-mode-designer` |
| `delivery-artifact-planner-reviewer` | reviewer | foundation | `presentation_brief`, `presentation_mode_spec`, `delivery_artifact_plan` | `review_result` | `success-criteria-designer` | `delivery-artifact-planner`, `presentation-mode-designer` |
| `success-criteria-designer` | specialist | foundation | `presentation_brief`, `audience_profile`, `presentation_mode_spec` | `success_criteria` | `success-criteria-designer-reviewer` | `presentation-mode-designer`, `brief-normalizer` |
| `success-criteria-designer-reviewer` | reviewer | foundation | `presentation_brief`, `audience_profile`, `presentation_mode_spec`, `success_criteria` | `review_result` | `validation-plan-designer` | `success-criteria-designer` |
| `validation-plan-designer` | specialist | foundation | `success_criteria`, `presentation_mode_spec` | `validation_plan` | `validation-plan-designer-reviewer` | `success-criteria-designer` |
| `validation-plan-designer-reviewer` | reviewer | foundation | `success_criteria`, `presentation_mode_spec`, `validation_plan` | `review_result` | `accessibility-policy-designer` | `validation-plan-designer`, `success-criteria-designer` |
| `accessibility-policy-designer` | specialist | foundation | `presentation_brief`, `audience_profile`, `delivery_artifact_plan` | `accessibility_policy` | `accessibility-policy-designer-reviewer` | `audience-analyzer`, `delivery-artifact-planner` |
| `accessibility-policy-designer-reviewer` | reviewer | foundation | `presentation_brief`, `audience_profile`, `delivery_artifact_plan`, `accessibility_policy` | `review_result` | `deck-outline-designer` | `accessibility-policy-designer` |

### deck-design

| context | type | stage | requires | produces | next | rollback_candidates |
|---|---|---|---|---|---|---|
| `deck-outline-designer` | specialist | deck-design | `presentation_brief`, `audience_profile`, `presentation_mode_spec`, `success_criteria` | `deck_outline` | `deck-outline-designer-reviewer` | `success-criteria-designer`, `presentation-mode-designer` |
| `deck-outline-designer-reviewer` | reviewer | deck-design | `presentation_brief`, `audience_profile`, `presentation_mode_spec`, `success_criteria`, `deck_outline` | `review_result` | `slide-sequence-designer` | `deck-outline-designer`, `presentation-mode-designer`, `success-criteria-designer`, `audience-analyzer` |
| `slide-sequence-designer` | specialist | deck-design | `deck_outline`, `presentation_mode_spec` | `slide_sequence_plan` | `slide-sequence-designer-reviewer` | `deck-outline-designer` |
| `slide-sequence-designer-reviewer` | reviewer | deck-design | `deck_outline`, `presentation_mode_spec`, `slide_sequence_plan` | `review_result` | `slide-content-model-router` | `slide-sequence-designer`, `deck-outline-designer` |

### slide-content (Slide ごとに実行する)

| context | type | stage | requires | produces | next | rollback_candidates |
|---|---|---|---|---|---|---|
| `slide-content-model-router` | specialist | slide-content | `slide_sequence_item@S`, `presentation_mode_spec` | `slide_content_model@S` | `slide-content-model-router-reviewer` | `slide-sequence-designer` |
| `slide-content-model-router-reviewer` | reviewer | slide-content | `slide_sequence_item@S`, `presentation_mode_spec`, `slide_content_model@S` | `review_result` | `slide-assertion-designer` \| `activity-slide-designer` \| `structural-slide-designer` | `slide-content-model-router`, `slide-sequence-designer` |
| `slide-assertion-designer` | specialist | slide-content | `slide_sequence_item@S`, `audience_profile`, `success_criteria` | `slide_assertion_spec@S` | `slide-assertion-designer-reviewer` | `slide-sequence-designer` |
| `slide-assertion-designer-reviewer` | reviewer | slide-content | `slide_sequence_item@S`, `audience_profile`, `success_criteria`, `slide_assertion_spec@S` | `review_result` | `slide-evidence-selector` | `slide-assertion-designer`, `slide-sequence-designer`, `slide-content-model-router` |
| `slide-evidence-selector` | specialist | slide-content | `slide_assertion_spec@S`, `source_materials?`, `audience_profile` | `slide_evidence_pack@S` | `slide-evidence-selector-reviewer` | `slide-assertion-designer` |
| `slide-evidence-selector-reviewer` | reviewer | slide-content | `slide_assertion_spec@S`, `source_materials?`, `audience_profile`, `slide_evidence_pack@S` | `review_result` | `visual-medium-router` | `slide-evidence-selector`, `slide-assertion-designer` |
| `activity-slide-designer` | specialist | slide-content | `slide_sequence_item@S`, `presentation_mode_spec`, `audience_profile` | `activity_slide_spec@S` | `activity-slide-designer-reviewer` | `slide-sequence-designer` |
| `activity-slide-designer-reviewer` | reviewer | slide-content | `slide_sequence_item@S`, `presentation_mode_spec`, `audience_profile`, `activity_slide_spec@S` | `review_result` | `visual-medium-router` | `activity-slide-designer`, `slide-sequence-designer`, `slide-content-model-router` |
| `structural-slide-designer` | specialist | slide-content | `slide_sequence_item@S`, `deck_outline` | `structural_slide_spec@S` | `structural-slide-designer-reviewer` | `slide-sequence-designer` |
| `structural-slide-designer-reviewer` | reviewer | slide-content | `slide_sequence_item@S`, `deck_outline`, `structural_slide_spec@S` | `review_result` | `visual-medium-router` | `structural-slide-designer`, `slide-sequence-designer`, `slide-content-model-router` |
| `slide-copywriter` | specialist | slide-content | `content_spec@S`, `visual_medium_plan@S`, `media_specs@S`, `audience_profile` | `slide_copy_spec@S` | `slide-copywriter-reviewer` | `<content-designer>`, `visual-medium-router` |
| `slide-copywriter-reviewer` | reviewer | slide-content | `content_spec@S`, `visual_medium_plan@S`, `media_specs@S`, `audience_profile`, `slide_copy_spec@S` | `review_result` | `speaker-track-designer` | `slide-copywriter`, `<content-designer>` |
| `speaker-track-designer` | specialist | slide-content | `content_spec@S`, `slide_copy_spec@S`, `audience_profile`, `deck_outline` | `speaker_track@S` | `speaker-track-designer-reviewer` | `slide-copywriter`, `<content-designer>` |
| `speaker-track-designer-reviewer` | reviewer | slide-content | `content_spec@S`, `slide_copy_spec@S`, `audience_profile`, `deck_outline`, `speaker_track@S` | `review_result` | `slide-layout-planner` | `speaker-track-designer`, `slide-copywriter` |

### visual-design (Slide ごとに実行する)

| context | type | stage | requires | produces | next | rollback_candidates |
|---|---|---|---|---|---|---|
| `visual-medium-router` | specialist | visual-design | `content_spec@S`, `audience_profile`, `presentation_mode_spec` | `visual_medium_plan@S` | `visual-medium-router-reviewer` | `<content-designer>` |
| `visual-medium-router-reviewer` | reviewer | visual-design | `content_spec@S`, `audience_profile`, `presentation_mode_spec`, `visual_medium_plan@S` | `review_result` | `chart-designer` \| `table-designer` \| `diagram-designer` \| `image-planner` \| `slide-copywriter` | `visual-medium-router`, `<content-designer>` |
| `chart-designer` | specialist | visual-design | `slide_evidence_pack@S`, `slide_assertion_spec@S`, `visual_medium_plan@S` | `chart_spec@S` | `chart-designer-reviewer` | `visual-medium-router`, `slide-evidence-selector` |
| `chart-designer-reviewer` | reviewer | visual-design | `slide_evidence_pack@S`, `slide_assertion_spec@S`, `visual_medium_plan@S`, `chart_spec@S` | `review_result` | `<remaining-media>` \| `slide-copywriter` | `chart-designer`, `visual-medium-router`, `slide-evidence-selector` |
| `table-designer` | specialist | visual-design | `content_spec@S`, `visual_medium_plan@S` | `table_spec@S` | `table-designer-reviewer` | `visual-medium-router` |
| `table-designer-reviewer` | reviewer | visual-design | `content_spec@S`, `visual_medium_plan@S`, `table_spec@S` | `review_result` | `<remaining-media>` \| `slide-copywriter` | `table-designer`, `visual-medium-router` |
| `diagram-designer` | specialist | visual-design | `content_spec@S`, `visual_medium_plan@S` | `diagram_spec@S` | `diagram-designer-reviewer` | `visual-medium-router` |
| `diagram-designer-reviewer` | reviewer | visual-design | `content_spec@S`, `visual_medium_plan@S`, `diagram_spec@S` | `review_result` | `<remaining-media>` \| `slide-copywriter` | `diagram-designer`, `visual-medium-router` |
| `image-planner` | specialist | visual-design | `content_spec@S`, `visual_medium_plan@S`, `audience_profile` | `image_spec@S` | `image-planner-reviewer` | `visual-medium-router` |
| `image-planner-reviewer` | reviewer | visual-design | `content_spec@S`, `visual_medium_plan@S`, `image_spec@S` | `review_result` | `<remaining-media>` \| `slide-copywriter` | `image-planner`, `visual-medium-router` |
| `slide-layout-planner` | specialist | visual-design | `content_spec@S`, `media_specs@S`, `slide_copy_spec@S`, `accessibility_policy`, `delivery_artifact_plan` | `slide_layout_spec@S` | `slide-layout-planner-reviewer` | `slide-copywriter`, `<media-designer>` |
| `slide-layout-planner-reviewer` | reviewer | visual-design | `content_spec@S`, `media_specs@S`, `slide_copy_spec@S`, `accessibility_policy`, `audience_profile`, `slide_layout_spec@S` | `review_result` | `visual-style-designer` | `slide-layout-planner`, `<media-designer>` |
| `visual-style-designer` | specialist | visual-design | `slide_layout_spec@S`, `accessibility_policy`, `presentation_mode_spec`, `delivery_artifact_plan`, `deck_style?` | `visual_style_spec@S` | `visual-style-designer-reviewer` | `slide-layout-planner` |
| `visual-style-designer-reviewer` | reviewer | visual-design | `slide_layout_spec@S`, `accessibility_policy`, `presentation_mode_spec`, `delivery_artifact_plan`, `deck_style?`, `visual_style_spec@S` | `review_result` | `animation-planner` | `visual-style-designer`, `slide-layout-planner` |
| `animation-planner` | specialist | visual-design | `slide_layout_spec@S`, `media_specs@S`, `speaker_track@S`, `presentation_mode_spec` | `animation_spec@S` | `animation-planner-reviewer` | `speaker-track-designer`, `slide-layout-planner` |
| `animation-planner-reviewer` | reviewer | visual-design | `slide_layout_spec@S`, `media_specs@S`, `speaker_track@S`, `presentation_mode_spec`, `animation_spec@S` | `review_result` | `chart-renderer` \| `table-renderer` \| `diagram-renderer` \| `image-generator` \| `slide-builder` | `animation-planner` |

### rendering-build (Slide ごとに実行する。deck-builder は全 Slide 完了後)

| context | type | stage | requires | produces | next | rollback_candidates |
|---|---|---|---|---|---|---|
| `chart-renderer` | specialist | rendering-build | `chart_spec@S`, `slide_layout_spec@S`, `visual_style_spec@S`, `delivery_artifact_plan` | `chart_asset@S` | `chart-renderer-reviewer` | `chart-designer` |
| `chart-renderer-reviewer` | reviewer | rendering-build | `chart_spec@S`, `visual_style_spec@S`, `accessibility_policy`, `chart_asset@S` | `review_result` | `<remaining-renderers>` \| `slide-builder` | `chart-renderer`, `chart-designer`, `visual-medium-router` |
| `table-renderer` | specialist | rendering-build | `table_spec@S`, `slide_layout_spec@S`, `visual_style_spec@S`, `delivery_artifact_plan` | `table_asset@S` | `table-renderer-reviewer` | `table-designer` |
| `table-renderer-reviewer` | reviewer | rendering-build | `table_spec@S`, `visual_style_spec@S`, `accessibility_policy`, `table_asset@S` | `review_result` | `<remaining-renderers>` \| `slide-builder` | `table-renderer`, `table-designer`, `visual-medium-router` |
| `diagram-renderer` | specialist | rendering-build | `diagram_spec@S`, `slide_layout_spec@S`, `visual_style_spec@S`, `delivery_artifact_plan` | `diagram_asset@S` | `diagram-renderer-reviewer` | `diagram-designer` |
| `diagram-renderer-reviewer` | reviewer | rendering-build | `diagram_spec@S`, `visual_style_spec@S`, `accessibility_policy`, `diagram_asset@S` | `review_result` | `<remaining-renderers>` \| `slide-builder` | `diagram-renderer`, `diagram-designer`, `visual-medium-router` |
| `image-generator` | specialist | rendering-build | `image_spec@S`, `slide_layout_spec@S`, `visual_style_spec@S` | `image_asset@S` | `image-generator-reviewer` | `image-planner` |
| `image-generator-reviewer` | reviewer | rendering-build | `image_spec@S`, `accessibility_policy`, `slide_layout_spec@S`, `visual_style_spec@S`, `image_asset@S` | `review_result` | `<remaining-renderers>` \| `slide-builder` | `image-generator`, `image-planner`, `visual-medium-router` |
| `slide-builder` | specialist | rendering-build | `content_spec@S`, `slide_copy_spec@S`, `slide_layout_spec@S`, `visual_style_spec@S`, `media_assets@S`, `accessibility_policy`, `delivery_artifact_plan`, `pptx_template` | `slide_build_static@S` | `slide-builder-reviewer` | - |
| `slide-builder-reviewer` | reviewer | rendering-build | `slide_copy_spec@S`, `slide_layout_spec@S`, `visual_style_spec@S`, `accessibility_policy`, `slide_build_static@S`, `animation_spec@S?` | `review_result` | `animation-builder` \| `<next-slide>` \| `deck-builder` | `slide-builder`, `<upstream>` |
| `animation-builder` | specialist | rendering-build | `slide_build_static@S`, `animation_spec@S` | `slide_build_final@S` | `animation-builder-reviewer` | `animation-planner` |
| `animation-builder-reviewer` | reviewer | rendering-build | `animation_spec@S`, `speaker_track@S`, `slide_build_final@S` | `review_result` | `<next-slide>` \| `deck-builder` | `animation-builder`, `animation-planner` |
| `deck-builder` | specialist | rendering-build | `slide_sequence_plan`, `approved_slides@*`, `delivery_artifact_plan`, `pptx_template` | `deck_build` | `deck-builder-reviewer` | `slide-builder` |
| `deck-builder-reviewer` | reviewer | rendering-build | `slide_sequence_plan`, `delivery_artifact_plan`, `deck_build` | `review_result` | `delivery-variant-builder` | `deck-builder`, `<slide-context>` |

### delivery

| context | type | stage | requires | produces | next | rollback_candidates |
|---|---|---|---|---|---|---|
| `delivery-variant-builder` | specialist | delivery | `deck_build`, `delivery_artifact_plan`, `speaker_track@*`, `slide_evidence_pack@*`, `accessibility_policy` | `delivery_artifacts` | `delivery-variant-builder-reviewer` | `deck-builder` |
| `delivery-variant-builder-reviewer` | reviewer | delivery | `deck_build`, `delivery_artifact_plan`, `speaker_track@*`, `slide_evidence_pack@*`, `accessibility_policy`, `delivery_artifacts` | `review_result` | `accessibility-validator` | `delivery-variant-builder`, `deck-builder` |

### validation (Reviewer-of-Reviewer を置かない)

| context | type | stage | requires | produces | next | rollback_candidates |
|---|---|---|---|---|---|---|
| `accessibility-validator` | validator | validation | `delivery_artifacts`, `accessibility_policy`, `environment_facts?` | `accessibility_validation_result` | `presentation-quality-auditor` | `<upstream>` |
| `presentation-quality-auditor` | validator | validation | `delivery_artifacts`, `presentation_brief`, `audience_profile`, `presentation_mode_spec`, `success_criteria`, `deck_outline`, `slide_sequence_plan`, `speaker_track@*`, `animation_spec@*` | `quality_audit_result` | `presentation-preflight-reviewer` | `<upstream>` |
| `presentation-preflight-reviewer` | validator | validation | `delivery_artifacts`, `environment_facts`, `speaker_track@*`, `animation_spec@*`, `validation_plan?` | `preflight_result` | `<delivery-ready>` | `<upstream>` |
| `outcome-evaluator` | validator | validation | `success_criteria`, `validation_plan`, `measured_results` | `outcome_evaluation` | `<outcome-validated>` | - |

## 特別な遷移先

| token | 意味 |
|---|---|
| `<user-choice>` | 人間が選んだ Context |
| `<content-designer>` | 対象 Slide の `content_spec@S` を生成した Designer (`slide-assertion-designer` / `slide-evidence-selector` / `activity-slide-designer` / `structural-slide-designer` のうち問題を生成したもの) |
| `<media-designer>` | 問題のある媒体仕様を生成した Designer (`chart-designer` / `table-designer` / `diagram-designer` / `image-planner`) |
| `<remaining-media>` | `visual_medium_plan@S` が要求する媒体のうち、まだ承認済み仕様が無い媒体の Designer。無ければ `slide-copywriter` |
| `<remaining-renderers>` | `media_specs@S` のうち、まだ承認済み Asset が無い媒体の Renderer。無ければ `slide-builder` |
| `<next-slide>` | まだ Build が承認されていない次の Slide の、未完了の最初の Context (通常は `slide-content-model-router`)。全 Slide が承認済みなら `deck-builder` |
| `<slide-context>` | 問題のある Slide の該当 Context |
| `<upstream>` | 問題を生成した最小の上流 Context。直前の Context へ機械的に戻さない |
| `<delivery-ready>` | 完成状態 `DELIVERY_READY`。以降は `outcome-evaluator` だけが残る |
| `<outcome-validated>` | 完成状態 `OUTCOME_VALIDATED` |

## 実行順序の既定

Foundation → Deck Design → (Slide ごとに) Slide Content → Visual Design → Rendering/Build → 全 Slide 完了後 Deck Build → Delivery → Validation。

Slide ごとの工程は、Reviewer の `next` が示すとおり同じ Slide を先へ進めるのが既定だが、**人間が別の順序を選んでよい** (例: 全 Slide の `slide-assertion-designer` を先に終えてから媒体設計へ進む)。Router は `requires` が満たされていれば実行し、満たされていなければ BLOCKED を返す。
