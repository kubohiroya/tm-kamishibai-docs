# 紙芝居DSL 4.0 台本作成ガイド

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

対象: 台本作者、教材作成者、授業設計者、DSL 3.2からの移行を検討する開発者\
対象仕様: `kamishibai: '4.0'`\
文書状態: DSL 4.0の実装基準に基づく先行ガイド\
調査基準: tmpose-kamishibai `371f2fb`、2026年8月6日

> **重要:** DSL 4.0は開発中です。現行の公開アプリtmpose-kamishibai 3.2.xへ、
> この文書のYAML台本を読み込ませることはできません。実際に作品を制作・上映する場合は、
> 既存の[紙芝居DSLファイル作成マニュアル](dsl-manual.md)と
> [紙芝居DSL コマンドリファレンス](command-reference.md)を使用してください。

このガイド本文は上記の`371f2fb`時点を調査基準としています。移行候補で使うfield、型、必須性、
既定値、action引数を確認するときは、より新しい固定Schemaから生成した
[紙芝居DSL 4.0 Schemaリファレンス](dsl-4.0-schema-reference.md)を併用してください。Schemaリファレンスも
実装のリリースを意味せず、4.0用YAMLへ上映環境を切り替える判断には使用できません。

この文書は、確定済みのDSL 4.0表層仕様を、台本作者が読める形で説明します。既存の3.1／3.2向け文書を
置き換えるものではありません。4.0のアプリ統合と配布ツールが完成するまでは、仕様の確認、台本設計、
試作、レビューに使用してください。

