# adversarial-answer v2 — 引き継ぎ

最終更新: 2026-09-18 (Skill `slide-visual` の追加に伴いリポジトリ構成の記述を更新)

改訂履歴は [handoff-history.md](handoff-history.md) に分離している。本書は常に「現在の状態と次にやること」だけを書き、過去の経緯は履歴側へ移す。

---

## 1. 現在地

v2 移行の Phase 1〜8 はすべて完了している。v1 の「単一論文ベースの敵対的検証」から、v2 の「Failure Mode Router + Method Card + Invariant Gate」への移行は動作する状態で終わっている。

| Phase | 内容 | 状態 |
|---|---|---|
| 1 | 現状調査と仕様統合 | 完了 |
| 2 | 実装計画と最終ファイル構成 | 完了 (計画文書は役目を終えたため削除。plans1 提案の採否は §3 へ移動) |
| 3 | PDF 取得と Reference Manifest | 完了 (P0 のうち 2 本は取得不可) |
| 4 | Method Card と Router | 完了 (Card 9 枚) |
| 5 | SKILL.md 統合 | 完了 |
| 6 | Router Regression | 完了 (36 ケース全 PASS) |
| 7 | A/B と敵対的検証 | 完了 → [docs/PHASE7-AB.md](../docs/PHASE7-AB.md) |
| 8 | 最終検証と Package | 完了 (`dist/adversarial-answer/skill.zip` 3.40MB) |

**未検証なのは本番環境 (ChatGPT) での動作だけ。** それ以外は机上・ローカルで確認済み。

### 検証状態

- `npm run check` = 0 error / 0 warn
- Router Regression 36 ケース全 PASS、CRITICAL な誤 Route 0、Forbidden Primary 違反 0
- `dist/adversarial-answer/skill.zip` sha256 `1604c1012e4124b39007b07e89c9ded1164994a2d5f15f02ae1a3ac8660990ae` / `dist/guided-clarification/skill.zip` sha256 `7df5451cf3aa7b2afedc7b16dbe858d239d8011f141b774e849a6cbea8465634`
  **この値は git 格納内容 (LF) からビルドしたもの。** 新規 clone でのビルドと一致することを確認済み
- git 16 コミット。baseline `6e2a38b` (v1 as-is)。**GitHub の `origin` (SSH) へ push 済みで、リポジトリは public**
- 秘密情報スキャンは作業ツリーが 0 件。加えて 2026-09-16 に**履歴全体を 1 回スキャン済み** — 全コミットのテキスト blob 82 件 (移動前の `src/SKILL.md` など削除済みファイルの旧版を含む) で 0 件。public 化以前の混入はない
- **CI で `npm run check` を常時実行** — `.github/workflows/check.yml`。main への push と全 Pull Request で走る。`.secrets-denylist` は git 管理外のため、リポジトリ Secret `SECRETS_DENYLIST` を設定するまで**組織固有語の検査だけが CI で効かない** (トークン・個人情報の検査は常に動く)

---

## 2. リポジトリ

複数 Skill を持てる構成になっている。`src/` 直下で `SKILL.md` を持つディレクトリが 1 つの Skill で、ディレクトリ名は `SKILL.md` の `name` と一致させる (不一致は検証エラー)。

```text
gpt-skills/                          ← リポジトリルート (D:\gpt-skills)
├── src/
│   ├── adversarial-answer/          本書が対象とする Skill
│   ├── guided-clarification/        2026-09-16 にユーザーが追加。3 ファイル / 8.7KB
│   └── slide-visual/                2026-09-18 にユーザーが追加。6 ファイル / 44.5KB
├── tools/      node 製の検証・ビルド・PDF 調査ツール (配布対象外)
├── docs/       配布対象外
│   ├── spec/<skill-name>.md         Skill ごとの仕様
│   ├── test/<skill-name>.md         受入基準の評価結果
│   ├── handoff.md / handoff-history.md   本書と改訂履歴
│   └── PHASE7-AB.md                 v1 との A/B 実測
├── plans/      進行中の計画・調査メモ。完了したら docs/ へ畳み込む (現在は空)
├── .github/workflows/  CI (push / PR で npm run check)
├── README.md   リポジトリ全体の説明
├── CLAUDE.md   メンテナンス手順 (Claude Code 向け)
└── dist/
    └── <skill-name>/skill.zip       (git 管理外)
```

