# 更新履歴

## 1.1.0 — 2026年9月19日

初版の実地検証で見つかった 3 点を是正しました。

### 変更

- **作業言語と成果物の声を分離** (I-15)。依頼の「対象者は幼稚園児、ひらがなで」といったトーン・表記の指定が、`audience_profile` などの作業の記録まで変えてしまう問題を是正しました。指定は `presentation_brief.deliverable_voice` に記録し、聴衆が読む・聞く文字列にだけ適用します。Context の出力スキーマでは該当項目に `[成果物の声]` と印を付けています。作業の記録・所見・案内は常に日本語の常体で書きます
- **各ターンを「次にすること」で終える** (I-16)。工程が切り替わった後に現在の状況しか出ず、利用者が次に何をすればよいか分からずに作業が止まる問題を是正しました。そのまま打てる操作と、それを選ぶと何が起きるかを 1 行ずつ示します。`BLOCKED` では足りないものと渡し方を、`FAIL` では所見の要点を日本語で書きます
- **`SAMPLES.md` を追加**。起動から完成状態までのターンの並びを実物の形で示します。FAIL と差し戻し、BLOCKED、状況確認、人間承認、言語の分離、内容モデルによる分岐を個別の例で載せています。実行時には読み込みません
- `audience_profile` に `voice_consistency` を追加。読解水準と専門性が矛盾する場合を記録します
- 確認ケースに L01〜L07 (言語とトーン) と N01〜N07 (ターン末の案内)、静的検査 S09〜S11 を追加しました

### 維持した条件

Context の構成と責務、1 Turn = 1 Context、生成と検証の分離、差し戻し原則、PPTX 既定とテンプレート必須、画像を生成しない方針、ドメインガイドの本文は変えていません。

## 1.0.0 — 2026年9月19日

初版。

### 構成

- 1 スキル・Context Router 構成。Control / Foundation / Deck Design / Slide Content / Visual Design / Rendering-Build / Delivery / Validation の 8 段階、69 Context (Designer 32・Reviewer 32・Validator 4・Navigator 1)
- `references/REGISTRY.md` に全 Context の入出力・遷移・差し戻し先を集約。Context ファイルは `references/contexts/` 配下に段階ごとのディレクトリで 1 本ずつ
- ドメイン知識の正本として `references/domain-guide.md` を同梱。元原稿の引用マーカーを出典表記へ置換し、見出しに番号を付し、出典対応表を付録として追加。本文は変更していない

### 決めたこと

- 1 Turn = 1 Specialist Context。人間の操作なしに次 Context へ進まない。FAIL は差し戻し先を示して止まり、自動修復しない
- Artifact は会話中の YAML ブロックを正本とし、Reviewer の PASS を承認とする。人間が Reviewer を経ずに承認する場合は記録に残す。Validator は人間承認で代替できない
- 出力は PPTX を既定とし、文字・表・Chart・図形はテンプレート上のネイティブ要素で組み上げる。PPTX テンプレートは必須 (無ければ `delivery-artifact-planner` が BLOCKED)
- 画像は生成しない。`image-generator` は受け渡し仕様と配置枠を作り、ユーザーが別途作った画像をはめ込む
- コード実行機能が無い環境では Build 系 Context を BLOCKED とし、テキストの仕様を生成物と称しない
- `presentation-preflight-reviewer` と `outcome-evaluator` は実測情報・測定データが無ければ BLOCKED。推測で PASS にしない

### 検証の区別

配布時の検査は静的検査 (構造・YAML・内部参照・Registry の整合) です。ZIP の検査・作成は、アカウントへの反映や、実際の起動・会話動作・生成物の品質の検証を意味しません。
