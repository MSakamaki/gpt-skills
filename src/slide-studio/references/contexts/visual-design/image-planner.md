# image-planner

種別：specialist　段階：visual-design　対象：Slide 単位

## 責務

写真・イラスト・アイコン等の**意味的役割**を設計し、`image_spec@S` にする。画像そのものは本スキルで作らない。別の画像作成スキルや画像生成機能で作り、ユーザーがはめ込む。受け渡し条件と配置枠は `image-generator` が作る。

## 禁止

- 装飾のためだけに画像を追加しない。役割 (この画像が無いと聴衆が理解できないこと) を書けなければ計画しない
- 内容に無い因果・順序・優劣を示す構図を指示しない
- 画像内に画面文章 (見出し・説明文) を入れる前提にしない。画面上の文章は `slide_copy_spec` が担う (I-08)
- 箇条書きをアイコンに置き換えるだけの画像を計画しない。情報構造が変わらないなら不要

## 入力

| Artifact | 使い方 |
|---|---|
| `content_spec@S` | 画像が支える主張・活動・構造と、証拠の出所 |
| `visual_medium_plan@S` | 該当 `media_id` の `what_to_read`・`reason` |
| `audience_profile` | 既有知識・文化的前提・閲覧環境。具体化の程度 |

## 出力：`image_spec@S`

```yaml
artifact: image_spec
artifact_id: image_spec@S07
version: 1
produced_by: image-planner
based_on: [slide_assertion_spec@S07 v1, slide_evidence_pack@S07 v1, visual_medium_plan@S07 v1, audience_profile v1]
slide_id: S07
media_id: M1
role: 新規顧客の導入現場が「小規模店舗」であることを、文で説明せずに具体化する   # 意味的役割
relation_to_content: slide_assertion_spec@S07.assertion の「新規顧客」の像を支える
image_kind: photo                # photo | illustration | icon | screenshot | map
subject: 小規模店舗のレジ前で端末を使う店員
must_include: [店舗の規模が分かる背景, 端末]
must_avoid: [大企業のオフィス, 成功・失敗を示す表情や記号, 文字, 装飾的な要素]
audience_fit: 聴衆は流通業の管理職。業界の典型的な店舗像で通じる
text_in_image: none              # none | labels_only
provenance: external             # 画像は別スキル・画像生成機能で作り、ユーザーがはめ込む
alt_text_intent: 小規模店舗のレジ前で端末を使う店員の写真で、新規顧客の典型像を示す
```

## 手順

1. `visual_medium_plan@S.media[]` の `what_to_read` から、この画像の `role` を 1 文で書く。「雰囲気を出す」「余白を埋める」しか書けないなら `BLOCKED` とし、`visual-medium-router` への差し戻しを提案する
2. `relation_to_content` に、主張・活動・構造のどこを支えるかを `content_spec@S` の参照で書く
3. `image_kind`・`subject`・`must_include` を、役割に必要な最小限で決める。`must_avoid` に、内容に無い因果・優劣を示す構図、装飾、文字を書く
4. `audience_profile` に合わせて具体化の程度と文化的前提を決める (初学者には具体的な場面、専門家には要点だけの図示)
5. 画像内の文字は原則 `none`。ラベルが必要なら `labels_only` とし、画面文章との重複を避ける
6. `alt_text_intent` を、画像が伝える意味で 1 文にする。「画像」「イラスト」と書かない

## 参照するガイド

- `references/domain-guide.md` §2「Mayer のマルチメディア学習理論」の段落 — Coherence。関係のない画像を除く (B)
- `references/domain-guide.md` §3 表「情報密度」「アクセシビリティ」行 — 関係のない画像を削る、alt text
- `references/domain-guide.md` §6「悪いスライドを「綺麗にする」だけでは不足する」の段落 — アイコン置換で認知上の仕事は残る
- `references/domain-guide.md` §7 のチェックリスト「削除」「字幕・alt」行

## 結果

- `COMPLETE` → `recommended_next: image-planner-reviewer`
- `BLOCKED` → 意味的役割を書けない (装飾目的)、支える内容が `content_spec@S` に無い
- `rollback_candidates`: `visual-medium-router`
