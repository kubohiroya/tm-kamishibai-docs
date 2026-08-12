# DSL 4.0 図版必要性台帳

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

確認日: 2026年8月12日\
対象: `docs/config.mjs`で4.0として公開する11 publication

## 判定基準

- **P1:** 読み順、処理順、責任分界、安全停止を誤ると、制作・移行・安全な利用を損なう
- **P2:** 複数の構成要素やrepositoryの関係を、文章だけでは追いにくい
- **P3:** 図が理解を補助するが、文章・表だけでも正しく利用できる
- **既存図で十分:** caption、本文、順序、失敗時の扱いまで既存図で説明できる
- **文章・表で十分:** 検索、正確な値の比較、コピー可能な例が主目的で、図にすると情報を失う

短い直線的な流れは、読み上げ順を保てるsemantic HTMLと`.concept-flow`を正本にします。複雑な分岐や
循環でMermaidが必要な場合は、renderer、印刷、JavaScript無効時の代替表現を同じ変更で導入するまで
採用しません。正式UIの操作画像は#34、#41、#47のcapture台帳で管理します。固定commitの再現確認を
目的とする実装スナップショットは#101で別管理し、正式公開画面とは表記・provenanceを分けます。

## 読者層と用語の境界

図版の要否だけでなく、文書が読者へ要求する前提も同時に確認します。

| 読者層               | 最初に示すこと                                   | 冒頭では使わない／先に説明すること                         |
| -------------------- | ------------------------------------------------ | ---------------------------------------------------------- |
| 一般利用者           | 何ができるか、どう参加するか、安全、次にすること | 内部状態、実装識別子、配布工程。YAMLも必要になる場面で説明 |
| 台本作者・移行担当者 | 最短の完成経路、元ファイルの保護、確認方法       | YAML、プレビュー、SB3、Schemaは初出で意味を説明            |
| 開発・リリース担当者 | 対象読者、前提文書、作業範囲、用語表への入口     | 専門語は維持するが、一般利用者向け文書だと誤認させない     |

4.0トップは一般利用者の入口とし、固定コミット、Schema、feature flagなどの追跡情報は、開発者向けカードの
先に置きません。Schemaリファレンスと内部仕様は通読用ではなく、必要な項目を検索する資料として案内します。

## 文書別台帳

