# DSL 4.0 図版必要性台帳

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

確認日: 2026年8月12日\
対象: `docs/config.mjs`で4.0として公開する13 publication

## 判定基準

- **P1:** 読み順、処理順、責任分界、安全停止を誤ると、制作・移行・安全な利用を損なう
- **P2:** 複数の構成要素やrepositoryの関係を、文章だけでは追いにくい
- **P3:** 図が理解を補助するが、文章・表だけでも正しく利用できる
- **既存図で十分:** caption、本文、順序、失敗時の扱いまで既存図で説明できる
- **文章・表で十分:** 検索、正確な値の比較、コピー可能な例が主目的で、図にすると情報を失う

短い直線的な流れは、読み上げ順を保てるsemantic HTMLと`.concept-flow`を正本にします。複雑な分岐や
循環でMermaidが必要な場合は、renderer、印刷、JavaScript無効時の代替表現を同じ変更で導入するまで
採用しません。正式UIの操作画像を追加する場合は#34と#47のcapture台帳を参照します。

#41の操作説明書は、公開URL、画面の案内、操作順を文章・表で完結させます。版、checksum、実機確認などの
保守情報は機械可読manifestへ分離します。固定commitの再現確認を目的とする実装スナップショットは#101で
別管理し、正式公開画面とは表記・provenanceを分けます。

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

| 文書・主要節                                                                                                                   | 読者の疑問                                            | 判定                                                       | 優先度 | 正本・アクセシビリティ                             |
| ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- | ---------------------------------------------------------- | ------ | -------------------------------------------------- |
| [`executive-summary-adult-4.0`](docs/user-guides/executive-summary-adult-4.0.md)「できること」「遊ぶ人の流れ」「作る人の流れ」 | 初めての人が、どんな体験をどの順で楽しめるか          | 初見読者の体験図だけを維持。実装構造や固定画面は掲載しない | P1     | semantic HTML、Markdown表、カメラ不使用の本文注記  |
| [`executive-summary-kids-4.0`](docs/user-guides/executive-summary-kids-4.0.md)「見る」「動く」「作る」「役わり」               | どの参加方法を選び、何を作るか                        | 文章・表で十分。未確定UI画像を置かない                     | P3     | Markdown表と本文                                   |
| `executive-summary-kids-4.0`「カメラ」「安全」「困ったとき」                                                                   | 問題が起きたとき、何を止め、誰へ知らせるか            | **既存図で十分**。2026年8月9日実装                         | **P1** | semantic HTML、caption、矢印は`aria-hidden`        |
| [`user-guide-4.0`](docs/user-guides/user-guide-4.0.md)全体                                                                     | サンプル作品をどう始め、進め、終了・復旧するか        | 文章・表で十分。正式UI画像を必須としない                   | P1     | 番号列、操作表、保守情報を分離したmachine manifest |
| [`dsl-4.0-author-guide`](docs/dsl-author-guides/dsl-4.0-author-guide.md)「読み進め方」「最小台本」                             | 最初の作品をどの順で完成させるか                      | 既存図で十分                                               | P1     | semantic HTML、caption、診断時の戻り先             |
| [`dsl-4.0-schema-reference`](docs/dsl-author-guides/dsl-4.0-schema-reference.md)全体                                           | 項目の型、必須性、制約は何か                          | 文章・表で十分。通読用の図を追加しない                     | P3     | 生成Markdown。byte-for-byte再生成                  |
| [`dsl-4.0-history`](docs/dsl-author-guides/dsl-4.0-history.md)全体                                                             | 版ごとに何が固定され、どこまで公開されたか            | 文章・表で十分。冒頭で対象読者と用語を説明                 | P1／P3 | history manifest、Markdown表、一次情報へのリンク   |
| [`dsl-3.2-to-4.0-conversion-guide`](docs/dsl-author-guides/dsl-3.2-to-4.0-conversion-guide.md)全体                             | 元ファイルを守りながら、どの順で変換・検証するか      | 既存図で十分                                               | P1     | semantic HTML、caption、rollback注記               |
| [`application-materials-guide-4.0`](docs/developer-guides/application-materials-guide-4.0.md)全8ページ                         | 作品、教材活動、作成用ツールがどうつながるか          | 既存図で十分                                               | P1／P2 | semantic HTML 2図、既存教材画像1図、caption・alt   |
| [`developer-guide-4.0`](docs/developer-guides/developer-guide-4.0.md)全体                                                      | どの変更をどのsourceとtestで扱うか                    | 文章・表で十分。内部処理図は専門文書へ委譲                 | P1／P2 | Markdown表、コピー可能なpath                       |
| [`internal-specification-4.0`](docs/developer-guides/internal-specification-4.0.md)全体                                        | sourceからadapterまでの依存方向と実moduleの対応は何か | 既存図で十分。抽象層と実moduleを連続して読む               | P1／P2 | semantic HTML、caption、順序付きflow               |
| [`extension-guide-4.0`](docs/developer-guides/extension-guide-4.0.md)全体                                                      | runtime coreと外部機能の境界はどこか                  | 既存図で十分。各providerの詳細は表で検索する               | P1／P2 | semantic HTML、Markdown表                          |
| [`dsl-4.0-diagnostics-design`](docs/developer-guides/dsl-4.0-diagnostics-design.md)全体                                        | 無効な入力を公開せず、どこで安全停止するか            | 既存図で十分                                               | P1／P2 | semantic HTML、caption、失敗経路表                 |
| [`release-smoke-4.0`](docs/developer-guides/release-smoke-4.0.md)全体                                                          | 候補版を何で固定し、どこで公開を止めるか              | 文章・表・codeで十分。camera frameを保存しない             | P1     | candidate manifest、Markdown表、code block         |

## P1判定の結果

- 既存のP1図は、利用者の体験、安全停止、作者の制作順、3.2からの変換、内部の責任分界を覆っている。
- 操作説明書は短い順番と復旧表を使い、画面画像が古くなって操作を誤らせる問題を避ける。
- repository path、Schema field、diagnostic codeのように正確な検索・コピーが必要な情報は、図へ置き換えず表とcodeを維持する。
- 同じ内部処理を複数の開発者向け文書へ重複作図せず、内部仕様書と診断設計の図を正本とする。

## P2・P3の扱い

P2とP3は、P1図の公開後に読者から具体的な理解上の問題が確認された場合だけ、対象節単位の子Issueへ分けます。
正式UI画像が必要になった項目は本台帳で代替図を作らず、#34と#47のcapture条件を満たしてから撮影します。

2026年8月12日の#101では、「実際の動作画面と実moduleのつながりを見たい」という要望を再評価しました。
大人向け概要に置いた実装確認用の画面は、初めて読む人の理解に必要なく、同じ図版の重複にもなったため削除しました。
実装経路の図は内部仕様書だけに残し、正式な操作画面は必要性と撮影条件が揃ってから取得します。

## 再監査条件

- 4.0の規範Schemaまたは固定実装commitを更新したとき
- 台本作成ガイドとチュートリアルの役割を変更したとき
- 正式UI画像を#34または#47のcaptureとして追加するとき
- 読者レビューで、順序、責任分界、安全停止について具体的な誤読が見つかったとき
