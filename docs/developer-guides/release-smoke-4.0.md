# DSL 4.0 release smoke

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

文書状態: 公開プレリリース`4.0.0-rc.6`の再現・公開照合・追加smoke手順<br />
対象Issue: [tmpose-kamishibai-docs #47](https://github.com/kubohiroya/tmpose-kamishibai-docs/issues/47)、[#163](https://github.com/kubohiroya/tmpose-kamishibai-docs/issues/163)

本書はリリース担当者向けで、一般的な動作確認を説明する文書ではありません。一般的な使い方は
[大人向け概要](../user-guides/executive-summary-adult-4.0.md)、実装の責務は
[ソフトウェアメンテナンスガイド](developer-guide-4.0.md)を参照してください。

`v4.0.0-rc.6`はnpm `next`、GitHub prerelease、Pagesのダウンロード導線として公開済みです。ただし、
推奨安定版は`v3.2.3`で、正式版`v4.0.0`は未公開です。Standard SB3の配布正本はGitHub Releaseです。
公開サンプルは、この公開SB3とfreeze commitから再生成したlockを別途照合します。

| 用語     | この文書での意味                                          |
| -------- | --------------------------------------------------------- |
| manifest | version、commit、成果物、検証結果を固定する機械可読な記録 |
| checksum | 取得・再生成した成果物が固定byte列と一致するか確認する値  |

## 固定値

正本は`sources/dsl4/release-smoke-4.0-candidate.json`です。

| 対象               | 固定値                                                                               |
| ------------------ | ------------------------------------------------------------------------------------ |
| candidate merge    | `4efec1963af04b50c080bef7095f598da928ac84`                                           |
| freeze／tag commit | `4c360cd9845f9dcdbf7ecbffaa2fe4c1462af8b6`                                           |
| version            | `4.0.0-rc.6`                                                                         |
| release source     | tag `v4.0.0-rc.6`（現行branchへ展開copyを保持しない）                                |
| source identity    | `sha256:ebdde314be4d929894bce9eb511f340c61879b2b9ff8366ae31cabbb00bfbf10`            |
| Schema SHA-256     | `bb96f6fd503ee7a747b48b4cdc30db227b5d3171854c2b83a47a96c15ed7fd79`                   |
| Standard SB3       | 6,684,010 bytes / `be0e38d6179873894db2363751955ccd68b971a829a5b09c048e54986fbd7796` |
| npm tarball        | 6,446,010 bytes / `6581c73b61f90762383bc8284699bb994dc396951ae3bfdd271249a362c99eba` |

固定commitを取得します。

```bash
git clone https://github.com/kubohiroya/tmpose-kamishibai.git
git -C tmpose-kamishibai checkout --detach 4c360cd9845f9dcdbf7ecbffaa2fe4c1462af8b6
git -C tmpose-kamishibai status --short
```

## Feature flag snapshot

すべてのDSL 4.0 flagは既定OFFです。配布surfaceは起動時に次のsnapshotを明示します。
ポーズoverlayには専用flagがなく、`poseRecognition.preview.overlay`を記述した全runtime profileで同じ契約を使います。

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
shasum -a 256 dist/downloads/kamishibai-4.0.0-rc.6.sb3
```

freeze PRの`pnpm verify:full`はNode系test 1,212件、Chromium test 13件を通過しました。
[GitHub Actionsの記録](https://github.com/kubohiroya/tmpose-kamishibai/actions/runs/31931898431/job/95127903375)を
一次証跡とします。

## 公開物を照合する

公開元を別々に取得し、固定値と照合します。

```bash
curl -fL \
  https://github.com/kubohiroya/tmpose-kamishibai/releases/download/v4.0.0-rc.6/kamishibai-4.0.0-rc.6.sb3 \
  -o kamishibai-4.0.0-rc.6.sb3
shasum -a 256 kamishibai-4.0.0-rc.6.sb3

npm view @kubohiroya/tmpose-kamishibai@4.0.0-rc.6 \
  version dist.tarball dist.integrity dist.shasum
npm view @kubohiroya/tmpose-kamishibai dist-tags
```

確認済みのnpm integrityは
`sha512-q4amPLLmVrsh60ZhNo6sjtCYLwBVH8nosmElbh/LGdX4/4gVBw4oohcgIgAZLm5G0VmgWxfj3NJ0fxHLe+C7bg==`です。
`next`は`4.0.0-rc.6`、`latest`は`3.2.3`であることを確認します。

## TurboWarp surfaceを確認する

rc.6 Standard SB3をfresh TurboWarp Editorで開き、次を確認します。

1. composite IDが`kubohiroyakamishibai4`である
2. Runtimeと6つの外部機能拡張、合計7 memberの見出しと文書ボタンが表示される
3. Runtime由来の23 core action blockが表示される
4. TurboWarp blockからの実行がYAMLと同じregistry、Schema正規化、ActionContext、lifecycleを通る
5. Asset Manager 0.11.0、Async Input 0.4.0、Bubble 0.7.0、Runtime Expression 0.4.0、
   SVG Text 0.5.0、TMPose 1.11.0のexact pinと一致する
6. remote codeを取得せず、PoseNet model dataをprojectから復元できる
7. `poseRecognition.preview.overlay`設定時にSVGの関節とボーンが表示され、省略時は非表示になる

## Browser／CLI Previewを確認する

Browser-owned Previewではuser gestureでproject directoryを選び、正常YAML、不正YAMLからの復帰、asset変更、
reload overlay、camera control、pose feedback、停止後のresource解放を確認します。source本文、local absolute path、
session token、file handle、camera device IDをログやSB3へ保存しません。

CLI Previewは候補packageとversion付きStandard SB3を使います。

```bash
pnpm exec tmpose-kamishibai preview-dsl4 --watch \
  --base /absolute/path/to/kamishibai-4.0.0-rc.6.sb3 \
  --project-root /absolute/path/to/project \
  --source-manifest /absolute/path/to/project/project.source.json \
  --control-profile production \
  --channel bundled
```

token付きloopback URLだけを開き、runtime-ready、source／asset変更、診断、safe stop、Ctrl+C後の
socket／watcher／timer解放を確認します。

## 実カメラ・実ポーズ

camera contextの責務境界は[Issue #601](https://github.com/kubohiroya/tmpose-kamishibai/issues/601)で
Chrome 151と物理cameraを使って測定しました。実際と同じ1 draw／1 read経路では`willReadFrequently`に
再現性のある高速化がなく、WebGLでは全条件で悪化したため、TMPose 1.11.0は通常contextを使用します。
CPU推論時にChromiumのreadback警告が1回出る場合がありますが、警告抑制だけを目的に成果物を書き換えません。

現時点の判定は次のとおりです。

| 項目                       | rc.6の状態 |
| -------------------------- | ---------- |
| 自動test／Chromium         | 合格       |
| npm／GitHub／Pages公開照合 | 合格       |
| camera context物理測定     | 合格       |
| overlay browser確認        | 合格       |

追加の物理確認ではcamera許可／拒否、preview、`legacy`と必要時の`latest-needed`、model準備の中断、認識feedback、
overlayの位置合わせ、scene遷移、終了時のtrack／model／timer解放を確認します。camera frameは保存しません。

## Release-stop条件

- commit、version、Schema、source identity、flag snapshot、artifact hashの不一致
- 23 core action、7 member見出し／文書ボタン、dependency pinの不一致
- 同じ入力から生成したSB3またはWeb版の非決定性
- Browser Preview、CLI Preview、Standard SB3での診断または挙動差
- camera拒否、model中断、asset失敗、無効source、runtime例外での部分commitまたはresource残留
- production成果物へのpreview token、debug session、local path、file handleの混入

## Rollback

公開済みrc.6のtag、SB3、npm tarballを同じversionで差し替えません。

1. npmの`next`を`4.0.0-rc.5`へ戻す
2. GitHub prereleaseとPagesへ影響範囲と回避策を追記する
3. 必要ならPagesを`7af1416e2f48cedae0a9a5d82c598da3b2ad9d5c`へ戻す
4. 修正版を`4.0.0-rc.7`としてbuild、検証、公開する
5. 推奨安定版`3.2.3`と過去のversion付き成果物を変更しない

文書だけをrollbackする場合は、このMarkdown、candidate manifest、リリース履歴、`docs/config.mjs`、
`site/4.0/index.html`、対応testを同じcommitで戻します。
