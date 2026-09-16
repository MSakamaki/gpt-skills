# adversarial-answer v2 — 引き継ぎ

最終更新: 2026-09-16 / 対象コミット: `11f8e09`

改訂履歴は [handoff-history.md](handoff-history.md) に分離している。本書は常に「現在の状態と次にやること」だけを書き、過去の経緯は履歴側へ移す。

---

## 1. 現在地

`plans/phase.md` の Phase 1〜8 はすべて完了している。v1 の「単一論文ベースの敵対的検証」から、v2 の「Failure Mode Router + Method Card + Invariant Gate」への移行は動作する状態で終わっている。

| Phase | 内容 | 状態 |
|---|---|---|
| 1 | 現状調査と仕様統合 | 完了 |
| 2 | 実装計画と最終ファイル構成 | 完了 → [docs/PHASE2-PLAN.md](../docs/PHASE2-PLAN.md) |
| 3 | PDF 取得と Reference Manifest | 完了 (P0 のうち 2 本は取得不可) |
| 4 | Method Card と Router | 完了 (Card 9 枚) |
| 5 | SKILL.md 統合 | 完了 |
| 6 | Router Regression | 完了 (36 ケース全 PASS) |
| 7 | A/B と敵対的検証 | 完了 → [docs/PHASE7-AB.md](../docs/PHASE7-AB.md) |
| 8 | 最終検証と Package | 完了 (`dist/skill.zip` 3.40MB) |

**未検証なのは本番環境 (ChatGPT) での動作だけ。** それ以外は机上・ローカルで確認済み。

### 検証状態

- `npm run check` = 0 error / 0 warn
- Router Regression 36 ケース全 PASS、CRITICAL な誤 Route 0、Forbidden Primary 違反 0
- `dist/skill.zip` sha256 `5771f3efdd52bd0193cb71c8bec2c7f748ff62b97e5759d879ee79b32ef31cca` (ビルドは再現性あり)
- git 9 コミット。baseline `6e2a38b` (v1 as-is)、HEAD `11f8e09`。**remote 未設定**

---

## 2. リポジトリ

複数 Skill を持てる構成になっている。`src/` 直下で `SKILL.md` を持つディレクトリが 1 つの Skill で、ディレクトリ名は `SKILL.md` の `name` と一致させる (不一致は検証エラー)。

```text
adversarial-answer/                  ← リポジトリ名は最初の Skill 由来
├── src/
│   └── adversarial-answer/          Skill 本体。ZIP 化される唯一の範囲
├── tools/      node 製の検証・ビルド・PDF 調査ツール (配布対象外)
├── docs/       フェーズ成果物 (配布対象外)
├── plans/      正本仕様と本書 (配布対象外)
└── dist/
    └── adversarial-answer/skill.zip (git 管理外)
```

```bash
npm install
npm run check    # build(strict) -> verify-package。リリース前はこれ
npm run check -- --skill=adversarial-answer   # 1 つだけ対象にする
npm run hash -- <file>                    # Manifest 用 SHA256 / File Size
node tools/pdfinfo.mjs <file.pdf>         # タイトル・著者・ライセンス表記
node tools/pdftext.mjs <file.pdf> 1 3     # 指定ページのテキスト
```

検証は `SKILL.md` と `agents/openai.yaml` だけを全 Skill 共通の必須とし、`references/methods/` または `METHOD-ROUTING.md` を持つ Skill にだけ Method Card と Manifest の完全性を要求する。`adversarial-answer` 以外の Skill を追加しても、この Skill の検証条件は変わらない。

---

## 3. 覆してはいけない決定事項

後から「なぜこうなっているのか」で迷わないための記録。変更する場合はユーザーの確認を取ること。

| # | 決定 | 根拠 |
|---|---|---|
| D1 | ルーティングは `Problem Profile → Failure Mode → Applicability → Method` の順。Profile から Method を直接決めない | plans2 §2。v2 の中核 |
| D2 | 数値スコアによる Method 選択を導入しない | plans2 §23。根拠のない重みは新たな恣意性 |
| D3 | 最大 3 Method は上限であり目標ではない | plans2 §23 / plans1 §17 |
| D4 | Method Card が実行仕様の正本。PDF は根拠であって実行指示ではない | plans2 §19 |
| D5 | 実行時に全 PDF をロードしない | plans2 §29 |
| D6 | 単一モデル時も停止せず `role_separated_single_model` で続行し、独立 Agent とは記録しない | plans2 §28。v1 はユーザー許可待ちで停止していた |
| D7 | Invariant Gate G1〜G7 は専門 Method が置き換えない。実施結果を記録する | plans2 §26 + Phase 7 の発見 |
| D8 | `UNKNOWN` ライセンスの arXiv 版と Elicitron を同梱する | **plans2 §21 からの意図的な逸脱。ユーザー承認済み** |
| D9 | 著者サイトで無償公開でも、実体が出版社の組版版なら同梱しない | Phase 3 での判断。ユーザーの当初指示より厳格な側へ倒した |
| D10 | 取得できない論文を別論文で置換しない | phase.md Phase 3 |

