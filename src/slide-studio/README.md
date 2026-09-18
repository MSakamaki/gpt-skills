# スライド作成スタジオ

スキル名：`slide-studio`　版：**1.4.0**  
初期版作成日・更新日：2026年9月19日

## できること

プレゼンテーション資料を、根拠のある手順で 1 工程ずつ作ります。目的・聴衆の整理 (Foundation) → Deck の構成 → Slide ごとの主張・証拠・視覚表現・話者原稿・レイアウト・スタイル・段階提示 → PPTX テンプレートへの組み上げ → 配布形態 → アクセシビリティ・品質・実機確認、の順に進み、各工程の成果物 (Artifact) は別の Reviewer が検証します。

1 回の操作で実行する工程は 1 つだけです。「最後まで自動で作る」スキルではありません。スライド設計の判断はすべて、同梱の `references/domain-guide.md` (認知負荷理論、Mayer のマルチメディア原理、assertion–evidence、Gestalt、グラフ知覚、アクセシビリティ指針などを整理したガイド) を根拠にします。

対象外にしているもの。

- 画像 (写真・イラスト・アイコン) の生成。画像の役割・条件と配置枠だけを定め、画像そのものは別の画像作成スキルや画像生成機能で作ってユーザーがはめ込みます
- PPTX テンプレート無しでの組み上げ。テンプレートはユーザーが用意します
- 「美しさ」の一律な基準や特定テンプレートへの固定

## 明示して使う

**ユーザーが意図的にこのスキルの利用を指定した場合だけ動きます。** スライドやプレゼンの話題が出ただけでは適用されません。

ChatGPT では `@` からスキルを選択できます。[1] 選択した状態で依頼を伝えるか、文章で利用を明示します。

```text
slide-studio を使って。役員向け 10 分の社内報告を作りたい。テンプレートと売上データを添付する。
```

最初は `workflow-navigator` (使い方と進捗の案内) か `brief-normalizer` (依頼の構造化) から始まります。以降は次のように操作します。

| 操作 | 意味 |
|---|---|
| `A` `B` `C` … | 直前のターンの選択肢を選ぶ。大文字小文字と全角半角は区別しない |
| `9` | 何も実行せず、各選択肢を詳しく説明して選び直す |
| `次へ` | 直前の結果が示す次の工程を 1 つ実行する (選択肢 `A` と同じ) |
| `戻す` | 直前の FAIL が示す差し戻し先を実行する (Designer が新しい版を作る) |
| `状況` | 進捗・実行できる工程・不足している入力を表示する |
| Context 名 (例: `slide-assertion-designer S03`) | その工程を指定して実行する |
| 「Slide 3 の主張を作って」 | 最も合う工程を 1 つ選んで実行する |
| ファイルや実測値の提供 | 外部入力として受け取る (工程は実行しない) |

各工程の成果物は会話中の YAML ブロックとして出力されます。これが作業の状態です。スキルの内部に隠れた状態はありません。上流の成果物を作り直したら、それに基づく下流は「要再確認」として案内されます。

## 分からないことは推論で埋めません

上流の成果物に書かれておらず、埋め方で結果が実質的に変わる点は、選択式で確認してから埋めます。工程の実行中に確認が要るときは、まず論点を 1 つ聞きます。この**確認ターン**では YAML を出しません。工程がまだ終わっていないためです。確認が終わって工程が完了したときに、**完了ターン**で結果と成果物を出し、次の操作を案内します。

```text
最初の依頼 / A / 次へ → 確認ターン (論点を 1 つ) → 完了ターン (結果 + 次にすること)
```

確認していない項目は「なし」ではなく**未回答**として残ります。あなたが「指定はありません」と答えたときだけ「なし」になります。未回答はそのまま後の工程へ渡り、その値が必要になった工程が改めて聞きます。依頼の時点で使わない指定を先回りして聞くことはしません。

目的、優先順位、主張の強さなど本人が決めるべき論点には推奨を付けません。選択肢の違いを中立に説明します。「残りは任せる」と伝えれば埋めて進めますが、埋めた内容と根拠は記録に残ります。検証の工程 (Reviewer と Validator) は確認しません。判定に必要な事実が無ければ止まります。

## ターンの終わり方

毎ターンの最後に「次にすること」が選択式で付きます。`A` `B` `C` と記号が並び、それぞれに「何をする工程か」「選ぶと何が変わるか」「いつこれを選ぶか」「取り消せるか」が書かれます。記号 1 文字で答えられます。工程名でも自由入力でも構いません。

`9` を打つと、何も実行せずに各選択肢を詳しく説明して選び直せます。`0` は使いません。推奨は常に `A` にあります。数字を選択肢の記号にしていないのは、Slide 番号と紛れるためです。

止まったときは、足りないものと渡し方が選択肢になります。実際のターンの並びは [進行例](SAMPLES.md) を見てください。

## 資料のトーンと、やり取りの言葉は別

