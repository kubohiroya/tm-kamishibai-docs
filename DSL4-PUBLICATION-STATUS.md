# DSL 4.0 文書・公開状態の表記基準

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

DSL 4.0の実装、プレリリース、安定版、公開サンプル、文書の状態を混同しないため、次の語を使います。

| 状態             | 意味                                                             |
| ---------------- | ---------------------------------------------------------------- |
| 実装基準         | 固定commitとSchemaで実装内容を調査・検証した基準                 |
| 公開プレリリース | npm `next`、GitHub prerelease、Pages成果物として公開された候補版 |
| 安定版           | npm `latest`と通常のダウンロード導線で推奨する版                 |
| 公開サンプル基準 | サンプル作品、スターター、Web版を生成したruntimeの版             |
| 文書状態         | どの実装、配布物、公開画面を説明する資料かの区別                 |

## 2026年8月15日の確認結果

- DSL 4.0文書の実装基準はannotated tag `v4.0.0-rc.5`のcommit
  [`f323a5475d4c6240a255f8a6f5b6c5d68b9ea7b6`](https://github.com/kubohiroya/tmpose-kamishibai/commit/f323a5475d4c6240a255f8a6f5b6c5d68b9ea7b6)
- `v4.0.0-rc.5`はnpmの`next`、GitHub prerelease、PagesのStandard SB3として公開済み
- rc.5のStandard SB3は`kamishibai-4.0.0-rc.5.sb3`、6,664,571 bytes、SHA-256
  `2494b43f43f7b7acbd1ce9d307fcff383d239931aa46de550f76c3eb3ec40f3c`
- 安定版の推奨は`v3.2.3`で、正式版`v4.0.0`は未公開
- 公開中の4.0サンプル作品、スターター、Web版はrc.3で作成された成果物を含む
- rc.5の作者経路とrc.3のサンプル再生経路を、本文とmachine-readable manifestで区別する

確認元:
[v4.0.0-rc.5 GitHub prerelease](https://github.com/kubohiroya/tmpose-kamishibai/releases/tag/v4.0.0-rc.5)、
[npm 4.0.0-rc.5](https://www.npmjs.com/package/@kubohiroya/tmpose-kamishibai/v/4.0.0-rc.5)、
[Pages downloads](https://kubohiroya.github.io/tmpose-kamishibai/downloads/)

## rc.5で文書へ反映する差分

- composite ID `kubohiroyakamishibai4`で全23 core actionを可視TurboWarp blockとして公開
- 6つの外部機能拡張とcore Runtimeの計7 memberに見出しと文書ボタンを表示
- Bubble 0.7.0、TMPose 1.10.0を含むexact dependency pin
- `poseRecognition.modelInitialization`の`legacy`／`latest-needed`、並列初期化、AbortSignal対応
- PoseNet model dataをruntime JavaScriptからproject dataへ移し、playback runtimeとauthoring runtimeを分離
- Standard SB3を6,664,571 bytesへ縮小

## 公開画面に基づく文書

- [紙芝居アプリ 4.0 操作説明書](docs/user-guides/user-guide-4.0.md)は公開画面を説明する
- [紙芝居を遊ぶ](docs/tutorials/play.md)は公開サンプル成果物rc.3を対象にする
- [紙芝居を作る](docs/tutorials/create.md)はrc.5 Standard SB3を作者環境として使い、公開starterのrc.3基準を併記する
- 公開URL、版、checksumなどの追跡情報は
  [`sources/dsl4/user-guide-4.0-public-surfaces.json`](sources/dsl4/user-guide-4.0-public-surfaces.json)へ固定する

## リリース記録

- [紙芝居DSL 4.0 リリース履歴](docs/dsl-author-guides/dsl-4.0-history.md)はrc.5のtag、公開URL、成果物、
  dependencyとrollbackを記録する
- [DSL 4.0 release smoke](docs/developer-guides/release-smoke-4.0.md)はrc.5の自動検証と公開照合を記録する
- rc.5でTMPose、PoseNet、モデル初期化経路が変わったため、rc.3の実カメラ証跡をrc.5の合格証跡へ流用しない

## 安定版4.0.0の公開時に更新する情報

- annotated `v4.0.0` tagとrelease commit
- GitHub Release URL、公開日、release asset URL／size／SHA-256／provenance
- npm 4.0.0のregistry URLとintegrity
- production Pagesのversionとartifact checksum
- 4.0.0で再生成したサンプル、スターター、Web版のruntime基準

未公開のtag、release asset、npm情報を公開済みとして本文へ固定しません。rc.5の公開記録と、将来の
安定版4.0.0の状態は別の履歴項目として管理します。

## 更新手順

1. GitHub Release、npm registry、Pages成果物を一次情報で確認する
2. 実装基準、公開プレリリース、安定版、公開サンプル基準を別々に記録する
3. 各文書、machine-readable manifest、テストを同じ変更で更新する
4. 4.0トップと文書メタデータを更新し、build後の公開表示を確認する
5. 問題があれば未確認の公開情報を削除し、確認済みのversion、commit、checksumへ戻す