---

## 4. 残作業

優先度順。

### R1. 本番環境での動作確認 (最優先・未着手)

`dist/skill.zip` を ChatGPT へ上げ、実際に走らせる。確認するのは次の 3 点。

1. Progressive Loading が動くか — `SKILL.md` から `references/METHOD-ROUTING.md` と Method Card が追加読み込みされるか
2. 読み込み量が実運用で収まるか — 固定約 35KB + Method Card 1〜3 枚 (各約 5〜7KB)
3. 検証サマリーに Route (Problem Profile / Failure Mode / 選択 Method / Route Check 結果) が出るか

ここが崩れると Router 設計の前提そのものが崩れる。**他の改善より先にやる。**

テスト入力は `src/references/ROUTER-TEST-CASES.md` から代表 5〜6 件を選ぶとよい。境界ケース (BND-001 / BND-002 / BND-003 / BND-004) は Route の正誤が判定しやすい。

### R2. git remote 未設定

現在ローカルのみでバックアップがない。

### R3. ABP と Premortem の Card 根拠補強

この 2 枚が最も根拠が薄い。

- `METHOD-ABP.md` — 根拠は RAND のランディングページ記述のみ。原典 PDF は再配布不可かつ暗号化で本文抽出不可
- `METHOD-PREMORTEM.md` — 原典 (Wiley 1989) が取得不可

組織で RAND / Wiley のアクセス権があれば本文照合し、Card の `Research-backed` 節を確定できる。現状は `Evidence Strength` を落として正直に書いてある状態。

### R4. P1/P2 Method の扱いの確定

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
| K5 | `UNKNOWN` ライセンス PDF の同梱 (D8) | Manifest に正直に記録。保守的運用へ切替可能 (選択肢 B) |
| K6 | A/B が非盲検・同一モデル・各 1 試行 | 本番での定量評価が未実施 |

---

## 6. 次の選択肢

| | 内容 | 規模 |
|---|---|---|
| **A** | 本番投入して実地検証 (= R1) | 中 |
| **B** | ライセンス保守的運用へ切替。`UNKNOWN` の 4 本を ZIP から外し Manifest 記載のみに。ZIP は 3.40MB → 約 0.8MB。Method Card が実行仕様なので動作は変わらない | 小 |
| **C** | P1/P2 の整理 (= R4) | 小〜中 |
| **D** | GitHub 化 + Actions で `npm run check` を常時実行 | 小 |
| **E** | Router テストへ対抗ケース追加。現在の 36 件は仕様どおり動くことの確認が中心。「わざと誤 Route を誘発する依頼文」を足すと K2 を能動的に探せる | 中 |

推奨は **A → D**。A は Router 設計の前提を検証する唯一の手段で、ここを飛ばすと他の改善が空振りになりうる。D は以降の変更を安全にする土台。

---

## 7. 再開手順

```bash
cd D:\gpt-skills\adversarial-answer
npm install          # node_modules は git 管理外
npm run check        # 0 error / 0 warn になることを確認
git log --oneline    # 9 コミット、HEAD = 11f8e09
```

そのうえで本書 §4 と §6 を読み、着手対象をユーザーと決める。

読む順序は `plans/handoff.md` (本書) → `docs/PHASE2-PLAN.md` (構成と Method 一覧) → `src/references/METHOD-ROUTING.md` (Router 仕様)。`plans/plans2.md` は正本だが 1,740 行あるため、疑義が出た箇所だけ参照する。

---

## 8. 触ってはいけないもの

- `plans/plans1.md` `plans/plans2.md` `plans/phase.md` — 正本仕様。編集禁止。`.gitattributes` で改行正規化の対象からも外してある
- baseline コミット `6e2a38b` — Phase 7 A/B の Baseline。v1 の内容はここからのみ復元できる (`git show 6e2a38b:SKILL.md`)

---

## 9. 環境上の注意

この環境で実際に踏んだ落とし穴。

- **Bash の heredoc が `\\` を 1 段階落とす。** `cat > file <<'EOF'` でクォート付きヒアドキュメントを使っても、`\\` が `\` になる。正規表現やエスケープを含むソースは Write ツールで書くこと。単一の `\` は保持される
- **PDF を Read ツールで開けない。** poppler (pdftoppm) が未インストールのため。`node tools/pdftext.mjs <file> <from> <to>` を使う
- **RAND と Wiley は curl に 403 を返す。** RAND はブラウザ相当の User-Agent を付ければランディングページのみ 200
- **JSZip は暗黙に作るフォルダエントリへ生成時刻を入れる。** `tools/build.mjs` で全エントリの日時を固定日時へ揃えてある。ここを変えると ZIP の再現性が壊れる