**本書 (`handoff.md`) は `adversarial-answer` の引き継ぎであり、`guided-clarification` と `slide-visual` は対象外。** どちらもユーザーが作成した独立の Skill で、仕様は [spec/guided-clarification.md](spec/guided-clarification.md) と [spec/slide-visual.md](spec/slide-visual.md) が持つ (受入基準の評価結果は `docs/test/<skill-name>.md`)。`slide-visual` は `references/test-cases.md` を持つが、`adversarial-answer` の v2 成果物 (Method Card / Manifest / Router テスト) とは無関係で、検証条件も変わらない。

```bash
npm install
npm run check    # scan-secrets -> build(strict) -> verify-package。リリース前はこれ
npm run check -- --skill=adversarial-answer   # 1 つだけ対象にする
npm run hash -- <file>                    # Manifest 用 SHA256 / File Size
node tools/pdfinfo.mjs <file.pdf>         # タイトル・著者・ライセンス表記
node tools/pdftext.mjs <file.pdf> 1 3     # 指定ページのテキスト
```

検証は `SKILL.md` と `agents/openai.yaml` だけを全 Skill 共通の必須とし、`references/methods/` または `METHOD-ROUTING.md` を持つ Skill にだけ Method Card と Manifest の完全性を要求する。`adversarial-answer` 以外の Skill を追加しても、この Skill の検証条件は変わらない。

---

## 3. 覆してはいけない決定事項

後から「なぜこうなっているのか」で迷わないための記録。変更する場合はユーザーの確認を取ること。根拠列の SPEC は [spec/adversarial-answer.md](spec/adversarial-answer.md) を指す。

| # | 決定 | 根拠 |
|---|---|---|
| D1 | ルーティングは `Problem Profile → Failure Mode → Applicability → Method` の順。Profile から Method を直接決めない | SPEC §1。v2 の中核 |
| D2 | 数値スコアによる Method 選択を導入しない | SPEC §1。根拠のない重みは新たな恣意性 |
| D3 | 最大 3 Method は上限であり目標ではない | SPEC §1 |
| D4 | Method Card が実行仕様の正本。PDF は根拠であって実行指示ではない | SPEC §0 の正本分担 |
| D5 | 実行時に全 PDF をロードしない | SPEC §4 |
| D6 | 単一モデル時も停止せず `role_separated_single_model` で続行し、独立 Agent とは記録しない | SPEC §5。v1 はユーザー許可待ちで停止していた |
| D7 | Invariant Gate G1〜G7 は専門 Method が置き換えない。実施結果を記録する | SPEC §1 + Phase 7 の発見 |
| D8 | `UNKNOWN` ライセンスの arXiv 版と Elicitron を同梱する | SPEC §47 が**正式な現行仕様**として規定。変更する場合は仕様変更として扱う |
| D9 | 著者サイトで無償公開でも、実体が出版社の組版版なら同梱しない | Phase 3 での判断。ユーザーの当初指示より厳格な側へ倒した |
| D10 | 取得できない論文を別論文で置換しない | SPEC §4 |

### 旧仕様 (plans1) 由来の提案の採否

仕様は当初 `plans/plans2.md` (正本) と `plans/plans1.md` (旧版) に分かれており、Phase 2 で plans1 固有の提案を分類して採否を決めた。**両ファイルは 2026-09-16 に削除済み** (内容は [spec/adversarial-answer.md](spec/adversarial-answer.md) へ集約)。この表は、旧版にあって採らなかったものを再提案されたときの判断材料として残す。

