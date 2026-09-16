# Router Regression Test

`METHOD-ROUTING.md` の Route が、依頼の見た目に引きずられて「それらしい Method」を選んでいないことを確認する。

## 評価方法

各ケースについて、`METHOD-ROUTING.md` §1〜§7 をそのまま適用し、次で判定する。

- `PASS` — `required_methods` をすべて選択し、選択した Method がすべて `allowed_methods` に含まれ、Primary が `forbidden_primary` に含まれない
- `FAIL` — 上記を満たさない
- `AMBIGUOUS` — 仕様の記述だけでは選択が一意に決まらない

`allowed_methods` は「選ばれてよい Method」であり、全部選べという意味ではない。`CORE-AR` は常に動作するため各ケースに記載しない。

`expected_design_principles` には、Method の選択結果に依らずかかる原則だけを書く。`REQUIREMENTS_MAD` のように特定の Method を選んだ Round にだけかかる原則は、その Method が `required_methods` にある場合に限って記載する。`allowed_methods` 止まりのケース (REQ-001 / CONF-001 / GEN-003) では、その Method を選んだときだけ原則がかかる。`INDEPENDENT_FIRST` / `MINORITY_DISSENT` は全 Round に常時かかるため記載しない。

`FAIL` が出た場合、テストケースではなく Method Card または Routing Rule を修正する。修正後は全ケースを再確認する。**個別ケースを通すためだけの例外規則を足さない。**

---

## REQ — 要件・課題整理

```yaml
id: REQ-001
prompt: >
  新サービスの要件を整理した。抜け漏れと曖昧さを検証したい。
expected_profile: [REQ]
expected_failure_modes: [F06, F11, F12]
required_methods: []
allowed_methods: [REQUIREMENTS_ELICITATION, SOCRATIC]
forbidden_primary: [COMPETING_HYPOTHESES, PREMORTEM, ROBUST_DECISION_MAKING]
expected_design_principles: [MARE_PROCESS_SEPARATION]
reason: >
  抜け漏れ (F06) と曖昧さ (F11) の両方が挙がっており、視点追加と定義明確化の
  どちらを Primary にしても妥当。原因分析でも計画でもないため ACH と PREMORTEM は不可。
```

```yaml
id: REQ-002
prompt: >
  要件定義書の用語が部署ごとに違う意味で使われている。
  定義を揃えたうえで、要件同士の矛盾がないか見たい。
expected_profile: [REQ]
expected_failure_modes: [F11, F12]
required_methods: [SOCRATIC]
allowed_methods: [SOCRATIC]
forbidden_primary: [REQUIREMENTS_ELICITATION, DEFEATER, PREMORTEM]
expected_design_principles: []
reason: >
  境界テスト (Socratic vs Requirements Elicitation)。問題の中心は既にある要件の
  定義の曖昧さであり、視点の不足ではない。REQUIREMENTS_ELICITATION の
  Do Not Use When に該当する。
```

```yaml
id: REQ-003
prompt: >
  社内ツールの要件一覧を作った。開発側の視点しか入っていないので、
  運用・保守側の観点が抜けていないか見てほしい。
expected_profile: [REQ]
expected_failure_modes: [F06, F14]
required_methods: [REQUIREMENTS_ELICITATION]
allowed_methods: [REQUIREMENTS_ELICITATION, SOCRATIC]
forbidden_primary: [SOCRATIC, COMPETING_HYPOTHESES, ROBUST_DECISION_MAKING]
expected_design_principles: [MARE_PROCESS_SEPARATION, REQUIREMENTS_MAD]
reason: >
  境界テスト (Socratic vs Requirements Elicitation)。ステークホルダーの不足 (F06) が
  明示されており、SOCRATIC の Do Not Use When に該当する。
```

---

## DECISION — 意思決定・比較

```yaml
id: DEC-001
prompt: >
  SaaS 導入と内製開発を比較し、SaaS を選ぶという結論を出した。
  この判断が妥当か検証したい。
expected_profile: [DECISION]
expected_failure_modes: [F02, F03]
required_methods: [CONSIDER_OPPOSITE]
allowed_methods: [CONSIDER_OPPOSITE, ASSUMPTION_BASED_PLANNING]
forbidden_primary: [COMPETING_HYPOTHESES, PREMORTEM]
expected_design_principles: []
reason: >
  境界テスト (ACH vs 単純な案比較)。2 案の優劣は評価基準と選好の問題であり、
  証拠によって偽と判定される説明仮説ではない。ACH の Do Not Use When に該当する。
```

```yaml
id: DEC-002
prompt: >
  ベンダー 3 社から 1 社を選定した。選定基準そのものが妥当だったか不安がある。
expected_profile: [DECISION]
expected_failure_modes: [F13, F02]
required_methods: [SOCRATIC]
allowed_methods: [SOCRATIC, CONSIDER_OPPOSITE]
forbidden_primary: [COMPETING_HYPOTHESES, PREMORTEM, ROBUST_DECISION_MAKING]
expected_design_principles: [MARE_PROCESS_SEPARATION]
reason: >
  F13 CRITERIA には専任 Method が無い。評価基準の定義を検査する SOCRATIC を当て、
  残余は Invariant Gate G1 と MARE 原則で扱う。F13 を完全に Cover できないことを
  制約として記録する。
```