仕様の正本は、tmpose-kamishibaiリポジトリの
[紙芝居DSL 4.0 表層仕様](https://github.com/kubohiroya/tmpose-kamishibai/blob/371f2fb6595735dcaba72d55b871ea6ba63d6078/docs/design/dsl-4-surface.md)と
[JSON Schema](https://github.com/kubohiroya/tmpose-kamishibai/blob/371f2fb6595735dcaba72d55b871ea6ba63d6078/schema/dsl-4.schema.json)です。
このガイドと正本が異なる場合は、正本を優先します。

## DSL 4.0で変わること

DSL 4.0では、1行を`=`、`:`、`,`で分割する3.2までの独自形式から、YAML 1.2へ移行します。
引数には名前が付き、背景、位置、時間などの意味を台本から読み取りやすくなります。

```text
# DSL 3.2
action=Hero:show:HeroHappy:0,-60,30
```

```yaml
# DSL 4.0
- Hero.show:
    skin: HeroHappy
    x: 0
    y: -60
    scale: 30
```

主な違いは次のとおりです。

| 項目         | DSL 3.2                       | DSL 4.0                                             |
| ------------ | ----------------------------- | --------------------------------------------------- |
| ファイル形式 | 独自の行形式                  | 制限付きYAML 1.2                                    |
| 推奨拡張子   | `.txt`                        | `.kamishibai.yaml`                                  |
| バージョン   | `kamishibai=3.2`              | `kamishibai: '4.0'`                                 |
| シーン       | `---`と`sceneLabel`           | `scenes`内の名前付きmapping                         |
| アクション   | `action=対象:命令:値`         | 1キーだけを持つYAML mapping                         |
| 複数引数     | 順番で意味を決定              | `x`、`y`、`seconds`などの名前付き引数               |
| ポーズモデル | シーン内の`TMPoseURL`         | `poseModel`アセットをシーンから参照                 |
| テキスト     | SVG Textと旧Text Asset        | `textStyles`と`Actor.setText`。旧Text Assetは対象外 |
| 外部アセット | 実行時にHTTP(S) URLを取得可能 | 基準仕様ではproject内の相対fileを成果物へ埋め込む   |
| 診断         | `K32-*`                       | Source Map付きの`K4-*`                              |

3.2台本と4.0台本は別の構文です。一つのファイルへ混在させたり、先頭のバージョンだけを
`4.0`へ書き換えたりしないでください。

## 現在の利用範囲

2026年8月6日の調査基準では、次の実装がtmpose-kamishibaiの`main`へ入っています。

- 制限付きYAMLの解析、JSON Schema検証、参照関係の意味検証
- 行・列とStory Pathを保持するSource Map、`K4-*`診断
- 検証後の台本をimmutableな`StoryDocument`へ正規化するsource frontend
- action実行、分岐、シーン遷移、停止を扱うpure runtime controller
- control profileの解決、キー入力adapter、時系列history reducer、runtime navigation control

一方、公開アプリで4.0作品を開いて上映するために必要なbuilder、TurboWarpとの実動作接続、
アプリUI、配布artifact、既定OFFの機能フラグを含むend-to-end統合は完了していません。
このため、この文書では構文を「使用できる」と断定せず、「4.0の実装基準として受理する」という意味で
説明します。

## 最小台本

ファイルをUTF-8で保存し、拡張子を`.kamishibai.yaml`にします。

```yaml
kamishibai: '4.0'

assets:
  Beach: backdrop
  HeroIdle: costume:Hero

actors:
  Hero: HeroIdle

scenes:
  opening:
    - stage: Beach
    - Hero.say:
        text: こんにちは！
        seconds: 2
    - wait: 1
```

この台本は、次の内容を表します。

1. `Beach`をプロジェクト内の背景として登録する
2. `HeroIdle`を`Hero`用のコスチュームとして登録する
3. `Hero`アクターの初期コスチュームを`HeroIdle`にする
4. 最初の`opening`シーンで背景を変更する
5. `Hero`が2秒間話し、1秒待つ

`kamishibai`と`scenes`だけがトップレベルの必須項目です。`scenes`には一つ以上のシーンが必要です。
通常実行は、`scenes`へ最初に書いたシーンから始まり、明示的な遷移がなければ記述順に次のシーンへ
進みます。

## ファイル全体の構造

トップレベルで使用できるキーは次のものだけです。表にないキーは警告ではなくエラーになります。

| キー              | 必須 | 役割                                           |
| ----------------- | ---- | ---------------------------------------------- |
| `kamishibai`      | 必須 | 文字列`'4.0'`を指定する                        |
| `assets`          | 任意 | 背景、コスチューム、音、ポーズモデルを登録する |
| `actors`          | 任意 | アクターと初期コスチュームを対応付ける         |
| `cover`           | 任意 | 表紙の背景とBGMを指定する                      |
| `textStyles`      | 任意 | SVG Textの名前付きスタイルを定義する           |
| `variables`       | 任意 | 物語で使う変数の初期値を定義する               |
| `loading`         | 任意 | 読み込み中の背景とコスチューム列を指定する     |
| `poseRecognition` | 任意 | ポーズ認識中と認識成立時の音を指定する         |
| `controls`        | 任意 | 実行環境ごとの操作キーを定義する               |
| `branches`        | 任意 | 順序付きの条件分岐を登録する                   |
| `scenes`          | 必須 | 一つ以上のシーンとアクションを記述する         |

推奨する並び順は表の順番です。YAML mappingの字下げには空白を使用し、タブは使いません。

## YAMLを書くときの規則

### バージョンは文字列で書く

```yaml
kamishibai: '4.0'
```

引用符のない`4.0`はYAMLの数値として解釈されるため、DSL 4.0として受理されません。

### アクションはlistとして並べる

各アクションは`-`で始め、一つのアクションmappingにはキーを一つだけ書きます。

```yaml
scenes:
  opening:
    - stage: Beach
    - wait: 1
```

次のように二つの命令を一つの項目へまとめることはできません。

```yaml
# エラー
- stage: Beach
  wait: 1
```

### 単一引数だけ短く書ける

意味が一つに決まるアクションにはscalarの短形式があります。

```yaml
- stage: Beach
- bgm: OpeningSound
- wait: 1
- goto: ending
- Hero.setSkin: HeroHappy
```

位置と時間のように意味の異なる値が複数ある場合は、名前付きmappingを使用します。

```yaml
- Hero.moveTo:
    x: 40
    y: -57
    seconds: 1.5
```

`[40, -57, 1.5]`のような位置引数listは受理されません。

### 長い文字列はblock scalarで書ける

```yaml
- Caption.setText:
    text: |-
      海へ出発！
      1か2を押してください
    style: title
```

`|-`の次の行から字下げした範囲が文字列になります。

### YAMLの一部機能は使用できない

DSL 4.0では、安全で決定的に解析するため、次の機能を禁止します。

- duplicate key
- anchorとalias
- merge key
- custom tag
- 一つのファイル内の複数YAML文書

コメントには`#`を使用できます。色の`#112233`、条件式、記号を含む文字列など、YAMLの解釈が
紛らわしい値は引用符で囲んでください。

## 名前の規則

アセット、アクター、スタイル、変数、分岐、シーン、`stableId`の識別子には、Unicodeの文字、数字、
`_`、`-`を使用できます。先頭は文字または`_`にします。

```yaml
assets:
  Beach_1: backdrop
  主人公-通常: costume:主人公
```

次の名前は使用できません。

```yaml
# 先頭が数字
1stScene: []

# 空白を含む
opening scene: []

# actor actionの区切りとして予約された`.`を含む
main.hero: []
```

日本語名はUnicode NFCで保存します。大文字と小文字は別の識別子として扱われます。

## アセットを登録する

### 短形式

すでにSB3へ埋め込まれているアセットを、アセットIDと同じ名前で参照する場合に使用します。

```yaml
assets:
  Beach: backdrop
  HeroIdle: costume:Hero
  OpeningSound: sound
```

| 書式              | 意味                           |
| ----------------- | ------------------------------ |
| `backdrop`        | ステージの同名背景             |
| `costume:ActorID` | 指定アクターの同名コスチューム |
| `sound`           | ステージの同名音               |

### 名前付き形式

埋め込み済みアセットの実名がアセットIDと異なる場合は`name`を使います。builder入力のローカルfileを
使用する場合は`file`を使います。`name`と`file`はどちらか一方だけを指定します。

```yaml
assets:
  Ocean:
    kind: backdrop
    file: assets/ocean.svg
    loading: lazy

  HeroHappy:
    kind: costume
    target: Hero
    name: happy

  OpeningSound:
    kind: sound
    name: Opening Theme
    loading: eager

  救助Pose:
    kind: poseModel
    file: pose-models/rescue
    loading: lazy
```

`kind`に指定できる値は`backdrop`、`costume`、`sound`、`poseModel`です。`costume`には`target`が
必須です。`poseModel`には`file`が必須で、`name`は使用できません。

`file`はproject rootを基準にした安全なPOSIX相対pathです。次の値は使用できません。

- `/assets/ocean.svg`のような絶対path
- `C:\assets\ocean.svg`のようなWindows絶対pathやバックスラッシュ
- `./assets/ocean.svg`、`../assets/ocean.svg`のような`.`または`..` segment
- `https://example.com/ocean.svg`のようなURI

基準仕様では、builderがfileのbyte列を成果物へ埋め込み、実行環境からのネットワーク取得を不要にします。
現行の3.2台本で外部URLを使っている場合は、そのURLをそのまま4.0へ移さず、アセットをproject内へ
配置する必要があります。

### eagerとlazy

名前付きアセットには`loading: eager`または`loading: lazy`を指定できます。省略時と短形式は
`eager`です。

- `eager`: 実行開始時に準備する
- `lazy`: 必要なシーンへの遷移が決まってから先読みし、シーン開始までに準備する

`lazy`でもアセット自体は配布成果物へ埋め込みます。scene開始時に準備が終わっていない場合は
Loading表示で待ち、準備に失敗した場合はそのsceneのアクションを開始せず診断を表示する設計です。

## アクターを登録する

`actors`では、アクターIDと初期コスチュームを対応付けます。

```yaml
assets:
  HeroIdle: costume:Hero
  HeroHappy: costume:Hero
  TurtleIdle: costume:Turtle

actors:
  Hero: HeroIdle
  Turtle: TurtleIdle
```

初期コスチュームは`costume`アセットであり、その`target`がアクターIDと一致している必要があります。
アクションでは`Hero.show`、`Turtle.say`のように、アクターIDと命令を`.`でつなぎます。

## 表紙、Loading、ポーズ認識音を設定する

### 表紙

```yaml
cover:
  backdrop: Beach
  bgm: OpeningSound
```

`backdrop`は必須で、背景アセットを指定します。`bgm`は任意で、音アセットを指定します。

### Loading表示

```yaml
assets:
  LoadingBackground: backdrop
  Loading1: costume:Loading
  Loading2: costume:Loading

loading:
  backdrop: LoadingBackground
  costumes: [Loading1, Loading2]
```

`loading`を記述する場合は、背景と一つ以上のコスチュームが必要です。`costumes`は同じ意味の値の集合なので
YAML listで指定します。

### ポーズ認識音

```yaml
poseRecognition:
  idleSound: ClockTicking
  chargeSound: Success
```

`poseRecognition`を記述する場合は、認識待機中の`idleSound`と、認識成立時の`chargeSound`を
どちらも指定します。参照先は音アセットでなければなりません。

## SVG Textを設定する

DSL 4.0の標準テキスト表現はSVG Textです。最初に`textStyles`で名前付きスタイルを定義します。

```yaml
textStyles:
  title:
    background: '#112233'
    color: '#ffffff'
    font: Noto Sans JP
    size: 150
    align: center
    direction: up
```

| 項目         | 値                            |
| ------------ | ----------------------------- |
| `background` | 背景色を表す文字列            |
| `color`      | 文字色を表す文字列            |
| `font`       | 空でないフォント名            |
| `size`       | 0より大きい数値               |
| `align`      | `left`、`center`、`right`     |
| `direction`  | `up`、`down`、`left`、`right` |

アクター自身へテキストを表示するときは`setText`を使います。

```yaml
- Caption.setText:
    text: おしまい
    style: title
```

`asset=NAME,text`、`text=`、`textStyle=`、`action=text:...`に相当する旧Text Asset構文は、
4.0 core schemaにありません。3.2では互換機能として動作しますが、4.0へは持ち込まないでください。

## 変数と条件分岐を設定する

### 変数

```yaml
variables:
  score: 1
  takeSeaRoute: false
  playerName: ななし
```

初期値に使用できる型はstring、number、booleanだけです。list、mapping、`null`、式を初期値には
使用できません。実行中に値を変更する処理はruntimeまたは登録済みactionが担当し、宣言時の型と異なる値へ
暗黙変換しません。

### 分岐

分岐は上から順に条件を評価し、最初に真になった移動先を選びます。最後の規則は必ず`else`にします。

```yaml
branches:
  rescueResult:
    - if: 'score == 1'
      goto: seaRoute
    - if: takeSeaRoute
      goto: seaRoute
    - else: ending
```

条件式は文字列として記述します。`if`と`goto`は同じmappingへ書き、`else`は分岐内に一つだけ、末尾へ
置きます。すべての移動先シーンが定義済みでなければなりません。

シーンから分岐を実行します。

```yaml
- branch: rescueResult
```

条件式の評価器と利用できる演算の最終的な製品契約は、4.0の実動作統合で確定します。3.2の式がそのまま
すべて利用できるとは仮定しないでください。

## 操作キーを設定する

`controls`では、development用とproduction用など、実行環境ごとに完全なkeymapを定義できます。

```yaml
controls:
  keymaps:
    development:
      Space: navigation.nextAction
      ArrowLeft: history.previousAction
      ArrowUp: history.previousScene
      ArrowDown: history.nextScene
    production:
      Space: navigation.nextAction
```

builderは`controlProfile`を明示的に一つ選び、選択されたprofileのkeymapだけを有効にする設計です。
profile間の継承、merge、fallbackはありません。

使用できるnavigation commandは次の4つです。

| command                  | 動作                                 |
| ------------------------ | ------------------------------------ |
| `navigation.nextAction`  | 通常実行として次のアクションへ進む   |
| `history.previousAction` | 実行履歴上の前のアクションへ移動する |
| `history.previousScene`  | 前に訪問したシーンの先頭へ移動する   |
| `history.nextScene`      | 次に訪問したシーンの先頭へ移動する   |

キー名には`KeyboardEvent.code`を使用します。`Space`、`Enter`、方向キー、`Digit0`〜`Digit9`、
`KeyA`〜`KeyZ`、`Numpad0`〜`Numpad9`、`F1`〜`F12`などがschemaで列挙されています。
`Shift+Space`のようなmodifierとの組み合わせは使用できません。

選択profileに`history.*`が一つでもある場合だけ、時系列historyを有効にします。history移動で実行位置は
変わりますが、物語の変数や表示状態を完全に巻き戻す機能ではありません。同じ物理キーを`controls`と
作品内の`keyInputToChangeScene`へ重ねて割り当てないでください。

## シーンを書く

### 短形式

シーン固有の設定が不要なら、アクション列を直接書きます。

```yaml
scenes:
  opening:
    - stage: Beach
    - wait: 1
```

### 長形式

ポーズモデルなどのシーン固有設定がある場合は、`actions`を持つmappingにします。

```yaml
scenes:
  rescue:
    poseModel: 救助Pose
    actions:
      - stage: Ocean
      - Hero.pose:
          choices:
            - pose: help
              skin: HeroHelp
              sound: Success
```

長形式では`actions`が必須です。`poseModel`とアクションを同じ階層へ混在させず、アクションは必ず
`actions`のlistへ入れます。短形式と長形式は、検証後に同じ内部の`SceneNode`へ正規化されます。

## Global action

Global actionはアクター名を付けずに記述します。

| action                    | 短形式または主な引数          | 役割                       |
| ------------------------- | ----------------------------- | -------------------------- |
| `stage`                   | 背景ID                        | 背景を変更する             |
| `bgm`                     | 音ID                          | BGMの再生を依頼する        |
| `sound`                   | 音ID                          | 効果音の再生を依頼する     |
| `wait`                    | 0以上の秒数                   | 指定時間待つ               |
| `transition`              | `effect`、`seconds`           | 見た目の遷移効果を実行する |
| `goto`                    | シーンID                      | 指定シーンへ移動する       |
| `branch`                  | 分岐ID                        | 条件分岐を評価して移動する |
| `keyInputToChangeScene`   | キーからシーンへのmapping     | キー入力を待って移動する   |
| `touchInputToChangeScene` | アクターからシーンへのmapping | タッチ入力を待って移動する |

### 背景、音、待機

```yaml
- stage: Beach
- bgm: OpeningSound
- sound: Success
- wait: 1.5
```

`wait`は0以上です。背景と音のIDは、使用箇所に合う`kind`のアセットを参照します。

### 画面効果

```yaml
- transition:
    effect: fadeOut
    seconds: 0.5
```

`transition`は見た目の効果だけを実行し、シーンを移動しません。移動が必要なら、次に`goto`または
`branch`を書きます。`effect`は識別子であり、実際に利用できる効果名はTurboWarp接続側の実装契約で
確定します。

### シーン移動

```yaml
- goto: ending
- branch: rescueResult
```

参照するシーンまたは分岐は、同じ台本内で定義済みでなければなりません。

### キー入力による移動

```yaml
- keyInputToChangeScene:
    Digit1: rescue
    Digit2: ending
```

`stableId`を付ける場合は、経路を`routes`の下へ移します。

```yaml
- keyInputToChangeScene:
    stableId: routeSelection
    routes:
      Digit1: rescue
      Digit2: ending
```

### タッチ入力による移動

```yaml
- touchInputToChangeScene:
    Hero: rescue
    Caption: ending
```

左側には登録済みアクター、右側には登録済みシーンを指定します。

## Actor action

Actor actionは`ActorID.command`をキーにします。

| action          | 必須引数                  | 役割                                         |
| --------------- | ------------------------- | -------------------------------------------- |
| `Actor.show`    | `skin`、`x`、`y`、`scale` | コスチューム、位置、倍率を指定して表示する   |
| `Actor.moveTo`  | `x`、`y`、`seconds`       | 指定位置へ移動する                           |
| `Actor.say`     | `text`、`seconds`         | 指定時間セリフを表示する                     |
| `Actor.setSkin` | コスチュームID            | コスチュームを変更する                       |
| `Actor.setText` | `text`、`style`           | SVG Textを更新する                           |
| `Actor.pose`    | `choices`                 | ポーズ認識結果に応じてコスチュームと音を選ぶ |

### 表示する

```yaml
- Hero.show:
    skin: HeroHappy
    x: 0
    y: -60
    scale: 30
```

`scale`は0より大きい数値です。`skin`は、そのアクターを`target`とするコスチュームアセットを
指定します。

### 移動する

```yaml
- Hero.moveTo:
    x: 40
    y: -57
    seconds: 1.5
```

`seconds`は0以上です。

### セリフを表示する

```yaml
- Hero.say:
    text: 助けに行こう
    seconds: 2
```

### コスチュームを変える

```yaml
- Hero.setSkin: HeroHelp
```

`stableId`を付ける場合は名前付き形式を使用します。

```yaml
- Hero.setSkin:
    stableId: heroRescueSkin
    skin: HeroHelp
```

### SVG Textを更新する

```yaml
- Caption.setText:
    text: おしまい
    style: title
```

### ポーズを認識する

```yaml
- Hero.pose:
    choices:
      - pose: help
        skin: HeroHelp
        sound: Success
      - pose: jump
        skin: HeroHappy
        sound: Success
```

`choices`は一つ以上必要です。各項目は、認識する`pose`、認識後に表示する`skin`、再生する`sound`を
一組として持ちます。シーン側の長形式で`poseModel`も指定してください。

## stableIdを付ける

`stableId`は、台本のlive reloadで変更前後の同じアクションを特定するための任意IDです。通常の台本で
すべてのアクションへ付ける必要はありません。付ける場合は文書全体で一意にします。

```yaml
- wait:
    stableId: waitBeforeEnding
    seconds: 1
```

`stableId`は名前付きmappingにだけ指定できます。`wait: 1`のようなscalar短形式へ追加することは
できません。

## 総合サンプル

次の例は、アセット、表紙、SVG Text、変数、keymap、分岐、入力、ポーズ認識を一つの台本へまとめた
ものです。構文確認用であり、現行3.2.xアプリでは実行できません。

```yaml
kamishibai: '4.0'

assets:
  Beach: backdrop
  Ocean:
    kind: backdrop
    file: assets/ocean.svg
    loading: lazy
  HeroIdle: costume:Hero
  HeroHappy: costume:Hero
  HeroHelp: costume:Hero
  CaptionIdle: costume:Caption
  OpeningSound: sound
  ClockTicking: sound
  Success: sound
  救助Pose:
    kind: poseModel
    file: pose-models/rescue
    loading: lazy

actors:
  Hero: HeroIdle
  Caption: CaptionIdle

cover:
  backdrop: Beach
  bgm: OpeningSound

textStyles:
  title:
    background: '#112233'
    color: '#ffffff'
    font: Noto Sans JP
    size: 150
    align: center
    direction: up

variables:
  score: 1
  takeSeaRoute: false

poseRecognition:
  idleSound: ClockTicking
  chargeSound: Success

controls:
  keymaps:
    development:
      Space: navigation.nextAction
      ArrowLeft: history.previousAction
      ArrowUp: history.previousScene
      ArrowDown: history.nextScene
    production:
      Space: navigation.nextAction

branches:
  rescueResult:
    - if: 'score == 1'
      goto: seaRoute
    - if: takeSeaRoute
      goto: seaRoute
    - else: ending

scenes:
  opening:
    - stage: Beach
    - bgm: OpeningSound
    - Caption.setText:
        stableId: openingTitle
        text: |-
          海へ出発！
          1か2を押してください
        style: title
    - Hero.show:
        skin: HeroHappy
        x: 0
        y: -60
        scale: 30
    - Hero.say:
        text: 助けに行こう
        seconds: 2
    - keyInputToChangeScene:
        Digit1: rescue
        Digit2: ending

  rescue:
    poseModel: 救助Pose
    actions:
      - stage: Ocean
      - Hero.setSkin: HeroHelp
      - Hero.pose:
          choices:
            - pose: help
              skin: HeroHelp
              sound: Success
            - pose: jump
              skin: HeroHappy
              sound: Success
      - branch: rescueResult

  seaRoute:
    - Hero.moveTo:
        x: 40
        y: -57
        seconds: 1.5
    - Hero.say:
        text: 海路で帰ろう
        seconds: 2
    - transition:
        effect: fadeOut
        seconds: 0.5
    - goto: ending

  ending:
    - stage: Beach
    - Caption.setText:
        text: おしまい
        style: title
```

## DSL 3.2から移行するときの考え方

4.0は3.2の宣言だけを置き換えるminor updateではありません。元の3.2台本を残し、別の
`.kamishibai.yaml`を作成して、シーン単位で移してください。

### 基本構造の対応

```text
kamishibai=3.2
asset=Beach,backdrop
asset=HeroIdle,costume:Hero
actor=Hero,HeroIdle
---
sceneLabel=opening
action=stage:Beach
action=Hero:say:こんにちは:2
```

```yaml
kamishibai: '4.0'

assets:
  Beach: backdrop
  HeroIdle: costume:Hero

actors:
  Hero: HeroIdle

scenes:
  opening:
    - stage: Beach
    - Hero.say:
        text: こんにちは
        seconds: 2
```

### 移行時に個別判断が必要な機能

2026年8月6日の4.0 core schemaには、3.2のすべての命令が揃っているわけではありません。
特に次の機能は、同名の4.0 core actionとして受理されません。

- 旧Text Asset関連の`asset=...,text`、`text`、`textStyle`、`action=text`
- `hide`、`think`、`setScale`、`setPosition`、`setLayer`
- `loop`、`sequence`
- `*`を対象にする一括Actor action
- 外部HTTP(S) URLを実行時に読むアセット

これらを黙って削除したり、似たアクションへ意味を変えて置換したりしないでください。SVG Text、シーン構成、
ローカルアセット、将来のcustom actionなどで代替できるかを作品ごとに判断します。

### 推奨する移行手順

1. 元の3.2台本を変更せず保管する
2. アセット、アクター、シーン、分岐の一覧を作る
3. 外部URLのアセットをproject内へ配置する
4. 4.0の`assets`、`actors`、`scenes`を別ファイルへ作る
5. 旧Text Assetを`textStyles`と`Actor.setText`へ再設計する
6. core schemaにない3.2 actionを一覧化し、代替方法が決まるまで移行完了にしない
7. schema検証と参照検証を通し、将来のpreview環境で演出を確認する
8. 4.0の配布経路が完成するまで、上映用の3.2台本を維持する

## 診断と安全停止

DSL 4.0のsource frontendは、YAMLを読み込んだあと、構造と参照関係の検証が成功するまでアセット準備や
アクション実行を始めません。診断にはcode、severity、source ID、行・列、Story Pathが含まれます。

| code                          | 主な意味                                     |
| ----------------------------- | -------------------------------------------- |
| `K4-YAML-*`                   | YAML構文または禁止機能の使用                 |
| `K4-VERSION-001`              | `kamishibai`が文字列`'4.0'`ではない          |
| `K4-SCHEMA-001`               | 型、必須field、構造がschemaと一致しない      |
| `K4-SCHEMA-UNKNOWN-KEY`       | schemaにないキーを使用した                   |
| `K4-ID-INVALID` / `K4-ID-001` | 識別子の文字規則またはUnicode NFC違反        |
| `K4-REF-001`                  | 参照先が未定義                               |
| `K4-REF-002`                  | 参照先アセットの`kind`が用途と一致しない     |
| `K4-REF-003`                  | コスチュームの`target`がアクターと一致しない |
| `K4-ASSET-001`                | `file`が安全なローカル相対pathではない       |
| `K4-BRANCH-001`               | 分岐の末尾が`else`ではない                   |
| `K4-STABLE-ID-001`            | `stableId`が文書内で重複している             |
| `K4-KEY-UNSUPPORTED`          | 対応外のキーやmodifierを指定した             |
| `K4-KEY-001`                  | navigation keymapと作品内キー入力が衝突した  |

runtime接続後は、action、scene、branch、port、戻り値などの実行時エラーにも`K4-RUNTIME-*`診断を
使用します。入力byte数、YAML node数、nesting深度、scalar長、シーン数、アクション数、アセット数、
診断数には安全上の上限を設ける設計ですが、具体値は実装時のbenchmarkで決定します。

## 作成時のチェックリスト

- [ ] ファイルをUTF-8の`.kamishibai.yaml`として保存した
- [ ] 先頭が`kamishibai: '4.0'`になっている
- [ ] トップレベルとactionに未知のキーがない
- [ ] インデントに空白を使い、一つのaction itemへ命令を一つだけ書いた
- [ ] IDが文字または`_`で始まり、Unicode NFCになっている
- [ ] 背景、音、コスチューム、ポーズモデルの`kind`が参照箇所と一致している
- [ ] コスチュームの`target`が使用するアクターと一致している
- [ ] `file`がproject内の安全な相対pathになっている
- [ ] すべてのシーン、分岐、スタイル、アセット参照が定義済みである
- [ ] 各分岐の最後に一つだけ`else`がある
- [ ] `stableId`が文書全体で重複していない
- [ ] navigation用キーと作品内の遷移キーが衝突していない
- [ ] 3.2だけの構文やactionを混在させていない
- [ ] 4.0のend-to-end配布が未完成であることを関係者と共有した

## 関連資料

- [紙芝居DSL 4.0 Schemaリファレンス](dsl-4.0-schema-reference.md): 固定Schemaに基づくfield、型、制約、action一覧
- [紙芝居DSLファイル作成マニュアル](dsl-manual.md): 現行3.1／3.2作品の作成手順
- [紙芝居DSL コマンドリファレンス](command-reference.md): 現行3.1／3.2の詳細な命令一覧
- [紙芝居DSL 2.0から3.2への変更履歴](history.md): 現行DSL系列の移行履歴
- [DSL 4.0表層仕様](https://github.com/kubohiroya/tmpose-kamishibai/blob/371f2fb6595735dcaba72d55b871ea6ba63d6078/docs/design/dsl-4-surface.md): 4.0の規範的な作者向け構文
- [DSL 4.0 JSON Schema](https://github.com/kubohiroya/tmpose-kamishibai/blob/371f2fb6595735dcaba72d55b871ea6ba63d6078/schema/dsl-4.schema.json): 機械可読な構造仕様
- [DSL 4.0総合fixture](https://github.com/kubohiroya/tmpose-kamishibai/blob/371f2fb6595735dcaba72d55b871ea6ba63d6078/test/fixtures/dsl4/valid/comprehensive.kamishibai.yaml): schemaと意味検証を通る総合例