| ID | 内容 | 採否 | 反映先 |
|---|---|---|---|
| S1 | `INDEPENDENT_FIRST` / `MINORITY_DISSENT` の定義 (Reviewer 同士を最初から相互参照させない / 初期回答を固定 / Consensus を正解としない) | 採用 | `DESIGN-PRINCIPLES.md` (実行時の正本は `SKILL.md` §6) |
| S2 | Method Card に参照ページを記録 | 採用 | Card の Evidence 欄 |
| S3 | Reference 障害時の Fallback 手順 (PDF 不在 → Manifest の Fallback → 無ければ当該 Method 不使用 + 最終回答へ制約記録。Web へ自動切替しない) | 採用 | `METHOD-ROUTING.md` §9 / 各 Card の Fallback |
| S4 | 高保証時は Defeater を 4 つ目として足さず、Coverage の低い Method と入れ替える | 採用 | `METHOD-ROUTING.md` §6 |
| S5 | 論理 / 事実 / 実用性の 3 観点を完全廃止しない | 採用 | Invariant Gate + Round 補助観点として `SKILL.md` |
| S6 | Invariant Gate G5 に安全・上位ルールへの適合を含める | 採用 | `SKILL.md` G5 の定義 |
| S7 | Manifest に `Required` / `Method Card` 欄 | 採用 | `REFERENCE-MANIFEST.md` |
| S8 | 「最大 3 Method は上限であり目標ではない」 | 採用 | `METHOD-ROUTING.md` §6 / `SKILL.md` (= D3) |
| C1 | Failure Mode 番号体系 F1–F14 | 不採用 | `F01`–`F16` を採用 |
| C2 | `references/` 直下に Method Card と PDF を平置き | 不採用 | `methods/` + `papers/<category>/` を採用 |
| C3 | 旧版の Method Card 見出し体系 | 不採用 | 現行の Card テンプレートを採用 |
| U1 | Policy Delphi | 不採用 | Method Registry に存在しない |
| U2 | Router 不確実時にユーザー確認質問へ戻る | 不採用 | Route Check の「再選択 1 回」に従う。残存不確実性は最終回答へ記録 |
| U3 | `package_skill.py` | 不採用 | 存在しないツール。node ビルドを使用 |

---

## 4. 残作業

優先度順。

### R1. 本番環境での動作確認 (最優先・未着手)

`dist/adversarial-answer/skill.zip` を ChatGPT へ上げ、実際に走らせる。確認するのは次の 3 点。

1. Progressive Loading が動くか — `SKILL.md` から `references/METHOD-ROUTING.md` と Method Card が追加読み込みされるか
2. 読み込み量が実運用で収まるか — 固定約 35KB + Method Card 1〜3 枚 (各約 5〜7KB)
3. 検証サマリーに Route (Problem Profile / Failure Mode / 選択 Method / Route Check 結果) が出るか

ここが崩れると Router 設計の前提そのものが崩れる。**他の改善より先にやる。**

テスト入力は `src/adversarial-answer/references/ROUTER-TEST-CASES.md` から代表 5〜6 件を選ぶとよい。境界ケース (BND-001 / BND-002 / BND-003 / BND-004) は Route の正誤が判定しやすい。

### R2. ABP と Premortem の Card 根拠補強

この 2 枚が最も根拠が薄い。

- `METHOD-ABP.md` — 根拠は RAND のランディングページ記述のみ。原典 PDF は再配布不可かつ暗号化で本文抽出不可
- `METHOD-PREMORTEM.md` — 原典 (Wiley 1989) が取得不可

組織で RAND / Wiley のアクセス権があれば本文照合し、Card の `Research-backed` 節を確定できる。現状は `Evidence Strength` を落として正直に書いてある状態。

### R3. P1/P2 Method の扱いの確定

ACH / Considering-the-Opposite / Socratic は原典を取得できていない。現状維持 (根拠の薄さを明示したまま EXECUTABLE_METHOD) か、DESIGN_PRINCIPLE へ降格するかの判断が未了。

---

## 5. 課題・残存リスク

`docs/PHASE7-AB.md` §5〜6 に詳細。要点だけ再掲する。

