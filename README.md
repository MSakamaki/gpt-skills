# adversarial-answer

依頼を 10 項目で確定し、想定される失敗モードに適した敵対的検証を 3 回行って回答を作る Skill。

配布物は `dist/skill.zip`。Skill 本体は `src/` 配下だけで、`tools/` `docs/` `plans/` はパッケージに含まれない。

## 構成

| パス | 内容 |
|---|---|
| `src/SKILL.md` | Skill 本体。実行フロー |
| `src/agents/openai.yaml` | ChatGPT / Codex 向けメタデータ |
| `src/references/METHOD-ROUTING.md` | Problem Profile → Failure Mode → Applicability → Method のルーティング仕様 |
| `src/references/methods/` | Method Card。実行仕様の正本 |
| `src/references/papers/` | 方法論の一次根拠 PDF |
| `src/references/REFERENCE-MANIFEST.md` | 論文のメタデータ・ライセンス・SHA256 |
| `src/references/ROUTER-TEST-CASES.md` | Router の回帰テスト |
| `plans/` | 正本仕様。**編集しない** |
| `docs/` | 実装計画などの開発用ドキュメント |

## コマンド

```bash
npm install
npm run validate          # 構造検証 (v2 成果物の欠落は WARN)
npm run validate:strict   # v2 成果物の欠落を ERROR にする
npm run build             # 検証したうえで dist/skill.zip を生成
npm run hash -- <file>    # Manifest 用の SHA256 / File Size を出力
```

`npm run build` は `src/` の全ファイルを `adversarial-answer/` 配下に置いた ZIP を生成する。再現性のためファイルの更新時刻は固定される。

## 検証内容

`tools/validate.mjs` は次を検査する。

- 必須ファイル (`SKILL.md`, `agents/openai.yaml`) の存在
- YAML frontmatter の `name` が lowercase kebab-case であること、`description` の存在
- `src/` 配下 Markdown からの内部参照 (`references/…` 等) のリンク切れ
- `REFERENCE-MANIFEST.md` と実体の整合 — SHA256・ファイルサイズ・`Bundled` と実体の有無・未登録 PDF の検出
- Skill 合計サイズ (20MB で WARN / 25MB で ERROR)

## PDF の扱い

PDF は方法論の一次根拠であり、実行仕様ではない。実行仕様は `src/references/methods/` の Method Card を正本とする。実行時に全 PDF を読み込むことはしない。

同梱するのは arXiv および著者公開版のみで、出版社の有料版は同梱しない。各 PDF の License と Redistribution Allowed は `REFERENCE-MANIFEST.md` に記録する。
