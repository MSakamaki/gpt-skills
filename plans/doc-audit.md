# ドキュメント監査 — 所見と是正計画

作成: 2026-09-16 / 対象コミット: `c006bab` + 未コミットの作業ツリー

**本書は計画であり、是正はまだ行っていない。** 所見の列挙と、どう直すかの案までを書く。着手はユーザーの判断を待つ。

---

## 1. 監査の範囲

| 対象 | 行数 | 監査 |
|---|---|---|
| `README.md` | 163 | 全文 |
| `CLAUDE.md` | 96 | 全文 |
| `docs/PHASE2-PLAN.md` | 191 | 全文 |
| `docs/PHASE7-AB.md` | 215 | 全文 |
| `plans/handoff.md` | 180 | 全文 |
| `plans/handoff-history.md` | 55 | 全文 |
| `src/adversarial-answer/SKILL.md` | 189 | 全文 |
| `src/guided-clarification/SKILL.md` | 141 | 全文 |
| `src/adversarial-answer/references/*.md` | 1,495 | METHOD-ROUTING / DESIGN-PRINCIPLES は全文、REFERENCE-MANIFEST と ROUTER-TEST-CASES は構造と全エントリ |
| `src/adversarial-answer/references/methods/*.md` | 959 | 見出し構造・Covers・Fallback を全 9 枚。本文は 3 枚を抜き取り |
| `plans/phase.md` `plans1.md` `plans2.md` | 3,457 | 他文書が引用する節を照合 (§18〜§29, §21, §34, 優先順位節) |

### 方法

1. 全 Markdown の相対リンクを機械的に検査 (**切れ 0 件**)
2. 文書間で重複する事実 (件数・サイズ・ハッシュ・ファイル構成・Failure Mode 対応) を突き合わせ
3. `plans/` の正本仕様に対して派生文書 (`docs/` `README` `CLAUDE` `src/`) が矛盾していないか照合
4. 表の宣言値と列挙内容をスクリプトで再計算
5. 実行時に読み込まれるファイルの参照グラフを追跡し、配布物の内容と突き合わせ

### この監査で「正」とした基準

`plans/phase.md` 冒頭の優先順位に従う。

1. `plans/plans2.md` (正本)
2. `plans/plans1.md` (plans2 に記載がない観点の補完のみ。矛盾時は plans2)
3. 現在の実装

ただし **ユーザー承認済みの逸脱** (`plans/handoff.md` §3 の D1〜D10) は正当なものとして扱い、逸脱それ自体は所見にしない。逸脱が文書に書かれていないことは所見にする。

---

## 2. 所見サマリ

| ID | 重大度 | 対象 | 内容 |
|---|---|---|---|
| D-01 | **HIGH** | `plans/handoff.md` | 「remote 未設定」が事実と異なる。GitHub へ push 済み |
| D-02 | **HIGH** | 配布 ZIP / `src/` | 実行時に参照されない開発用ドキュメント 47.7KB が配布物に入る |
| D-03 | MED | `ROUTER-TEST-CASES.md` | カバレッジ表の件数と列挙が 5 箇所で不一致。3 箇所は列挙なしで検証不能 |
| D-04 | MED | `PHASE2-PLAN.md` / `METHOD-ROUTING.md` | Design Principle の Failure Mode 対応が食い違い、2 原則が Router から起動しない |
| D-05 | MED | `SKILL.md` / `DESIGN-PRINCIPLES.md` | 原則ファイルの読み込み条件が、原則自身の適用条件を覆っていない |
| D-06 | MED | `METHOD-ROUTING.md` | F13 の扱いが §4 と §6 の規則で整合しない |
| D-07 | MED | `agents/openai.yaml` / `SKILL.md` | `allow_implicit_invocation: false` と description の起動条件が矛盾 |
| D-08 | MED | `README.md` | PDF 同梱方針が plans2 §21 からの承認済み逸脱であることを書いていない |
| D-09 | LOW | `REFERENCE-MANIFEST.md` | 非同梱エントリの SHA256 が検証対象外であることが読み取れない |
| D-10 | LOW | `PHASE2-PLAN.md` | Phase 3 の結果 (PDF 3 本が取得不可) が反映されていない |
| D-11 | LOW | `SKILL.md` ほか | 同じ規定が 2 箇所に書かれ、片方だけ更新すると乖離する |
| D-12 | LOW | `README.md` / `CLAUDE.md` | plans1 < plans2 の優先順位が書かれず、両者を同格の正本として扱っている |
| D-13 | LOW | `README.md` | 「`plans/` は編集しない」の記述が今回の改稿で落ちた |
| D-14 | LOW | `README.md` | `npm run check` の注釈が scan-secrets 追加を反映していない |
| D-15 | LOW | `README.md` / `CLAUDE.md` | selftest の件数を直書きしており、ずれても検出されない |
| D-16 | LOW | `package.json` | `version: 2.0.0` が単一 Skill 時代の意味のまま残っている |
| D-17 | LOW | `README.md` | 「ChatGPT / Codex 向け」だが Codex 対応は 1 Skill だけ |
| D-18 | 情報 | `docs/` | Phase 3/4/5/6/8 の成果物が docs に無い |

