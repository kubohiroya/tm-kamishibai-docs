# 紙芝居を作る

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

文書状態: DSL 4.0リリース前draft。スターター配布先と完成版の出力手順は未確定です。\
対象: 初めて紙芝居DSL 4.0を書く人\
対象仕様: `kamishibai: '4.0'`\
想定時間: 60〜90分

入口: [紙芝居チュートリアル](index.md)

> このページは公開前の準備版です。スターター（ひな形）の配布先とプレビューを開く方法は、正式公開時に更新します。

このチュートリアルでは、「紙芝居を遊ぶ」で使用した作品のひな形を少しずつ変更します。変更は
Webブラウザーで確かめ、最後に一つのSB3ファイルとして出力します。Scratchのブロックは追加しません。

## 最初のゴール

最初の目標は、スターターのセリフを一行だけ変え、プレビューで変更を確かめることです。背景、登場人物、
ポーズは、その成功を確認してから一つずつ追加します。ここではまだ編集せず、Step 1から順番に進めます。

## 用意するもの

- 配布されたチュートリアル用スターター
- 文字を編集できるエディター
- 新しいWebブラウザー
- プレビューで使うカメラと、全身を映せる少しの空間

Scratchのブロックは追加しません。最後に作品を検証して出力するときだけ、表示されたコマンドを
コピーして使います。

## 全体の流れ

| Step | やること                      | 画面で確かめること                 |
| ---: | ----------------------------- | ---------------------------------- |
|    1 | 完成作品を遊ぶ                | 物語の始まり、ポーズ、終わり       |
|    2 | スターターを開く              | 編集する台本ファイル               |
|    3 | Web Previewで作品を開く       | 変更を待っている状態               |
|    4 | セリフを一行変える            | 新しいセリフ                       |
|    5 | 背景、登場人物、場面を加える  | 新しい場面                         |
|    6 | 同梱されたポーズ場面を加える  | ポーズの案内と進み具合             |
|    7 | わざと一つ間違えてから直す    | エラーの場所と、修正後に消えること |
|    8 | 台本と素材を検証してSB3を作る | 完成したSB3                        |
|    9 | 完成したSB3を再生する         | 最後まで遊べること                 |

## 1. 完成作品を確認する

最初に[紙芝居を遊ぶ](play.md)を行い、作成する作品の開始、ポーズ認識、終了を確認します。完成状態を
先に知ることで、以後の変更が画面のどこへ反映されたか比較できます。

<!-- capture-note: 完成画面は「遊ぶ」の画像を再利用し、必要な場合だけC-13を取得する。 -->

<!-- screenshot:C-13 -->

## 2. スターターを開く

正式リリース後は、ここからチュートリアル用スターターをダウンロードします。ZIPファイルを展開し、
`tutorial-story`フォルダーを開きます。中には次のファイルがあります。

```text
tutorial-story/
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
    └── add-pose-scene.yml.txt
```

最初に編集するのは`story.kamishibai.yaml`です。`project.source.json`、画像、音声、
`rescue-pose`フォルダーはそのままにします。`addition-kit`はStep 5以降で使う追加素材と、同じ内容の
YAML見本です。

<!-- screenshot:C-01 -->

## 3. Web Previewで作品を開く

Web Previewを開き、「プロジェクトを開く」を押します。

<!-- screenshot:C-02 -->

ファイル選択画面では`story.kamishibai.yaml`ではなく、`tutorial-story`フォルダーそのものを選びます。

<!-- screenshot:C-03 -->

作品のタイトル画面が表示され、変更を待っていることを確認します。

<!-- screenshot:C-04 -->

エラーが表示された場合は、`tutorial-story`フォルダーを選んだか確認します。まだ台本は変更しません。

## 4. セリフを変更する

`story.kamishibai.yaml`をエディターで開きます。最初の台本は次の形です。`beach.svg`と`turtle.svg`は、
`file`で指定したローカル素材です。

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

Web Previewへ戻ると、更新状態ボタンに保存時刻が表示されます。そのボタンを押し、「先頭から」を選び、
次の画面で「今回だけ更新」を選びます。

<!-- screenshot:C-05 -->

変更したセリフが「こんにちは！」になったことを確認します。ここまでできれば、最初の編集は成功です。

<!-- screenshot:C-06 -->

## 5. 背景、登場人物、場面を追加する

次は、`addition-kit`の追加素材を使います。一度に一種類ずつ追加します。

1. `addition-kit/new-beach.svg`と`addition-kit/friend.svg`を`tutorial-story`直下へコピーする
2. `assets`全体を次の形にして、新しい背景と登場人物の画像を追加する

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

<!-- screenshot:C-07 -->

3. `actors`全体を次の形にして、新しい登場人物を追加する

```yaml
actors:
  Turtle: TurtleIdle
  Friend: FriendIdle
```

4. `scenes`全体を次の形にして、新しい場面とセリフを追加して保存する

