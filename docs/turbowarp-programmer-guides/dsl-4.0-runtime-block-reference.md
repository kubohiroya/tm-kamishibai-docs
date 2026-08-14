# DSL 4.0ランタイム ブロックリファレンス

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

対象: DSL 4.0ランタイムをTurboWarp Editorで開き、集約されたブロックからプログラムを書く方  
調査基準: tmpose-kamishibai 4.0.0-rc.5候補、sb3-toolchain 0.8.0、2026年8月15日

文書状態: 固定実装基準を説明する4.0候補版向けリファレンス  
実装基準: 2026年8月15日時点のtmpose-kamishibai main

この一覧は4.0の正式リリースまたは将来版で同じblock構成を保証するものではありません。利用前に
[公開元](https://github.com/kubohiroya/tmpose-kamishibai/releases)のversionとrelease noteを確認してください。

DSL 4.0のSB3には、紙芝居ランタイムと6つの機能拡張が、一つの静的な機能拡張bundleとして入っています。
TurboWarp Editorでは一つのパレットに見えますが、見出し、アイコン、名前空間、ドキュメントボタンによって
由来を識別できます。本書は、現行bundleでパレットに表示される121ブロックを由来別に一覧にします。

## パレットとドキュメントボタン

各memberは、パレット内で次の順に表示されます。

1. `◆ 機能拡張名 [member ID] ◆`という見出し
2. その機能拡張が`docsURI`を持つ場合は`Open Documentation`ボタン
3. その機能拡張に由来するブロック

ボタンを押すと、次の公開文書を開きます。リンク先のトップが英語の場合は、ページ内の「日本語」を選べます。

| 由来                       | version        | member ID                      | docsURI                                                                                                                                |
| -------------------------- | -------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Kamishibai DSL 4.0 Runtime | 4.0.0-rc.5候補 | `kubohiroyakamishibairuntime4` | [本リファレンス](https://kubohiroya.github.io/tmpose-kamishibai-docs/4.0/turbowarp-programmer-guides/dsl-4.0-runtime-block-reference/) |
| Asset Manager              | 0.11.0         | `kubohiroyaassetmanager`       | [Asset Manager](https://kubohiroya.github.io/turbowarp-asset-manager/)                                                                 |
| Async Input                | 0.4.0          | `kubohiroyaasyncinput`         | [Async Input](https://kubohiroya.github.io/turbowarp-async-input/)                                                                     |
| Bubble                     | 0.7.0          | `kubohiroyabubble`             | [Bubble](https://kubohiroya.github.io/turbowarp-bubble/)                                                                               |
| Runtime Expression         | 0.4.0          | `kubohiroyaruntimeexpression`  | [Runtime Expression](https://kubohiroya.github.io/turbowarp-runtime-expression/)                                                       |
| SVG Text                   | 0.5.0          | `kubohiroyasvgtext`            | [SVG Text](https://kubohiroya.github.io/turbowarp-svg-text/)                                                                           |
| TMPose                     | 1.10.0         | `tmpose`                       | [TMPose](https://kubohiroya.github.io/turbowarp-tmpose/)                                                                               |

集約時にopcodeはmember IDを含む名前空間へ変換されるため、同名ブロックが別memberにあっても衝突しません。
保存済みprojectでは変換後opcodeを使い、利用者が見るブロック文と実行時の意味は上流拡張の定義を保ちます。

## Kamishibai DSL 4.0 Runtime（23ブロック）

このmemberは、YAML actionと同じSchema定義で引数を検証して実行します。`SPEC`、`ROUTES`、`STEPS`はJSON文字列です。

| opcode                    | パレットのブロック文                                               | 役割                                          |
| ------------------------- | ------------------------------------------------------------------ | --------------------------------------------- |
| `stage`                   | `set stage backdrop [BACKDROP]`                                    | 背景assetを設定する                           |
| `bgm`                     | `play BGM [SOUND]`                                                 | BGMを再生する                                 |
| `sound`                   | `play sound [SOUND] until done`                                    | 効果音を再生し、終了まで待つ                  |
| `wait`                    | `wait [SECONDS] seconds`                                           | 指定秒数待つ                                  |
| `debugger`                | `debugger`                                                         | development debugの停止境界を置く             |
| `broadcastMessageAndWait` | `broadcast [MESSAGE] and wait`                                     | exact nameのmessageを送り、receiver完了を待つ |
| `transition`              | `transition [EFFECT] for [SECONDS] seconds`                        | 画面遷移effectを実行する                      |
| `goto`                    | `go to scene [SCENE]`                                              | 指定sceneへ移動する                           |
| `branch`                  | `choose branch [BRANCH]`                                           | 指定branchを評価する                          |
| `keyInputToChangeScene`   | `wait for key routes [ROUTES]`                                     | キーからsceneへのrouteを待つ                  |
| `touchInputToChangeScene` | `wait for actor touch routes [ROUTES]`                             | actorタッチからsceneへのrouteを待つ           |
| `poseInputToChangeScene`  | `wait for pose routes [ROUTES]`                                    | ポーズからsceneへのrouteを待つ                |
| `show`                    | `show actor [TARGET] skin [SKIN] x [X] y [Y] scale [SCALE] %`      | actorを指定skin・位置・倍率で表示する         |
| `hide`                    | `hide actor [TARGET]`                                              | actorを隠す                                   |
| `setTransparency`         | `set actor [TARGET] transparency spec [SPEC]`                      | 透明度を即時または時間付きで変更する          |
| `moveTo`                  | `move actor [TARGET] to x [X] y [Y] in [SECONDS] seconds [EASING]` | actorを補間移動する                           |
| `say`                     | `actor [TARGET] say spec [SPEC]`                                   | 指定Bubble styleで発話する                    |
| `think`                   | `actor [TARGET] think spec [SPEC]`                                 | 指定Bubble styleで思考を表示する              |
| `setSkin`                 | `set actor [TARGET] skin [SKIN] optional scale [SCALE]`            | actorのskinと任意の倍率を変更する             |
| `setLayer`                | `set actor [TARGET] layer [LAYER]`                                 | actorを前面、背面、数値layerへ移す            |
| `loop`                    | `loop actor [TARGET] costume steps [STEPS]`                        | actorのskin列をloopする                       |
| `setText`                 | `set text actor [TARGET] to [TEXT] style [STYLE]`                  | text actorの内容とstyleを設定する             |
| `pose`                    | `recognize actor [TARGET] pose steps [STEPS]`                      | ポーズ認識の手順を実行する                    |

YAMLからTurboWarpの受信scriptを呼ぶ場合は、
[メッセージに応じた動作の記述](dsl-4.0-turbowarp-broadcast-guide.md)も参照してください。

## Asset Manager 0.11.0（23ブロック）

素材を名前で登録し、画像、文字、音声、animationへ同じ名前を渡します。外部URL、cache、costume、backdrop、
project sound、runtime textを扱います。

| opcode                    | 役割                                                       |
| ------------------------- | ---------------------------------------------------------- |
| `registerAsset`           | resourceを名前付きassetとして登録する                      |
| `assetErrorType`          | 直近の登録失敗のstable error codeを返す                    |
| `assetErrorLabel`         | 直近の登録失敗に関係する名前を返す                         |
| `deleteMemoryAsset`       | 一つの登録をmemoryから解放する                             |
| `deleteAllMemoryAssets`   | 全登録と所有するskin、animation、音声を解放する            |
| `deleteCachedAsset`       | 一つの外部assetをIndexedDB cacheから削除する               |
| `deleteAllCachedAssets`   | 外部asset cacheをすべて消去する                            |
| `isLoaded`                | assetが登録済みか返す                                      |
| `setTextValue`            | runtime text assetの値を設定する                           |
| `setTextStyle`            | text assetのanimation、font、color、width、alignを設定する |
| `setThisSpriteSkin`       | 現在のsprite／cloneへ画像またはtext assetを表示する        |
| `setSpriteSkin`           | 名前付きspriteへassetを表示する互換ブロック                |
| `startActorLoop`          | actorのasset列をbackgroundでloopする                       |
| `startActorSequence`      | actorのasset列をbackgroundで一度再生する                   |
| `stopActorAnimation`      | actorのloop／sequenceを停止する                            |
| `finishAllActorSequences` | 全one-shot sequenceを最終画像まで進める                    |
| `setStageSkin`            | Stageへ登録画像を表示する                                  |
| `playSound`               | 登録音声を待たずに再生する                                 |
| `playSoundUntilDone`      | 登録音声を終了まで再生する                                 |
| `stopSound`               | 指定assetの再生だけを停止する                              |
| `stopAllSounds`           | Asset Managerが追跡する全音声を停止する                    |
| `getAssetMimeType`        | 登録assetの正規化済みMIME typeを返す                       |
| `getVersion`              | Asset Managerのversionを返す                               |

`loadAsset`、loading表示用block、構造化project locator検証などは内部／互換surfaceであり、現行bundleの
パレットには表示されません。session binary backing、verified remote cache、bitmap resolutionなどのhost APIは
上流ガイドのComposition APIを参照してください。

## Async Input 0.4.0（11ブロック）

入力listenerは、それを登録したStage、sprite、cloneが所有します。runtime variableはTemporary Variables由来です。

| opcode                       | 役割                                              |
| ---------------------------- | ------------------------------------------------- |
| `listenForKey`               | physical keyでruntime variableを更新する          |
| `listenForKeyAndBroadcast`   | keyで変数を更新してmessageを送る                  |
| `stopListeningForKey`        | 現在targetの指定key listenerを外す                |
| `stopAllKeyListeners`        | 現在targetの全key listenerを外す                  |
| `listenForTouch`             | 現在sprite／cloneのタッチで変数を更新する         |
| `listenForTouchAndBroadcast` | タッチで変数を更新してmessageを送る               |
| `stopListeningForTouch`      | 現在targetのtouch listenerを外す                  |
| `listenForPose`              | accumulated poseで変数を更新する                  |
| `stopListeningForPose`       | 現在targetの指定pose listenerを外す               |
| `stopAllPoseListeners`       | 現在targetの全pose listenerを外す                 |
| `stopAllInputListeners`      | 現在targetのkey、touch、pose listenerをすべて外す |

## Bubble 0.7.0（28ブロック）

BubbleはSVG body、SVG Text、portrait、目パチ、口パク、音声、continue indicatorを一つの表示surfaceとして扱います。

| opcode                    | 役割                                                 |
| ------------------------- | ---------------------------------------------------- |
| `defineBubbleStyle`       | 名前付きBubble styleとSVG Text styleの対応を定義する |
| `setBubblePlacement`      | actor相対方向または背景相対regionを設定する          |
| `setPortraitBase`         | portraitの基準画像assetを設定する                    |
| `setPortraitLayout`       | portraitの辺／角、offset、zoom、角丸を設定する       |
| `setBubbleDistance`       | actor境界からtail先端までの距離を設定する            |
| `setBubbleVisualStyle`    | BubbleのSVG形状を設定する                            |
| `setBubbleTailLength`     | actor相対Bubbleのtail長を設定する                    |
| `setBubbleOffset`         | Bubble本体のoffsetとscaleを設定する                  |
| `setBlinkFrames`          | portraitの目パチasset列と間隔を設定する              |
| `setLipSyncFrames`        | portraitの口パクasset列と間隔を設定する              |
| `setContinueFrames`       | 入力待ちindicatorのasset列と間隔を設定する           |
| `setBubbleReveal`         | CHARACTER／WORD／LINE／BLOCKの逐次表示を設定する     |
| `setBubbleWordDelimiters` | WORD表示の区切り文字と表示有無を設定する             |
| `setBubbleRevealSound`    | 逐次表示単位ごとの効果音assetを設定する              |
| `setBubbleVoice`          | Bubble開始時のfull-voice assetを設定する             |
| `finishBubbleReveal`      | 残りを表示し、条件またはtimeoutを待つ                |
| `setBubbleShowAnimation`  | 表示開始animationを設定する                          |
| `setBubbleHideAnimation`  | 表示終了animationを設定する                          |
| `animateBubble`           | 名前付きdisplay animationを直ちに実行する            |
| `shakeBubble`             | Bubble surface全体を方向・回数・easing付きで揺らす   |
| `explodeBubble`           | Bubble surface全体を相対倍率で拡縮する               |
| `animateBubbleShape`      | Bubble形状を別visual styleへ遷移する                 |
| `sayWithBubbleStyle`      | 現在spriteの発話Bubbleを表示する                     |
| `thinkWithBubbleStyle`    | 現在spriteの思考Bubbleを表示する                     |
| `setBubbleAnimationMode`  | talking／awaiting-continueなどのmodeを変える         |
| `waitForBubbleContinue`   | Runtime Expressionの条件またはtimeoutを待つ          |
| `closeBubble`             | Bubbleを閉じ、timer、skin、drawableを解放する        |
| `getVersion`              | Bubbleのversionを返す                                |

## Runtime Expression 0.4.0（3ブロック）

| opcode                           | 役割                                                          |
| -------------------------------- | ------------------------------------------------------------- |
| `runtimeCondition`               | Temporary Variablesを使う制限付きJavaScript風条件式を評価する |
| `registerConditionalBroadcast`   | false→true／true→falseの変化でmessageを送る登録を作る         |
| `unregisterConditionalBroadcast` | IDが一致する条件付きbroadcastを解除する                       |

`validateConditionSyntax`はhost向けの非表示blockです。利用できる演算子、値の変換、式の長さ・token数・深さ・
timeout、エラー時の扱いは上流ガイドを参照してください。

## SVG Text 0.5.0（2ブロック）

| opcode        | 役割                                                                   |
| ------------- | ---------------------------------------------------------------------- |
| `defineStyle` | background、文字色、font、size、alignを持つ名前付き文字styleを定義する |
| `setText`     | 現在spriteのskinを、指定styleのresponsive SVG textへ置き換える         |

文字幅測定、skin所有権、target／全体解放はComposition APIで提供され、パレットblockではありません。

## TMPose 1.10.0（31ブロック）

### model、camera、preview

| opcode                     | 役割                                          |
| -------------------------- | --------------------------------------------- |
| `versionReporter`          | TMPoseのversionを返す                         |
| `setModelURL`              | Teachable Machine Pose model URLを設定する    |
| `loadModel`                | 設定済みmodelを読み込む                       |
| `isModelLoaded`            | modelの読込状態を返す                         |
| `startCamera`              | cameraとpreviewを開始する                     |
| `stopCamera`               | cameraと認識loopを停止する                    |
| `isCameraRunning`          | cameraの実行状態を返す                        |
| `refreshCameraList`        | 利用できるvideo input一覧を更新する           |
| `setCameraSelection`       | default、front、back、検出済みcameraを選ぶ    |
| `cameraCountReporter`      | 検出したcamera数を返す                        |
| `cameraDeviceIdReporter`   | 使用中cameraのdevice IDを返す                 |
| `cameraDeviceNameReporter` | 使用中cameraのdevice名を返す                  |
| `showPreview`              | camera previewを表示する                      |
| `hidePreview`              | camera previewを隠す                          |
| `isPreviewVisible`         | previewの表示設定を返す                       |
| `setPreviewOpacity`        | previewの不透明度を0〜1で設定する             |
| `setPreviewPosition`       | previewのStage内位置を設定する                |
| `setPreviewMirroring`      | 認識入力を変えずにpreviewの左右反転を設定する |
| `previewMirroringReporter` | `mirrored`または`unmirrored`を返す            |

### 認識結果と診断

| opcode                   | 役割                                   |
| ------------------------ | -------------------------------------- |
| `startPredict`           | ポーズ認識を開始する                   |
| `stopPredict`            | ポーズ認識を停止する                   |
| `isPredicting`           | 認識中か返す                           |
| `currentPoseReporter`    | confidenceが最大のpose labelを返す     |
| `scoreReporter`          | 現在poseのconfidenceを返す             |
| `poseScoreReporter`      | 指定poseのconfidenceを返す             |
| `isPose`                 | 指定poseが既定threshold 0.75以上か返す |
| `isPoseWithThreshold`    | 指定poseが指定threshold以上か返す      |
| `cameraMsReporter`       | camera開始時間をmsで返す               |
| `modelLoadMsReporter`    | model読込時間をmsで返す                |
| `firstPredictMsReporter` | 最初の認識までの時間をmsで返す         |
| `lastErrorReporter`      | 直近のerror messageを返す              |

`setAccumulatedPoseParameters`、`setAccumulatedPoseThreshold`、`resetAccumulatedPose`、
`accumulatedPoseReporter`、`accumulatedScoreReporter`、`accumulatedPoseScoreReporter`は
`temporalPoseScoring`が既定OFFのため、現行の集約パレットには表示されません。DSL 4.0内部は
TMPose Composition APIの時間累積機能を、作品実行の契約に従って利用します。

TMPose 1.10.0の`latest-needed` model初期化、`AbortSignal`、実行中1件＋最新待機1件、cancelled modelを
registryへ公開しない契約もComposition API側の機能であり、TurboWarp blockとしては追加されません。

## 互換性と安全な使い方

- 集約ランタイム内のblockは、同じversionの上流ドキュメントを正本として使います。
- 上流packageのComposition APIすべてがTurboWarp blockになるわけではありません。host専用APIは各Pagesで区別します。
- `SPEC`や`ROUTES`へ渡すJSONは文字数16,384、深さ32、node数1,024の上限と危険keyの拒否を受けます。
- camera、microphone、外部network、local fileはブラウザーの権限とsecure contextの制約を受けます。
- memberのversionまたはblock定義を更新したら、bundle成果物、docsURI、block count、本書を同じrelease候補で再検証します。