---

## 3. 所見の詳細

### D-01 — 「remote 未設定」が事実と異なる (HIGH)

**事実**: `git remote -v` は GitHub 上の `origin` (SSH) を返し、`origin/main` は `c006bab` を指している。**push 済み。**

**記述**:
- `plans/handoff.md:31` — 「git 12 コミット。baseline `6e2a38b`、HEAD `c006bab`。**remote 未設定**」
- `plans/handoff.md:103` — 「### R2. git remote 未設定 / 現在ローカルのみでバックアップがない」
- `plans/handoff.md` §6 選択肢 D — 「GitHub 化 + Actions で `npm run check` を常時実行」(前半は既に済)

**なぜ問題か**: 引き継ぎ資料の最重要事実が逆。残作業 R2 は消えており、優先度判断が狂う。加えて、直前に入れた秘密情報スキャンの前提が変わる — **ローカル限りではなく、すでに外部へ出ている**。混入していた場合の影響範囲が違う。

**推奨対応**:
1. handoff §1 / §4 R2 / §6 D を現状へ更新
2. リポジトリが public か private かを確認する (ローカルからは判定できない)
3. public であれば、過去 12 コミット全体に対して `node tools/scan-secrets.mjs` 相当の履歴スキャンを一度行う。現行スキャンは作業ツリーとステージだけを見ており、**既存履歴は未検査**
4. 選択肢 D の残り (GitHub Actions で `npm run check`) を再評価

### D-02 — 配布 ZIP に実行時参照のない開発用ドキュメントが入る (HIGH)

**事実**: `dist/adversarial-answer/skill.zip` に含まれる Markdown のうち、実行時の参照グラフ (`SKILL.md` → `METHOD-ROUTING.md` → 選択した Method Card、条件付きで `DESIGN-PRINCIPLES.md`) から到達しないものが 2 つある。

| ファイル | サイズ | src 内から参照される箇所 |
|---|---|---|
| `references/ROUTER-TEST-CASES.md` | 31,134 B | **なし** |
| `references/REFERENCE-MANIFEST.md` | 16,530 B | **なし** (`DESIGN-PRINCIPLES.md` が `PAPER-*` ID を引くのみ) |

合計 47.7KB で、ZIP 内 Markdown 総量 (約 103KB) の 46%。

**内容の性質**: `ROUTER-TEST-CASES.md` は開発時の回帰テストで、「評価結果」「修正 1 — DEFEATER の過剰適用」「未解決」という開発プロセスの記録を含む。エンドユーザーが実行時に使うものではない。

**検証ツールの状況**: `tools/verify-package.mjs` の `FORBIDDEN` は `node_modules|tools|docs|plans|dist` のみを弾く。`src/` 内に置かれた開発用ドキュメントは検出できない。

**判断が必要**: これは仕様どおりでもある。`docs/PHASE2-PLAN.md` §1 が `src/references/ROUTER-TEST-CASES.md` を最終ファイル構成に含めており、plans2 §22 の推奨ディレクトリにも沿う。したがって **バグではなく設計判断の再確認** として扱う。選択肢:

