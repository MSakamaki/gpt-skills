# image-planner-reviewer

種別：reviewer　段階：visual-design　対象：`image_spec@S`

## 責務

画像に意味的役割があり、装飾でなく、内容に無い意味を足さないかを検証する。修正しない。別の画像案を書かない。

## 入力

| Artifact | 使い方 |
|---|---|
| `content_spec@S` | 役割が支える内容の照合元 |
| `visual_medium_plan@S` | `what_to_read` との一致、密度方針 |
| `image_spec@S` | 検証対象 |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | `role` が「この画像が無いと聴衆が理解できないこと」を書いているか。装飾・雰囲気・余白埋めになっていないか | ガイド §2 Mayer Coherence (B)、§7「削除」 |
| 2 | `relation_to_content` が `content_spec@S` の主張・活動・構造を実際に支えているか | 責務境界 |
| 3 | `subject` / `must_include` / `must_avoid` が、内容に無い因果・順序・優劣 (成功・失敗の表情や記号など) を示さないか | I-11 相当 (意味の改変禁止) |
| 4 | 箇条書きのアイコン化のように、情報構造を変えない画像になっていないか | ガイド §6「綺麗にする」だけでは不足の段落 |
| 5 | `text_in_image` が `none` (または理由のある `labels_only`) で、画面文章と重複しないか | I-08、ガイド §2 Mayer Redundancy |
| 6 | `audience_fit` が `visual_medium_plan@S` の密度方針と矛盾しないか (小型画面で細部に頼る画像など) | ガイド §4 オンライン配信の段落 |
| 7 | `provenance: external` で、本スキルが画像を生成する前提になっていないか | 範囲外 (SKILL.md) |
| 8 | `alt_text_intent` が画像の意味を書き、「画像」「イラスト」で終わっていないか | ガイド §3 表「アクセシビリティ」行 |
| 9 | (上流の問題) 画像を使うべきではなかった (図解・表・文の方が判断に合う) | ガイド §3 逆算表 |

## 判定

- 観点 1・3 は `CRITICAL`。観点 2・4・5・7・8・9 は `MAJOR`。観点 6 は `MINOR`
- `CRITICAL` / `MAJOR` が 1 つでもあれば `FAIL`

| 問題の種類 | rollback_target |
|---|---|
| 役割・主題・禁止事項・alt の設計問題 | `image-planner` |
| 画像を使うべきではなかった | `visual-medium-router` |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `image_spec@S<nn> v<n>`。`PASS` の `recommended_next` は `<remaining-media>`、無ければ `slide-copywriter`。

## 参照するガイド

- `references/domain-guide.md` §2「Mayer のマルチメディア学習理論」の段落
- `references/domain-guide.md` §3 表「情報密度」「アクセシビリティ」行
- `references/domain-guide.md` §6「悪いスライドを「綺麗にする」だけでは不足する」の段落
- `references/domain-guide.md` §7 のチェックリスト「削除」「字幕・alt」行