```yaml
id: DEC-003
prompt: >
  新機能を今期に出すか来期に回すかを決めた。判断を覆す材料がないか確認したい。
expected_profile: [DECISION]
expected_failure_modes: [F02, F03]
required_methods: [CONSIDER_OPPOSITE]
allowed_methods: [CONSIDER_OPPOSITE, PREMORTEM]
forbidden_primary: [COMPETING_HYPOTHESES, ROBUST_DECISION_MAKING]
expected_design_principles: []
reason: >
  結論の反転可能性を問う依頼。不確実変数が特定されていないため RDM は不可。
```

---

## CAUSE — 原因・仮説分析

```yaml
id: CAUSE-001
prompt: >
  DNS、Network、DB のどれが障害原因か、ログから分析したい。
expected_profile: [CAUSE]
expected_failure_modes: [F03, F08, F15]
required_methods: [COMPETING_HYPOTHESES]
allowed_methods: [COMPETING_HYPOTHESES, SOCRATIC]
forbidden_primary: [PREMORTEM, ASSUMPTION_BASED_PLANNING, CONSIDER_OPPOSITE, ROBUST_DECISION_MAKING]
expected_design_principles: []
reason: >
  説明仮説が 3 つ明示され、ログという識別証拠がある。ACH の Applicable When を満たす。
  既に起きた事象であり PREMORTEM の Do Not Use When に該当する。
```

```yaml
id: CAUSE-002
prompt: >
  先月から解約率が上がった。原因は価格改定だと結論づけた。
expected_profile: [CAUSE]
expected_failure_modes: [F02, F03, F15]
required_methods: [COMPETING_HYPOTHESES]
allowed_methods: [COMPETING_HYPOTHESES, CONSIDER_OPPOSITE]
forbidden_primary: [PREMORTEM, ASSUMPTION_BASED_PLANNING, REQUIREMENTS_ELICITATION]
expected_design_principles: []
reason: >
  境界テスト (FACT vs CAUSE)。単一原因で確定させており、代替仮説の不足 (F03) と
  因果の飛躍 (F15) が中心。事実確認ではなく原因分析。
```

```yaml
id: CAUSE-003
prompt: >
  夜間バッチが遅い。原因はインデックス不足だと結論づけたが、
  裏付けは 1 件のスロークエリログだけ。追加のログ取得は可能。
expected_profile: [CAUSE]
expected_failure_modes: [F08, F03, F15]
required_methods: [COMPETING_HYPOTHESES]
allowed_methods: [COMPETING_HYPOTHESES, DEFEATER, SOCRATIC]
forbidden_primary: [PREMORTEM, ROBUST_DECISION_MAKING]
expected_design_principles: []
reason: >
  識別証拠を追加取得できるため ACH の Applicable When を満たす。根拠不足 (F08) が
  CRITICAL であれば DEFEATER を併用してよい。
```

---

## PLAN — 計画・施策

```yaml
id: PLAN-001
prompt: >
  新サービスを全社導入する計画を作った。見落としを検証したい。
expected_profile: [PLAN]
expected_failure_modes: [F01, F04, F14]
required_methods: []
allowed_methods: [ASSUMPTION_BASED_PLANNING, PREMORTEM]
forbidden_primary: [COMPETING_HYPOTHESES, REQUIREMENTS_ELICITATION, DEFEATER]
expected_design_principles: []
reason: >
  「見落とし」としか書かれておらず、前提 (F01) と失敗条件 (F04) のどちらが
  最重要か依頼文からは決まらない。どちらを Primary にしても妥当。
```

```yaml
id: PLAN-002
prompt: >
  基幹システムの移行計画を作った。実行後に失敗するとしたら
  何が原因になるかを洗い出したい。
expected_profile: [PLAN]
expected_failure_modes: [F04, F14]
required_methods: [PREMORTEM]
allowed_methods: [PREMORTEM, ASSUMPTION_BASED_PLANNING]
forbidden_primary: [ROBUST_DECISION_MAKING, COMPETING_HYPOTHESES, CONSIDER_OPPOSITE]
expected_design_principles: []
reason: >
  境界テスト (Premortem vs RDM)。失敗という結果から遡る依頼であり、
  重要な不確実変数が 2 つ以上あるとは示されていないため RDM は適用外。
```

```yaml
id: PLAN-003
prompt: >
  3 年間のシステム刷新ロードマップを作った。
  この計画がどの前提に依存しているのか、その前提が崩れないかを見たい。
expected_profile: [PLAN, UNCERTAINTY]
expected_failure_modes: [F01, F05, F14]
required_methods: [ASSUMPTION_BASED_PLANNING]
allowed_methods: [ASSUMPTION_BASED_PLANNING, ROBUST_DECISION_MAKING, PREMORTEM]
forbidden_primary: [PREMORTEM, COMPETING_HYPOTHESES]
expected_design_principles: []
reason: >
  境界テスト (Premortem vs ABP / PLAN vs UNCERTAINTY)。依存する前提の特定が
  主目的であり、失敗の結果から遡る依頼ではない。
```

---

## UNCERTAINTY — 深い不確実性