- **A. 現状維持** — 監査可能性 (配布物だけで Router の検証状況が分かる) を優先する。理由を README へ明記する
- **B. ROUTER-TEST-CASES.md を `docs/` へ移す** — ZIP が 31KB 減る。plans2 §22 からの逸脱になるため承認が要る。`validate.mjs` の v2 成果物チェック (`V2_ARTIFACTS`) の修正も必要
- **C. 配布用と開発用を分ける** — 「評価結果」以降の節だけを `docs/` へ出し、テストケース定義は残す

`REFERENCE-MANIFEST.md` は同梱の根拠 (ライセンス・出所) を配布物自身が持つ意味があるため、A を推奨。

### D-03 — カバレッジ表の件数が列挙と合わない (MED)

`src/adversarial-answer/references/ROUTER-TEST-CASES.md` の「Method 別カバレッジ」表 (699〜704 行)。

| 行 | Method | 列 | 宣言 | 実際の列挙数 |
|---|---|---|---|---|
| 699 | `CONSIDER_OPPOSITE` | Positive | 8 | **9** |
| 701 | `PREMORTEM` | Positive | 7 | **8** |
| 702 | `ASSUMPTION_BASED_PLANNING` | Positive | 9 | **10** |
| 704 | `DEFEATER` | Positive | 6 | **7** |
| 704 | `DEFEATER` | Negative | 7 | **8** |

加えて、Negative 列が列挙を持たないものが 3 件ある — `COMPETING_HYPOTHESES` 「20 以上」、`PREMORTEM` 「14」、`ROBUST_DECISION_MAKING` 「12」。どのケースを数えたか復元できず、検証できない。

**なぜ問題か**: 表の直後に「すべての Method で Positive >= 3、Negative >= 3、Boundary >= 2 を満たす」という充足判定がある。その判定の入力値が合っていない。今回の不一致はいずれも実際の方が多いため結論 (>= 3) は覆らないが、**数え直さないとそう言えない**状態が問題。

**推奨対応**: 36 ケースの `required_methods` / `allowed_methods` / `forbidden_primary` から件数を機械的に算出し、表を再生成する。Negative の列挙なし 3 件も列挙へ揃える。将来の再発防止として `tools/` に集計スクリプトを置く案もあるが、Route 判定自体は人間の解釈を含むため完全自動化はできない。

### D-04 — Design Principle の Failure Mode 対応が 2 文書で食い違う (MED)

`docs/PHASE2-PLAN.md` §2 の Method 一覧では、

- M10 `REQUIREMENTS_MAD` — Covers `F06 F07`
- M11 `ADVERSARIAL_COLLABORATION` — Covers `F02 F07`

としている。一方 `METHOD-ROUTING.md` §4 の「担当する原則」列には、

| 行 | Failure Mode | 担当する原則 |
|---|---|---|
| 94 | `F02` CONFIRMATION | — |
| 98 | `F06` PERSPECTIVE | `MARE_PROCESS_SEPARATION` |
| 99 | `F07` CONSENSUS | `INDEPENDENT_FIRST` / `MINORITY_DISSENT` |

とあり、`REQUIREMENTS_MAD` と `ADVERSARIAL_COLLABORATION` はどこにも現れない。

**帰結**: この 2 原則は Failure Mode 経由では起動しない。`ADVERSARIAL_COLLABORATION` は `DESIGN-PRINCIPLES.md` 側に「Problem Profile に `CONFLICT` が含まれる場合」という独自トリガがあるため実質動くが、`REQUIREMENTS_MAD` は Router からも Profile からもトリガを持たない (D-05 と連動)。

**推奨対応**: どちらかへ寄せる。ROUTING §4 の担当する原則列へ 2 原則を追記するのが軽い。PHASE2-PLAN は計画時点の文書なので、ROUTING を正として PHASE2-PLAN 側に注記する方法もある。

### D-05 — 原則ファイルの読み込み条件が原則の適用条件を覆っていない (MED)

`SKILL.md:102` の条件:

> 問題プロファイルに `CONFLICT` `FORECAST` `UNCERTAINTY` が含まれる場合、または要件・原因・対策を生成した役割にそのまま検証させそうな場合は、`references/DESIGN-PRINCIPLES.md` も読み

