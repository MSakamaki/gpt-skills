# image-generator-reviewer

種別：reviewer　段階：rendering-build　対象：`image_asset@S`

## 責務

`image_asset@S` の受け渡し仕様 (`handoff_brief`) と配置枠 (`placeholder`) が `image_spec@S` を忠実に表し、アクセシビリティ方針に従うかを検証する。修正しない。本スキルは画像を生成しないので、画像そのものの品質は対象外 (ユーザーがはめ込んだ後の確認は Validation 段階)。

## 入力

| Artifact | 使い方 |
|---|---|
| `image_spec@S` | 意味的役割・主題・必須要素・避ける要素の照合元 |
| `accessibility_policy` | alt text の方針、装飾画像の扱い |
| `image_asset@S` | 検証対象 (`placeholder` `handoff_brief` `insertion_instruction` `verification`) |
| `slide_layout_spec@S` | 配置枠が領域に収まるかの照合元 |
| `visual_style_spec@S` | `style_constraints` の色調・画風との整合 |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | `handoff_brief` の役割・主題・必須要素・避ける要素が `image_spec` と一致するか。役割を変えたり主題を足したりしていないか | I-03 |
| 2 | 画像を生成した・取得した・挿入したと書いていないか。`kind: external_handoff` か | 本スキルは画像を生成しない |
| 3 | `placeholder` が `slide_layout_spec` の領域に収まり、比率が `image_spec` と矛盾しないか (`verification.placeholder_fits_layout` を信用せず値で確認) | 実装 |
| 4 | `alt_text` が意味的役割を 1 文で書いているか。「画像」「イラスト」「写真」だけになっていないか。空になっていないか | `accessibility_policy`、ガイド §3「アクセシビリティ」行 |
| 5 | `text_in_image` が `none` か。画面文章を画像に入れる指示が無いか | I-08 (画面文章は `slide_copy_spec`) |
| 6 | `must_avoid` に、元の内容に無い因果・順序・優劣・装飾・文字が含まれているか (無ければ不足) | 意味の改変を防ぐ |
| 7 | `style_constraints` が `visual_style_spec` の色調・画風方針と矛盾しないか | Deck の一貫性 |
| 8 | `insertion_instruction` に枠の置き換え・比率の維持・代替テキストの設定・読み上げ順の位置が書かれているか | ユーザーがはめ込む運用 |
| 9 | (上流の問題) 役割が装飾だけで、画像そのものが不要ではないか | ガイド §2「Mayer」段落 (Coherence) |

## 判定

- 観点 1・2 は `CRITICAL`。観点 3〜6・9 は `MAJOR`。観点 7・8 は不足の程度により `MAJOR` または `MINOR`
- `CRITICAL` / `MAJOR` が 1 つでもあれば `FAIL`

| 問題の種類 | rollback_target |
|---|---|
| 受け渡し仕様・配置枠・alt text・手順の問題 | `image-generator` |
| 役割・主題・必須要素の設計問題 (spec 自体が不適切、役割が装飾だけ) | `image-planner` |
| 画像を使うべきではなかった (図解や文章の方が目的に合う) | `visual-medium-router` |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `image_asset@S<nn> v<n>`。`PASS` の `recommended_next` は残りの Renderer (`<remaining-renderers>`)、無ければ `slide-builder`。

## 参照するガイド

- `references/domain-guide.md` §2「Mayer のマルチメディア学習理論」の段落 (Coherence: 不要な画像を除く)
- `references/domain-guide.md` §3 の表「情報密度」「アクセシビリティ」行
- `references/domain-guide.md` §7 のチェックリスト「削除」「字幕・alt」行
