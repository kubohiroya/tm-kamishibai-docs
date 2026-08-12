# DSL 4.0 文書・公開状態の表記基準

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

DSL 4.0の実装、リリース、公開画面、文書の状態を混同しないため、次の語を使います。

| 状態         | 意味                                                               |
| ------------ | ------------------------------------------------------------------ |
| 実装基準     | 固定コミットとスキーマで、実装内容を調査・検証した基準             |
| リリース候補 | `next`等で先行公開され、安定版としては固定されていない候補         |
| 正式リリース | タグ、リリースノート、配布物、完全性情報が固定されたバージョン     |
| 公開画面     | 読者が実際に利用できるプレイヤー、サンプル、ダウンロード、CLI      |
| 文書状態     | 固定実装を説明する資料か、正式リリースの操作を説明する資料かの区別 |

## 2026年8月12日の確認結果

- DSL 4.0文書の公開実装基準は`tmpose-kamishibai`のコミット`0e7e23f59a323f088408f42ba0dc41f6b6c9feef`
- `v4.0.0-rc.1`はnpmの`next`、GitHub prerelease、PagesのSB3として公開済み
- GitHub Releasesで公開済みの最新正式リリースは`v3.2.3`
- `v4.0.0`の正式リリースは未公開
- 公開作品ページの4.0サンプル、Web版、チュートリアル用スターター、addition kitは利用可能
- `4.0.0-rc.1`のCLIは利用可能だが、安定版`4.0.0`との同一性は保証しない

確認元: [tmpose-kamishibai Releases](https://github.com/kubohiroya/tmpose-kamishibai/releases)

## 公開画面に基づき完了した課題

- [#41](https://github.com/kubohiroya/tmpose-kamishibai-docs/issues/41): 公開作品ページ、公開Web版、
  機械可読manifest、実機証跡に基づく
  [紙芝居アプリ 4.0 操作説明書](docs/user-guides/user-guide-4.0.md)

#41では正式UI画像を必須とせず、一般向け本文は操作順と失敗時の戻り方に絞ります。公開URL、版、
checksumなどの追跡情報は`sources/dsl4/user-guide-4.0-public-surfaces.json`で固定します。
画像を将来追加するときだけcapture gateを適用します。

## 公開状態を明記して完了した課題

- [#42](https://github.com/kubohiroya/tmpose-kamishibai-docs/issues/42): release準備merge、検証candidate、
  Schema、surface、制約と正式公開状態を分ける
  [紙芝居DSL 4.0 リリース履歴](docs/dsl-author-guides/dsl-4.0-history.md)

## 安定版4.0.0の公開時に更新する情報

- annotated `v4.0.0` tagとrelease commit
- GitHub Release URL、公開日、release asset URL／size／SHA-256／provenance
- npm 4.0.0のregistry URLとintegrity
- production Pagesのversionとartifact checksum

未公開のtag、release asset、npm情報を公開済みとして本文へ固定しません。現在は履歴項目の
`publicationState`を`candidate-verified-publication-pending`として維持します。

## リリース候補で完了した課題

- [#47](https://github.com/kubohiroya/tmpose-kamishibai-docs/issues/47): checksum付き候補、配布SB3／Web、
  Browser／CLI Preview、実カメラ・実ポーズ、release-stop、証跡、rollbackを
  [DSL 4.0 release smoke](docs/developer-guides/release-smoke-4.0.md)として固定

#47の結果はcandidateの公開可否を判定する記録であり、正式リリース済みという意味ではありません。正式tag、
npm integrity、release asset URL、Pages URLが確定した時点でcandidate manifestとリリース履歴を更新し、
変更範囲のsmokeを再実行します。

## 更新手順

1. GitHub Releaseのタグ、公開日時、リリースノート、配布物を一次情報で確認する
2. 公開作品と正式リリースの状態を別々に記録する
3. 各文書とテストを更新する
4. 4.0トップ、文書メタデータ、本文の状態表示を同じ変更で更新する
5. 問題があれば、未確定の公開情報を削除し、確認済みの公開画面または固定実装基準の説明へ戻す
