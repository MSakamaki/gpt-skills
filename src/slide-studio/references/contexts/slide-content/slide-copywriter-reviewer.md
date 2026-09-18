# slide-copywriter-reviewer

種別：reviewer　段階：slide-content　対象：`slide_copy_spec@S`

## 責務

画面文章が、長文朗読を要求せず、主張と一致し、話者の内容が混入していないかを検証する。修正しない。代わりの見出し文を書かない。

## 入力

| Artifact | 使い方 |
|---|---|
| `content_spec@S` | 見出し・ラベルの意味の照合元。事実・数値の出所 |
| `visual_medium_plan@S` | 文章で担うべき範囲との整合 |
| `media_specs@S` | ラベル・注釈の `target` が実在する要素か |
| `audience_profile` | 用語・文字量の適否 (聴衆相対) |
| `presentation_brief.deliverable_voice` | 画面文章が従うべき声との照合 |
| `slide_copy_spec@S` | 検証対象 |

## 確認観点

| # | 観点 | 根拠 |
|---|---|---|
| 1 | 長文朗読を要求する構造になっていないか (段落、全文、報告書の転載、説明的な箇条書き) | ガイド §1 要点、§6 悪い例 |
| 2 | 主張型で `headline` が `slide_assertion_spec.assertion` の意味と一致するか。トピック名に退行していないか | ガイド §3「見出し」行 |
| 3 | 話者が担うべき因果・解釈・判断・Story が画面文章に混入していないか (`on_screen_excluded` へ移されているか) | I-08、ガイド §3「音声との分担」 |
| 4 | Redundant text になっていないか。話者が読み上げると想定される文章と同一の全文を置いていないか | ガイド §2 Redundancy |
| 5 | 字幕の計画を「冗長」として排除していないか。字幕は別レイヤーであり本 Context の対象外 (触れていれば MINOR) | ガイド §3「字幕と冗長性原理は区別する」 |
| 6 | `labels` / `annotations` の `target` が `media_specs@S` の要素として実在し、図表が担う情報と重複していないか | ガイド §2 Spatial contiguity |
| 7 | `content_spec@S` に無い事実・数値が書かれていないか | I-03 / 推測禁止 |
| 8 | 活動型で `short_instructions` が手順・成果物・時間を保ち、説明文になっていないか | ガイド §4 活動スライド |
| 9 | 用語・略語・文字量が `audience_profile` に合うか。固定の文字数ルールを根拠にしていないか | I-09、ガイド §2 expertise reversal |
| 10 | レイアウト・フォント・色を先取りしていないか | 責務境界 |
| 11 | `[成果物の声]` の項目が `deliverable_voice` の言語・表記・トーン・読解水準に従うか。逆に `purpose` `reason` などの説明欄が作業言語のままか | I-15 |

## 判定

- 観点 1・2・3・7 は `CRITICAL`。観点 4・6・8・9・11 は `MAJOR`。観点 5・10 は `MINOR`
- `CRITICAL` / `MAJOR` が 1 つでもあれば `FAIL`

| 問題の種類 | rollback_target |
|---|---|
| 文章の構造・分担・ラベルの問題、見出しの退行、創作 | `slide-copywriter` |
| 内容自体が文章化に耐えない (主張が曖昧、証拠が不足、活動の手順が未定) | `<content-designer>` (問題の元の Designer) |

## 出力：`review_result`

`SKILL.md` の共通形式。`target` に `slide_copy_spec@S<nn> v<n>`。`PASS` の `recommended_next` は `speaker-track-designer`。

## 参照するガイド

- `references/domain-guide.md` §1 の要点「ナレーションとスライドに同じ仕事をさせない」
- `references/domain-guide.md` §2「Mayer のマルチメディア学習理論」の段落
- `references/domain-guide.md` §3 の表「見出し」「情報密度」「音声との分担」行、「字幕と冗長性原理は区別する」の段落
- `references/domain-guide.md` §6 の悪い例・改善例
- `references/domain-guide.md` §7 のチェックリスト「ナレーション」行
