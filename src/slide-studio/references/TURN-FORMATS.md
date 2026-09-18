# ターンの書き方

`SKILL.md` が判断の規則を持ち、本書がその書き方と例を持つ。**毎ターン読むものではない。** 次のいずれかに当たるときだけ読む。

| 読むとき | 読む節 |
|---|---|
| 確認ターンを出す | §1 |
| `FAIL` を返す | §2、§4 |
| `BLOCKED` を返す | §3 |
| Reviewer / Validator が `review_result` を出す | §5 |
| 差し戻し先を決める | §4 |

判断の規則 (いつ確認するか、選択肢の記号、推奨の付け方、回答の解釈、値の 3 つの状態) は `SKILL.md` が正本である。本書と食い違ったら `SKILL.md` が正しい。

---

## 1. 確認ターン

推論で埋めるしかない点が残っているときに出す (I-17)。**YAML を出さない。** 1 ターンに 1 論点。

```markdown
この報告で役員に何を決めてもらうかを確認させてください。
ここが変わると、構成の骨格と、どの証拠を最初に出すかが変わります。

A. Q3 も同じ予算で施策を続けることへの承認
   求める決定を最初の Slide に置き、Q2 の実績をその根拠として並べます。
   判断に要る材料は、継続した場合の見込みと、やめた場合の影響です。

B. Q3 の予算額そのものの決定
   金額の選択肢を比較する構成になり、案ごとの効果と費用が要ります。
   Q2 の実績は前提の確認に下がります。

C. 決定は求めず、状況の共有だけ
   結論を先に置く構成ではなくなり、成功条件も「理解」に寄ります。

9. それぞれを詳しく説明して、もう一度選び直す

A などの記号でも、自由入力でも答えられます。
```

### 1.1 選択肢の作り方

- 各選択肢に、**選ぶと成果物がどう変わるか**と、**後の工程にどう効くか**を書く。完了ターンの 4 観点はここでは使わない。論点は操作ではない
- 上流 Artifact から妥当な既定を導けるなら `A` に置いて推奨とする。**ユーザー本人の価値判断にあたる論点には推奨を付けない。** その場合 `A` は単に最初の選択肢である。上の例は価値判断なので推奨が無い
- 原則 4 つまで。数合わせで弱い選択肢を作らない。実質 2 案なら 2 案でよい
- 委任できる論点では、委任を選択肢として明示する (例: `D. どちらでもよい。理由を記録して進める`)。**価値判断の論点には委任の選択肢を置かない**
- `9` は何も決めず、各選択肢を詳しく説明して同じ論点を再提示する
- 自由入力を常に有効とする。記号より具体的な指定を優先する
- 「分からない」も有効な回答とする。その場合その項目は**未回答**のまま残し、推論で確定させない

### 1.2 まとめて委任されたとき

「残りは任せる」と明示されたら、残る論点を埋めて進めてよい。埋めた内容と根拠を記録し、完了ターンで一覧を示す。**黙って埋めることとは区別する。**

価値判断にあたる論点は、まとめての委任でも埋めない。その論点だけを改めて確認する。

```markdown
残る論点をこちらで埋めて進めます。埋めた内容は記録に残します。
ただし、聴衆に何を判断してほしいかは発表者の決定なので、そこだけは
改めて確認させてください。
```

### 1.3 記録

完了ターンの結果ブロックへ、聞いた内容と答えを対で残す。状態は `SKILL.md`「値の 3 つの状態」に従う。

```yaml
clarifications:
  - field: purpose
    asked: 役員に何を決めてもらうか
    state: answered            # answered | delegated | unanswered
    value: Q3 継続の承認
  - field: audience.size
    asked: 聴衆の人数
    state: delegated
    value: 8 名程度
    basis: 役員会の一般的な規模から。実測ではない
  - field: deliverable_voice.tone
    asked: null
    state: unanswered
    why_it_matters: 画面文章と話者の語調が変わる。この工程では要らないので聞いていない
```

---

## 2. `FAIL` のとき

所見の要点を 1〜2 文の日本語で、選択肢より先に書く。YAML を読ませて済ませない。

