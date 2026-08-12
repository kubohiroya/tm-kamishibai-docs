# 紙芝居DSL 4.0 リリース履歴

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

この文書は、4.0の候補版と正式版を管理する開発・リリース担当者向けの記録です。アプリの使い方や台本作成の
入門書ではありません。初めて使う方は[大人向け概要](../user-guides/executive-summary-adult-4.0.md)、実際に
試す方は[操作説明書](../user-guides/user-guide-4.0.md)から始めてください。

ここでは、どの版を検証し、何がまだ公開されていないかを追跡します。台本の書き方や操作手順は扱いません。
既存作品を4.0へ移す方は[変換ガイド](dsl-3.2-to-4.0-conversion-guide.md)を参照してください。

文書状態: 検証済みの候補版と正式公開を区別する4.0系列の履歴\
対象Issue: [tmpose-kamishibai-docs #42](https://github.com/kubohiroya/tmpose-kamishibai-docs/issues/42)

## 最初に出てくる言葉

| 言葉                         | この文書での意味                                                      |
| ---------------------------- | --------------------------------------------------------------------- |
| 候補版（candidate）          | 正式公開の前に、内容と動作を確認している版                            |
| 正式公開                     | タグ、公開案内、配布ファイルが揃い、正式版として公開された状態        |
| revision                     | 同じ内容を追跡するためのコミット識別子                                |
| 実行経路（surface）          | ブラウザー、作成用コマンド、完成ファイルなど、4.0を利用・実行する場所 |
| 機能切り替え（feature flag） | 開発中の機能を有効または無効にする設定                                |
| 成果物（artifact）           | 配布候補として作られたSB3やnpmパッケージ                              |
| SHA-256 / checksum           | ファイルが検証時と同じ内容か確かめるための値                          |
| production Pages             | 正式版として案内する公開Webページ                                     |

> **公開状態**
>
> 2026年8月8日時点の固定実装を起点に、2026年8月12日の4.0.0 candidateを検証済みです。
> ただし、`v4.0.0` tag、GitHub Release、npm 4.0.0、production Pagesは未公開または正式版として未確認です。
> 最新の正式リリースは`v3.2.3`です。この項目は4.0.0の正式リリース済みを意味せず、公開URLの利用を
> 保証しません。利用前に[公開元のリリース情報](https://github.com/kubohiroya/tmpose-kamishibai/releases)を
> 確認してください。

## 履歴の読み方

各versionは、次の三つを分けて記録します。

| 層       | 記録するもの                                                        |
| -------- | ------------------------------------------------------------------- |
| 実装     | 公開準備の統合、検証した候補版、固定したsource、Schema              |
| 検証     | 対応する実行経路、機能切り替え、成果物のchecksum、既知の制約        |
| 正式公開 | annotated tag、GitHub Release、npm、release asset、production Pages |

`publicationState`が`candidate-verified-publication-pending`の項目は、実装と候補成果物を再現できますが、
正式公開日はまだありません。tagが作成されるまでcandidate commitをrelease commitと呼び替えません。

機械可読な正本は
[`sources/dsl4/release-history-4.0.json`](https://github.com/kubohiroya/tmpose-kamishibai-docs/blob/main/sources/dsl4/release-history-4.0.json)です。

## 4.0.0

状態: **candidate検証済み・正式公開待ち**

### 固定したrevision

| 対象                     | 固定値                                                                                                                                             |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| release準備PR            | [`#452`](https://github.com/kubohiroya/tmpose-kamishibai/pull/452)                                                                                 |
| release準備merge         | [`23739cc`](https://github.com/kubohiroya/tmpose-kamishibai/commit/23739cc102a8afaaba713b0c92adb4c1c236aaee)                                       |
| 検証済みcandidate        | [`28d9812`](https://github.com/kubohiroya/tmpose-kamishibai/commit/28d98125573f3186530fba231ecda844752bb14f)                                       |
| 固定release source       | `release-sources/4.0.0/app` / `dc8f65eb9f9b68d778ba3b4fd9da0926b42ff4e9`                                                                           |
| candidate Schema SHA-256 | `287867c36feff4d3fd7a5b266ab4f27368dd25ca0edc5b8c400fcc64ad08f230`                                                                                 |
| package version          | `4.0.0`                                                                                                                                            |
| 上流release note         | [`docs/releases/v4.0.0.md`](https://github.com/kubohiroya/tmpose-kamishibai/blob/28d98125573f3186530fba231ecda844752bb14f/docs/releases/v4.0.0.md) |

release準備mergeは4.0.0のsourceをmainへ統合したrevision、検証済みcandidateはその後のrelease catalogと
debugger source anchorまで含むrevisionです。正式tagがないため、どちらも正式release commitとは記録しません。

作者向けSchemaリファレンスは、独立したsource lockとして`283daadeffa5d11ab4510daa66f60168277dafea`と
SHA-256 `f519c033c68be61d71cc5dcba20a8434e23255ec0279fc0dc2d6408e7f014d7e`を固定しています。
candidate Schemaのchecksumとは役割とrevisionが異なります。正式公開時に両者が異なる場合は、履歴の値を
書き換えて一致したことにせず、Schemaリファレンスの同期を別変更で先に完了します。

### 正式公開の状態

2026年8月12日13:30 JSTの確認結果です。

| 公開対象               | 状態                                 |
| ---------------------- | ------------------------------------ |
| annotated `v4.0.0`     | 未公開                               |
| GitHub Release         | 未公開。latestは`v3.2.3`             |
| npm 4.0.0              | 未公開。公開済みversionは`3.2.3`まで |
| production Pages       | 4.0.0正式成果物として未確認          |
| source catalog         | 4.0.0を`stable`・`recommended`と記録 |
| candidate release note | `release candidate（未公開）`と記録  |

source catalogの状態だけを根拠にtag、npm、Pagesも公開済みとは判断しません。正式公開後はこの表とmanifestを
同じ変更で更新し、公開日とURLを追加します。

### 対応する利用・実行経路（surface）

| Surface                   | 4.0.0 candidateで追跡する範囲                                  |
| ------------------------- | -------------------------------------------------------------- |
| YAML source／Source Graph | 厳格Schema、source位置、resource上限、optional include         |
| Standard Runtime          | scene／action、pose、speech、asset、custom action              |
| `validate-dsl4`           | projectとSchemaの検証、cross-surface診断                       |
| `build-dsl4`              | 固定release sourceからの自己完結SB3 build                      |
| `preview-dsl4 --watch`    | token付きloopback preview、source／asset監視、安全停止         |
| Browser-owned Preview     | user gestureによるdirectory選択、transactional reload、診断    |
| Production SB3／Web版     | title、Loading、入力、camera、pose、finished、resource cleanup |

公開サンプルの操作方法は[紙芝居アプリ 4.0 操作説明書](../user-guides/user-guide-4.0.md)、候補の再現と
端から端までの判定は[DSL 4.0 release smoke](../developer-guides/release-smoke-4.0.md)を正本とします。

### 機能切り替えの記録（feature flag snapshot）

すべてのDSL 4.0 flagは既定OFFです。surfaceは起動時に必要なsnapshotだけを明示します。

| Surface               | ONにするflag                                                                                   |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| Standard production   | `dsl4Runtime`、`dsl4AppShell`、`dsl4PoseFeedbackModes`、`dsl4SpeechAdvanceTypewriter`          |
| 非埋め込みdevelopment | Standard productionに加え、`dsl4WebPreviewAdapter`、`dsl4PreviewReloadOverlay`、`dsl4Debugger` |

この履歴はflag状態を記録するだけで、既定値や配布設定を変更しません。

### 候補版の成果物

| 成果物       | 公開状態                | byte      | SHA-256                                                            |
| ------------ | ----------------------- | --------- | ------------------------------------------------------------------ |
| Standard SB3 | 検証済みcandidate build | 7,633,722 | `ab8bfefab37620538db27e4846334723d567c64bf7972d8a962287feb2a72807` |
| npm tarball  | publish dry-run         | 5,499,295 | `19117725dc8fa291776087ea9250025a557f0a1db6174cab9d94c4bdf476d8b7` |

これらはrelease asset URLやnpm integrityではありません。正式公開物と同一だとは保証しません。
公開後はURL、registry integrity、provenance、SBOMを追加し、候補値との差を記録します。

### 既知の制約

- local previewはtoken付きloopbackだけを使用し、remote previewを提供しない
- Source Graphの`include`は`dsl4SourceIncludes`、file数、個別／合計byte数、深さを明示した場合だけ有効
- 非埋め込みdevelopmentのtoken、handle、candidate、reload設定、dialog、debug状態、停止位置をSB3へ保存しない
- local project assetだけの変更を独立candidateとして監視するときはCLI Previewのasset live reloadを使う
- remote assetはHTTPS、SHA-256、media typeを指定したopt-inだけを受理する
- Standard Runtimeは、別系列のextension bundleを組み替えて生成するartifactではない
- 作者向けSchemaリファレンスとcandidate Schemaは別revisionであり、正式公開時に差分を再確認する
- tag、GitHub Release、npm、production Pagesが揃うまで正式公開済みとは扱わない

### 検証と切り戻し（rollback）

候補は`pnpm verify:full`と`pnpm release:check`を成功し、unit 1,148件、実Chromium 57件、Standard SB3、
npm tarball dry-runを確認済みです。実カメラ・実ポーズを含む詳細結果はrelease smokeのmanifestに固定しています。

正式公開前に不一致が見つかった場合はcandidateを破棄し、`v3.2.3`を最新正式リリースとして維持します。
正式公開後は4.0.0を同じversionで差し替えず、npmのdeprecate、GitHub Releaseへの注意追記、次のpatchで
修正します。過去のversion付きsourceとartifactは削除しません。

## 4.0.xを追記する

新しいpatchは、この章の手順で独立した履歴項目として先頭へ追加します。既存項目のchecksumや制約を新しい値で
上書きしません。

### 更新する情報

1. `publicationState`と確認日時
2. tag、GitHub Release URL、公開日、release commit、固定release source commit
3. package version、Schema pathとSHA-256、source lockとの一致または差分
4. 対応surfaceと各surfaceのfeature flag snapshot
5. release assetとnpm tarballのURL、byte数、SHA-256、registry integrity、provenance／SBOM
6. 追加・変更・廃止した契約と既知制約
7. 自動検証、実ブラウザ、必要な場合の実camera／pose証跡
8. release-stop条件、rollback先、次patchの方針

### 検証手順

候補commitをdetached checkoutし、上流で次を実行します。

```bash
pnpm install --frozen-lockfile
pnpm verify:full
pnpm release:check
git status --short
```

正式公開後は、一次情報を読み取って一致を確認します。

```bash
git show --no-patch v4.0.0
gh release view v4.0.0 --repo kubohiroya/tmpose-kamishibai
npm view @kubohiroya/tmpose-kamishibai@4.0.0 version dist.integrity
shasum -a 256 kamishibai-4.0.sb3
```

tag、release、npm、Pagesのどれかが欠ける場合は`publicationState`を正式公開へ進めません。値が一致したら、
history manifest、本文、4.0トップ、公開状態ポリシー、テストを同じPRで更新し、このrepositoryで
`pnpm check`と同一入力の再build skipを確認します。

## 文書境界

- 4.0 Schemaのfieldと型: [Schemaリファレンス](dsl-4.0-schema-reference.md)
- 4.0の台本作成: [台本作成ガイド](dsl-4.0-author-guide.md)
- 既存作品を変更する作業: [専用ガイド](dsl-3.2-to-4.0-conversion-guide.md)
- 候補の詳細な判定: [release smoke](../developer-guides/release-smoke-4.0.md)

この履歴へ手順を複製せず、versionごとに「何が固定され、どこまで公開されたか」だけを追記します。