```yaml
id: UNC-001
prompt: >
  為替と原材料価格の両方が読めない中で、今後 2 年の調達戦略を決めた。
  どの条件で破綻するか知りたい。
expected_profile: [UNCERTAINTY, DECISION]
expected_failure_modes: [F05, F10, F14]
required_methods: [ROBUST_DECISION_MAKING]
allowed_methods: [ROBUST_DECISION_MAKING, ASSUMPTION_BASED_PLANNING]
forbidden_primary: [PREMORTEM, COMPETING_HYPOTHESES, SOCRATIC]
expected_design_principles: [FORECAST_CALIBRATION]
reason: >
  境界テスト (Premortem vs RDM)。重要な不確実変数が 2 つ明示され、戦略が存在する。
  RDM の Applicable When をすべて満たす。
```

```yaml
id: UNC-002
prompt: >
  生成 AI 規制の動向が不透明な中で製品方針を決めた。
  規制と技術の両方が変わっても方針が成り立つか検証したい。
expected_profile: [UNCERTAINTY, PLAN]
expected_failure_modes: [F05, F10]
required_methods: [ROBUST_DECISION_MAKING]
allowed_methods: [ROBUST_DECISION_MAKING, ASSUMPTION_BASED_PLANNING]
forbidden_primary: [COMPETING_HYPOTHESES, REQUIREMENTS_ELICITATION, PREMORTEM]
expected_design_principles: [FORECAST_CALIBRATION]
reason: >
  不確実変数が 2 つ、方針という戦略がある。将来条件の変化に対する頑健性が主題。
```

```yaml
id: UNC-003
prompt: >
  需要が読めないので、需要が想定を下回った場合に備えた増員計画を作った。
  不確実なのは需要だけで、他の条件は固定できている。
expected_profile: [PLAN, UNCERTAINTY]
expected_failure_modes: [F04, F14]
required_methods: [PREMORTEM]
allowed_methods: [PREMORTEM, ASSUMPTION_BASED_PLANNING]
forbidden_primary: [ROBUST_DECISION_MAKING, COMPETING_HYPOTHESES]
expected_design_principles: []
reason: >
  境界テスト (Premortem vs RDM)。不確実変数が 1 つしかないため RDM の
  Applicable When を満たさず、Do Not Use When にも該当する。
```

---

## CONFLICT — 意見・利害対立

```yaml
id: CONF-001
prompt: >
  開発チームと営業チームで機能の優先順位が対立している。
  どちらの言い分が妥当か整理したい。
expected_profile: [CONFLICT, DECISION]
expected_failure_modes: [F02, F03, F06]
required_methods: [CONSIDER_OPPOSITE]
allowed_methods: [CONSIDER_OPPOSITE, REQUIREMENTS_ELICITATION]
forbidden_primary: [COMPETING_HYPOTHESES, PREMORTEM, ROBUST_DECISION_MAKING]
expected_design_principles: [ADVERSARIAL_COLLABORATION]
reason: >
  境界テスト (DECISION vs CONFLICT)。立場の対立であり、観測で識別できる
  説明仮説ではない。各立場の反証条件を先に定義させる原則を適用する。
```

```yaml
id: CONF-002
prompt: >
  セキュリティ部門と事業部門で、ある脆弱性の許容可否の判断が割れている。
  見落としがあると事故につながる。
expected_profile: [CONFLICT, ASSURANCE]
expected_failure_modes: [F09, F02, F06]
required_methods: [DEFEATER]
allowed_methods: [DEFEATER, CONSIDER_OPPOSITE]
forbidden_primary: [COMPETING_HYPOTHESES, REQUIREMENTS_ELICITATION, ROBUST_DECISION_MAKING]
expected_design_principles: [ADVERSARIAL_COLLABORATION]
reason: >
  ASSURANCE を Secondary に持つケース。DEFEATER を必ず選択集合へ入れる。
  対立構造には ADVERSARIAL_COLLABORATION を原則として併用する。
```

```yaml
id: CONF-003
prompt: >
  技術選定で 2 つのチームが譲らない。どちらが正しいか決着させたい。
expected_profile: [CONFLICT, DECISION]
expected_failure_modes: [F02, F03, F13]
required_methods: [CONSIDER_OPPOSITE]
allowed_methods: [CONSIDER_OPPOSITE, SOCRATIC]
forbidden_primary: [COMPETING_HYPOTHESES, PREMORTEM, DEFEATER]
expected_design_principles: [ADVERSARIAL_COLLABORATION]
reason: >
  評価基準の不一致 (F13) が対立の実体である可能性が高い。ACH は不可。
  高保証要求がないため DEFEATER を Primary にしない。
```

---

## ASSURANCE — 高保証・重大リスク

```yaml
id: ASSR-001
prompt: >
  医療機器のソフトウェア更新が安全であることを説明する資料を作った。
  反証がないか厳しく見たい。
expected_profile: [ASSURANCE]
expected_failure_modes: [F09, F08]
required_methods: [DEFEATER]
allowed_methods: [DEFEATER, SOCRATIC, CONSIDER_OPPOSITE]
forbidden_primary: [SOCRATIC, REQUIREMENTS_ELICITATION, COMPETING_HYPOTHESES, PREMORTEM]
expected_design_principles: [MINORITY_DISSENT]
reason: >
  境界テスト (Defeater vs 一般的な批判)。覆ると結論が変わる主張が明確にあり、
  高保証要求がある。DEFEATER の Applicable When を満たす。
```

