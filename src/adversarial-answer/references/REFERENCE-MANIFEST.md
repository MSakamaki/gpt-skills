# Reference Manifest

方法論の一次根拠となる文献の台帳。実行仕様は `references/methods/` の Method Card を正本とし、本書の PDF はその根拠および適用範囲の確認に使う。

`Bundled: YES` の PDF だけが配布 ZIP に含まれる。`Redistribution Allowed` が `NO` / `UNKNOWN-RESTRICTED` のものは同梱せず、取得元 URL だけを記録する。

Retrieved Date はいずれも 2026-09-16。SHA256 と File Size は `node tools/hash.mjs` の出力と一致し、`node tools/validate.mjs` が毎回照合する。

## 凡例

- **Role** — `CORE_PROTOCOL` / `EXECUTABLE_METHOD` / `DESIGN_PRINCIPLE` (plans2 §18)
- **Evidence Strength** — その文献が Method の有効性をどこまで裏付けるか。`STRONG` / `MODERATE` / `LIMITED` / `METHODOLOGICAL` (実証ではなく方法論記述)
- **Transfer Risk** — 原論文の対象領域から本 Skill の一般回答へ転用する際の risk。`LOW` / `MEDIUM` / `HIGH`
- **Required** — その Method を実行するために PDF が必須か。Method Card が実行仕様であるため、すべて `false`

---

## PAPER-AR

- ID: PAPER-AR
- Title: Adversarial Review: Structured Disagreement for Grounded Agentic Code Review
- Authors: Eric S. Qiu; Joyce Gill
- Year: 2026
- DOI / arXiv ID: arXiv:2608.18167
- Landing Page: https://arxiv.org/abs/2608.18167
- Download Source: https://arxiv.org/pdf/2608.18167v1
- Local Path: references/papers/core/adversarial-review-2608.18167.pdf
- SHA256: 9fd3eea9e8a3a82d5ffb808bd0f4518a65b41fc21fdc8327553f93d9b23a5748
- File Size: 418400
- Role: CORE_PROTOCOL
- Method IDs: CORE-AR
- Method Card: references/methods/METHOD-CORE-AR.md
- Original Domain: エージェントによるコードレビュー
- Evidence Strength: LIMITED
- Transfer Risk: HIGH
- License: arXiv.org perpetual non-exclusive license 1.0
- Redistribution Allowed: UNKNOWN
- Bundled: YES
- Required: false
- Version: v1
- Retrieved Date: 2026-09-16
- Notes: v1 から同梱しているため継続する。一般的な回答精度の向上を実証した研究としては扱わない。採用するのは Main / Reviewer / Critic の分離、回答案の固定、根拠付き不同意、Consensus を成功条件としないこと、Review stabilization という構造のみ (plans2 §3)。

## PAPER-MARE

- ID: PAPER-MARE
- Title: MARE: Multi-Agents Collaboration Framework for Requirements Engineering
- Authors: Dongming Jin; Zhi Jin; Xiaohong Chen; Chunhui Wang
- Year: 2024
- DOI / arXiv ID: arXiv:2405.03256
- Landing Page: https://arxiv.org/abs/2405.03256
- Download Source: https://arxiv.org/pdf/2405.03256v1
- Local Path: references/papers/requirements/mare-2405.03256.pdf
- SHA256: 40a84557d16a843764dd2df2a336f120141b3c6d88435738609b328d40da3d2a
- File Size: 718450
- Role: DESIGN_PRINCIPLE
- Method IDs: MARE_PROCESS_SEPARATION
- Method Card: references/DESIGN-PRINCIPLES.md
- Original Domain: 要件工学 (LLM マルチエージェント)
- Evidence Strength: MODERATE
- Transfer Risk: MEDIUM
- License: arXiv.org perpetual non-exclusive license 1.0
- Redistribution Allowed: UNKNOWN
- Bundled: YES
- Required: false
- Version: v1
- Retrieved Date: 2026-09-16
- Notes: MARE そのものを再現しない。「要件の生成と検証を同じ役割に担当させない」という工程分離の原則としてのみ利用する (plans2 §8)。