「対象者は幼稚園児、ひらがなで」「スライドは英語で」といった指定は**成果物の声**として扱います。スライドに出る文字、話す内容、活動の指示、配布物の補足にだけ適用され、作業の記録 (各工程の成果物や検証の所見) と案内は通常の日本語のままです。作業の記録まで対象読者向けの表記になると読みにくく、検証もしにくくなるためです。

## 前提と環境

| 前提 | 内容 |
|---|---|
| PPTX テンプレート | `delivery-artifact-planner` 以降で必須。無い場合はその工程が BLOCKED になり、先へ進めません |
| コード実行機能 | テンプレートの検査、Chart・表・図形の実装、Slide と Deck の組み上げ、配布形態の作成に必要です。無い環境では該当工程が BLOCKED になります (設計工程は動きます) |
| 元資料 (`source_materials`) | 証拠 (データ・例・出典) の出所。無い主張に証拠を創作することはなく、`slide-evidence-selector` が BLOCKED になります |
| 実測情報 (`environment_facts`) | `presentation-preflight-reviewer` に必要。投影環境・最遠席の可読性・リハーサル時間など。無ければ BLOCKED。AI の推測で合格にはしません |
| 測定データ (`measured_results`) | `outcome-evaluator` に必要。無ければ BLOCKED。`DELIVERY_READY` と `OUTCOME_VALIDATED` は別の状態です |

出力は PPTX を既定とし、文字・表・Chart・図形はテンプレート上のネイティブ要素として組み上げます。画像は `image-generator` が受け渡し仕様と配置枠を作り、ユーザーが別途作った画像をはめ込みます。ChatGPT では作業中の PPTX ファイルがセッションで失われることがあります。Build 系の工程の後は、案内される方法でファイルを取得してください。

## 工程の全体像

```text
Foundation      brief → audience → mode → delivery plan → success criteria → validation plan → accessibility policy
Deck Design     deck outline → slide sequence
Slide Content   content model → (assertion → evidence | activity | structural) → copy → speaker track
Visual Design   visual medium → (chart | table | diagram | image) → layout → style → animation
Rendering/Build renderers → slide build → (animation build) → deck build
Delivery        delivery variants (live / handout / recording support)
Validation      accessibility → quality audit → preflight → (outcome)
```

各工程には Designer と Reviewer が対になっています (Validation は独立検証のみ)。Reviewer は修正せず、問題を生成した最小の上流工程を差し戻し先として示します。工程の一覧・入出力・遷移は `references/REGISTRY.md` が正本です。

## 起動設定と導入後の確認

`agents/openai.yaml` に次の設定を含めています。

```yaml
policy:
  allow_implicit_invocation: false
```

公式資料では、この設定によって Codex の暗黙起動を無効にできることが明記されています。[1] **ChatGPT Web/Desktop でも同じ設定が必ず同じように反映されると、この ZIP だけからは保証しません。** 明示起動専用の説明文と本体の制御も併用し、利用先で実際の明示起動・非適用・継続を確認してください。

導入・更新の操作は、利用環境の最新の公式案内を参照してください。[2] 導入後は、明示選択で開始すること、未選択の通常依頼には適用されないこと、1 回の操作で 1 工程だけ進むこと、FAIL で止まって差し戻し先が示されることを確認します。

ZIP の作成・検査・配布は、アカウントへのインストール、既存版への反映、実行試験の完了を意味しません。

## ファイル構成と保守

```text
slide-studio/
  SKILL.md                      Router (実行規則の正本)
  agents/openai.yaml            表示情報と起動ポリシー
  assets/icon.svg
  SAMPLES.md                    進行例 (ターンの並び)
  README.md / CHANGELOG.md
  references/
    REGISTRY.md                 Context Registry (一覧・入出力・遷移・差し戻し先)
    TURN-FORMATS.md             ターンの書き方と例 (条件付きで読む)
    domain-guide.md             ドメイン知識の正本 (§1〜§7 + 付録)
    test-cases.md               確認ケース
    contexts/<stage>/<context>.md   各 Context の手順 (69 本)
```

実行時に読むのは `SKILL.md`、`REGISTRY.md`、対象の Context ファイル 1 本、その Context が指定するガイドの節だけです。`TURN-FORMATS.md` は確認や差し戻しが要るときだけ読みます。README・SAMPLES・CHANGELOG・test-cases は保守と案内のための資料で、通常の実行では読みません。

## 検証状況

配布時の静的検査と、導入先での会話動作・生成物の実地検証を区別します。静的検査では、構造、YAML、内部参照、Registry と Context ファイルの 1 対 1 対応、Designer / Reviewer の対、遷移先と Artifact 名の解決を確認しています。実地テストの期待結果は `references/test-cases.md` に記載していますが、記載は合格を意味しません。

## 公式情報の参照先

2026年9月19日確認。製品仕様の参考であり、本スキルの設計判断の根拠ではありません。

[1]: https://learn.chatgpt.com/docs/build-skills
[2]: https://help.openai.com/ja-jp/articles/20001066-skills-in-chatgpt
