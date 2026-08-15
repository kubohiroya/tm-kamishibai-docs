# DSL 4.0 release smoke

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

文書状態: 公開プレリリース`4.0.0-rc.5`の再現・公開照合・追加smoke手順<br />
対象Issue: [tmpose-kamishibai-docs #47](https://github.com/kubohiroya/tmpose-kamishibai-docs/issues/47)

本書はリリース担当者向けで、一般的な動作確認を説明する文書ではありません。一般的な使い方は
[大人向け概要](../user-guides/executive-summary-adult-4.0.md)、実装の責務は
[ソフトウェアメンテナンスガイド](developer-guide-4.0.md)を参照してください。

`v4.0.0-rc.5`はnpm `next`、GitHub prerelease、PagesのStandard SB3として公開済みです。ただし、
推奨安定版は`v3.2.3`で、正式版`v4.0.0`は未公開です。公開サンプルはrc.3基準の成果物を含むため、
rc.5のsmoke証跡には使用しません。

| 用語     | この文書での意味                                          |
| -------- | --------------------------------------------------------- |
| manifest | version、commit、成果物、検証結果を固定する機械可読な記録 |
| checksum | 取得・再生成した成果物が固定byte列と一致するか確認する値  |

## 固定値

正本は`sources/dsl4/release-smoke-4.0-candidate.json`です。

| 対象               | 固定値                                                                               |
| ------------------ | ------------------------------------------------------------------------------------ |
| candidate merge    | `9b3895638edba009ee4558a6c0594f077d9fbd6b`                                           |
| freeze／tag commit | `f323a5475d4c6240a255f8a6f5b6c5d68b9ea7b6`                                           |
| version            | `4.0.0-rc.5`                                                                         |
| release source     | `release-sources/4.0.0-rc.5/app`                                                     |
| source identity    | `sha256:a6c4be01405af1b3070f6d02dc584a55bd2b45844ae48761aa3d4141ef474ca4`            |
| Schema SHA-256     | `0d6bc7f58f849560f3e9125a660a2b5efc5d91f34d533963b9777d6f467ac136`                   |
| Standard SB3       | 6,664,571 bytes / `2494b43f43f7b7acbd1ce9d307fcff383d239931aa46de550f76c3eb3ec40f3c` |
| npm tarball        | 6,425,111 bytes / `f7e9075a0a4445367aa38b2a9a2b71a5a22ff471e7d3795c9a9b1430685c7b23` |

固定commitを取得します。

```bash
git clone https://github.com/kubohiroya/tmpose-kamishibai.git
git -C tmpose-kamishibai checkout --detach f323a5475d4c6240a255f8a6f5b6c5d68b9ea7b6
git -C tmpose-kamishibai status --short
```

## Feature flag snapshot

すべてのDSL 4.0 flagは既定OFFです。配布surfaceは起動時に次のsnapshotを明示します。

| Surface               | ONにするflag                                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Standard production   | `dsl4Runtime`、`dsl4AppShell`、`dsl4PoseFeedbackModes`、`dsl4SpeechAdvanceTypewriter`、`dsl4TurboWarpActionSurface`            |
| 非埋め込みdevelopment | Standard productionに加え、`dsl4WebPreviewAdapter`、`dsl4BrowserDistributionBuild`、`dsl4PreviewReloadOverlay`、`dsl4Debugger` |

`dsl4TurboWarpActionSurface`により、23個のcore actionを可視blockとして公開します。4個の内部制御blockは
非表示のままです。smoke中に既定値を変更しません。

## 自動検証

```bash
cd tmpose-kamishibai
pnpm install --frozen-lockfile
pnpm release:dsl4:check
pnpm verify:full
pnpm release:check
shasum -a 256 dist/downloads/kamishibai-4.0.0-rc.5.sb3
```

candidate PRの`pnpm verify:full`はNode test 1,224件、Chromium test 63件を通過しました。
[GitHub Actionsの記録](https://github.com/kubohiroya/tmpose-kamishibai/actions/runs/31823718461/job/94842799234)を
一次証跡とします。

## 公開物を照合する

公開元を別々に取得し、固定値と照合します。

```bash
curl -fL \
  https://kubohiroya.github.io/tmpose-kamishibai/downloads/kamishibai-4.0.0-rc.5.sb3 \
  -o kamishibai-4.0.0-rc.5.sb3
shasum -a 256 kamishibai-4.0.0-rc.5.sb3

npm view @kubohiroya/tmpose-kamishibai@4.0.0-rc.5 \
  version dist.tarball dist.integrity dist.shasum
npm view @kubohiroya/tmpose-kamishibai dist-tags
```

確認済みのnpm integrityは
`sha512-RF4kHhE2e1EzKu5eYwMdV4//8uVj8OflafQ5R1GlRVmQz2ONcdVZfeY6fvB9EC/VO7irL7deH1h9Cqo08jWj7A==`です。
`next`は`4.0.0-rc.5`、`latest`は`3.2.3`であることを確認します。

## TurboWarp surfaceを確認する

rc.5 Standard SB3をfresh TurboWarp Editorで開き、次を確認します。

1. composite IDが`kubohiroyakamishibai4`である
2. Runtimeと6つの外部機能拡張、合計7 memberの見出しと文書ボタンが表示される
3. Runtime由来の23 core action blockが表示される
4. TurboWarp blockからの実行がYAMLと同じregistry、Schema正規化、ActionContext、lifecycleを通る
5. Asset Manager 0.11.0、Async Input 0.4.0、Bubble 0.7.0、Runtime Expression 0.4.0、
   SVG Text 0.5.0、TMPose 1.10.0のexact pinと一致する
6. remote codeを取得せず、PoseNet model dataをprojectから復元できる

## Browser／CLI Previewを確認する

Browser-owned Previewではuser gestureでproject directoryを選び、正常YAML、不正YAMLからの復帰、asset変更、
reload overlay、camera control、pose feedback、停止後のresource解放を確認します。source本文、local absolute path、
session token、file handle、camera device IDをログやSB3へ保存しません。

CLI Previewは候補packageとversion付きStandard SB3を使います。

```bash
pnpm exec tmpose-kamishibai preview-dsl4 --watch \
  --base /absolute/path/to/kamishibai-4.0.0-rc.5.sb3 \
  --project-root /absolute/path/to/project \
  --source-manifest /absolute/path/to/project/project.source.json \
  --control-profile production \
  --channel bundled
```

token付きloopback URLだけを開き、runtime-ready、source／asset変更、診断、safe stop、Ctrl+C後の
socket／watcher／timer解放を確認します。

## 実カメラ・実ポーズ

rc.3で実施した[Issue #510の物理確認](https://github.com/kubohiroya/tmpose-kamishibai/issues/510#issuecomment-5255177777)は、
rc.5の合格証跡へ流用しません。rc.5ではTMPose 1.10.0、PoseNet model data、モデル初期化、AbortSignal経路が
変わったためです。

現時点の判定は次のとおりです。

| 項目                       | rc.5の状態 |
| -------------------------- | ---------- |
| 自動test／Chromium         | 合格       |
| npm／GitHub／Pages公開照合 | 合格       |
| 実カメラ／実ポーズ再確認   | 未実施     |

物理確認ではcamera許可／拒否、preview、`legacy`と必要時の`latest-needed`、model準備の中断、認識feedback、
scene遷移、終了時のtrack／model／timer解放を確認します。camera frameは保存しません。

## Release-stop条件

- commit、version、Schema、source identity、flag snapshot、artifact hashの不一致
- 23 core action、7 member見出し／文書ボタン、dependency pinの不一致
- 同じ入力から生成したSB3またはWeb版の非決定性
- Browser Preview、CLI Preview、Standard SB3での診断または挙動差
- camera拒否、model中断、asset失敗、無効source、runtime例外での部分commitまたはresource残留
- production成果物へのpreview token、debug session、local path、file handleの混入

## Rollback

公開済みrc.5のtag、release source、SB3、npm tarballを同じversionで差し替えません。

1. npmの`next`を`4.0.0-rc.4`へ戻す
2. GitHub prereleaseとPagesへ影響範囲と回避策を追記する
3. 必要ならPagesを`1708a19719fb6441040431a4d9daa36e8647407b`へ戻す
4. 修正版を`4.0.0-rc.6`としてbuild、検証、公開する
5. 推奨安定版`3.2.3`と過去のversion付き成果物を変更しない

文書だけをrollbackする場合は、このMarkdown、candidate manifest、リリース履歴、`docs/config.mjs`、
`site/4.0/index.html`、対応testを同じcommitで戻します。