これに対し `DESIGN-PRINCIPLES.md` の各原則が宣言する適用範囲:

| 原則 | 適用範囲 | 上の条件で読まれるか |
|---|---|---|
| `MARE_PROCESS_SEPARATION` | 生成と検証の分離。常時 | 後半の条件で読まれる |
| `REQUIREMENTS_MAD` | 「REQUIREMENTS_ELICITATION を実行する Round では」 | **`REQ` 単独プロファイルでは読まれない可能性** |
| `ADVERSARIAL_COLLABORATION` | `CONFLICT` を含む場合 | 読まれる |
| `FORECAST_CALIBRATION` | `FORECAST` / `UNCERTAINTY` | 読まれる |
| `INDEPENDENT_FIRST` | 「すべての Round に常時かかる制約」 | 条件付きでしか読まれない |
| `MINORITY_DISSENT` | 「すべての Round の安定化工程にかかる制約」 | 条件付きでしか読まれない |

**なぜ問題か**: 「常時かかる」と書いてあるものが条件付き読み込みになっている。実害は小さい — `INDEPENDENT_FIRST` / `MINORITY_DISSENT` の実質的な規則は `SKILL.md` §6 本文に転記済みだから。ただしその転記が D-11 の二重管理そのものになっている。

**推奨対応**: `REQUIREMENTS_ELICITATION` を選択した場合を読み込み条件へ追加する。あわせて `INDEPENDENT_FIRST` / `MINORITY_DISSENT` の「常時」という表現を、`SKILL.md` 本文が正本である旨に改める。

### D-06 — F13 の扱いが §4 と §6 で整合しない (MED)

`METHOD-ROUTING.md` §6 は Method の特化判定の第 1 基準を次のように定める。

> 1. その Failure Mode を Method Card の `Covers` に持つ

しかし `F13 CRITERIA` を `Covers` に持つ Method Card は存在しない (9 枚すべてを確認済み)。にもかかわらず §4 の表 (105 行) は F13 の次候補に `SOCRATIC` を挙げ、§4 の補足と `ROUTER-TEST-CASES.md` の DEC-002 は SOCRATIC の選択を PASS としている。

**なぜ問題か**: §6 の規則に従うと選べないものを、§4 と回帰テストは選ばせている。実行時に §6 を厳密に読むと F13 へ Method を当てられず、Router の挙動が読み手で変わる。

**推奨対応**: §6 へ「`Covers` に無くても、その Failure Mode の一部分を検査できると Card が明示している場合は次候補として選べる。ただし Primary にしない」といった例外規則を明記する。仕様の意図 (`F13` に専任 Method を作らない) は変えない。

### D-07 — 暗黙起動の設定と description が矛盾 (MED)

`src/adversarial-answer/agents/openai.yaml:13` は `allow_implicit_invocation: false`。
一方 `SKILL.md` の description は:

> ユーザーが adversarial-answer を明示的に指定した場合、**または**要件整理、反復的な確認、根拠確認、敵対的検証、反例検討、3回の検証要約を伴う厳密な回答を求めた場合に使用する。

後半は暗黙起動の条件を書いている。`guided-clarification` 側は description も「ユーザーがこの Skill を明示的に起動して」と書いており矛盾がない。

**なぜ問題か**: 設定が `false` なら後半の条件は発火しない。description を読んだ利用者は暗黙起動すると期待する。

**推奨対応**: 意図を確認したうえで、(a) `allow_implicit_invocation: true` にするか、(b) description の後半を「明示起動したうえで、次のような依頼に使う」という書き方へ改める。**どちらが意図かはユーザーにしか決められない。**

### D-08 — README の PDF 方針が承認済み逸脱に触れていない (MED)

README「PDF の扱い」は同梱条件を 3 つ挙げる (再配布許諾済み / arXiv 配布版 / 著者・所属機関の公開版)。実態は同梱 6 本のうち 4 本が `Redistribution Allowed: UNKNOWN` で、`plans/plans2.md` §21-9 は「`UNKNOWN` / `NO` の PDF を最終配布 Skill へ自動同梱しない」と定める。

