# GPT Skills

`src/` 直下で `SKILL.md` を持つディレクトリが 1 つの Skill になる。配布物は Skill ごとに `dist/<skill-name>/skill.zip`。`tools/` `docs/` `plans/` はパッケージに含まれない。

## Skill 一覧

| Skill | 内容 |
|---|---|
| [adversarial-answer](src/adversarial-answer/SKILL.md) | 依頼を 10 項目で確定し、想定される失敗モードに適した敵対的検証を 3 回行って回答を作る |
| [guided-clarification](src/guided-clarification/SKILL.md) | 最終回答を実質的に変える確認だけを `0/1/2/3/9` の選択式で 1 問ずつ行ってから回答する |

以下の `references/` に関する記述は `adversarial-answer` 固有で、すべての Skill に必要なものではない。

## 構成

```text
src/
└── adversarial-answer/          ← ディレクトリ名 = SKILL.md の name
    ├── SKILL.md
    ├── agents/openai.yaml
    ├── assets/icon.svg
    └── references/
```

| パス | 内容 |
|---|---|
| `src/<skill>/SKILL.md` | Skill 本体。実行フロー |
| `src/<skill>/agents/openai.yaml` | ChatGPT / Codex 向けメタデータ |
| `src/<skill>/references/METHOD-ROUTING.md` | Problem Profile → Failure Mode → Applicability → Method のルーティング仕様 |
| `src/<skill>/references/methods/` | Method Card。実行仕様の正本 |
| `src/<skill>/references/papers/` | 方法論の一次根拠 PDF |
| `src/<skill>/references/REFERENCE-MANIFEST.md` | 論文のメタデータ・ライセンス・SHA256 |
| `src/<skill>/references/ROUTER-TEST-CASES.md` | Router の回帰テスト |
| `plans/` | 正本仕様。**編集しない** |
| `docs/` | 実装計画などの開発用ドキュメント |

`references/` 以下は `adversarial-answer` 固有の構成で、他の Skill に必須ではない。検証は `SKILL.md` と `agents/openai.yaml` だけを全 Skill 共通の必須とし、`references/methods/` または `METHOD-ROUTING.md` を持つ Skill にだけ Method Card と Manifest の完全性を要求する。

### 新しい Skill を追加する

1. `src/<skill-name>/SKILL.md` を作る。frontmatter の `name` はディレクトリ名と一致させる (不一致は検証エラー)
2. `src/<skill-name>/agents/openai.yaml` を作る
3. `npm run check` を実行する

## コマンド

```bash
npm install
npm run check             # build (strict) + verify。リリース前はこれを使う
npm run validate          # 構造検証 (v2 成果物の欠落は WARN)
npm run validate:strict   # v2 成果物の欠落を ERROR にする
npm run build             # 検証したうえで dist/<skill>/skill.zip を生成
npm run verify            # 生成済み ZIP 自体を検証
npm run hash -- <file>    # Manifest 用の SHA256 / File Size を出力
```

いずれも引数なしで全 Skill を対象にする。1 つだけ扱う場合は `--skill=<name>` を付ける。

```bash
npm run build -- --skill=adversarial-answer
npm run check -- --skill=adversarial-answer
```

`npm run build` は `src/<skill>/` の全ファイルを ZIP 内の `<skill>/` 配下へ置く。再現性のため、ファイルとフォルダ双方のエントリ日時を固定している。

論文を追加する際は次の 2 つを使う。どちらも配布物には含まれない。

```bash
node tools/pdfinfo.mjs <file.pdf>          # タイトル・著者・ライセンス表記を抽出
node tools/pdftext.mjs <file.pdf> [from] [to]   # 指定ページのテキストを抽出
```

## 検証内容

`tools/validate.mjs` は `src/` を検査する。

- 必須ファイル (`SKILL.md`, `agents/openai.yaml`) の存在
- YAML frontmatter の `name` が lowercase kebab-case であること、`description` の存在
- `src/` 配下 Markdown からの内部参照 (`references/…` 等) のリンク切れ
- `REFERENCE-MANIFEST.md` と実体の整合 — SHA256・ファイルサイズ・`Bundled` と実体の有無・未登録 PDF の検出
- Skill 合計サイズ (20MB で WARN / 25MB で ERROR)

`tools/verify-package.mjs` は生成済みの `dist/skill.zip` 自体を検査する。ZIP 内 PDF の SHA256 を ZIP 内 Manifest と照合し、開発用ファイルの混入と `Bundled: NO` の PDF の混入を検出する。

## PDF の扱い

PDF は方法論の一次根拠であり、実行仕様ではない。実行仕様は `src/references/methods/` の Method Card を正本とする。実行時に全 PDF を読み込むことはしない。Method Card は PDF が無くても実行できる。

同梱するのは次のいずれかに限る。

- 明示的に再配布が許諾されているもの (CC BY、CC BY-NC-ND など)
- arXiv が配布している版
- 著者・所属機関が公開している著者版

出版社の有料版は同梱しない。**著者サイトで無償公開されていても、実体が出版社の組版版であるものは同梱しない。** 各 PDF の License と Redistribution Allowed は `REFERENCE-MANIFEST.md` に記録する。