```yaml
id: ASSR-002
prompt: >
  個人情報を扱う新機能が法令に適合していると結論づけた。
  見落としが許されない領域なので検証したい。
expected_profile: [ASSURANCE, FACT]
expected_failure_modes: [F09, F08, F14]
required_methods: [DEFEATER]
allowed_methods: [DEFEATER, SOCRATIC]
forbidden_primary: [PREMORTEM, COMPETING_HYPOTHESES, ROBUST_DECISION_MAKING]
expected_design_principles: [MINORITY_DISSENT]
reason: >
  法令適合という主張が限られた根拠の上に立つ。事実確認の要素はあるが、
  見落としの許容度が低いと明示されているため DEFEATER を適用する。
```

```yaml
id: ASSR-003
prompt: >
  決済システムの移行手順書を作った。切り戻し手順も含めて、
  当日に破綻しないか確認したい。障害が起きると決済が止まる。
expected_profile: [PLAN, ASSURANCE]
expected_failure_modes: [F04, F09, F14]
required_methods: [PREMORTEM, DEFEATER]
allowed_methods: [PREMORTEM, DEFEATER, ASSUMPTION_BASED_PLANNING]
forbidden_primary: [COMPETING_HYPOTHESES, REQUIREMENTS_ELICITATION, ROBUST_DECISION_MAKING]
expected_design_principles: []
reason: >
  ASSURANCE を Secondary に持つケース。最重要 Failure Mode は F04 なので
  Primary は PREMORTEM だが、ASSURANCE が含まれるため DEFEATER を選択集合へ入れる。
```

---

## FORECAST — 将来予測

```yaml
id: FCST-001
prompt: >
  来年度の市場規模見通しをまとめ、「成長する可能性が高い」と結論づけた。
expected_profile: [FORECAST]
expected_failure_modes: [F10, F08]
required_methods: []
allowed_methods: [DEFEATER, CONSIDER_OPPOSITE]
forbidden_primary: [ROBUST_DECISION_MAKING, PREMORTEM, COMPETING_HYPOTHESES]
expected_design_principles: [FORECAST_CALIBRATION]
reason: >
  戦略・方針が存在しないため RDM は適用外。曖昧な確度表現を検証可能な形へ
  変換するのは FORECAST_CALIBRATION の役割であり、Review Round ではない。
```

```yaml
id: FCST-002
prompt: >
  3 年後のクラウド費用を単価と使用量の両面から予測し、
  その予測に基づいて契約形態を長期契約に決めた。
expected_profile: [FORECAST, DECISION]
expected_failure_modes: [F05, F10]
required_methods: [ROBUST_DECISION_MAKING]
allowed_methods: [ROBUST_DECISION_MAKING, ASSUMPTION_BASED_PLANNING]
forbidden_primary: [COMPETING_HYPOTHESES, REQUIREMENTS_ELICITATION, PREMORTEM]
expected_design_principles: [FORECAST_CALIBRATION]
reason: >
  不確実変数が 2 つあり、契約形態という戦略が存在する。予測そのものではなく
  予測に依存した判断の頑健性が主題。
```

```yaml
id: FCST-003
prompt: >
  競合の参入時期を来年前半と予測した。根拠は業界紙の記事 1 本だけ。
expected_profile: [FORECAST]
expected_failure_modes: [F08, F10]
required_methods: []
allowed_methods: [DEFEATER, CONSIDER_OPPOSITE]
forbidden_primary: [ROBUST_DECISION_MAKING, PREMORTEM, ASSUMPTION_BASED_PLANNING]
expected_design_principles: [FORECAST_CALIBRATION]
reason: >
  予測に依存した戦略が示されていないため RDM は適用外。単一の根拠に立つ
  主張であり、反証の構成または反対結論の構成が有効。
```

---

## FACT — 事実・根拠確認

```yaml
id: FACT-001
prompt: >
  技術仕様の説明文を書いた。記述が公式ドキュメントと一致しているか確認したい。
expected_profile: [FACT]
expected_failure_modes: [F08]
required_methods: []
allowed_methods: []
forbidden_primary: [DEFEATER, COMPETING_HYPOTHESES, PREMORTEM, ROBUST_DECISION_MAKING, ASSUMPTION_BASED_PLANNING]
expected_design_principles: []
reason: >
  境界テスト (Defeater vs 一般的な批判 / FACT vs CAUSE)。出典との突き合わせで
  決着する事実確認であり、Invariant Gate G3 / G6 で足りる。専門 Method を
  当てず CORE-AR だけで進む。
```

```yaml
id: FACT-002
prompt: >
  「このライブラリのライセンスは Apache-2.0」と書いた。実際に正しいか確認したい。
expected_profile: [FACT]
expected_failure_modes: [F08]
required_methods: []
allowed_methods: []
forbidden_primary: [DEFEATER, COMPETING_HYPOTHESES, PREMORTEM, ROBUST_DECISION_MAKING, CONSIDER_OPPOSITE]
expected_design_principles: []
reason: >
  GENERIC fallback の一種。単一事実の真偽確認であり、専門 Method を当てない。
```

```yaml
id: FACT-003
prompt: >
  障害発生時刻と影響範囲をまとめた報告書の事実関係を確認したい。
  原因分析は別途行うので今回は対象外。
expected_profile: [FACT]
expected_failure_modes: [F08]
required_methods: []
allowed_methods: [SOCRATIC]
forbidden_primary: [COMPETING_HYPOTHESES, PREMORTEM, DEFEATER]
expected_design_principles: []
reason: >
  境界テスト (FACT vs CAUSE)。障害という語があっても原因分析は明示的に対象外。
  ACH を選ぶのは誤り。
```

