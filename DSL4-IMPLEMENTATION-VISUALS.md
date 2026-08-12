# DSL 4.0 実装ビジュアル記録

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

記録日: 2026年8月12日\
管理Issue: [#101](https://github.com/kubohiroya/tmpose-kamishibai-docs/issues/101)

## 記録の位置付け

この記録は、固定commitから再現したDSL 4.0実装の動作画面と、sourceを実画面まで追ったmodule境界を
固定します。GitHub Releasesで正式公開されたプレイヤーの操作証跡ではありません。正式リリース後の
操作説明書とcapture gateは#41を正本とし、ここで記録する画像を正式UIとして扱いません。

## 再現元

| 項目               | 固定値                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| runtime repository | `kubohiroya/tmpose-kamishibai`                                                                                     |
| runtime commit     | `8ea06bfd100b106f559cb25a280fab5570e42919`                                                                         |
| sample repository  | `kubohiroya/tmpose-kamishibai-samples`                                                                             |
| sample commit      | `dc9f6626de9ef85ca71312402fd139082922b867`                                                                         |
| YAML               | `stories/urashima/urashima.k4.yml` / SHA-256 `9ff92d07fb6851ddb07cc6f13d20fc9023b2c90605d2533fec89cb9fdbb1faa2`    |
| SB3                | `stories/urashima/urashima-4.0.sb3` / SHA-256 `a198352ed1785261fe41ba1b0333914664ca33434da1a9bf3ba9dc56ba81de1a`   |
| Web成果物          | `stories/urashima/web-4.0/index.html` / SHA-256 `6a458145f63df77a80258c5ec2956f0608a1b7e2cedd290db0267e1328dc5ae1` |
| Packager           | `@turbowarp/packager@3.13.0`、embedded script・embedded assets                                                     |
| 外部依存           | 作品固有assetと3 pose modelは埋め込み。許可したonline dependencyは0件                                              |

`dsl4-artifacts.lock.json`と`dsl4-web-artifacts.lock.json`は、SB3とWeb成果物をそれぞれ2回生成して
byte一致することを記録しています。画面内の`Version 4.0.0`は成果物内メタデータであり、GitHub Releaseの
存在を示す値ではありません。

## 撮影条件

- URL: `http://127.0.0.1:4173/stories/urashima/web-4.0/`
- browser surface: Codex In-app Browser
- viewport: 1280×720 CSS px
- 撮影方法: viewport screenshotから舞台または説明対象だけを矩形capture
- camera: 許可せず、実映像を収録しない
- 個人情報: タイトル下部の連絡先をcapture範囲から除外
- ローカルpath: 画面内に表示しない
- 画像形式: browserが返したJPEG byteを拡張子`.jpg`で保存

## 収録画像

| file                                                |   pixel | SHA-256                                                            | 観測した状態                                              |
| --------------------------------------------------- | ------: | ------------------------------------------------------------------ | --------------------------------------------------------- |
| `docs/images/dsl4-implementation-title.jpg`         | 960×300 | `23c93cd48642e28f626a3d509538cb6653cc7022ad6a6e990d382da524e674a2` | タイトル、実装version、公式site、開始に相当する閉じる操作 |
| `docs/images/dsl4-implementation-pose-feedback.jpg` | 960×680 | `25418684648f1876dff8c612695c295bcc2219dd6626f2dee6e98f5bc6286fbe` | `Urashima.pose`待機、認識度、チャージ、物語画面の維持     |

pose画像の中央にある円形表示は、実行セッションでポーズモデル準備中として観測した
`progressbar`です。実装状態を整形して見せるために消さず、画像とcaptionで存在を説明します。

## 実装追跡

内部仕様書の図は、`8ea06bf`の次のsourceを直接確認して作成しました。

1. `src/dsl4/source-graph.js`の`createDsl4SourceGraph()`がentryと`include`を有限探索する。
2. `src/dsl4/source-graph-frontend.js`の`createDsl4SourceGraphFrontend().parse()`が宣言を合成し、
   single-source frontendへ委譲する。
3. `src/dsl4/source-frontend.js`の`createDsl4SourceFrontend().parse()`がrestricted YAML、AJV Schema、
   semantic、resource limit、Action Registryを検査する。
4. `src/dsl4/story-document.js`がsource位置を保持したimmutable `StoryDocument`を作る。
5. `src/dsl4/runtime-startup.js`がruntime componentを検証し、navigation sessionを所有する。
6. `src/dsl4/runtime-controller.js`の`dispatch()`がcore／custom actionを分け、command名でportを呼ぶ。
7. `src/dsl4/platform/turbowarp-runtime-host.js`がasset、media、Actor、SVG Text、Bubble、入力、poseの
   portとlifecycleをcompositionする。

画面との対応は、`stage`が背景、Actor portが浦島太郎と亀、`say`がbubble、`pose`がTMPoseと
pose feedbackへ到達するところまで確認しました。runtime coreはTurboWarp VM、DOM、cameraを直接参照せず、
platform port境界を維持します。

## 表示検証

- Web publication: 成人向け概要から固定実装の画面記録を外し、読者の理解に必要な概念図だけを公開する。
  実装画像は公開AppBarへ登録しない開発者向け追試資料に限定する。
- 狭幅: 内部仕様書の呼出し図を320×568で表示し、content幅280pxに対して`scrollWidth` 280pxで、
  追加要素からのoverflowがないことを確認する。
- A4: 公開ビルド後の`dist/.../document.html`をVivliostyle CLI 11.1.0でA4へ組版し、PNGへrenderした。
  内部仕様書の呼出し図はmodule列と3 port群を切らずに表示する。
- 自動検証: JPEG signature・pixel・SHA-256、非release表記、公開概要からの分離、呼出し図の
  module名を`test/dsl4-implementation-visuals.test.mjs`で固定した。

## 再取得

1. sample repositoryを`dc9f662`へcheckoutし、`pnpm build`でlockと一致する`dist/`を生成する。
2. `dist/`をlocalhostで配信し、`/stories/urashima/web-4.0/`を1280×720で開く。
3. タイトルは上部960×300だけをcaptureし、連絡先を含めない。
4. 閉じる操作で上演を開始し、Beach sceneを経て`Urashima.pose`待機へ到達した状態をcaptureする。
5. 画像のMIME type、pixel、SHA-256を確認し、本表と差がある場合は実装・成果物・撮影条件のどれが
   変わったかを記録してから差し替える。

正式リリース後に画面を更新するときは、この実装スナップショットを無言で置換せず、#41の正式captureへ
別画像として引き渡します。
