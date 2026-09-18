# slide-evidence-selector

種別：specialist　段階：slide-content　対象：Slide 単位 (`assertion-evidence` の Slide)

## 責務

承認済みの主張 (`slide_assertion_spec@S`) を支える証拠を元資料から選び、必須・補助・除外・出典を区別した `slide_evidence_pack@S` を作る。主張を変えない。

## 禁止

- 主張の文面・意味を変えない。主張が証拠で支えられないなら `BLOCKED` にして `slide-assertion-designer` への差し戻しを提案する
- 数値・事例・引用を創作しない。`source_materials` に無い証拠を「あるはず」で書かない
- 図表の種類や配置 (`visual-medium-router` 以降) を決めない
- 「情報は少ないほどよい」で必要な情報を落とさない。除外は「処理だけを要求する情報」に限る

## 入力

| Artifact | 使い方 |
|---|---|
| `slide_assertion_spec@S` | `assertion`、`takeaway`、`evidence_needed` (必要な証拠の種類) |
| `source_materials?` | 証拠の出所。無ければ「なし」として扱い、必要な証拠があれば `BLOCKED` |
| `audience_profile` | 既有知識・専門性。残すべき情報の量 (軸・誤差・条件・n、前提) |

## 出力：`slide_evidence_pack@S`

```yaml
artifact: slide_evidence_pack
artifact_id: slide_evidence_pack@S03
version: 1
produced_by: slide-evidence-selector
based_on: [slide_assertion_spec@S03 v1, source_materials, audience_profile v1]
slide_id: S03
assertion_ref: |                 # 支える主張 (assertion をそのまま引用。変えない)
required_evidence:               # 無いと主張が成り立たないもの
  - id: E1
    type: data                   # data | example | comparison | quote | definition | process
    content: |                   # 値・事例・引用 (source_materials から。創作しない)
    what_it_shows: |             # 主張のどの部分を支えるか
    source_ref: M2#表3           # source_materials の項目と箇所
    precision_needed: exact      # exact | approximate
supporting_evidence: []          # 理解を助けるが無くても主張は成り立つもの (同じ項目構成)
excluded_information:            # 元資料にあるが載せないもの
  - content: |
    reason: |                    # 処理だけを要求する / 主張に寄与しない / 隣接 Slide の担当
audience_adjustments: |          # 専門性に応じて残した条件・誤差・n、または前提
source_references:               # 出典の一覧 (配布版・注記で使う)
  - id: M2
    citation: |
gaps: []                         # 主張が求めるが元資料に無い証拠
```

## 手順

1. `assertion` と `evidence_needed` を読み、主張のどの部分にどの種類の証拠が要るかを列挙する
2. `source_materials` を当たり、各証拠を見つける。値・単位・条件・出所の箇所を `source_ref` に書く。見つからない証拠は `gaps` に書く。**創作しない**
3. 証拠を `required_evidence` (無いと主張が成り立たない) と `supporting_evidence` (理解を助ける) に分ける。1 枚に置くのは原則として主張の証拠だけ
4. `audience_profile` に応じて残す情報を調整する。専門家向けでは軸・誤差・条件・サンプル数を、初学者向けでは前提・中間ステップを残す。意思決定や理解に必要な情報は残し、処理だけを要求する情報 (重複、無関係な数値、装飾的な引用) を `excluded_information` に理由付きで置く
5. 精密な比較が主張の核心なら `precision_needed: exact` とし、後工程が位置・長さで表現できるよう値をそろえて残す (表現の選択はしない)
6. `gaps` が `required_evidence` に当たる場合は `BLOCKED` とし、`issues` に「元資料の追加提供」または「主張の見直し (`slide-assertion-designer`)」を書く。`supporting_evidence` の不足だけなら `COMPLETE` にして `gaps` に残す
7. `source_references` を配布版・注記で使える形でまとめる

## 参照するガイド

- `references/domain-guide.md` §2「認知負荷理論」の段落 — 意思決定や理解に必要な情報は残し、処理だけを要求する情報を減らす。expertise reversal
- `references/domain-guide.md` §2「Mayer のマルチメディア学習理論」の段落 — Coherence
- `references/domain-guide.md` §3 の表「情報密度」行 — 1 枚につき主張とその証拠だけ
- `references/domain-guide.md` §6 の悪い例・改善例 — 結論に寄与する証拠だけ残す実例
- `references/domain-guide.md` §7 のチェックリスト「証拠」「削除」行

## 結果

- `COMPLETE` → `recommended_next: slide-evidence-selector-reviewer`
- `BLOCKED` → 必須の証拠が `source_materials` に無い、`source_materials` が無い状態で主張が事実・データを要求している
- `rollback_candidates`: `slide-assertion-designer` (主張が証拠で支えられない、主張の粒度が元資料と合わない)