---

## GENERIC — 上記に特化しない

```yaml
id: GEN-001
prompt: >
  社内勉強会の進め方について助言がほしい。制約は特にない。
expected_profile: [GENERIC]
expected_failure_modes: [F11, F12]
required_methods: []
allowed_methods: [SOCRATIC]
forbidden_primary: [COMPETING_HYPOTHESES, PREMORTEM, ROBUST_DECISION_MAKING, DEFEATER, ASSUMPTION_BASED_PLANNING]
expected_design_principles: []
reason: >
  GENERIC fallback。論点が定まっていないため SOCRATIC は使えるが、
  他の専門 Method は Applicable When を満たさない。
```

```yaml
id: GEN-002
prompt: >
  この説明文を、前提知識のない読み手にも分かるように書き直してほしい。
expected_profile: [GENERIC]
expected_failure_modes: []
required_methods: []
allowed_methods: []
forbidden_primary: [SOCRATIC, COMPETING_HYPOTHESES, PREMORTEM, ROBUST_DECISION_MAKING, DEFEATER, ASSUMPTION_BASED_PLANNING, REQUIREMENTS_ELICITATION, CONSIDER_OPPOSITE]
expected_design_principles: []
reason: >
  GENERIC fallback。CRITICAL / MAJOR の Failure Mode が無い。専門 Method を
  1 つも選ばず CORE-AR の一般攻撃を 3 回行う。3 つ埋めるために Method を足さない。
```

```yaml
id: GEN-003
prompt: >
  チームの生産性を上げたい。何から手をつけるべきか。
expected_profile: [GENERIC, DECISION]
expected_failure_modes: [F11, F12, F13]
required_methods: [SOCRATIC]
allowed_methods: [SOCRATIC, REQUIREMENTS_ELICITATION]
forbidden_primary: [COMPETING_HYPOTHESES, PREMORTEM, ROBUST_DECISION_MAKING, DEFEATER]
expected_design_principles: [MARE_PROCESS_SEPARATION]
reason: >
  「生産性」が未定義で、評価基準も示されていない。まず論点を確定する段階。
```

---

## 境界重点ケース

```yaml
id: BND-001
prompt: >
  新しい評価制度を来期から導入する。この制度は「管理職が四半期ごとに
  全メンバーと面談できる」ことを前提にしているが、そこが崩れないか見たい。
expected_profile: [PLAN]
expected_failure_modes: [F01, F05, F14]
required_methods: [ASSUMPTION_BASED_PLANNING]
allowed_methods: [ASSUMPTION_BASED_PLANNING, PREMORTEM]
forbidden_primary: [PREMORTEM, COMPETING_HYPOTHESES, ROBUST_DECISION_MAKING]
expected_design_principles: []
reason: >
  境界テスト (Premortem vs ABP)。特定の前提が load-bearing かつ vulnerable か
  を問うており、失敗の結果から遡る依頼ではない。
```

```yaml
id: BND-002
prompt: >
  新しい評価制度の導入計画を作った。導入後に失敗したとしたら、
  そのとき何が起きていたのかを知りたい。
expected_profile: [PLAN]
expected_failure_modes: [F04, F14]
required_methods: [PREMORTEM]
allowed_methods: [PREMORTEM, ASSUMPTION_BASED_PLANNING]
forbidden_primary: [ASSUMPTION_BASED_PLANNING, COMPETING_HYPOTHESES, ROBUST_DECISION_MAKING]
expected_design_principles: []
reason: >
  境界テスト (Premortem vs ABP)。BND-001 と同じ題材だが、失敗という結果から
  遡る形で問われている。Primary は入れ替わる。
```

```yaml
id: BND-003
prompt: >
  決済基盤を A 社と B 社のどちらにするか比較し、A 社を選んだ。
expected_profile: [DECISION]
expected_failure_modes: [F02, F03, F13]
required_methods: [CONSIDER_OPPOSITE]
allowed_methods: [CONSIDER_OPPOSITE, SOCRATIC, ASSUMPTION_BASED_PLANNING]
forbidden_primary: [COMPETING_HYPOTHESES, PREMORTEM]
expected_design_principles: []
reason: >
  境界テスト (ACH vs 単純な案比較)。A と B は観測によって偽と判定される仮説ではなく
  選択肢である。ACH の Do Not Use When に該当する。
```

```yaml
id: BND-004
prompt: >
  決済失敗率が上昇した。原因が A 社側の障害か自社の実装変更かを
  切り分けたい。両方の時系列ログが取得できている。
expected_profile: [CAUSE]
expected_failure_modes: [F03, F08, F15]
required_methods: [COMPETING_HYPOTHESES]
allowed_methods: [COMPETING_HYPOTHESES, SOCRATIC]
forbidden_primary: [CONSIDER_OPPOSITE, PREMORTEM, ROBUST_DECISION_MAKING]
expected_design_principles: []
reason: >
  境界テスト (ACH vs 単純な案比較)。BND-003 と似た二者択一に見えるが、
  こちらは観測で識別できる説明仮説であり ACH の Applicable When を満たす。
```

