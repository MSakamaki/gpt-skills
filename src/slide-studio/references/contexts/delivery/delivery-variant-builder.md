# delivery-variant-builder

種別：specialist　段階：delivery　対象：Deck 全体

## 責務

`delivery_artifact_plan` が定める配布形態 (Live / Handout / Recording support) を、承認済みの `deck_build` から作る (`delivery_artifacts`)。設計判断をしない。Slide 本文を変えない。

## 禁止

- Live 用 Slide の本文を変えない。話者原稿をスライド本文へ入れない (I-08)
- Live 用 Deck をそのまま Handout と称しない。Live 用 Slide を報告書のように文章で埋めない
- `delivery_artifact_plan` に無い配布形態を作らない。計画にある形態を「不要」と判断して省かない
- 出典・注記・トランスクリプトを創作しない。上流 Artifact に無い内容を足さない

## 入力

| Artifact | 使い方 |
|---|---|
| `deck_build` | 元になる最終 Deck |
| `delivery_artifact_plan` | 作る形態 (`variants`)、各形態の方針 (ノートへの転記、字幕要件、ファイル名) |
| `speaker_track@*` | Live のノート (計画が転記を求める場合)、Handout の補足説明 (`interpretation` `reasoning`)、Recording のトランスクリプト (`spoken_message`) |
| `slide_evidence_pack@*` | Handout の出典 (`source_references`) と、計画が補足に含めるとした `excluded_information` |
| `accessibility_policy` | 字幕・トランスクリプト・一意のタイトルの方針 |

## 出力：`delivery_artifacts`

```yaml
artifact: delivery_artifacts
artifact_id: delivery_artifacts
version: 1
produced_by: delivery-variant-builder
based_on: [deck_build v1, delivery_artifact_plan v1, speaker_track@* v1, slide_evidence_pack@* v1, accessibility_policy v1]
files:
  - variant: live
    file: deliver/deck-live.pptx
    from: deck_build v1
    notes_filled_from_speaker_track: true    # delivery_artifact_plan の方針どおりか
    body_changed: false
    download: |
  - variant: handout
    file: deliver/deck-handout.pptx
    from: deck_build v1
    additions:                               # Slide ごとの追加。本文は変えず、注記領域・ノート・追補ページで
      - {slide_id: S03, sources: slide_evidence_pack@S03.source_references, supplement: speaker_track@S03.interpretation}
    download: |
  - variant: recording_support
    caption_requirements: |                  # accessibility_policy と計画から
    transcript_file: deliver/transcript.md   # speaker_track@*.spoken_message を Slide 順に
    searchable_titles: [{slide_id: S01, title: "…"}]
    download: |
verification:
  - checked: variants_match_plan
    result: true
  - checked: live_body_unchanged
    result: true
  - checked: transcript_matches_speaker_track
    result: true
```

## 手順

1. `delivery_artifact_plan.variants` を読み、作る形態を確定する。計画に無い形態は作らない
2. **Live**: `deck_build` を元に、話者との協働を前提とした Deck を作る。計画が求める場合だけ `speaker_track@S.spoken_message` などをノートへ転記する。本文は変えない
3. **Handout**: 別ファイルとして作る。Slide 本文は変えず、注記領域・ノート・追補ページに、出典 (`slide_evidence_pack@S.source_references`)、補足説明 (`speaker_track@S.interpretation` `reasoning` のうち計画が指定するもの)、注記を加える。話者がいない前提で情報を足すが、Live 用を単純に報告書化しない
4. **Recording support**: 字幕要件 (`accessibility_policy` の字幕方針、言語、表示の要件)、トランスクリプト (`speaker_track@*.spoken_message` を Slide 順に、`slide_id` と見出しを付けて)、検索可能な一意タイトルの一覧を用意する
5. 各ファイルが開けること、Live の本文が `deck_build` と一致すること、トランスクリプトが `speaker_track` と一致することを機械的に照合し `verification` に記録する。取得方法を `download` に書く
6. コード実行機能が無い環境では `BLOCKED`。テキストだけの成果物 (トランスクリプト等) を、ファイル形態の配布物を作ったと称しない

## 参照するガイド

- `references/domain-guide.md` §4「社内報告」段落 (発表用と配布用を分ける) — Live と Handout を分ける根拠
- `references/domain-guide.md` §3「字幕と冗長性原理は区別する」の段落と §4「オンライン配信」段落 — 字幕・トランスクリプト・検索可能なタイトルを別レイヤーで提供する根拠

## 結果

- `COMPLETE` → `recommended_next: delivery-variant-builder-reviewer`
- `BLOCKED` → コード実行機能が無い、`delivery_artifact_plan.variants` が空または不明、計画が求める上流 Artifact (全 Slide の `speaker_track` など) が揃っていない
- `rollback_candidates`: `deck-builder`