これは `plans/handoff.md` §3 の **D8「plans2 §21 からの意図的な逸脱。ユーザー承認済み」** に記録がある正当な判断だが、README だけを読むと逸脱と分からない。

**推奨対応**: README へ 1〜2 文足す。「plans2 §21 は UNKNOWN の同梱を禁じているが、arXiv 標準ライセンス版と Elicitron についてはユーザー承認のうえ同梱している (handoff D8)」。

### D-09 — 非同梱エントリの SHA256 が検証されないと分からない (LOW)

`PAPER-ADV-COLLAB` と `PAPER-FORECAST` は `Bundled: NO` / `Local Path: -` でありながら SHA256 と File Size を持つ。`tools/validate.mjs` は `Bundled: YES` のエントリしか照合しないため、この 2 件の値は**誰も検証していない**。Manifest 冒頭は「SHA256 と File Size は `node tools/hash.mjs` の出力と一致し、`node tools/validate.mjs` が毎回照合する」と書いており、全件が照合対象であるかのように読める。

**推奨対応**: 凡例へ「非同梱エントリの SHA256 は取得時点の記録であり、自動照合の対象外」と明記する。

### D-10 — Phase 3 の結果が PHASE2-PLAN に反映されていない (LOW)

`docs/PHASE2-PLAN.md` §2 は M07 ABP の PDF を `papers/planning/assumption-based-planning.pdf` (RAND / Phase 3 で可否判定) と書いたままだが、Phase 3 の結果は取得・同梱とも不可 (`PAPER-ABP`: `Bundled: NO` / `Local Path: -`)。§1 の構成図にある `papers/collaboration/` `papers/forecasting/` も実体がない (「P2 で実体が入る場合のみ作成」と注記済み)。

冒頭の「後日の変更」注記は `src/` とルート名の移動だけを扱っており、Phase 3 の結果には触れていない。

**推奨対応**: PHASE2-PLAN は計画時点の記録なので本文は変えず、冒頭注記へ「PDF 取得の最終結果は `REFERENCE-MANIFEST.md` を参照。§2 の PDF 列は計画時点の想定」と足す。

### D-11 — 同じ規定が 2 箇所にある (LOW / 保守性)

- `INDEPENDENT_FIRST` / `MINORITY_DISSENT` の実質的規則 → `DESIGN-PRINCIPLES.md` と `SKILL.md` §6
- Invariant Gate G1〜G7 の定義 → `SKILL.md` が定義、`METHOD-ROUTING.md` §8 と `DESIGN-PRINCIPLES.md` が参照
- Method の適用境界 → `METHOD-ROUTING.md` §5 の表と各 Card の `Applicable When` / `Do Not Use When`

いずれも現時点では矛盾していない。片方だけ更新したときに検出する手段がないことが所見。

**推奨対応**: 各所へ「正本はどちらか」を 1 行書く。機械検査は費用対効果が低い。

### D-12 — plans1 と plans2 の優先順位が派生文書に書かれていない (LOW)

`plans/phase.md` 冒頭は plans2 > plans1 > 現実装 と定め、plans1 固有事項は `SUPPLEMENT` / `CONFLICT` / `UNCERTAIN` に分類して `SUPPLEMENT` のみ採用すると規定する。実際 `docs/PHASE2-PLAN.md` §5 で C1/C2/C3 は不採用になっている。

しかし `README.md` と `CLAUDE.md` は 3 ファイルを「正本仕様。編集禁止」と同格に並べるだけで、優先順位に触れていない。CLAUDE.md だけを読んだ担当が plans1 を現行仕様として読む危険がある。

**推奨対応**: CLAUDE.md の「編集してはいけないもの」へ優先順位を 1 行追加。

### D-13 — README から「plans/ は編集しない」が落ちた (LOW)

旧 README は構成表に「`plans/` — 正本仕様。**編集しない**」の行を持っていたが、2026-09-16 の改稿で構成図へ置き換えた際に「正本仕様と引き継ぎ資料」とだけ書かれ、編集禁止が消えた。現在は CLAUDE.md にのみ残る。**この欠落は今回の改稿で入れたもの。**

**推奨対応**: README の構成図の `plans/` 行、または直後に 1 行戻す。

### D-14 — README 内で `npm run check` の説明が食い違う (LOW)