```yaml
id: BND-005
prompt: >
  社内向けの提案書を書いた。一般的に厳しくレビューしてほしい。
  特に保証要件や法令要件はない。
expected_profile: [GENERIC]
expected_failure_modes: [F08, F11]
required_methods: []
allowed_methods: [SOCRATIC]
forbidden_primary: [DEFEATER, COMPETING_HYPOTHESES, PREMORTEM, ROBUST_DECISION_MAKING]
expected_design_principles: []
reason: >
  境界テスト (Defeater vs 一般的な批判)。漠然とした厳しいレビューの要求であり、
  高保証要求も、反証条件を書ける具体的な主張の指定もない。
```

```yaml
id: BND-006
prompt: >
  来期の採用計画を作った。採用市況と自社の離職率の 2 つが読めない。
expected_profile: [PLAN, UNCERTAINTY]
expected_failure_modes: [F05, F10, F14]
required_methods: [ROBUST_DECISION_MAKING]
allowed_methods: [ROBUST_DECISION_MAKING, ASSUMPTION_BASED_PLANNING, PREMORTEM]
forbidden_primary: [COMPETING_HYPOTHESES, REQUIREMENTS_ELICITATION, DEFEATER]
expected_design_principles: [FORECAST_CALIBRATION]
reason: >
  境界テスト (PLAN vs UNCERTAINTY)。Profile は PLAN だが、最重要 Failure Mode は
  将来条件への脆弱性 (F05)。Profile から Method を決めていないことの確認になる。
```

---

## 評価結果

`METHOD-ROUTING.md` を適用した結果。2026-09-16 実施。

| ID | 判定 | 備考 |
|---|---|---|
| REQ-001 | PASS | REQUIREMENTS_ELICITATION を Primary、SOCRATIC を追加 |
| REQ-002 | PASS | REQUIREMENTS_ELICITATION が Do Not Use When で除外される |
| REQ-003 | PASS | SOCRATIC が Do Not Use When で除外される |
| DEC-001 | PASS | ACH は Do Not Use When (単なる案比較) で除外 |
| DEC-002 | PASS | F13 に専任 Method が無いため SOCRATIC + 制約記録 |
| DEC-003 | PASS | — |
| CAUSE-001 | PASS | — |
| CAUSE-002 | PASS | — |
| CAUSE-003 | PASS | 証拠追加取得が可能と明示されているため ACH 適用可 |
| PLAN-001 | PASS | ABP / PREMORTEM いずれも許容 |
| PLAN-002 | PASS | RDM は不確実変数 2 つ以上の条件を満たさず除外 |
| PLAN-003 | PASS | — |
| UNC-001 | PASS | — |
| UNC-002 | PASS | — |
| UNC-003 | PASS | RDM の Do Not Use When に該当 |
| CONF-001 | PASS | — |
| CONF-002 | PASS | ASSURANCE Secondary → DEFEATER を選択集合へ |
| CONF-003 | PASS | — |
| ASSR-001 | PASS | — |
| ASSR-002 | PASS | — |
| ASSR-003 | PASS | Primary は F04 に対する PREMORTEM、DEFEATER を併用 |
| FCST-001 | PASS | RDM は戦略が存在せず Applicable When を満たさない。DEFEATER は許容範囲 |
| FCST-002 | PASS | — |
| FCST-003 | PASS | — |
| FACT-001 | **FAIL → 修正後 PASS** | 修正 1 を参照 |
| FACT-002 | **FAIL → 修正後 PASS** | 修正 1 を参照 |
| FACT-003 | PASS | — |
| GEN-001 | PASS | — |
| GEN-002 | PASS | Failure Mode が無く CORE-AR のみ |
| GEN-003 | PASS | — |
| BND-001 | PASS | — |
| BND-002 | PASS | — |
| BND-003 | PASS | — |
| BND-004 | PASS | — |
| BND-005 | **FAIL → 修正後 PASS** | 修正 1 を参照 |
| BND-006 | PASS | — |

36 ケース中、初回評価で 3 件 FAIL。原因は 1 つで、Routing Rule と Method Card を修正して全件 PASS。

### 再評価 — ドキュメント監査の是正後 (2026-09-16)

ドキュメント監査の是正で `METHOD-ROUTING.md` と `SKILL.md` を変更したため、影響範囲を再確認した。**判定に変更はなく、36 件すべて PASS のまま。**

| 変更 | Route への影響 |
|---|---|
| D-04 — §4 の「担当する原則」列へ `REQUIREMENTS_MAD` / `ADVERSARIAL_COLLABORATION` を追記 | なし。原則は Method 候補ではなく、`required_methods` / `allowed_methods` / `forbidden_primary` の判定に入らない。全 36 件の `expected_design_principles` と照合し、矛盾が無いことを確認した |
| D-05 — `SKILL.md` の `DESIGN-PRINCIPLES.md` 読み込み条件へ `REQUIREMENTS_ELICITATION` 選択時を追加 | なし。読み込みの要否が変わるだけで Method 選択は変わらない |
| D-06 — §6 へ `Covers` 外の Method を次候補として選べる例外を明記 | `F13` を含む DEC-002 / CONF-003 / GEN-003 / BND-003 の 4 件が対象。いずれも PASS のまま |

D-06 の影響を受ける 4 件の確認。