## PAPER-ELICITRON

- ID: PAPER-ELICITRON
- Title: Elicitron: An LLM Agent-Based Simulation Framework for Design Requirements Elicitation
- Authors: Mohammadmehdi Ataei; Hyunmin Cheong; Daniele Grandi; Ye Wang; Nigel Morris; Alexander Tessier
- Year: 2024
- DOI / arXiv ID: arXiv:2404.16045
- Landing Page: https://www.research.autodesk.com/publications/elicitron-llm-based-simulation-framework-design-requirements/
- Download Source: https://www.research.autodesk.com/app/uploads/2024/11/Elicitron.pdf
- Local Path: references/papers/requirements/elicitron.pdf
- SHA256: e63cf0a825132bdd80e050524cdccd7b6ded60bd814d939b6c623e78e3324e1c
- File Size: 1091006
- Role: EXECUTABLE_METHOD
- Method IDs: REQUIREMENTS_ELICITATION
- Method Card: references/methods/METHOD-REQ-ELICITATION.md
- Original Domain: 製品設計における要求抽出
- Evidence Strength: MODERATE
- Transfer Risk: MEDIUM
- License: 表記なし (Autodesk Research が公開する著者版)
- Redistribution Allowed: UNKNOWN
- Bundled: YES
- Required: false
- Version: Autodesk Research 公開版 (2024-11 掲載)
- Retrieved Date: 2026-09-16
- Notes: 生成したペルソナ由来の要求は `CANDIDATE_REQUIREMENT` として扱い、`CONFIRMED_REQUIREMENT` としない (plans2 §7)。同内容は arXiv:2404.16045 としても公開されているが、plans2 §7 が示す Autodesk Research 公開版を取得した。PDF に再配布条件の記載がないため License は UNKNOWN。著者 6 名は arXiv 版・同梱 PDF の双方で一致を確認済み。

## PAPER-DEFEATERS

- ID: PAPER-DEFEATERS
- Title: Defeaters and Eliminative Argumentation in Assurance 2.0
- Authors: Robin Bloomfield; Kate Netkachova; John Rushby
- Year: 2024
- DOI / arXiv ID: arXiv:2405.15800
- Landing Page: https://arxiv.org/abs/2405.15800
- Download Source: https://arxiv.org/pdf/2405.15800v1
- Local Path: references/papers/assurance/defeaters-2405.15800.pdf
- SHA256: ed378de5f09e7edb88fa939df5b8d66acfc5ba478429e2e4bb6bb8c0859c2db0
- File Size: 931575
- Role: EXECUTABLE_METHOD
- Method IDs: DEFEATER
- Method Card: references/methods/METHOD-DEFEATER.md
- Original Domain: 高保証システムの assurance case
- Evidence Strength: METHODOLOGICAL
- Transfer Risk: MEDIUM
- License: CC BY-NC-ND 4.0 (arXiv) / Distribution Statement A (Approved for Public Release, Distribution Unlimited)
- Redistribution Allowed: YES
- Bundled: YES
- Required: false
- Version: v1 (SRI-CSL-2024-01, 2024-05-28)
- Retrieved Date: 2026-09-16
- Notes: 再配布条件が明示されている唯一の P0 文献。CC BY-NC-ND のため改変せず原本のまま同梱する。

## PAPER-RDM