| 文書・主要節                                                                                                                            | 読者の疑問                                                 | 現状                                                                   | 判定                                                       | 優先度 | 正本・アクセシビリティ                                      | 依存・実装先                                     |
| --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------- | ------ | ----------------------------------------------------------- | ------------------------------------------------ |
| [`executive-summary-adult-4.0`](docs/user-guides/executive-summary-adult-4.0.md)「できること」「遊ぶ人の流れ」「作る人の流れ」          | 初めての人がどんな体験をどの順で楽しめるか                 | 見る・参加する・作るの表と、作品を開いて展開を楽しむまでの図がある     | 初見読者の体験図だけを維持。実装構造や固定画面は掲載しない | P1     | semantic HTML、Markdown表、カメラ不使用の本文注記           | #101・#107。技術詳細は作者・開発者向け資料へ委譲 |
| [`executive-summary-kids-4.0`](docs/user-guides/executive-summary-kids-4.0.md)「見る」「動く」「作る」「役わり」                        | どの参加方法を選び、何を作るか                             | 比較表、役割表、短い節に分かれている                                   | 文章・表で十分。未確定UI画像を置かない                     | P3     | Markdown表と本文                                            | UI画像は#34・#41                                 |
| `executive-summary-kids-4.0`「カメラ」「安全」「困ったとき」                                                                            | 問題が起きたとき何を先に止め、誰へ知らせるか               | 安全条件は箇条書き、停止順は番号列だけだった                           | **新規図が必要。2026-08-09実装**                           | **P1** | semantic HTML、caption、本文注記、矢印は`aria-hidden`       | `executive-summary-kids-4.0.md`、release非依存   |
| [`dsl-4.0-author-guide`](docs/dsl-author-guides/dsl-4.0-author-guide.md)「読み進め方」「最小台本」                                      | 最初の作品をどの順で完成させるか                           | 「台本を段階的に完成させる順序」の既存図がある                         | 既存図で十分                                               | P1     | semantic HTML、caption、診断時の戻り先                      | #88で表示確認済み                                |
| `dsl-4.0-author-guide`「Project」「複数source」                                                                                         | fileとinclude先assetの基準位置はどこか                     | copy可能なdirectory tree、JSON、YAML例と規則がある                     | 文章・codeで十分。構造を変えずに検索・転記できることを優先 | P2     | text code blockと本文                                       | #87の分冊判断後に再評価                          |
| `dsl-4.0-author-guide`「全体構造」から「総合サンプル」                                                                                  | field、scene、actionをどう記述するか                       | 小さなYAML例と説明を機能単位で配置                                     | 文章・codeで十分                                           | P2     | copy可能なYAMLと見出し                                      | Schema変更時に再監査                             |
| [`dsl-4.0-schema-reference`](docs/dsl-author-guides/dsl-4.0-schema-reference.md)全体                                                    | fieldの型、必須性、制約は何か                              | 規範Schemaから生成した表と例がある                                     | 文章・表で十分。通読用の図を追加しない                     | P3     | 生成Markdown。byte-for-byte再生成                           | Schema generatorが正本                           |
| [`dsl-3.2-to-4.0-conversion-guide`](docs/dsl-author-guides/dsl-3.2-to-4.0-conversion-guide.md)全体                                      | 元fileを守りながらどの順で変換・検証するか                 | 「既存作品を4.0の制作経路へ引き渡す」の既存図、command、停止条件がある | 既存図で十分                                               | P1     | semantic HTML、caption、rollback注記                        | #88で表示確認済み                                |
| [`application-materials-guide-4.0`](docs/developer-guides/application-materials-guide-4.0.md)全8ページ                                  | project、Source Graph、教材活動、toolchainはどう接続するか | 実行境界、合成、教材の3図と比較表がある                                | 既存図で十分                                               | P1／P2 | semantic HTML 2図、既存教材画像1図、caption・alt            | 教材画像のlicenseは`docs/LICENSE.md`             |
| [`developer-guide-4.0`](docs/developer-guides/developer-guide-4.0.md)「保守境界」「repository構成」                                     | どの変更をどのsourceとtestで扱うか                         | path・責務表、repository別の表がある                                   | 文章・表で十分                                             | P1     | Markdown表。pathをコピー可能                                | 固定実装commitに追随                             |
| `developer-guide-4.0`「Source Graph transaction」「adapter」                                                                            | candidate、current、adapterの責務はどう分かれるか          | 番号列、surface比較表があり、詳細図は内部仕様・診断設計へ委譲          | 既存資料への委譲で十分。重複図を作らない                   | P2     | 番号列、比較表、関連文書link                                | 内部仕様書・診断設計が正本                       |
| [`internal-specification-4.0`](docs/developer-guides/internal-specification-4.0.md)「権威関係とアーキテクチャ」「固定実装の呼出し経路」 | sourceからadapterまでの依存方向と実moduleの対応は何か      | 7段の概念図に、export・composition root・port分岐の実装追跡図を追加    | 既存図を改善。抽象層と実moduleを連続して読める             | P1／P2 | semantic HTML、caption、順序付きflow、3 port群              | #101、固定commit `8ea06bf`                       |
| `internal-specification-4.0`「transaction」「asset lifecycle」                                                                          | どの状態でcommitし、何をrollbackするか                     | 状態名、番号列、変更分類表、失敗時の契約がある                         | 文章・表で十分。診断設計のcommit gate図と重複させない      | P1／P2 | 番号列とMarkdown表                                          | 診断設計を図の正本とする                         |
| [`extension-guide-4.0`](docs/developer-guides/extension-guide-4.0.md)「Standard Runtime」                                               | runtime coreと外部capabilityの境界はどこか                 | 既存の境界図とsurface比較表がある                                      | 既存図で十分                                               | P1     | semantic HTML、caption、本文注記                            | #88で表示確認済み                                |
| `extension-guide-4.0`「統合1〜9」                                                                                                       | 各providerの入力、出力、権限、fallbackは何か               | 同じdimensionの表を統合単位で反復している                              | 文章・表で十分。画面captureを使わない                      | P2     | Markdown表と固定source link                                 | package更新時に再監査                            |
| [`dsl-4.0-diagnostics-design`](docs/developer-guides/dsl-4.0-diagnostics-design.md)「レビュー結論」「commit gate」                      | 無効なcandidateを公開せず、どこで安全停止するか            | commit gateの既存図と失敗経路表がある                                  | 既存図で十分                                               | P1     | semantic HTML、caption、validate／activate／runtime失敗注記 | #88で表示確認済み                                |
| `dsl-4.0-diagnostics-design`「段階別分類」以降                                                                                          | code、診断surface、cleanupをどう対応させるか               | 段階別の表、envelope例、確認表がある                                   | 文章・表で十分                                             | P2     | Markdown表とJSON例                                          | 固定実装commitに追随                             |
| [`release-smoke-4.0`](docs/developer-guides/release-smoke-4.0.md)全体                                                                   | candidateを何で固定し、どこで公開を止めるか                | exact値の表、copy可能なcommand、判定表、証跡treeがある                 | 文章・表・codeで十分。camera frameを保存しない             | P1     | candidate manifest、Markdown表、code block                  | #47、実機結果は上流#510                          |

## P1判定の結果

- 既存のP1図は、作者の制作順、3.2からの変換、全体architecture、runtime境界、commit gateを覆っている。
- 子供向け概要だけは、安全停止の順番を一目で追う図が不足していたため、本台帳と同じ変更で追加した。
- repository path、Schema field、diagnostic codeのように正確な検索・コピーが必要な情報は、図へ置き換えず表とcodeを維持する。
- 同じtransactionをメンテナンスガイド、内部仕様書、診断設計へ重複作図せず、診断設計のcommit gate図を正本とする。

## P2・P3の扱い

P2とP3は、P1図の公開後に読者から具体的な理解上の問題が確認された場合だけ、対象節単位の子Issueへ分けます。
正式UIが必要な項目は本台帳で代替図を作らず、#34、#41、#47の再開条件を満たしてからcaptureします。

2026年8月12日の#101では、「実際の動作画面と実moduleのつながりを見たい」という要望を再評価しました。
大人向け概要に置いた実装確認用の画面は、初めて読む人の理解に必要なく、同じ図版の重複にもなったため削除しました。
実装経路の図は内部仕様書だけに残し、正式な操作画面は#41の公開条件を満たしてから取得します。

## 再監査条件

- 4.0の規範Schemaまたは固定実装commitを更新したとき
- #87で台本作成ガイドとチュートリアルを分冊したとき
- 正式UIとsampleが固定され、#34・#41・#47のcaptureを開始するとき
- 読者レビューで、順序、責任分界、安全停止について具体的な誤読が見つかったとき