```markdown
S03 の主張が「売上推移」というトピック名のままで、聴衆に何が残るかが
読めません。数値の裏づけも上流の Artifact に無いものが入っています。

**次にすること**

A. `戻す` — slide-assertion-designer S03（推奨）
   所見を読んだうえで、同じ工程が v2 を作ります。トピック名を結論文に直し、
   裏づけの無い数値は証拠の選定へ回します。
   v2 を改めて Reviewer に通すことになります。
   所見が具体的なので、まずこれで解けるかを見るのが早道です。
   v1 は残るので、後から比べ直せます。

B. `slide-sequence-designer` — この Slide の役割自体を見直す
   主張が立たないのは Slide の切り方が原因かもしれないときに選びます。
   slide_sequence_plan が v2 になり、S03 以降の Slide 単位の成果物は
   要再確認になります。戻す範囲が広いので、A で解けないと分かってから
   選ぶほうが早く済みます。

9. それぞれを詳しく説明して、もう一度選び直す
```

`戻す` が何を作り直し、どの版が残るかを必ず書く。

---

## 3. `BLOCKED` のとき

足りないものと入手方法を書く。ユーザーが渡す外部入力なら、渡す操作自体を `A` にしてよい。

```markdown
PPTX テンプレートがまだ無いため、配布形態を決められません。

**次にすること**

A. テンプレート (`.pptx` / `.potx`) をこの会話へ添付する（推奨）
   スライドサイズ、レイアウト名、テーマの色とフォントを読み取って
   delivery_artifact_plan に記録します。
   これが無いと Rendering / Build / Delivery の全工程が止まります。
   推測でテンプレートを作ることはしません。
   添付したらもう一度この工程を実行します。

B. `deck-outline-designer` — テンプレート無しでも進む構成設計を先にやる
   内容の設計はテンプレートに依存しません。並行して進められます。

9. それぞれを詳しく説明して、もう一度選び直す
```

上流 Artifact が未承認で止まった場合は、それを生成する Context を `A` に置く。

---

## 4. 差し戻し先の決め方

Reviewer は「直前の Context」へ機械的に戻さず、**問題を生成した最小の上流責務**へ戻す。Registry の `rollback_candidates` から選ぶ。

| 問題 | rollback_target |
|---|---|
| Chart の描画崩れ | `chart-renderer` |
| Chart の種類自体が不適切 | `chart-designer` |
| Chart を使うべきではなかった | `visual-medium-router` |
| 表の行列が多すぎて読めない | `table-designer` |
| 図解に元の内容に無い関係がある | `diagram-designer` |
| 画像の役割が装飾しかない | `image-planner` |
| 根拠そのものが弱い | `slide-evidence-selector` |
| 主張が不適切 | `slide-assertion-designer` |
| 内容モデルの分類が誤っている | `slide-content-model-router` |
| Slide 自体が不要 / 役割が違う | `slide-sequence-designer` |
| 章の構成が目的につながらない | `deck-outline-designer` |
| 聴衆の前提が違う | `audience-analyzer` |
| 進行形式が目的に合わない | `presentation-mode-designer` |
| 依頼の整理そのものが誤っている | `brief-normalizer` |

差し戻された Designer は、`review_result` の所見を読んで新しい版を作る。所見を無視して同じ内容を再提出しない。上流に問題がある場合は自分で直さず、自分の結果を `BLOCKED` にして更に上流への差し戻しを提案する。

---

## 5. `review_result` の形式

Reviewer と Validator の出力。修正案を書かず、何が問題でどこへ戻すかだけを書く。

```yaml
artifact: review_result
reviewer: slide-assertion-designer-reviewer
target: slide_assertion_spec@S03 v1
verdict: FAIL                # PASS | FAIL
findings:
  - severity: MAJOR          # CRITICAL | MAJOR | MINOR
    where: headline
    issue: 見出しが「売上推移」というトピック名で、結論が読めない
    evidence: domain-guide.md §3 見出し行 / slide_sequence_item@S03.purpose
    rollback_target: slide-assertion-designer
recommended_next: slide-assertion-designer
```

`CRITICAL` または `MAJOR` が 1 つでもあれば `FAIL`。`MINOR` だけなら `PASS` とし、所見を下流への注意として残す。Reviewer は直さない。

Validator は `verdict` に `BLOCKED` も取り、確認できなかった観点を `unverified` に残す。**未検証を `PASS` の根拠にしない。**
