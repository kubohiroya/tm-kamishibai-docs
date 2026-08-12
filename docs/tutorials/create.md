# 紙芝居を作る

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

対象バージョン: `4.0.0-rc.1`（公開プレリリース）\
対象: 初めて紙芝居DSL 4.0を書く人\
扱う台本: 4.0用のYAML台本\
想定時間: 60〜90分

入口: [TMPose紙芝居 4.0 チュートリアル](index.md)

このチュートリアルでは、「紙芝居を遊ぶ」で使用した作品のスターターを少しずつ変更します。台本は、
YAML（項目を字下げして並べるテキスト形式）で書きます。変更はローカルプレビュー（ブラウザー上で
変更を確かめる画面）で確かめ、最後に
SB3（TurboWarpやScratchで開ける一つの作品ファイル）として出力します。Scratchのブロックは追加しません。

## 最初のゴール

最初の目標は、スターターのセリフを一行だけ変え、プレビューで変更を確かめることです。背景、登場人物、
ポーズは、その成功を確認してから一つずつ追加します。ここではまだ編集せず、Step 1から順番に進めます。

## 用意するもの

- Node.js `22.12.0`以降とpnpmを使えるパソコン
- 文字を編集できるエディター
- 新しいWebブラウザー
- ポーズ場面を確かめるためのカメラと、全身を映せる少しの空間

この手順では`@kubohiroya/tmpose-kamishibai`を`4.0.0-rc.1`へ固定します。公開プレリリースを
試す手順であることを理解したうえで、ほかの作品と分けた作業フォルダーで進めてください。

## 全体の流れ

| Step | やること                       | 画面で確かめること                 |
| ---: | ------------------------------ | ---------------------------------- |
|    1 | 完成作品を遊ぶ                 | 物語の始まり、ポーズ、終わり       |
|    2 | スターターと実行環境を用意する | 編集する台本ファイル               |
|    3 | ローカルプレビューを起動する   | 変更を待っている状態               |
|    4 | セリフを一行変える             | 新しいセリフ                       |
|    5 | 背景、登場人物、場面を加える   | 新しい場面                         |
|    6 | 同梱されたポーズ場面を加える   | ポーズの案内と進み具合             |
|    7 | わざと一つ間違えてから直す     | エラーの場所と、修正後に消えること |
|    8 | 台本と素材を検査してSB3を作る  | 完成したSB3                        |
|    9 | 完成したSB3を再生する          | 最後まで遊べること                 |

## 1. 完成作品を確認する

最初に[紙芝居を遊ぶ](play.md)を行い、作成する作品の開始、ポーズ認識、終了を確認します。完成状態を
先に知ることで、以後の変更が画面のどこへ反映されたか比較できます。

<!-- screenshot:C-13 -->

## 2. スターターと実行環境を用意する

次の二つをダウンロードします。