- ID: PAPER-RDM
- Title: Robust Decision Making (RDM) — Decision Making under Deep Uncertainty, Chapter 2
- Authors: Robert J. Lempert
- Year: 2019
- DOI / arXiv ID: 10.1007/978-3-030-05252-2_2
- Landing Page: https://link.springer.com/chapter/10.1007/978-3-030-05252-2_2
- Download Source: https://link.springer.com/content/pdf/10.1007/978-3-030-05252-2_2.pdf
- Local Path: references/papers/planning/robust-decision-making.pdf
- SHA256: 15cf0a681977b4c36f87d33cf9327590a4bec1bc5e943b115f182fc5700da453
- File Size: 687304
- Role: EXECUTABLE_METHOD
- Method IDs: ROBUST_DECISION_MAKING
- Method Card: references/methods/METHOD-RDM.md
- Original Domain: 深い不確実性下の政策・投資判断
- Evidence Strength: MODERATE
- Transfer Risk: MEDIUM
- License: CC BY 4.0 (Springer Open Access)
- Redistribution Allowed: YES
- Bundled: YES
- Required: false
- Version: 出版版 (Open Access)
- Retrieved Date: 2026-09-16
- Notes: 原典は定量シミュレーションを伴う手法。本 Skill では定性的な stress test として転用するため、その転用を Method Card に明示する。

## PAPER-MAD-RE

- ID: PAPER-MAD-RE
- Title: Multi-Agent Debate Strategies to Enhance Requirements Engineering with Large Language Models
- Authors: Marc Oriol; Quim Motger; Jordi Marco; Xavier Franch
- Year: 2025
- DOI / arXiv ID: arXiv:2507.05981
- Landing Page: https://arxiv.org/abs/2507.05981
- Download Source: https://arxiv.org/pdf/2507.05981v1
- Local Path: references/papers/requirements/mad-re-2507.05981.pdf
- SHA256: b7eaad98c01a63bd40b030505a062e2e0222dc67df26fb5e020aaf351c9daab0
- File Size: 487451
- Role: DESIGN_PRINCIPLE
- Method IDs: REQUIREMENTS_MAD
- Method Card: references/DESIGN-PRINCIPLES.md
- Original Domain: 要件工学における Multi-Agent Debate
- Evidence Strength: LIMITED
- Transfer Risk: MEDIUM
- License: arXiv.org perpetual non-exclusive license 1.0
- Redistribution Allowed: UNKNOWN
- Bundled: YES
- Required: false
- Version: v1
- Retrieved Date: 2026-09-16
- Notes: RE classification での実現可能性評価にとどまるため、あらゆる要件整理タスクへの有効性を示した研究としては扱わない (plans2 §15)。

---

# 同梱しない文献

以下は Method Card の根拠として参照するが、再配布条件を満たさないため配布 ZIP へ含めない。利用者が必要とする場合は Landing Page から各自取得する。

## PAPER-ABP

- ID: PAPER-ABP
- Title: Assumption-Based Planning: A Planning Tool for Very Uncertain Times
- Authors: James A. Dewar; Carl H. Builder; William M. Hix; Morlie Hammer Levin
- Year: 1993
- DOI / arXiv ID: RAND MR-114
- Landing Page: https://www.rand.org/pubs/monograph_reports/MR114.html
- Download Source: https://www.rand.org/content/dam/rand/pubs/monograph_reports/2005/MR114.pdf
- Local Path: -
- SHA256: 3c7ea245ff333985ec4f1676963607bcc6482cfca96174d6c3c64aa7694d05ea
- File Size: 6677309
- Role: EXECUTABLE_METHOD
- Method IDs: ASSUMPTION_BASED_PLANNING
- Method Card: references/methods/METHOD-ABP.md
- Original Domain: 長期・戦略計画 (米陸軍向け)
- Evidence Strength: METHODOLOGICAL
- Transfer Risk: MEDIUM
- License: © RAND Corporation. "Permission is required from RAND to reproduce, or reuse in another form, any of its publications."
- Redistribution Allowed: NO
- Bundled: NO
- Required: false
- Version: MR-114 (2005 年公開 PDF)
- Retrieved Date: 2026-09-16
- Notes: 無償で閲覧・ダウンロードできるが、RAND が明示的に再配布を制限しているため同梱しない。PDF は暗号化されており本文抽出も不可。Method Card は Landing Page の記述と plans2 §12 に基づき、原典の細部に踏み込まない範囲で記述する。

## PAPER-PREMORTEM