```yaml
scenes:
  opening:
    - stage: Beach
    - Turtle.say:
        text: こんにちは！
        seconds: 2
  meeting:
    - stage: NewBeach
    - Friend.show:
        skin: FriendIdle
        x: 0
        y: -60
        scale: 30
    - Friend.say:
        text: こんにちは、カメさん！
        seconds: 2
```

同じ抜粋は`addition-kit/add-background-and-actor.yml.txt`でも確認できます。

Web Previewの更新案内で、追加した背景と登場人物の名前を確認します。

<!-- screenshot:C-08 -->

先頭から再開し、新しい背景、登場人物、場面が表示されることを確認します。表示されない場合は、
ファイル名と台本の`file`が同じか確認します。

<!-- screenshot:C-09 -->

## 6. ポーズ場面を追加する

スターターに同梱された`rescue-pose`を使う場面を追加します。このモデルには`help`というポーズが
登録済みです。まず、`assets`全体を次の形にして、モデルと成功音を追加します。

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

続いて、`scenes`全体を次の形にして、ポーズ場面を追加して保存します。

```yaml
scenes:
  opening:
    - stage: Beach
    - Turtle.say:
        text: こんにちは！
        seconds: 2
  meeting:
    - stage: NewBeach
    - Friend.show:
        skin: FriendIdle
        x: 0
        y: -60
        scale: 30
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
```

同じ抜粋は`addition-kit/add-pose-scene.yml.txt`でも確認できます。このチュートリアルでは、ポーズモデル
そのものは作りません。

Web Previewを先頭から更新し、カメラを許可します。見本のポーズ、カメラ映像、進み具合が表示され、
ポーズを保つと次の場面へ進むことを確認します。

<!-- screenshot:C-10 -->

## 7. 診断を読んで修正する

エラー表示の読み方も一度だけ練習します。作業中の台本で`- stage: Beach`を
`- stage: BeachTypo`へ変更して保存します。

Web Previewが示すファイル名、行、説明を確認します。

<!-- screenshot:C-11 -->

`BeachTypo`を`Beach`へ戻して保存します。エラーが消え、作品をもう一度更新できれば修正完了です。

## 8. 検証してSB3を作る

正式リリース時に、台本を検証するコマンドとSB3を作るコマンドを、コピーできる形でここへ掲載します。
最初に検証を実行し、「エラーなし」と表示されたことを確認してからSB3を作ります。

完了後、出力先に新しいSB3ファイルがあることを確認します。エラーが出た場合は、表示されたファイル名と
行を直してから、もう一度検証します。

## 9. 完成したSB3を再生する

完成したSB3をTurboWarpで開き、緑の旗を押します。

<!-- screenshot:C-12 -->

タイトルから開始し、「遊ぶ」と同じ順序で最後まで再生します。変更したセリフ、新しい背景、登場人物、
ポーズ場面がすべて表示されれば完成です。

## 完了チェック

- [ ] スターターで編集する台本ファイルを見つけた
- [ ] Web Previewで台本ファイルではなく作品フォルダーを選んだ
- [ ] セリフを一行変更し、プレビューへ反映した
- [ ] 新しい背景、登場人物、場面を追加した
- [ ] 同梱されたポーズを使う場面を確認した
- [ ] エラーが示した行から間違いを修正した
- [ ] 台本を検証し、SB3を作った
- [ ] 完成したSB3を最後まで再生した
- [ ] Scratchブロックを追加しなかった

## このチュートリアルと作者ガイドの違い

ここで扱うのは、最初の作品を完成させるための一つの学習経路だけです。成果物は、変更したYAMLから
作った検証済みの自己完結SB3です。作者ガイドを最初から読み直す必要はありません。

全action、Source Graph、分岐、custom actionなど、作品を発展させるときに必要な内容は
[紙芝居DSL 4.0 台本作成ガイド](../dsl-author-guides/dsl-4.0-author-guide.md)または
[DSL 4.0 Schemaリファレンス](../dsl-author-guides/dsl-4.0-schema-reference.md)で調べます。

DSL 3.1／3.2のTXT／SB3操作や変換は扱いません。移行が必要な場合は、別の変換ガイドを使います。
正式starter、sample、UI、commandが固定される前は、本文の例を配布物の正本とみなしません。

## 初版で扱わないこと

- Teachable Machineでのポーズモデル作成
- DSL 3.1／3.2台本の変換
- 複雑な分岐と独自action
- Web公開やGitHub Pagesへの公開
- 紙芝居アプリ本体や機能拡張の開発

## 次に読む

- [紙芝居DSL 4.0 台本作成ガイド](../dsl-author-guides/dsl-4.0-author-guide.md)
- [DSL 4.0 Schemaリファレンス準備 Issue #29](https://github.com/kubohiroya/tmpose-kamishibai-docs/issues/29)
- DSL 3.1／3.2からの移行、custom action、公開手順は、それぞれの正式ガイド完成後にリンクを追加する