- `README.md:57` — 「`npm run check` # build (strict) + verify。リリース前はこれを使う」
- `README.md` §秘密情報 §2 — 「`check` の最初のステップとして、追跡中 + 未追跡の全ファイルをスキャンする」

実際は scan-secrets → build → verify の 3 段。**これも今回の変更で入れた不整合。**

**推奨対応**: 57 行のコメントを「scan + build (strict) + verify」へ。

### D-15 — selftest の件数を文書に直書きしている (LOW)

`README.md` 「npm run scan:selftest # 検出 15 ケース / 非検出 10 ケース」と `CLAUDE.md` 「検出 15 ケース / 非検出 10 ケースの見本が…」。ルールを足すたびに 2 ファイルの更新が要り、ずれても検出されない。

**推奨対応**: 件数を消して「見本は `selftest()` にある」とだけ書く。件数はコマンド出力が持っている。

### D-16 — package.json の version の意味が定まらない (LOW)

`"version": "2.0.0"` は adversarial-answer v2 に由来する。`name` はリポジトリ名 `gpt-skills` へ変えたため、いま 2.0.0 が何のバージョンなのかが宙に浮いている。Skill ごとにバージョンが異なりうる構成では、リポジトリ単一のバージョンは意味を持ちにくい。

**推奨対応**: (a) `private: true` なので実害なしとして放置、(b) `0.0.0` にして無効化、(c) Skill ごとのバージョンを `agents/openai.yaml` か `SKILL.md` frontmatter で持つ。現状は (a) で足りる。

### D-17 — 「ChatGPT / Codex 向け」の主語 (LOW)

README 冒頭は「ChatGPT / Codex 向けの Skill をまとめたリポジトリ」。`products` は adversarial-answer が `chatgpt, codex, api, atlas`、guided-clarification が `chatgpt` のみ。

**推奨対応**: 「ChatGPT 向け (一部 Codex / API 対応)」程度に緩めるか、Skill 一覧表へ対応プロダクト列を足す。

### D-18 — docs に残っていない Phase がある (情報)

`plans/handoff.md` §1 は Phase 1〜8 すべて完了としているが、`docs/` にあるのは PHASE2-PLAN と PHASE7-AB だけ。Phase 6 の結果は配布物内の `ROUTER-TEST-CASES.md` にあり (D-02 と関連)、Phase 3/5/8 の判断は handoff と handoff-history の要約のみ。

所見ではあるが、意図的な省略の可能性が高い (handoff-history が経緯を引き受ける設計)。**対応不要と判断してよい。** 記録として残す。

---

## 4. 是正計画

### 段階 1 — 事実誤りの是正 (即日、判断不要)

| 所見 | 対象ファイル | 作業 |
|---|---|---|
| D-01 | `plans/handoff.md` | §1 の remote 記述、§4 R2、§6 D を現状へ更新 |
| D-13 | `README.md` | plans/ の編集禁止を復帰 |
| D-14 | `README.md` | check の注釈を修正 |
| D-03 | `ROUTER-TEST-CASES.md` | カバレッジ表を再集計して差し替え。Negative 3 件を列挙へ |

検証: `npm run check` が 0 error / 0 warn。`ROUTER-TEST-CASES.md` は配布物に入るため ZIP の sha256 が変わる — 変わること自体が正しい。変更後の値を handoff §1 へ反映する。

### 段階 2 — 文書間の矛盾解消 (判断が要るもの以外)

| 所見 | 対象 | 作業 |
|---|---|---|
| D-04 | `METHOD-ROUTING.md` §4 | 担当する原則列へ `REQUIREMENTS_MAD` / `ADVERSARIAL_COLLABORATION` を追記 |
| D-05 | `SKILL.md:102` | 読み込み条件へ REQUIREMENTS_ELICITATION 選択時を追加 |
| D-06 | `METHOD-ROUTING.md` §6 | `Covers` 外の Method を次候補として選べる例外を明記 |
| D-08 | `README.md` | D8 の逸脱を明記 |
| D-09 | `REFERENCE-MANIFEST.md` 凡例 | 非同梱エントリの SHA256 の位置づけを明記 |
| D-10 | `docs/PHASE2-PLAN.md` | 冒頭注記へ Phase 3 結果への参照を追加 |
| D-12 | `CLAUDE.md` | plans の優先順位を 1 行追加 |
| D-15 | `README.md` / `CLAUDE.md` | selftest 件数の直書きを削除 |
| D-17 | `README.md` | 対応プロダクトの表現を修正 |