- [チュートリアル用スターター](https://kubohiroya.github.io/tmpose-kamishibai-samples/stories/tutorial/tutorial-story-starter-4.0.zip)
- [紙芝居4.0.0-rc.1のベースSB3](https://kubohiroya.github.io/tmpose-kamishibai/downloads/kamishibai-4.0.0-rc.1.sb3)

新しい作業フォルダーを作り、スターターのZIPをその中へ展開します。ベースSB3も同じ作業フォルダーへ
保存し、名前を`kamishibai-4.0.0-rc.1.sb3`にします。ターミナルで作業フォルダーへ移動し、実行環境を
インストールします。

```bash
pnpm init
pnpm add --save-exact @kubohiroya/tmpose-kamishibai@4.0.0-rc.1
```

インストール後の主なファイルは次の配置になります。

```text
作業フォルダー/
├── package.json
├── pnpm-lock.yaml
├── kamishibai-4.0.0-rc.1.sb3
└── tutorial-story/
    ├── README.md
    ├── LICENSES.md
    ├── project.source.json
    ├── story.kamishibai.yaml
    ├── beach.svg
    ├── turtle.svg
    ├── opening.mp3
    ├── rescue-pose/
    │   ├── model.json
    │   ├── metadata.json
    │   └── weights.bin
    └── addition-kit/
        ├── new-beach.svg
        ├── friend.svg
        ├── add-background-and-actor.yml.txt
        ├── add-pose-scene.yml.txt
        └── intentional-diagnostic.kamishibai.yaml.txt
```

最初に編集するのは`tutorial-story/story.kamishibai.yaml`です。`project.source.json`は読み込む台本を
指定する設定ファイルです。この設定ファイル、画像、音声、
`rescue-pose`フォルダーはそのままにします。`addition-kit`はStep 5以降で使う追加素材とYAML見本です。

<!-- screenshot:C-01 -->

![story.kamishibai.yamlと画像、音声、rescue-pose、addition-kitが並ぶスターターのファイルツリー](../images/tutorials/dsl4/create/tutorial-create-01-starter-project.png)

_スターターを開き、編集する台本と後で使う追加素材を確認します。画像は公開starterの配置を再現したfixtureです。_

## 3. ローカルプレビューを起動する

作業フォルダーのターミナルで、次の命令を実行します。

```bash
pnpm exec tmpose-kamishibai preview-dsl4 --watch \
  --base kamishibai-4.0.0-rc.1.sb3 \
  --project-root tutorial-story \
  --source-manifest tutorial-story/project.source.json \
  --control-profile production \
  --channel bundled \
  --max-source-bytes 65536 \
  --max-asset-file-bytes 8388608 \
  --max-asset-files 32 \
  --max-total-asset-bytes 16777216 \
  --replace-existing
```

<!-- screenshot:C-02 -->

![ターミナルでDSL 4.0のローカルプレビューを起動しているところ](../images/tutorials/dsl4/create/tutorial-create-02-project-open.png)

_ターミナルで`preview-dsl4 --watch`を実行します。画像は公開CLIの引数と出力を固定したfixtureです。_

ブラウザーが自動で開き、「DSL 4.0 local preview」と、`story.kamishibai.yaml`を監視していることが
表示されます。ターミナルはプレビューを使っている間、そのまま開いておきます。

<!-- screenshot:C-03 -->

![story.kamishibai.yamlの検証成功と監視中の状態を表示したローカルプレビュー](../images/tutorials/dsl4/create/tutorial-create-03-directory-picker.png)

_自動で開いたローカルプレビューで、台本が`VALID`で監視中であることを確認します。画像は説明用fixtureです。_

作品のタイトル画面と、台本の状態が`VALID`であることを確認します。終了するときはターミナルで
`Ctrl-C`を押します。

<!-- screenshot:C-04 -->

![スターターを開き、最初のセリフとWatching表示を示したローカルプレビュー](../images/tutorials/dsl4/create/tutorial-create-04-first-preview.png)

_作品の最初の画面と、変更を待つ`Watching`状態を確認します。画像は公開starterと固定実装から作成したfixtureです。_

## 4. セリフを変更する

`story.kamishibai.yaml`をエディターで開きます。最初に編集する内容は次の形です。

```yaml
kamishibai: '4.0'

assets:
  Beach:
    kind: backdrop
    file: beach.svg
  TurtleIdle:
    kind: costume
    target: Turtle
    file: turtle.svg

actors:
  Turtle: TurtleIdle

scenes:
  opening:
    - stage: Beach
    - Turtle.say:
        text: 助けて！
        seconds: 2
```

`text`の右側だけを次のように変更し、保存します。行の先頭にある空白と、`text`や`seconds`の位置は
変えません。

```yaml
- Turtle.say:
    text: こんにちは！
    seconds: 2
```

validな変更はプレビューへ自動で反映されます。更新状態ボタンから、今回の再開位置と次回以降の
再開方針を確認することもできます。

<!-- screenshot:C-05 -->

![更新状態からストーリーの先頭を再開位置として選ぶダイアログ](../images/tutorials/dsl4/create/tutorial-create-05a-reload-position.png)

_更新状態ボタンを開いた場合は、今回の再開位置を選べます。画像はrelease fixtureの2段階契約を日本語で再現しています。_

![選んだ再開位置を今回だけ使って更新するダイアログ](../images/tutorials/dsl4/create/tutorial-create-05b-reload-scope.png)

_次の画面では、選んだ再開位置を今回だけ使うか、次回以降も使うかを選べます。_

変更したセリフが「こんにちは！」になったことを確認します。ここまでできれば、最初の編集は成功です。

<!-- screenshot:C-06 -->

![変更後の「こんにちは！」というセリフを表示したローカルプレビュー](../images/tutorials/dsl4/create/tutorial-create-06-updated-dialogue.png)

_台本で変更したセリフがプレビューへ反映されたことを確認します。画像は公開starterを再現したfixtureです。_

## 5. 背景、登場人物、場面を追加する

次は、`addition-kit`の追加素材を使います。一度に一種類ずつ追加します。

1. `addition-kit/new-beach.svg`と`addition-kit/friend.svg`を`tutorial-story`直下へコピーする
2. `addition-kit/add-background-and-actor.yml.txt`を開き、`assets`、`actors`、`scenes`を同じ形にする
3. `story.kamishibai.yaml`を保存する

追加後の主要部分は次の形です。

```yaml
assets:
  Beach:
    kind: backdrop
    file: beach.svg
  TurtleIdle:
    kind: costume
    target: Turtle
    file: turtle.svg
  NewBeach:
    kind: backdrop
    file: new-beach.svg
  FriendIdle:
    kind: costume
    target: Friend
    file: friend.svg
```

```yaml
actors:
  Turtle: TurtleIdle
  Friend: FriendIdle
```

```yaml
scenes:
  opening:
    - stage: Beach
    - Turtle.show:
        skin: TurtleIdle
        x: 0
        y: -70
        scale: 45
    - Turtle.say:
        text: こんにちは！
        seconds: 2
  meeting:
    - stage: NewBeach
    - Friend.show:
        skin: FriendIdle
        x: 80
        y: -55
        scale: 38
    - Friend.say:
        text: こんにちは、カメさん！
        seconds: 2
```

<!-- screenshot:C-07 -->

![new-beach.svgとfriend.svgを作品フォルダー直下へ追加したファイルツリー](../images/tutorials/dsl4/create/tutorial-create-07-added-files.png)

_追加素材の背景と登場人物の画像を作品フォルダー直下へコピーします。画像は公開starterの配置を再現したfixtureです。_

更新状態に、追加した背景と登場人物が反映されたことを確認します。

<!-- screenshot:C-08 -->

![新しい背景と登場人物を確認して先頭からの更新を選ぶダイアログ](../images/tutorials/dsl4/create/tutorial-create-08-asset-reload-dialog.png)

_追加した`NewBeach`と`FriendIdle`を確認し、先頭から更新します。画像はasset差分契約を再現したfixtureです。_

先頭から再開し、新しい背景、登場人物、場面が表示されることを確認します。表示されない場合は、
ファイル名と台本の`file`が同じか確認します。

<!-- screenshot:C-09 -->

![追加した背景の前に新しい登場人物とセリフが表示されたローカルプレビュー](../images/tutorials/dsl4/create/tutorial-create-09-backdrop-actor.png)

_新しい背景、登場人物、`meeting`場面が表示されたことを確認します。画像は公開addition kitを再現したfixtureです。_

## 6. ポーズ場面を追加する

スターターに同梱された`rescue-pose`を使う場面を追加します。このモデルには`help`というポーズが
登録済みです。`addition-kit/add-pose-scene.yml.txt`を開き、`assets`、`actors`、`scenes`を見本と
同じ形にして保存します。追加するアセットと場面は次の部分です。

```yaml
assets:
  Beach:
    kind: backdrop
    file: beach.svg
  TurtleIdle:
    kind: costume
    target: Turtle
    file: turtle.svg
  NewBeach:
    kind: backdrop
    file: new-beach.svg
  FriendIdle:
    kind: costume
    target: Friend
    file: friend.svg
  RescuePose:
    kind: poseModel
    file: rescue-pose
    loading: lazy
  RescueSound:
    kind: sound
    file: opening.mp3
```

```yaml
scenes:
  opening:
    - stage: Beach
    - Turtle.show:
        skin: TurtleIdle
        x: 0
        y: -70
        scale: 45
    - Turtle.say:
        text: こんにちは！
        seconds: 2
  meeting:
    - stage: NewBeach
    - Friend.show:
        skin: FriendIdle
        x: 80
        y: -55
        scale: 38
    - Friend.say:
        text: こんにちは、カメさん！
        seconds: 2
  rescue:
    poseModel: RescuePose
    actions:
      - stage: Beach
      - Turtle.pose:
          steps:
            - pose: help
              skin: TurtleIdle
              sound: RescueSound
      - Turtle.say:
          text: 助けてくれて、ありがとう！
          seconds: 2
```

このチュートリアルでは、ポーズモデルそのものは作りません。プレビューを先頭から更新し、カメラを
許可します。見本のポーズ、カメラ映像、進み具合が表示され、ポーズを保つと次へ進むことを確認します。

<!-- screenshot:C-10 -->

![合成人物のポーズ認識中にカメラ操作と更新状態が重ならず表示されたローカルプレビュー](../images/tutorials/dsl4/create/tutorial-create-10-pose-preview-controls.png)

_カメラ操作を右上、更新状態を上中央へ分けた固定layoutを確認します。人物は合成fixtureです。_

## 7. 診断を読んで修正する

`addition-kit/intentional-diagnostic.kamishibai.yaml.txt`を複製し、作業用ファイル名を
`intentional-diagnostic.kamishibai.yaml`にします。次の命令で、わざと含めてある`Turtle.sya`の
間違いを検査します。

```bash
pnpm exec tmpose-kamishibai validate-dsl4 \
  --input tutorial-story/intentional-diagnostic.kamishibai.yaml \
  --max-source-bytes 262144 \
  --format pretty
```

表示されたファイル名、行、説明を確認します。

<!-- screenshot:C-11 -->

![intentional-diagnostic.kamishibai.yamlのファイル名、行、Turtle.syaの未知命令、修正方法を示した診断画面](../images/tutorials/dsl4/create/tutorial-create-11-diagnostic.png)

_診断のファイル名、行、コード、説明から台本を直します。画像は固定診断契約を再現したfixtureです。_

作業用ファイルの`Turtle.sya`を`Turtle.say`へ直し、同じ命令をもう一度実行します。エラーがなくなれば
診断修正の練習は完了です。以後のプレビューとビルドでは`story.kamishibai.yaml`を使います。

## 8. 検査してSB3を作る

まず、編集した台本を検査します。

```bash
pnpm exec tmpose-kamishibai validate-dsl4 \
  --input tutorial-story/story.kamishibai.yaml \
  --max-source-bytes 262144 \
  --format pretty
```

エラーがないことを確認してから、完成したSB3を作ります。プレビューが動いている場合は`Ctrl-C`で
終了してから実行します。

```bash
pnpm exec tmpose-kamishibai build-dsl4 \
  --base kamishibai-4.0.0-rc.1.sb3 \
  --project-root tutorial-story \
  --source-manifest tutorial-story/project.source.json \
  --output tutorial-story-built.sb3 \
  --control-profile production \
  --channel bundled \
  --max-source-bytes 262144 \
  --max-asset-file-bytes 8388608 \
  --max-asset-files 32 \
  --max-total-asset-bytes 16777216 \
  --replace-existing
```

作業フォルダーに`tutorial-story-built.sb3`が作られたことを確認します。エラーが出た場合は、表示された
ファイル名と行を直してから、検査とビルドをもう一度実行します。

## 9. 完成したSB3を再生する

完成した`tutorial-story-built.sb3`をTurboWarpまたは対応するScratch環境で開き、緑の旗を押します。

<!-- screenshot:C-12 -->

![tutorial-story-built.sb3をTurboWarpで開き、緑の旗を押す位置を示した画面](../images/tutorials/dsl4/create/tutorial-create-12-built-sb3.png)

_完成したSB3をTurboWarpで開き、緑の旗から再生します。画像は操作位置を示すfixtureです。_

タイトルから開始し、「遊ぶ」と同じ順序で最後まで再生します。変更したセリフ、新しい背景、登場人物、
ポーズ場面がすべて表示されれば完成です。

## 完了チェック

- [ ] `4.0.0-rc.1`のスターター、ベースSB3、実行環境を用意した
- [ ] ローカルプレビューでスターターを開いた
- [ ] セリフを一行変更し、プレビューへ反映した
- [ ] 新しい背景、登場人物、場面を追加した
- [ ] 同梱されたポーズを使う場面を確認した
- [ ] エラーが示した行から間違いを修正した
- [ ] 台本を検査し、SB3を作った
- [ ] 完成したSB3を最後まで再生した
- [ ] Scratchブロックを追加しなかった

## このチュートリアルと台本作成ガイドの違い

ここで扱うのは、最初の作品を完成させるための一つの学習経路だけです。できあがるのは、変更した台本と
素材をまとめたSB3です。作者ガイドを最初から読み直す必要はありません。

すべての命令、複数の台本を組み合わせる方法、分岐、独自の命令など、作品を発展させるときに必要な内容は
[紙芝居DSL 4.0 台本作成ガイド](../dsl-author-guides/dsl-4.0-author-guide.md)または
[DSL 4.0 Schemaリファレンス](../dsl-author-guides/dsl-4.0-schema-reference.md)で調べます。

DSL 3.1／3.2のTXT／SB3操作や変換は扱いません。移行が必要な場合は、別の変換ガイドを使います。

## 初版で扱わないこと

- Teachable Machineでのポーズモデル作成
- DSL 3.1／3.2台本の変換
- 複雑な分岐と独自の命令
- Web公開やGitHub Pagesへの公開
- 紙芝居アプリ本体や機能拡張の開発

## 次に読む

- [紙芝居DSL 4.0 台本作成ガイド](../dsl-author-guides/dsl-4.0-author-guide.md)
- [DSL 4.0 Schemaリファレンス](../dsl-author-guides/dsl-4.0-schema-reference.md)
- DSL 3.1／3.2からの移行は[変換ガイド](../dsl-author-guides/dsl-3.2-to-4.0-conversion-guide.md)を使う