| # | リスク | 現状の扱い |
|---|---|---|
| K1 | 実行手順の複雑化による Route Check の実施漏れ | 検出手段なし。受け入れている |
| K2 | 適用条件が緩い Method が候補表上位にいると適用フィルタをすり抜ける | DEFEATER で 1 件顕在化し修正済み。同型が他 Method に潜在しうる |
| K3 | `F13 CRITERIA` に専任 Method がない | Invariant Gate G1 + SOCRATIC で部分被覆。未 Coverage は制約として記録 |
| K4 | 3 Method 上限での取りこぼし | 未 Coverage Failure Mode を記録する設計 |
| K5 | `UNKNOWN` ライセンス PDF の同梱 (D8) | Manifest に正直に記録。保守的運用へ切り替える場合は SPEC §47 の仕様変更として行う |
| K6 | A/B が非盲検・同一モデル・各 1 試行 | 本番での定量評価が未実施 |

---

## 6. 次の選択肢

| | 内容 | 規模 |
|---|---|---|
| **A** | 本番投入して実地検証 (= R1) | 中 |
| **B** | ライセンス保守的運用へ切替。`UNKNOWN` の 4 本を ZIP から外し Manifest 記載のみに。ZIP は 3.40MB → 約 0.8MB。Method Card が実行仕様なので動作は変わらない | 小 |
| **C** | P1/P2 の整理 (= R3) | 小〜中 |
| ~~**D**~~ | ~~GitHub Actions で `npm run check` を常時実行~~ | **完了** |
| **E** | Router テストへ対抗ケース追加。現在の 36 件は仕様どおり動くことの確認が中心。「わざと誤 Route を誘発する依頼文」を足すと K2 を能動的に探せる | 中 |

推奨は **A**。Router 設計の前提を検証する唯一の手段で、ここを飛ばすと他の改善が空振りになりうる。D (CI) は完了したので、以降の変更は push / PR のたびに検証される。

---

## 7. 再開手順

```bash
cd D:\gpt-skills
npm install          # node_modules は git 管理外
npm run check        # 0 error / 0 warn になることを確認
git log --oneline    # 16 コミット
git remote -v        # origin は GitHub (public)
```

そのうえで本書 §4 と §6 を読み、着手対象をユーザーと決める。

読む順序は `CLAUDE.md` (リポジトリの約束事) → `docs/handoff.md` (本書) → [spec/adversarial-answer.md](spec/adversarial-answer.md) (設計判断と研究根拠) → `src/adversarial-answer/references/METHOD-ROUTING.md` (Router 仕様)。

---

## 8. 触ってはいけないもの

- baseline コミット `6e2a38b` — Phase 7 A/B の Baseline。v1 の内容はここからのみ復元できる (`git show 6e2a38b:SKILL.md`)

---

## 9. 環境上の注意

この環境で実際に踏んだ落とし穴。

- **Bash の heredoc が `\\` を 1 段階落とす。** `cat > file <<'EOF'` でクォート付きヒアドキュメントを使っても、`\\` が `\` になる。正規表現やエスケープを含むソースは Write ツールで書くこと。単一の `\` は保持される
- **PDF を Read ツールで開けない。** poppler (pdftoppm) が未インストールのため。`node tools/pdftext.mjs <file> <from> <to>` を使う
- **RAND と Wiley は curl に 403 を返す。** RAND はブラウザ相当の User-Agent を付ければランディングページのみ 200
- **作業ツリーの改行が CRLF だと ZIP のハッシュがずれる。** `.gitattributes` の `* text=auto eol=lf` により git は LF で格納するが、Windows のツールが書いた作業ツリーのファイルは CRLF になる。ビルドは作業ツリーを読むため、**手元のハッシュと新規 clone のハッシュが一致しなくなる。** ハッシュを記録する前に作業ツリーを LF へ揃えること。2026-09-16 に `1604c101…` が新規 clone のビルドと一致することを確認済み
- **JSZip は暗黙に作るフォルダエントリへ生成時刻を入れる。** `tools/build.mjs` で全エントリの日時を固定日時へ揃えてある。ここを変えると ZIP の再現性が壊れる