- ID: PAPER-PREMORTEM
- Title: Back to the Future: Temporal Perspective in the Explanation of Events
- Authors: Deborah J. Mitchell; J. Edward Russo; Nancy Pennington
- Year: 1989
- DOI / arXiv ID: 10.1002/bdm.3960020103
- Landing Page: https://onlinelibrary.wiley.com/doi/abs/10.1002/bdm.3960020103
- Download Source: 取得不可 (Wiley 有料。正規の無償公開版を確認できず)
- Local Path: -
- SHA256: -
- File Size: -
- Role: EXECUTABLE_METHOD
- Method IDs: PREMORTEM
- Method Card: references/methods/METHOD-PREMORTEM.md
- Original Domain: 事象説明における時間的視点 (心理学実験)
- Evidence Strength: LIMITED
- Transfer Risk: HIGH
- License: © Wiley
- Redistribution Allowed: NO
- Bundled: NO
- Required: false
- Version: J. Behav. Decis. Mak. 2(1), 25-38
- Retrieved Date: 2026-09-16 (取得試行のみ)
- Notes: **P0 の不足**。prospective hindsight を「未来の出来事が既に起きたものとして説明させる」方法として扱う点のみを plans2 §11 経由で採用する。原典未取得のため、実験条件・効果量に関する主張を Method Card へ書かない。別論文への置換は行わない。

## PAPER-ACH

- ID: PAPER-ACH
- Title: The "Analysis of Competing Hypotheses" in Intelligence Analysis
- Authors: Mandeep K. Dhami; Ian K. Belton; David R. Mandel
- Year: 2019
- DOI / arXiv ID: 10.1002/acp.3550
- Landing Page: https://onlinelibrary.wiley.com/doi/10.1002/acp.3550
- Download Source: 取得不可 (Wiley 有料)
- Local Path: -
- SHA256: -
- File Size: -
- Role: EXECUTABLE_METHOD
- Method IDs: COMPETING_HYPOTHESES
- Method Card: references/methods/METHOD-ACH.md
- Original Domain: インテリジェンス分析
- Evidence Strength: LIMITED
- Transfer Risk: MEDIUM
- License: © Wiley
- Redistribution Allowed: NO
- Bundled: NO
- Required: false
- Version: Appl. Cogn. Psychol. 33(6)
- Retrieved Date: 2026-09-16 (取得試行のみ)
- Notes: ACH の有効性については mixed evidence が報告されており、`ACH = guaranteed debiasing` として扱わない (plans2 §10)。

## PAPER-COTO

- ID: PAPER-COTO
- Title: Considering the Opposite: A Corrective Strategy for Social Judgment
- Authors: Charles G. Lord; Mark R. Lepper; Elizabeth Preston
- Year: 1984
- DOI / arXiv ID: 10.1037/0022-3514.47.6.1231
- Landing Page: https://pubmed.ncbi.nlm.nih.gov/6527215/
- Download Source: 取得不可 (APA 有料)
- Local Path: -
- SHA256: -
- File Size: -
- Role: EXECUTABLE_METHOD
- Method IDs: CONSIDER_OPPOSITE
- Method Card: references/methods/METHOD-CONSIDER-OPPOSITE.md
- Original Domain: 社会的判断のバイアス補正 (心理学実験)
- Evidence Strength: LIMITED
- Transfer Risk: HIGH
- License: © American Psychological Association
- Redistribution Allowed: NO
- Bundled: NO
- Required: false
- Version: J. Pers. Soc. Psychol. 47(6), 1231-1243
- Retrieved Date: 2026-09-16 (取得試行のみ)
- Notes: biased assimilation への補正方略として検討された研究。実験課題と本 Skill の一般回答は対象が異なるため転用であることを明示する。

## PAPER-SOCRATIC