段階 2 は `src/` を触るため ZIP が変わる。Router の挙動に関わる D-04 / D-05 / D-06 は、変更後に `ROUTER-TEST-CASES.md` の 36 ケースを再評価する必要がある。**特に D-06 は Route の選択規則そのものなので、再評価なしに確定しない。**

### 段階 3 — 判断が必要なもの (ユーザー決裁待ち)

| 所見 | 決めること |
|---|---|
| D-01 | リポジトリが public か。public なら履歴の秘密情報スキャンを行うか |
| D-02 | `ROUTER-TEST-CASES.md` を配布物に残すか (A 現状維持 / B docs へ移す / C 分割)。plans2 §22 からの逸脱になるため承認が要る |
| D-07 | `allow_implicit_invocation` を true にするか、description を明示起動前提へ書き換えるか |
| D-16 | `package.json` の version をどう扱うか |

### 対応しないと判断してよいもの

- **D-11** — 現時点で矛盾がなく、機械検査の費用対効果が低い。各所へ正本を 1 行書く案だけ残す
- **D-18** — handoff-history が経緯を引き受ける設計であり、docs の欠落は意図的とみなす

---

## 5. 監査して問題が無かったもの

所見が無かったことを記録する。再監査時に重複作業を避けるため。

- **相対リンク** — 全 Markdown の相対リンク 0 件切れ
- **サイズ・ハッシュの記載** — `docs/PHASE7-AB.md` §4 の読み込み量 (SKILL.md 16,002 B / METHOD-ROUTING.md 13,008 B / METHOD-CORE-AR.md 6,265 B / Baseline 11,272 B) は実ファイルと完全一致。「固定約 46KB」「固定約 35KB」も再計算で一致
- **Failure Mode 対応** — `docs/PHASE2-PLAN.md` §2 の Covers 列と、Method Card 9 枚の `## Covers` は全 Method で一致
- **Manifest** — 13 エントリ / 同梱 6 件。`DESIGN-PRINCIPLES.md` が引く `PAPER-*` ID は全て実在。`validate` / `verify-package` の照合も通る
- **Method Card の構造** — 9 枚すべてが plans2 §19 のテンプレート (Role / Purpose / Covers / Applicable When / Do Not Use When / Inputs / Procedure / Output / False Positive Guard / Stop Condition / Evidence / Evidence Strength / Domain Transfer / Fallback) に従う。`Fallback` は全枚に存在
- **Route Check** — `METHOD-ROUTING.md` §7 の RC1〜RC8 は plans2 §24 と文言まで一致
- **Invariant Gate** — `SKILL.md` の G1〜G7 は plans2 §26 と一致
- **実行モード** — `role_separated_single_model` の扱いは plans2 §28 と一致 (D6)
- **テストケース数** — `id:` は 36 件。handoff / PHASE7-AB の「36 ケース」と一致
- **guided-clarification** — SKILL.md 単体で完結し、内部矛盾なし。`0/1/2/3/9` の定義、質問ループ、品質チェックの間に食い違いなし

---

## 6. 再監査の手順

```bash
# 相対リンク切れ
npm run check                      # src/ 内の参照は validate が見る

# 文書間で重複する数値の突き合わせ (手動)
stat -c "%s %n" src/adversarial-answer/SKILL.md \
  src/adversarial-answer/references/METHOD-ROUTING.md \
  src/adversarial-answer/references/methods/METHOD-CORE-AR.md
grep -c "^id: " src/adversarial-answer/references/ROUTER-TEST-CASES.md
git remote -v && git log --oneline | wc -l
```

突き合わせの要点は 4 つ。**(1) 件数・サイズ・ハッシュ、(2) Failure Mode と Method の対応、(3) plans2 からの逸脱が handoff §3 に記録されているか、(4) 実行時の参照グラフと配布物の内容。**
