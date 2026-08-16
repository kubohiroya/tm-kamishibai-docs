# 紙芝居DSL 4.0 リリース履歴

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

文書状態: 公開プレリリースと安定版を区別する4.0系列の履歴<br />
対象Issue: [tmpose-kamishibai-docs #42](https://github.com/kubohiroya/tmpose-kamishibai-docs/issues/42)、[#163](https://github.com/kubohiroya/tmpose-kamishibai-docs/issues/163)

この文書は開発・リリース担当者向けで、アプリの使い方や台本作成の
入門書ではありません。初めて使う方は
[大人向け概要](../user-guides/executive-summary-adult-4.0.md)、実際に試す方は
[操作説明書](../user-guides/user-guide-4.0.md)から始めてください。機械可読な正本は
[`sources/dsl4/release-history-4.0.json`](https://github.com/kubohiroya/tmpose-kamishibai-docs/blob/main/sources/dsl4/release-history-4.0.json)です。

## 最初に出てくる言葉

| 状態             | 意味                                                             |
| ---------------- | ---------------------------------------------------------------- |
| 公開プレリリース | npm `next`、GitHub prerelease、Pages成果物として公開された候補版 |
| 安定版           | npm `latest`と通常のダウンロード導線で推奨する版                 |
| 公開サンプル基準 | サンプル作品、starter、Web版を生成したruntimeの版                |

2026年8月16日現在、`v4.0.0-rc.6`は公開プレリリースです。推奨安定版は`v3.2.3`で、
正式版`v4.0.0`は未公開です。チュートリアルとサンプル成果物は、公開rc.6のSB3とfreeze commitを
入力として再生成し、作品ごとのlockに完全性情報を記録します。

## 4.0.0-rc.6

状態: **公開プレリリース**<br />
公開日時: 2026年8月16日 16:08 JST

### 固定revisionと公開先

| 対象                  | 固定値                                                                                                                                                                            |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 追跡Issue             | [`#624`](https://github.com/kubohiroya/tmpose-kamishibai/issues/624)                                                                                                              |
| candidate PR          | [`#625`](https://github.com/kubohiroya/tmpose-kamishibai/pull/625) / `4efec1963af04b50c080bef7095f598da928ac84`                                                                   |
| freeze PR／tag commit | [`#626`](https://github.com/kubohiroya/tmpose-kamishibai/pull/626) / [`4c360cd`](https://github.com/kubohiroya/tmpose-kamishibai/commit/4c360cd9845f9dcdbf7ecbffaa2fe4c1462af8b6) |
| 公開記録PR            | [`#627`](https://github.com/kubohiroya/tmpose-kamishibai/pull/627) / `72cf2fa8c5a989169cd3929614cf61e77eef25af`                                                                   |
| release source        | tag `v4.0.0-rc.6`。現行branchへ展開copyを保持しない                                                                                                                               |
| source identity       | `sha256:ebdde314be4d929894bce9eb511f340c61879b2b9ff8366ae31cabbb00bfbf10`                                                                                                         |
| Schema SHA-256        | `bb96f6fd503ee7a747b48b4cdc30db227b5d3171854c2b83a47a96c15ed7fd79`                                                                                                                |
| GitHub prerelease     | [`v4.0.0-rc.6`](https://github.com/kubohiroya/tmpose-kamishibai/releases/tag/v4.0.0-rc.6)                                                                                         |
| npm                   | [`4.0.0-rc.6`](https://www.npmjs.com/package/@kubohiroya/tmpose-kamishibai/v/4.0.0-rc.6)、dist-tag `next`                                                                         |
| Pages                 | [download一覧](https://kubohiroya.github.io/tmpose-kamishibai/downloads/)                                                                                                         |

作者向けSchemaリファレンスはtag commit `4c360cd9845f9dcdbf7ecbffaa2fe4c1462af8b6`と同じ
Schema SHA-256を固定します。

### rc.5からの変更

- TMPoseを1.11.0へexact pinし、camera canvasのcontext／readback責務をTMPose上流へ集約
- `poseRecognition.preview.overlay`からSVGの関節とボーンを表示し、style、最低confidence、confidence連動を設定可能にした
- overlay専用feature flagを設けず、DSL 4.0 runtimeでSchemaに設定があれば公開Composition APIへ接続
- scratch-renderとPackagerへ警告抑制patchを当てず、実測に基づく上流責務を維持
- project source manifestを任意化し、唯一の`.k4.yml`を自動選択できるようにした
- 公開SB3の正本をGitHub Releasesへ移し、旧`release-sources/`の展開copyを廃止

### exact dependency pin

| package                                    | version |
| ------------------------------------------ | ------- |
| `@kubohiroya/turbowarp-asset-manager`      | 0.11.0  |
| `@kubohiroya/turbowarp-async-input`        | 0.4.0   |
| `@kubohiroya/turbowarp-bubble`             | 0.7.0   |
| `@kubohiroya/turbowarp-runtime-expression` | 0.4.0   |
| `@kubohiroya/turbowarp-svg-text`           | 0.5.0   |
| `@kubohiroya/turbowarp-tmpose`             | 1.11.0  |

### 公開成果物

| 成果物                                                                                                                  | byte      | 完全性情報                                                                 |
| ----------------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------- |
| [Standard SB3](https://github.com/kubohiroya/tmpose-kamishibai/releases/download/v4.0.0-rc.6/kamishibai-4.0.0-rc.6.sb3) | 6,684,010 | SHA-256 `be0e38d6179873894db2363751955ccd68b971a829a5b09c048e54986fbd7796` |
| [npm tarball](https://registry.npmjs.org/@kubohiroya/tmpose-kamishibai/-/tmpose-kamishibai-4.0.0-rc.6.tgz)              | 6,446,010 | SHA-256 `6581c73b61f90762383bc8284699bb994dc396951ae3bfdd271249a362c99eba` |

npm registry integrityは
`sha512-q4amPLLmVrsh60ZhNo6sjtCYLwBVH8nosmElbh/LGdX4/4gVBw4oohcgIgAZLm5G0VmgWxfj3NJ0fxHLe+C7bg==`です。
GitHub ReleaseとPagesのSB3は同じbyte数とSHA-256です。

### 検証、制約、rollback

freeze PRの`pnpm verify:full`はNode系1,212件とChromium 13件を通過しました。記録は
[GitHub Actions](https://github.com/kubohiroya/tmpose-kamishibai/actions/runs/31931898431/job/95127903375)で確認できます。
物理cameraの測定では通常Canvas2D contextに再現性のある劣化がなく、CPU推論時のChromium readback警告は
性能根拠のない抑制をせず許容します。camera frameは保存していません。

- DSL document versionは引き続き`kamishibai: "4.0"`
- `overlay`省略時は非表示、記述して`visible`省略時は表示
- rc.5以前のversion付きSB3とtagを差し替えない
- 問題時はnpm `next`を`4.0.0-rc.5`へ戻し、公開済みrc.6のbyte列を上書きしない
- 修正版は`4.0.0-rc.7`として公開する

## 4.0.0-rc.5

状態: **公開プレリリース**<br />
公開日時: 2026年8月15日 03:55 JST

### 固定revisionと公開先

| 対象                  | 固定値                                                                                                                                                                            |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 追跡Issue             | [`#583`](https://github.com/kubohiroya/tmpose-kamishibai/issues/583)                                                                                                              |
| candidate PR          | [`#593`](https://github.com/kubohiroya/tmpose-kamishibai/pull/593) / `9b3895638edba009ee4558a6c0594f077d9fbd6b`                                                                   |
| freeze PR／tag commit | [`#594`](https://github.com/kubohiroya/tmpose-kamishibai/pull/594) / [`f323a54`](https://github.com/kubohiroya/tmpose-kamishibai/commit/f323a5475d4c6240a255f8a6f5b6c5d68b9ea7b6) |
| 公開記録PR            | [`#596`](https://github.com/kubohiroya/tmpose-kamishibai/pull/596) / `f76af3b27973dad2ebab601550a585180eec1ad9`                                                                   |
| release source        | `release-sources/4.0.0-rc.5/app`                                                                                                                                                  |
| source identity       | `sha256:a6c4be01405af1b3070f6d02dc584a55bd2b45844ae48761aa3d4141ef474ca4`                                                                                                         |
| Schema SHA-256        | `0d6bc7f58f849560f3e9125a660a2b5efc5d91f34d533963b9777d6f467ac136`                                                                                                                |
| GitHub prerelease     | [`v4.0.0-rc.5`](https://github.com/kubohiroya/tmpose-kamishibai/releases/tag/v4.0.0-rc.5)                                                                                         |
| npm                   | [`4.0.0-rc.5`](https://www.npmjs.com/package/@kubohiroya/tmpose-kamishibai/v/4.0.0-rc.5)、dist-tag `next`                                                                         |
| Pages                 | [download一覧](https://kubohiroya.github.io/tmpose-kamishibai/downloads/)                                                                                                         |

作者向けSchemaリファレンスもtag commit `f323a5475d4c6240a255f8a6f5b6c5d68b9ea7b6`と同じSchema SHA-256を固定します。

### rc.4からの変更

- manifestに定義された全23 core actionを`kubohiroyakamishibai4`の可視TurboWarp blockとして公開
- TurboWarp blockをYAML台本と同じregistry、Schema正規化、ActionContext、lifecycleへ接続
- core Runtimeと6つの外部機能拡張、合計7 memberに見出しと文書ボタンを表示
- Bubble 0.7.0で実測幅の折り返し、native reveal、音声、表示animationを利用可能にした
- TMPose 1.10.0で`poseRecognition.modelInitialization`の`legacy`／`latest-needed`、並列初期化、
  AbortSignalによる中断を追加した。既定値は`legacy`／`parallel: false`
- PoseNet model dataをruntime JavaScriptのBase64からproject model dataへ移した
- playback runtimeをauthoring runtimeから分離し、SB3を7,866,652 bytesから6,664,571 bytesへ縮小した

### exact dependency pin

| package                                    | version |
| ------------------------------------------ | ------- |
| `@kubohiroya/turbowarp-asset-manager`      | 0.11.0  |
| `@kubohiroya/turbowarp-async-input`        | 0.4.0   |
| `@kubohiroya/turbowarp-bubble`             | 0.7.0   |
| `@kubohiroya/turbowarp-runtime-expression` | 0.4.0   |
| `@kubohiroya/turbowarp-svg-text`           | 0.5.0   |
| `@kubohiroya/turbowarp-tmpose`             | 1.10.0  |

### 公開成果物

| 成果物                                                                                                     | byte      | 完全性情報                                                                 |
| ---------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------- |
| [Standard SB3](https://kubohiroya.github.io/tmpose-kamishibai/downloads/kamishibai-4.0.0-rc.5.sb3)         | 6,664,571 | SHA-256 `2494b43f43f7b7acbd1ce9d307fcff383d239931aa46de550f76c3eb3ec40f3c` |
| [npm tarball](https://registry.npmjs.org/@kubohiroya/tmpose-kamishibai/-/tmpose-kamishibai-4.0.0-rc.5.tgz) | 6,425,111 | SHA-256 `f7e9075a0a4445367aa38b2a9a2b71a5a22ff471e7d3795c9a9b1430685c7b23` |

npm registry integrityは
`sha512-RF4kHhE2e1EzKu5eYwMdV4//8uVj8OflafQ5R1GlRVmQz2ONcdVZfeY6fvB9EC/VO7irL7deH1h9Cqo08jWj7A==`です。
PagesとGitHub Releaseから取得したSB3は同じbyte数とSHA-256でした。

### 検証

candidateの`pnpm verify:full`はNode test 1,224件とChromium test 63件を通過しました。記録は
[GitHub Actions](https://github.com/kubohiroya/tmpose-kamishibai/actions/runs/31823718461/job/94842799234)で確認できます。

rc.3で行った実カメラ・実ポーズ確認は、TMPose、PoseNet model data、モデル初期化経路が変わったrc.5の
合格証跡には流用しません。rc.5の自動検証と公開照合は合格、物理camera／poseの再確認は未完了として
[release smoke](../developer-guides/release-smoke-4.0.md)へ記録します。

### 制約とrollback

- DSL document versionは引き続き`kamishibai: "4.0"`
- Structured Data Standalone／DebugとAction Contextは既定OFF
- rc.4以前のversion付きSB3とrelease sourceを差し替えない
- 問題時はnpm `next`を`4.0.0-rc.4`へ戻し、GitHub prereleaseとPagesへ注意事項を追加する
- rc.5のbyte列を上書きせず、修正版は`4.0.0-rc.6`として公開する

## 次のversionを追記する

既存項目のchecksumや制約を上書きせず、新しい履歴項目を先頭へ追加します。

1. tag、release commit、公開日時、GitHub Release、npm、Pagesを確認する
2. release source、source identity、Schema SHA-256、feature flag snapshotを固定する
3. SB3とnpm tarballを独立に取得し、byte数、checksum、registry integrityを照合する
4. 自動検証と、変更範囲に応じた実ブラウザ／camera／pose証跡を記録する
5. 安定版、公開プレリリース、公開サンプル基準を区別する
6. rollback先と、公開済み成果物を上書きしない修正版versionを記録する

上流での確認例です。

```bash
git show --no-patch v4.0.0-rc.6
gh release view v4.0.0-rc.6 --repo kubohiroya/tmpose-kamishibai
npm view @kubohiroya/tmpose-kamishibai@4.0.0-rc.6 version dist.integrity
shasum -a 256 kamishibai-4.0.0-rc.6.sb3
```