- **DEC-002** (`F13`, `F02`) — `F02` を `Covers` に持つ `CONSIDER_OPPOSITE` が適用可能なため、そちらが Primary、`SOCRATIC` は `F13` に対する次候補。`required_methods` の `SOCRATIC` は選択集合に入っており、`forbidden_primary` にも触れない
- **CONF-003** (`F02`, `F03`, `F13`) — Primary は `CONSIDER_OPPOSITE` で変わらない
- **GEN-003** (`F11`, `F12`, `F13`) — `SOCRATIC` は `F11` / `F12` を `Covers` に持つため、例外規則を使わずに Primary になる
- **BND-003** (`F02`, `F03`, `F13`) — Primary は `CONSIDER_OPPOSITE` で変わらない

規則を「`Covers` に持つ Method を Primary に優先する」としたのは、`F13` だけが立つ依頼で Primary を置けなくなるのを避けるため。その場合に限り例外側の Method を Primary にしてよい。

### 修正 1 — DEFEATER の過剰適用

**現象**: FACT-001 / FACT-002 / BND-005 で、`F08 EVIDENCE` を検出すると `METHOD-ROUTING.md` §4 の表が DEFEATER を第一候補として返し、DEFEATER の `Applicable When` の 3 つ目 (「回答案の中心的な主張が、限られた根拠の上に立っている」) が緩いため除外されなかった。結果として、出典と突き合わせれば決着する単純な事実確認や、対象を指定しない一般的なレビュー依頼にも DEFEATER が Primary として選ばれた。

**影響**: `RC8` が問う False Positive の増加。根拠が 1 つしかないだけの記述に対して `CLAIM / ARGUMENT / EVIDENCE` 分解と反証構成を行うと、Invariant Gate G3 / G6 で足りる確認を過剰な指摘へ膨らませる。

**修正**: テストケースではなく仕様を直した。

1. `METHOD-DEFEATER.md` の `Do Not Use When` へ次を追加した。
   - 単一の事実の真偽確認であり、出典との突き合わせで決着する
   - 回答仕様に高保証要求がなく、`F08` の Severity が `MAJOR` 未満である
2. `METHOD-ROUTING.md` §4 の `F08` 行へ注を付け、DEFEATER を当てる条件を次のいずれかに限定した。満たさない場合は Invariant Gate `G3` / `G6` に委ねる。
   - Problem Profile に `ASSURANCE` が含まれる
   - `F08` または `F09` の Severity が `CRITICAL`
   - 覆ると結論が変わる主張が特定でき、その反証条件を書ける

**局所修正になっていないことの確認**: この修正は DEFEATER の適用範囲全体に効く。修正後に 36 件すべてを再評価し、DEFEATER が選ばれ続けることを次で確認した。

- ASSR-001 / ASSR-002 / ASSR-003 / CONF-002 — 条件 1 (`ASSURANCE`)
- CAUSE-003 — 条件 2 (`F08` が `CRITICAL`)
- FCST-001 / FCST-003 — 条件 3 (予測という主張の反証条件を書ける)

FACT-001 / FACT-002 は Card の `Do Not Use When` で、BND-005 は条件 3 を満たさないことで除外される。

---

## Method 別カバレッジ

件数は 36 ケースの `allowed_methods` / `forbidden_primary` から機械的に決まる。定義は次のとおりで、集計し直せば必ず同じ数になる。

- **Positive** — `allowed_methods` に含まれ、`forbidden_primary` に含まれない。選択集合へ入ってよいケース
- **Negative** — `forbidden_primary` に含まれる。Primary として選んではならないケース
- **Boundary** — `reason` に境界テストと明記されたケース、または `BND-*` のうち、その Method が Positive か Negative のいずれかに当たるもの

Positive と Negative は定義上排他になる。`allowed_methods` と `forbidden_primary` の両方に現れる Method (補助としては許すが Primary にはしない) は Negative として数える。

| Method | Positive | Negative | Boundary |
|---|---|---|---|
| SOCRATIC | 13 | 4 | 8 |
| REQUIREMENTS_ELICITATION | 4 | 10 | 6 |
| CONSIDER_OPPOSITE | 11 | 5 | 7 |
| COMPETING_HYPOTHESES | 4 | 30 | 17 |
| PREMORTEM | 7 | 27 | 17 |
| ASSUMPTION_BASED_PLANNING | 12 | 7 | 11 |
| ROBUST_DECISION_MAKING | 5 | 23 | 12 |
| DEFEATER | 7 | 11 | 6 |

すべての Method で Positive >= 3、Negative >= 3、Boundary >= 2 を満たす (最小は Positive 4、Negative 4、Boundary 6)。

### 内訳

**SOCRATIC**

- Positive (13) — REQ-001, REQ-002, DEC-002, CAUSE-001, CAUSE-003, CONF-003, ASSR-002, FACT-003, GEN-001, GEN-003, BND-003, BND-004, BND-005
- Negative (4) — REQ-003, UNC-001, ASSR-001, GEN-002
- Boundary (8) — REQ-002, REQ-003, UNC-001, ASSR-001, FACT-003, BND-003, BND-004, BND-005

**REQUIREMENTS_ELICITATION**

- Positive (4) — REQ-001, REQ-003, CONF-001, GEN-003
- Negative (10) — REQ-002, CAUSE-002, PLAN-001, UNC-002, CONF-002, ASSR-001, ASSR-003, FCST-002, GEN-002, BND-006
- Boundary (6) — REQ-002, REQ-003, CAUSE-002, CONF-001, ASSR-001, BND-006

**CONSIDER_OPPOSITE**