- ID: PAPER-SOCRATIC
- Title: Socratic Elenchus-inspired multi-agent debate for mitigating hallucinations in large language models
- Authors: (Expert Systems with Applications 掲載)
- Year: 2026
- DOI / arXiv ID: S0957417426011218
- Landing Page: https://www.sciencedirect.com/science/article/pii/S0957417426011218
- Download Source: 取得不可 (Elsevier 有料)
- Local Path: -
- SHA256: -
- File Size: -
- Role: EXECUTABLE_METHOD
- Method IDs: SOCRATIC
- Method Card: references/methods/METHOD-SOCRATIC.md
- Original Domain: LLM の hallucination 低減
- Evidence Strength: LIMITED
- Transfer Risk: MEDIUM
- License: © Elsevier
- Redistribution Allowed: NO
- Bundled: NO
- Required: false
- Version: 未取得
- Retrieved Date: 2026-09-16 (取得試行のみ)
- Notes: 本文未取得のため、Method Card は Socratic questioning の一般的枠組み (定義・前提・矛盾・因果・反例の検査) として記述し、同論文の実験結果を根拠に用いない。

## PAPER-ADV-COLLAB

- ID: PAPER-ADV-COLLAB
- Title: Adversarial Collaboration: An Undervalued Approach in Behavioral Science
- Authors: Stephen J. Ceci; Cory J. Clark; Lee Jussim; Wendy M. Williams
- Year: 2024
- DOI / arXiv ID: 10.1037/amp0001391
- Landing Page: https://pubmed.ncbi.nlm.nih.gov/39146049/
- Download Source: https://sites.rutgers.edu/lee-jussim/wp-content/uploads/sites/135/2026/02/adversarial-collaborations-2024.pdf
- Local Path: -
- SHA256: bb0214143f4e766ab77c542ca29c8c61380b3e437243adcc30b9f10e51f20675
- File Size: 899318
- Role: DESIGN_PRINCIPLE
- Method IDs: ADVERSARIAL_COLLABORATION
- Method Card: references/DESIGN-PRINCIPLES.md
- Original Domain: 行動科学の研究方法
- Evidence Strength: METHODOLOGICAL
- Transfer Risk: HIGH
- License: © American Psychological Association (American Psychologist 出版版を著者サイトが公開)
- Redistribution Allowed: UNKNOWN-RESTRICTED
- Bundled: NO
- Required: false
- Version: Advance online publication (2024-08-15)
- Retrieved Date: 2026-09-16
- Notes: 著者サイトから無償取得できるが、実体は APA の出版版であり再配布条件を満たさないため同梱しない。単一モデルが双方を演じる場合、独立した研究参加者による Adversarial Collaboration の再現とは主張しない (plans2 §16)。

## PAPER-FORECAST

- ID: PAPER-FORECAST
- Title: Forecasting Tournaments: Tools for Increasing Transparency and Improving the Quality of Debate
- Authors: Philip E. Tetlock; Barbara A. Mellers; Nick Rohrbaugh; Eva Chen
- Year: 2014
- DOI / arXiv ID: 10.1177/0963721414534257
- Landing Page: https://journals.sagepub.com/doi/10.1177/0963721414534257
- Download Source: https://faculty.wharton.upenn.edu/wp-content/uploads/2015/07/2014---forecasting-tournaments-tools-for-increasing-transparency-and-improving-debate.pdf
- Local Path: -
- SHA256: 531f62d11087e301a5d2c37d41b196467fb724f1a5fe18840f145ff24b2ba755
- File Size: 329341
- Role: DESIGN_PRINCIPLE
- Method IDs: FORECAST_CALIBRATION
- Method Card: references/DESIGN-PRINCIPLES.md
- Original Domain: 予測トーナメントと予測精度の追跡
- Evidence Strength: MODERATE
- Transfer Risk: MEDIUM
- License: © The Author(s) 2014 / SAGE (Current Directions in Psychological Science 出版版)
- Redistribution Allowed: UNKNOWN-RESTRICTED
- Bundled: NO
- Required: false
- Version: Curr. Dir. Psychol. Sci. 23(4), 290-295
- Retrieved Date: 2026-09-16
- Notes: 著者サイトから無償取得できるが、実体は SAGE の出版版であり再配布条件を満たさないため同梱しない。
