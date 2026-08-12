# DSL 4.0 チュートリアル公開管理

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

文書状態: `4.0.0-rc.2`のブラウザー完結作者flowを対象とする公開候補\
関連Issue: [ブラウザー作者flow #118](https://github.com/kubohiroya/tmpose-kamishibai-docs/issues/118) / [本体実装 #555](https://github.com/kubohiroya/tmpose-kamishibai/issues/555) / [正式公開 #111](https://github.com/kubohiroya/tmpose-kamishibai-docs/issues/111) / [準備 #31](https://github.com/kubohiroya/tmpose-kamishibai-docs/issues/31)

読者向け入口: [紙芝居チュートリアル](index.md)

このREADMEは、チュートリアルを公開する人のための管理メモです。初めて紙芝居を遊ぶ人や台本を作る人は、
上の読者向け入口から始めてください。

このディレクトリは、`4.0.0-rc.2`候補を対象とするチュートリアル本文、
スクリーンショット台帳、4.0ドキュメント一覧への公開計画を保持します。画面名、コマンド、
サンプルURLは、公開済みのruntimeとsample成果物へ固定します。

3ページを`docs/config.mjs`へ登録し、4.0トップのドキュメント一覧には入口だけを
1項目として置きます。公開時も
AppBarへ独立した「チュートリアル」項目は追加せず、各ページでは既存の「ドキュメント」を現在地にします。

## 公開時の情報設計

| URL                      | 役割                           | source                 |
| ------------------------ | ------------------------------ | ---------------------- |
| `/4.0/tutorials/`        | 二つのチュートリアルを選ぶ入口 | [index.md](index.md)   |
| `/4.0/tutorials/play/`   | 紙芝居を遊ぶ                   | [play.md](play.md)     |
| `/4.0/tutorials/create/` | 紙芝居を作る                   | [create.md](create.md) |

初版のチュートリアルはWeb操作を正本とし、PDFを公開しません。詳細な仕様、全field、全action、
移行、開発者向け手順は既存ドキュメントへリンクし、チュートリアルへ重複掲載しません。

[publication-plan.json](publication-plan.json)を公開先、4.0一覧での項目数、AppBarの現在地、
activation gate、ロールバック方針の正本とします。4.0トップには3ページを個別に並べず、
「TMPose紙芝居 4.0 チュートリアル」の1項目だけを置き、入口から「遊ぶ」「作る」へ分岐します。

## 台本作成ガイドとの役割分担

「紙芝居を作る」は、最初の作品を完成させるための最短経路です。対象読者は初めてDSL 4.0を書く方で、
固定starterを変更し、TurboWarp Editor内のpreview、自動検証、診断修正、menu build、SB3再生までを一回通します。全構文、全action、
Source Graph、複雑な分岐、custom action、runtimeやextensionの開発は扱いません。

「紙芝居DSL 4.0 台本作成ガイド」は、入門後に必要な機能を調べる作者、教材作成者、授業設計者のための
検索可能な詳細資料です。最初から全ページを通読する資料ではなく、チュートリアルの各stepから必要な節へ
移ります。Schemaリファレンスはさらに狭く、field、型、必須性、制約を検索する資料です。

チュートリアルの後は、作者ガイドの「記法」「最小台本」「作品フォルダーへファイルを配置する」
「Web Preview」「診断と安全停止」へ進みます。画面名、URL、操作画像は公開RCと固定fixtureへ
対応付けています。

## サンプルとYAMLの正本

「遊ぶ」と「作る」が使う最小作品、starter、画像、音声、pose bundle、Web版、SB3は、
`tmpose-kamishibai-samples`を正本とします。この文書リポジトリやチュートリアル本文へ、完全なsample YAMLや
配布物を複製して保守しません。

チュートリアル内のYAMLは、概念を説明する短い抜粋です。sample repositoryについて、
固定commit、starter version、artifact URL、integrity、licenseを台帳へ記録し、本文の手順と配布物が同じ入力から生成されたことを
確認しています。作者ガイド内の最小例・総合例は構文と契約を説明する例であり、チュートリアルsampleの
代替正本ではありません。

## 読者と完了条件

| チュートリアル | 対象                     | 想定時間 | 完了条件                                                                            |
| -------------- | ------------------------ | -------: | ----------------------------------------------------------------------------------- |
| 紙芝居を遊ぶ   | 初めて紙芝居を再生する人 | 10〜15分 | サンプルを開き、ポーズ認識を経て最後まで再生できる                                  |
| 紙芝居を作る   | 初めてDSL 4.0を書く人    | 60〜90分 | starterをbrowser previewで変更し、診断修正とmenu buildを経て自己完結SB3を再生できる |

通常の台本作者はScratchブロックを追加しません。「作る」は外部YAML正本とアセットを編集し、
標準templateのblock graphを変更しないゼロブロック作者フローを前提にします。

## チュートリアル用作品

「遊ぶ」と「作る」は、同じ最小作品を利用します。正式なsource、asset、生成設定、Web版、SB3、
ライセンスは`tmpose-kamishibai-samples`で管理し、この文書リポジトリへ複製しません。

最小作品は次の条件を満たすものとします。

- 3シーン程度で最後まで短時間に再生できる
- 背景1〜2件、アクター1件、セリフ、待機、画面遷移を含む
- 同梱済みポーズモデルによるポーズ認識を1件含む
- project source、配布SB3、Web版を同じ固定入力から生成できる
- assetと生成物のversion、integrity、licenseを固定できる
- 初めての人が変更する範囲と、配布側が用意する範囲を分離できる
- root直下の`story.kamishibai.yaml`、画像、音声と、model単位のpose bundle directoryで構成できる
- `addition-kit`に追加背景、追加登場人物、背景・登場人物・ポーズ場面のYAML抜粋を同梱できる

浦島太郎全編を直接教材にせず、「カメを助ける」程度の独立した小さな作品を想定します。
Teachable Machineでのモデル作成は初版の対象外とし、検証済みモデルをstarterへ同梱します。

## スクリーンショット

[screenshots.json](screenshots.json)を画像台帳の正本とします。各画像にはID、対応step、用途、
想定caption、alt text案、file名、依存するrelease gateを記録します。

YAMLはコピー可能なcode blockを正本とします。画像はTurboWarp Editorでの画面操作、正常状態、
失敗状態を示す補助として使用します。CLI commandは高度な利用者向けの任意手順だけに置きます。

### 実装追跡

2026-08-12時点では、上流のbrowser preview live reload、transactional asset live reload、共通reload
overlay、pose feedback、camera controlを含む公開RCの固定実装を
[`0e7e23f`](https://github.com/kubohiroya/tmpose-kamishibai/commit/0e7e23f59a323f088408f42ba0dc41f6b6c9feef)
で確認しています。さらに本体#555のbrowser distribution buildを`4.0.0-rc.2`候補へ反映し、
`browser-authoring` gateを`implemented`、`ready: true`として追跡します。

浦島太郎、my-urashima、チュートリアル用最小作品の4.0 Web版、SB3、integrityはsamples PR #97と
Pages deploy run `31586410478`で公開済みです。
公開surfaceは[操作説明書のmachine-readable manifest](../../sources/dsl4/user-guide-4.0-public-surfaces.json)へ
固定しています。チュートリアル用starterとaddition kitも同じrelease入力から生成され、実ファイルの
sizeとSHA-256を公開manifestと照合しました。`tutorial-sample` gateは`published`、`ready: true`です。

DSL `4.0.0-rc.1`は公開プレリリースとして固定済みです。annotated `v4.0.0-rc.1` tag、
[npm `next`](https://www.npmjs.com/package/@kubohiroya/tmpose-kamishibai/v/4.0.0-rc.1)、
[GitHub prerelease](https://github.com/kubohiroya/tmpose-kamishibai/releases/tag/v4.0.0-rc.1)、
[Pages](https://kubohiroya.github.io/tmpose-kamishibai/downloads/)を
[tmpose-kamishibai #548](https://github.com/kubohiroya/tmpose-kamishibai/issues/548)で照合し、
SB3 SHA-256を`2d55ec71cfba272c21c8a560ecc52d0b05a289a842307a1f49cf1063b37890b8`へ固定しました。
`dsl4-release` gateは`published`、`ready: true`です。安定版`4.0.0`ではなく、公開済みRCを
チュートリアルの対象releaseとして扱います。

reload overlayは上流の
[撮影引き継ぎ契約](https://github.com/kubohiroya/tmpose-kamishibai/blob/0e7e23f59a323f088408f42ba0dc41f6b6c9feef/docs/design/dsl-4-preview-reload-overlay.md#tutorial-screenshot-handoff)と
[fixture](https://github.com/kubohiroya/tmpose-kamishibai/blob/0e7e23f59a323f088408f42ba0dc41f6b6c9feef/test/fixtures/dsl4/preview-reload-overlay-screenshot.json)
を正本にします。作者用の開始、directory open、診断、build menuは、本体の
`test/fixtures/dsl4/browser-authoring-menu.html`から実際のmenu／error indicator moduleを読み込んで撮影します。
1280 × 720 CSS px、DPR 1、`ja-JP`、reduced motionとし、人物や実カメラ映像、local source pathを
画像へ含めません。

### 開発者向けの固定実装追試

固定実装を追試する開発者・文書メンテナーは、
[DSL 4.0固定実装のローカル追試](../developer-guides/dsl4-implementation-walkthrough.md)を使用します。runtime `0e7e23f`と
sample `d2f37b9`からWeb成果物を生成し、タイトル、上演、ポーズfeedback、YAML validation、
SHA-256を一続きで確認できます。

この追試で参照する2画像は#101の実装スナップショットです。チュートリアル画像とはIDと用途を分けます。
固定commitの追試経路も`docs/config.mjs`へ登録せず、公開AppBarからリンクしません。

想定する保存先は次のとおりです。

```text
docs/images/tutorials/dsl4/play/
docs/images/tutorials/dsl4/create/
```

## 公開導線とAppBar

[navigation-contract.json](navigation-contract.json)を5項目AppBarの正本とします。契約とレンダラーは
`@kubohiroya/tmpose-kamishibai-docs`のバージョン付きビルド依存として提供し、他の2リポジトリは
同じ契約スナップショットをビルド時に検証します。

```text
トップ → ドキュメント → ワークショップ → 作品 → ダウンロード
```

`/workshops/`と配下では「ワークショップ」、それ以外のドキュメントサイトでは「ドキュメント」だけを
現在地にします。各サイトは実行時に外部HTMLやJavaScriptを取得せず、静的生成物へナビゲーションを
埋め込みます。チュートリアル公開時もこの5項目と3リポジトリの契約は変更しません。

## Capture gate完了記録

[screenshots.json](screenshots.json)の全gateを完了し、次の情報を固定しています。

- DSL 4.0の公開versionと対象commit
- Standard Web playerとapp shellの配置、状態、文言
- チュートリアル用サンプルURLとstarter artifact
- 非埋め込みStandard SB3のdirectory選択、YAML／additive asset live reload、診断UI
- 2段階reload dialogの再開位置、適用範囲、8方向anchorと衝突回避
- pose feedback presenter
- camera preview、mirroring、camera選択UIの採用範囲
- 作者用メニューの「配布用SB3を作る」、保存状態、CLI fallback
- viewport、device pixel ratio、browser version
- 人物と実カメラを使わない合成fixture、背景、個人情報除去方針

## 公開手順

1. `/4.0/tutorials/`、`play/`、`create/`のHTMLを生成し、最初から最後まで追試する
2. 4.0トップのドキュメント一覧へ1項目だけ追加されることを確認する
3. AppBarの項目数を変えず、既存の「ドキュメント」が現在地になることを確認する
4. Pages公開後に3 URL、画像、公開サンプルへのリンクを確認する

## 関連資料

- [紙芝居DSL 4.0 台本作成ガイド](../dsl-author-guides/dsl-4.0-author-guide.md)
- [DSL 4.0 Schemaリファレンス準備 Issue #29](https://github.com/kubohiroya/tmpose-kamishibai-docs/issues/29)
- [source channelとゼロブロック作者フロー #258](https://github.com/kubohiroya/tmpose-kamishibai/issues/258)
- [capability・Bundle・release境界 #266](https://github.com/kubohiroya/tmpose-kamishibai/issues/266)
- [release candidate更新とversion／hash固定 #548](https://github.com/kubohiroya/tmpose-kamishibai/issues/548)
- [チュートリアル用最小作品・starter・addition kit #94](https://github.com/kubohiroya/tmpose-kamishibai-samples/issues/94)
- [poseModel asset lifecycle #327](https://github.com/kubohiroya/tmpose-kamishibai/issues/327)
- [Web PreviewとYAML live reload #390](https://github.com/kubohiroya/tmpose-kamishibai/issues/390)
- [local assetの追加・内容更新live reload #391](https://github.com/kubohiroya/tmpose-kamishibai/issues/391)
- [共通reload overlay #394](https://github.com/kubohiroya/tmpose-kamishibai/issues/394)
- [pose認識進捗表示 #383](https://github.com/kubohiroya/tmpose-kamishibai/issues/383)
- [camera preview操作UI #388](https://github.com/kubohiroya/tmpose-kamishibai/issues/388)