- Positive (11) — DEC-001, DEC-002, DEC-003, CAUSE-002, CONF-001, CONF-002, CONF-003, ASSR-001, FCST-001, FCST-003, BND-003
- Negative (5) — CAUSE-001, PLAN-002, FACT-002, GEN-002, BND-004
- Boundary (7) — DEC-001, CAUSE-002, PLAN-002, CONF-001, ASSR-001, BND-003, BND-004

**COMPETING_HYPOTHESES**

- Positive (4) — CAUSE-001, CAUSE-002, CAUSE-003, BND-004
- Negative (30) — REQ-001, REQ-003, DEC-001, DEC-002, DEC-003, PLAN-001, PLAN-002, PLAN-003, UNC-001, UNC-002, UNC-003, CONF-001, CONF-002, CONF-003, ASSR-001, ASSR-002, ASSR-003, FCST-001, FCST-002, FACT-001, FACT-002, FACT-003, GEN-001, GEN-002, GEN-003, BND-001, BND-002, BND-003, BND-005, BND-006
- Boundary (17) — REQ-003, DEC-001, CAUSE-002, PLAN-002, PLAN-003, UNC-001, UNC-003, CONF-001, ASSR-001, FACT-001, FACT-003, BND-001, BND-002, BND-003, BND-004, BND-005, BND-006

**PREMORTEM**

- Positive (7) — DEC-003, PLAN-001, PLAN-002, UNC-003, ASSR-003, BND-002, BND-006
- Negative (27) — REQ-001, REQ-002, DEC-001, DEC-002, CAUSE-001, CAUSE-002, CAUSE-003, PLAN-003, UNC-001, UNC-002, CONF-001, CONF-003, ASSR-001, ASSR-002, FCST-001, FCST-002, FCST-003, FACT-001, FACT-002, FACT-003, GEN-001, GEN-002, GEN-003, BND-001, BND-003, BND-004, BND-005
- Boundary (17) — REQ-002, DEC-001, CAUSE-002, PLAN-002, PLAN-003, UNC-001, UNC-003, CONF-001, ASSR-001, FACT-001, FACT-003, BND-001, BND-002, BND-003, BND-004, BND-005, BND-006

**ASSUMPTION_BASED_PLANNING**

- Positive (12) — DEC-001, PLAN-001, PLAN-002, PLAN-003, UNC-001, UNC-002, UNC-003, ASSR-003, FCST-002, BND-001, BND-003, BND-006
- Negative (7) — CAUSE-001, CAUSE-002, FCST-003, FACT-001, GEN-001, GEN-002, BND-002
- Boundary (11) — DEC-001, CAUSE-002, PLAN-002, PLAN-003, UNC-001, UNC-003, FACT-001, BND-001, BND-002, BND-003, BND-006

**ROBUST_DECISION_MAKING**

- Positive (5) — PLAN-003, UNC-001, UNC-002, FCST-002, BND-006
- Negative (23) — REQ-001, REQ-003, DEC-002, DEC-003, CAUSE-001, CAUSE-003, PLAN-002, UNC-003, CONF-001, CONF-002, ASSR-002, ASSR-003, FCST-001, FCST-003, FACT-001, FACT-002, GEN-001, GEN-002, GEN-003, BND-001, BND-002, BND-004, BND-005
- Boundary (12) — REQ-003, PLAN-002, PLAN-003, UNC-001, UNC-003, CONF-001, FACT-001, BND-001, BND-002, BND-004, BND-005, BND-006

**DEFEATER**

- Positive (7) — CAUSE-003, CONF-002, ASSR-001, ASSR-002, ASSR-003, FCST-001, FCST-003
- Negative (11) — REQ-002, PLAN-001, CONF-003, FACT-001, FACT-002, FACT-003, GEN-001, GEN-002, GEN-003, BND-005, BND-006
- Boundary (6) — REQ-002, ASSR-001, FACT-001, FACT-003, BND-005, BND-006

---

## 必須境界テストの対応

| 境界 | ケース |
|---|---|
| Premortem vs ABP | BND-001, BND-002, PLAN-003 |
| Premortem vs RDM | PLAN-002, UNC-001, UNC-003 |
| ACH vs 単純な案比較 | DEC-001, BND-003, BND-004 |
| Socratic vs Requirements Elicitation | REQ-002, REQ-003 |
| Defeater vs 一般的な批判 | BND-005, ASSR-001, FACT-001 |
| FACT vs CAUSE | FACT-003, CAUSE-002, FACT-001 |
| PLAN vs UNCERTAINTY | BND-006, UNC-003, PLAN-003 |
| DECISION vs CONFLICT | CONF-001, CONF-003, DEC-001 |
| ASSURANCE を Secondary に持つ | CONF-002, ASSR-003 |
| GENERIC fallback | GEN-001, GEN-002, FACT-002 |

---

## 未解決

- `F13 CRITERIA` を直接検査する EXECUTABLE_METHOD が無い。DEC-002 / CONF-003 / GEN-003 / BND-003 では SOCRATIC と Invariant Gate G1 で代替しており、完全な Coverage ではない。無理に PASS とせず、制約として記録する運用にしている。
- PLAN-001 のように依頼文から最重要 Failure Mode が一意に決まらないケースがある。`allowed_methods` を複数許容することで扱っているが、実運用では Route Check `RC1` の判断が分かれうる。
