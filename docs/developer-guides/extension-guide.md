# TMPose紙芝居 機能拡張ガイド

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。引用図版には各出典の条件が適用されます。

<p class="extension-overview-kicker">全32ページ。15個の機能拡張を、1拡張につき2ページの見開きで図解する</p>

`kamishibai=3.1`台本を動かす現行アプリは、次の15機能拡張を利用します。
読む順番は実行時の読込順ではなく、**Gallery由来 → TurboWarp標準 → 外部埋め込み → アプリ内蔵**です。

<nav class="extension-index-grid" aria-label="機能拡張一覧">
<a href="#extension-consoles"><strong>Consoles</strong><code>sipcconsole</code><span>Gallery｜consoleへ実行記録</span></a>
<a href="#extension-temporary-variables"><strong>Temporary Variables</strong><code>lmsTempVars2</code><span>Gallery｜処理中の状態を共有</span></a>
<a href="#extension-text-operators"><strong>Text</strong><code>strings</code><span>Gallery｜台本文字列を解析</span></a>
<a href="#extension-local-storage"><strong>Local Storage</strong><code>localstorage</code><span>Gallery｜台本と設定を保存</span></a>
<a href="#extension-more-timers"><strong>More Timers</strong><code>lmsTimers</code><span>Gallery｜複数timerを計測</span></a>
<a href="#extension-files"><strong>Files</strong><code>files</code><span>Gallery｜TXT台本を選択</span></a>
<a href="#extension-animated-text"><strong>Animated Text</strong><code>text</code><span>Gallery｜文字を描画・演出</span></a>
<a href="#extension-translate"><strong>Translate</strong><code>translate</code><span>TurboWarp標準｜表示言語を取得</span></a>
<a href="#extension-asset-manager"><strong>Asset Manager</strong><code>kubohiroyaassetmanager</code><span>外部埋め込み｜assetとLoading</span></a>
<a href="#extension-tmpose"><strong>TMPose</strong><code>tmpose</code><span>外部埋め込み｜pose認識</span></a>
<a href="#extension-text-lines"><strong>Text Lines</strong><code>kubohiroyatextlines</code><span>外部埋め込み｜台本を行へ分割</span></a>
<a href="#extension-runtime-expression"><strong>Runtime Expression</strong><code>kubohiroyaruntimeexpression</code><span>外部埋め込み｜分岐条件を評価</span></a>
<a href="#extension-async-input"><strong>Async Input</strong><code>kubohiroyaasyncinput</code><span>外部埋め込み｜key・touch入力</span></a>
<a href="#extension-kamishibai-runtime"><strong>Kamishibai Runtime</strong><code>kubohiroyakamishibairuntime</code><span>アプリ内蔵｜台本を事前検査</span></a>
<a href="#extension-web-link"><strong>Web Link</strong><code>kubohiroyaweblink</code><span>アプリ内蔵｜公式URLを開く</span></a>
</nav>

<p class="extension-overview-note"><strong>2種類の数え方:</strong> このガイドは保守するソース単位で15個を説明します。一方、bundle版SB3では、そのうち7個を<code>kamishibaibundle</code>という1個のIDにまとめます。詳しくは次ページを参照してください。</p>

<p class="extension-source extension-overview-source">詳しい呼出し関係は<a href="internal-specification.md">内部仕様書</a>、更新手順は<a href="developer-guide.md">メンテナンスガイド</a>を参照してください。</p>

## 7拡張を1つのIDへまとめる {#extension-bundle .extension-sheet .extension-bundle-sheet}

<p class="extension-spread-label">2 / 32　sb3-toolchainのbundle</p>

<p class="extension-meta"><span>生成時の変換</span><code>kamishibaibundle</code><span>7 components → 1 ID</span></p>

このガイドで説明する15個は、更新・検査する**論理上の機能拡張**です。
sb3-toolchainでbundle版SB3を生成すると、外部埋め込み5個とアプリ内蔵2個だけを、**1個の複合機能拡張**へまとめます。

<div class="extension-bundle-visual"><div class="extension-bundle-members"><strong>保守する7個のソース</strong><span><code>kubohiroyaassetmanager</code> Asset Manager</span><span><code>tmpose</code> TMPose</span><span><code>kubohiroyatextlines</code> Text Lines</span><span><code>kubohiroyaruntimeexpression</code> Runtime Expression</span><span><code>kubohiroyaasyncinput</code> Async Input</span><span><code>kubohiroyakamishibairuntime</code> Kamishibai Runtime</span><span><code>kubohiroyaweblink</code> Web Link</span></div><div class="extension-bundle-arrow"><b>sb3-toolchain</b><span>build時だけ変換</span><strong>→</strong></div><div class="extension-bundle-result"><small>bundle版SB3で見えるID</small><strong>kamishibaibundle</strong><span>1 embedded data URL</span><span>1 register()</span><span>1 permission unit</span></div></div>

<div class="extension-count-compare"><section><small>このガイド／source</small><strong>15</strong><span>論理上の機能拡張</span></section><b>→</b><section><small>bundle版SB3</small><strong>9</strong><span>読込ID</span></section><p>Gallery由来7個 + Translate 1個 + <code>kamishibaibundle</code> 1個</p></div>

<div class="extension-columns"><section><p class="extension-subhead">sourceは展開したまま</p><ul><li>7拡張を個別に更新・検査</li><li>元のID、opcode、storageを保持</li><li><code>check</code>／<code>sync</code>も個別に実行</li></ul></section><section><p class="extension-subhead">生成物だけを集約</p><ul><li>opcodeとstorageをmember別にnamespace化</li><li>許可確認を1単位へまとめる</li><li>復元用capsuleにより展開可能</li></ul></section></div>

<p class="extension-note"><strong>重要:</strong> 15個の機能が9個へ減るわけではありません。実装を統合するのではなく、配布するSB3の読込・登録単位だけをまとめる仕組みです。Gallery由来7個とTurboWarp標準のTranslateはbundleの外に残ります。</p>

<p class="extension-source">出典: <a href="https://github.com/kubohiroya/sb3-toolchain/blob/2c82aaf02f605564f79efe8ff3bbd8f1a78d6fe9/docs/extension-bundles.md">sb3-toolchain: Extension bundles</a>、<a href="https://github.com/kubohiroya/tmpose-kamishibai/blob/b8de78adcc38e7caf6010ad660e49cb89e5ac763/app/embedded-extensions.json">Version 3.1.9 埋め込みmanifest</a></p>

## Consoles — 実行の足跡を残す {#extension-consoles .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">Gallery 1 / 7　機能編 1 / 2</p>

<p class="extension-meta"><span>Gallery</span><code>sipcconsole</code><span>開発支援</span></p>

ブラウザーの開発者ツールへ、台本解析、scene実行、errorを種類別に記録します。
利用者向け画面を増やさず、開発者だけが実行順を追える「舞台裏の記録係」です。

<figure class="extension-gallery-banner"><img src="../images/extension-gallery-consoles.svg" alt="TurboWarp Extension GalleryのConsolesバナー"><figcaption>TurboWarp Extension Galleryの公式バナー。consoleへ色分けして情報を送る拡張です。</figcaption></figure>

<figure class="extension-flow"><figcaption>紙芝居から開発者ツールまで</figcaption><div><span>command・scene</span><b>→</b><span>journal / error</span><b>→</b><span>browser console</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">見つけやすくする</p><ul><li>通常記録、warning、error、debug</li><li>処理groupと時間計測</li><li>開始時のconsole消去</li></ul></section><section><p class="extension-subhead">画面表示とは分離</p><ul><li>利用者向けerrorはSVG診断</li><li>consoleは開発者だけが確認</li><li>本番の演出を妨げない</li></ul></section></div>

<p class="extension-source">出典: <a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/images/-SIPC-/consoles.svg">Galleryバナー</a>、<a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/extensions/-SIPC-/consoles.js">配布ソース</a></p>

## Consoles — scene実行を追跡する {#extension-consoles-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">Gallery 1 / 7　使用例 2 / 2</p>

<figure class="extension-editor-example"><figcaption>TurboWarp Editor: Stage「exec scene # …」の代表部分</figcaption><div class="tw-editor"><div class="tw-editor-bar"><strong>Stage</strong><code>define exec scene # (index) with (transition)</code></div><div class="tw-script"><div class="tw-block tw-custom">定義 exec scene # <i>index</i> with <i>transition</i></div><div class="tw-block tw-extension">journal <i>scene開始 + index</i></div><div class="tw-block tw-control">もし <span class="tw-reporter">sceneが存在しない</span> なら</div><div class="tw-indent"><div class="tw-block tw-extension">error <i>scene not found</i></div></div><div class="tw-block tw-extension">journal <i>scene完了</i></div></div></div></figure>

<div class="extension-usage-grid"><section><strong>いつ使う?</strong><span>scene開始、待機、asset生成、Actor処理の節目。</span></section><section><strong>何が分かる?</strong><span>どのcommandまで進み、どこで止まったか。</span></section><section><strong>異常時</strong><span>Kamishibai RuntimeのSVGと同じ原因をconsoleにも残す。</span></section></div>

<p class="extension-note"><strong>このアプリでの役割:</strong> 緑の旗で古いconsoleを消し、<code>journal</code>で進行、<code>error</code>で異常を記録します。表示用errorと開発用logを混ぜないことが重要です。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/tmpose-kamishibai/blob/b8de78adcc38e7caf6010ad660e49cb89e5ac763/app/project.source.json">Version 3.1.9 project source</a>（Stage: <code>exec scene # %s with %s</code>）</p>

## Temporary Variables — その場の状態を持つ {#extension-temporary-variables .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">Gallery 2 / 7　機能編 1 / 2</p>

<p class="extension-meta"><span>Gallery</span><code>lmsTempVars2</code><span>状態管理</span></p>

Scratch変数を増やさず、処理の途中だけ必要な名前付き値を保持します。
一つのcustom block内だけのthread variableと、project全体で共有するruntime variableを使い分けます。

<figure class="extension-gallery-banner"><img src="../images/extension-gallery-temporary-variables.svg" alt="TurboWarp Extension GalleryのTemporary Variablesバナー"><figcaption>局所的なthread値と、全体共有のruntime値を扱う公式Galleryバナー。</figcaption></figure>

<figure class="extension-flow"><figcaption>値の届く範囲</figcaption><div><span>custom block内</span><b>→</b><span>thread variable</span><b>／</b><span>全target共有</span><b>→</b><span>runtime variable</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">thread</p><ul><li>台本1行の分解結果</li><li>loop index</li><li>再帰呼出しでも値を分離</li></ul></section><section><p class="extension-subhead">runtime</p><ul><li>scene、skip、pose</li><li>UI言語と選択結果</li><li>拡張間の値の受渡し</li></ul></section></div>

<p class="extension-source">出典: <a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/images/Lily/TempVariables2.svg">Galleryバナー</a>、<a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/extensions/Lily/TempVariables2.js">配布ソース</a></p>

## Temporary Variables — asset解析をつなぐ {#extension-temporary-variables-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">Gallery 2 / 7　使用例 2 / 2</p>

<figure class="extension-editor-example"><figcaption>TurboWarp Editor: Stage「create asset」の代表部分</figcaption><div class="tw-editor"><div class="tw-editor-bar"><strong>Stage</strong><code>define create asset</code></div><div class="tw-script"><div class="tw-block tw-custom">定義 create asset</div><div class="tw-block tw-extension">thread変数 <i>assetName</i> を <span class="tw-reporter">解析結果</span> にする</div><div class="tw-block tw-extension">thread変数 <i>address</i> を <span class="tw-reporter">解析結果</span> にする</div><div class="tw-block tw-data">assetName と address を検査</div><div class="tw-block tw-extension">runtime変数 <i>loadingCount</i> を 1 ずつ変える</div></div></div></figure>

<div class="extension-usage-grid"><section><strong>局所値</strong><span>assetName、address、引数番号をthreadへ置く。</span></section><section><strong>共有値</strong><span>scene、入力状態、Loading進捗をruntimeへ置く。</span></section><section><strong>連携</strong><span>Runtime ExpressionとAsync Inputが同じruntime値を読む。</span></section></div>

<p class="extension-note"><strong>注意:</strong> runtime variableも永続保存ではありません。再起動後に残す値はLocal Storageを使い、green flag時にruntimeへ戻します。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/tmpose-kamishibai/blob/b8de78adcc38e7caf6010ad660e49cb89e5ac763/app/project.source.json">Version 3.1.9 project source</a>（Stage: <code>create asset</code>）</p>

## Text — `key=value`を読み解く {#extension-text-operators .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">Gallery 3 / 7　機能編 1 / 2</p>

<p class="extension-meta"><span>Gallery</span><code>strings</code><span>文字列処理</span></p>

検索、分割、置換、比較、trimを追加する文字列演算拡張です。
紙芝居DSLの一行を、command名と値へ分解する基礎になります。

<figure class="extension-gallery-banner"><img src="../images/extension-gallery-text.svg" alt="TurboWarp Extension GalleryのTextバナー"><figcaption>文字列の検索・分割・置換を視覚化した公式Galleryバナー。</figcaption></figure>

<figure class="extension-flow"><figcaption>台本1行の変換</figcaption><div><span>asset=Hero,...</span><b>→</b><span>位置を探す</span><b>→</b><span>split + trim</span><b>→</b><span>key / value</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">形を調べる</p><ul><li>文字数と出現回数</li><li>前方・後方一致</li><li>厳密な文字列比較</li></ul></section><section><p class="extension-subhead">値を取り出す</p><ul><li>区切り文字でsplit</li><li>部分文字列</li><li>前後の空白をtrim</li></ul></section></div>

<p class="extension-source">出典: <a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/images/text.svg">Galleryバナー</a>、<a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/extensions/text.js">配布ソース</a></p>

## Text — 引数を安全に切り出す {#extension-text-operators-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">Gallery 3 / 7　使用例 2 / 2</p>

<figure class="extension-editor-example"><figcaption>TurboWarp Editor: Stage「selectValue # …」の代表部分</figcaption><div class="tw-editor"><div class="tw-editor-bar"><strong>Stage</strong><code>define selectValue # (index) separated by (separator) from (text)</code></div><div class="tw-script"><div class="tw-block tw-custom">定義 selectValue # <i>index</i> separated by <i>separator</i> from <i>text</i></div><div class="tw-block tw-control">もし <span class="tw-reporter">separator の個数</span> &lt; index なら</div><div class="tw-indent"><div class="tw-block tw-custom">返す <span class="tw-reporter">最後の項目をtrim</span></div></div><div class="tw-block tw-custom">返す <span class="tw-reporter">text の index 番目をsplitしてtrim</span></div></div></div></figure>

<div class="extension-usage-grid"><section><strong>command</strong><span><code>asset=...</code>の最初の<code>=</code>を境界にする。</span></section><section><strong>引数</strong><span>comma区切りの指定位置を取得する。</span></section><section><strong>比較</strong><span>空文字・command名・action名を厳密に照合する。</span></section></div>

<p class="extension-note"><strong>区別:</strong> このTextは文字列演算の<code>strings</code>です。Stageへ文字を描くAnimated Text（ID: <code>text</code>）とは別物です。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/tmpose-kamishibai/blob/b8de78adcc38e7caf6010ad660e49cb89e5ac763/app/project.source.json">Version 3.1.9 project source</a>（Stage: <code>selectValue # %s separated by %s from %s</code>）</p>

## Local Storage — 次回起動まで覚える {#extension-local-storage .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">Gallery 4 / 7　機能編 1 / 2</p>

<p class="extension-meta"><span>Gallery</span><code>localstorage</code><span>永続保存</span></p>

browserの保存領域に、project固有のnamespaceで文字列を保持します。
Scratch変数と違い、ページを閉じた後でも次回起動時に読み戻せます。

<figure class="extension-gallery-banner"><img src="../images/extension-gallery-local-storage.svg" alt="TurboWarp Extension GalleryのLocal Storageバナー"><figcaption>project単位の保存領域へ値を書き、後で読み戻す公式Galleryバナー。</figcaption></figure>

<figure class="extension-flow"><figcaption>sessionをまたぐ値</figcaption><div><span>台本・UI言語</span><b>→</b><span>project namespace</span><b>→</b><span>次回起動</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">保存する</p><ul><li>外部から開いた台本</li><li>English／日本語の選択</li><li>project IDで領域を分離</li></ul></section><section><p class="extension-subhead">保存しない</p><ul><li>camera映像</li><li>pose認識の途中結果</li><li>一時的なscene状態</li></ul></section></div>

<p class="extension-source">出典: <a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/images/local-storage.svg">Galleryバナー</a>、<a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/docs/local-storage.md">公式ドキュメント</a></p>

## Local Storage — UI言語を復元する {#extension-local-storage-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">Gallery 4 / 7　使用例 2 / 2</p>

<figure class="extension-editor-example"><figcaption>TurboWarp Editor: Stage「緑の旗」の初期化部分</figcaption><div class="tw-editor"><div class="tw-editor-bar"><strong>Stage</strong><code>when green flag clicked</code></div><div class="tw-script"><div class="tw-block tw-event">⚑ が押されたとき</div><div class="tw-block tw-extension">storage project ID を <i>tmpose-kamishibai</i> にする</div><div class="tw-block tw-control">もし <span class="tw-reporter">storageの uiLanguage</span> = ja なら</div><div class="tw-indent"><div class="tw-block tw-extension">runtime変数 <i>uiLanguage</i> を ja にする</div></div><div class="tw-block tw-event">UI言語を反映 を送って待つ</div></div></div></figure>

<div class="extension-usage-grid"><section><strong>起動時</strong><span>保存済み言語を読み、なければTranslateへ進む。</span></section><section><strong>台本選択</strong><span>Filesで開いたtextを保存し、reloadで再利用する。</span></section><section><strong>UI操作</strong><span>言語変更時に保存値とruntime値を同時更新する。</span></section></div>

<p class="extension-note"><strong>注意:</strong> 同じprojectを複数tabで開くと、後から保存したwindowが値を上書きする可能性があります。小さな設定と台本文字列だけを対象にします。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/tmpose-kamishibai/blob/b8de78adcc38e7caf6010ad660e49cb89e5ac763/app/project.source.json">Version 3.1.9 project source</a>（Stage: green flag）</p>

## More Timers — 同時に時間を測る {#extension-more-timers .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">Gallery 5 / 7　機能編 1 / 2</p>

<p class="extension-meta"><span>Gallery</span><code>lmsTimers</code><span>時間管理</span></p>

標準timerを一つだけでなく、文字列で名付けた複数timerとして並行管理します。
待機、fade、glideが重なっても、それぞれの経過時間を独立して読めます。

<figure class="extension-gallery-banner"><img src="../images/extension-gallery-more-timers.svg" alt="TurboWarp Extension GalleryのMore Timersバナー"><figcaption>複数の名前付きtimerを作成・停止・再開する公式Galleryバナー。</figcaption></figure>

<figure class="extension-flow"><figcaption>timerのlife cycle</figcaption><div><span>start / reset</span><b>→</b><span>値を読む</span><b>→</b><span>完了判定</span><b>→</b><span>remove</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">操作</p><ul><li>start／reset</li><li>pause／resume</li><li>増減、削除、全削除</li></ul></section><section><p class="extension-subhead">紙芝居</p><ul><li><code>wait</code> action</li><li>Actorの待機</li><li>fadeとtransition進捗</li></ul></section></div>

<p class="extension-source">出典: <a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/images/Lily/MoreTimers.svg">Galleryバナー</a>、<a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/extensions/Lily/MoreTimers.js">配布ソース</a></p>

## More Timers — skipできる待機を作る {#extension-more-timers-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">Gallery 5 / 7　使用例 2 / 2</p>

<figure class="extension-editor-example"><figcaption>TurboWarp Editor: Stage「wait (seconds) seconds」の代表部分</figcaption><div class="tw-editor"><div class="tw-editor-bar"><strong>Stage</strong><code>define wait (seconds) seconds</code></div><div class="tw-script"><div class="tw-block tw-custom">定義 wait <i>seconds</i> seconds</div><div class="tw-block tw-extension">timer <i>wait</i> を開始／reset</div><div class="tw-block tw-control">くり返す <span class="tw-reporter">timer wait &lt; seconds かつ skipでない</span></div><div class="tw-indent"><div class="tw-block tw-control">0秒待つ</div></div><div class="tw-block tw-extension">timer <i>wait</i> を削除</div></div></div></figure>

<div class="extension-usage-grid"><section><strong>通常終了</strong><span>指定秒数へ達したらloopを抜ける。</span></section><section><strong>skip</strong><span>runtimeのskip状態でもloopを抜ける。</span></section><section><strong>後片付け</strong><span>どちらの終了でも名前付きtimerを削除する。</span></section></div>

<p class="extension-note"><strong>設計上の要点:</strong> Scratchの長い「待つ」ブロックに任せず、短いloopでtimerとskipを同時に監視します。これにより上演中の操作へすぐ反応できます。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/tmpose-kamishibai/blob/b8de78adcc38e7caf6010ad660e49cb89e5ac763/app/project.source.json">Version 3.1.9 project source</a>（Stage: <code>wait %s seconds</code>）</p>

## Files — local台本を開く {#extension-files .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">Gallery 6 / 7　機能編 1 / 2</p>

<p class="extension-meta"><span>Gallery</span><code>files</code><span>ファイル入力</span></p>

利用者が選択またはdrag & dropしたlocal fileを、textまたはdata URLとしてprojectへ渡します。
紙芝居では、作品ごとのTXT台本をアプリ本体へ読み込む入口です。

<figure class="extension-gallery-banner"><img src="../images/extension-gallery-files.svg" alt="TurboWarp Extension GalleryのFilesバナー"><figcaption>file pickerとdownloadをTurboWarp blockへ接続する公式Galleryバナー。</figcaption></figure>

<figure class="extension-flow"><figcaption>外部台本を開く</figcaption><div><span>button / drop</span><b>→</b><span>.txt picker</span><b>→</b><span>script text</span><b>→</b><span>preflight</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">入力</p><ul><li>拡張子・MIME type指定</li><li>text／data URL</li><li>cancel時は空文字</li></ul></section><section><p class="extension-subhead">出力</p><ul><li>filename付きdownload</li><li>browser内で完結</li><li>明示的な利用者操作から開始</li></ul></section></div>

<p class="extension-source">出典: <a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/images/files.svg">Galleryバナー</a>、<a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/extensions/files.js">配布ソース</a></p>

## Files — 選択結果を通常経路へ渡す {#extension-files-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">Gallery 6 / 7　使用例 2 / 2</p>

<figure class="extension-editor-example"><figcaption>TurboWarp Editor: UiItem「ファイルを開く」の代表部分</figcaption><div class="tw-editor"><div class="tw-editor-bar"><strong>UiItem</strong><code>when I receive runUiItemAction</code></div><div class="tw-script"><div class="tw-block tw-event">runUiItemAction を受け取ったとき</div><div class="tw-block tw-control">もし <span class="tw-reporter">action = openFile</span> なら</div><div class="tw-indent"><div class="tw-block tw-extension">runtime変数 <i>script</i> を <span class="tw-reporter">拡張子 txt を textとして選ぶ</span> にする</div><div class="tw-block tw-event">startStory を送る</div></div></div></div></figure>

<div class="extension-usage-grid"><section><strong>UiItem</strong><span>menu buttonの操作からpickerを開く。</span></section><section><strong>runtime</strong><span>選択した全文を<code>script</code>へ渡す。</span></section><section><strong>合流</strong><span>埋め込み台本と同じpreflight・asset登録へ進む。</span></section></div>

<p class="extension-note"><strong>安全性:</strong> pickerは利用者clickに続いて開きます。cancelで空文字になった場合は、保存済み台本を勝手に置き換えません。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/tmpose-kamishibai/blob/b8de78adcc38e7caf6010ad660e49cb89e5ac763/app/project.source.json">Version 3.1.9 project source</a>（UiItem: <code>runUiItemAction</code>）</p>

## Animated Text — 文字をStageの素材にする {#extension-animated-text .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">Gallery 7 / 7　機能編 1 / 2</p>

<p class="extension-meta"><span>Gallery</span><code>text</code><span>文字描画</span></p>

spriteへ文字専用のrenderer skinを作り、font、色、幅、配置、outline、animationを設定します。
紙芝居では台詞、prompt、menu、診断画面の文字を「表示できるasset」へ変換します。

<figure class="extension-gallery-banner"><img src="../images/extension-gallery-animated-text.svg" alt="TurboWarp Extension GalleryのAnimated Textバナー"><figcaption>Scratch Lab互換の文字描画・animationを示す公式Galleryバナー。</figcaption></figure>

<figure class="extension-flow"><figcaption>文字からStage表示へ</figcaption><div><span>text + style</span><b>→</b><span>renderer skin</span><b>→</b><span>sprite表示</span><b>→</b><span>animation</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">style</p><ul><li>font、色、outline</li><li>幅、折返し、align</li><li>spriteのskinとして描画</li></ul></section><section><p class="extension-subhead">animation</p><ul><li>typing</li><li>rainbow、zoom</li><li>shakeなどの演出</li></ul></section></div>

<p class="extension-source">出典: <a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/images/lab/text.svg">Galleryバナー</a>、<a href="https://github.com/TurboWarp/extensions/blob/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a/extensions/lab/text.js">配布ソース</a></p>

## Animated Text — Asset Managerの描画backend {#extension-animated-text-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">Gallery 7 / 7　使用例 2 / 2</p>

<figure class="extension-editor-example"><figcaption>TurboWarp Editor: 文字animationの最小例</figcaption><div class="tw-editor"><div class="tw-editor-bar"><strong>Stage</strong><code>Animated Text</code></div><div class="tw-script"><div class="tw-block tw-extension">textを <i>むかし、むかし</i> にする</div><div class="tw-block tw-extension">fontを <i>sans-serif</i> にする</div><div class="tw-block tw-extension">text幅を <i>420</i> にする</div><div class="tw-block tw-extension">textを <i>typing</i> でanimateする</div></div></div></figure>

<div class="extension-usage-grid"><section><strong>直接利用</strong><span>animation blockでtypingなどを開始できる。</span></section><section><strong>実アプリ</strong><span>Asset Managerがtext skin生成をbackendとして呼ぶ。</span></section><section><strong>表示先</strong><span>title、menu、prompt、SVG診断の説明文。</span></section></div>

<p class="extension-note"><strong>このアプリでの使い方:</strong> 多くの文字はAnimated Textを直接並べず、Asset Managerの<code>set text value/style</code>を経由します。asset名と表示targetを一元管理するためです。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/tmpose-kamishibai/blob/b8de78adcc38e7caf6010ad660e49cb89e5ac763/app/project.source.json">Version 3.1.9 project source</a>（<code>text_animateText</code>とAsset Manager連携）</p>

## Translate — viewerの言語を知る {#extension-translate .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">TurboWarp標準 1 / 1　機能編 1 / 2</p>

<p class="extension-meta"><span>TurboWarp標準</span><code>translate</code><span>表示言語</span></p>

Scratch／TurboWarp標準の翻訳拡張です。文章を翻訳するblockに加え、viewerで選択中の言語を返します。
このアプリが使うのは、network翻訳ではなく「viewerの言語」reporterです。

<div class="extension-concept-hero"><div class="extension-icon">文<br><small>Language</small></div><div><strong>viewer localeを最初のUIへ</strong><p>保存済み設定がなければ、TurboWarpの表示言語からEnglish／日本語の初期値を選びます。</p></div></div>

<figure class="extension-flow"><figcaption>初回起動の言語選択</figcaption><div><span>viewer language</span><b>→</b><span>ja / ja-JP?</span><b>→</b><span>日本語</span><b>／</b><span>English</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">利用する</p><ul><li>viewer language reporter</li><li>日本語codeの判定</li><li>初回だけの既定値</li></ul></section><section><p class="extension-subhead">利用しない</p><ul><li>台本文の自動翻訳</li><li>外部翻訳API</li><li>自由な言語追加</li></ul></section></div>

<p class="extension-source">出典: <a href="https://github.com/TurboWarp/scratch-vm/blob/c4823421cb7c17d8d8a89878851ce1668c26a21f/src/extensions/scratch3_translate/index.js">固定scratch-vmのTranslate実装</a></p>

## Translate — 保存値がない時だけ使う {#extension-translate-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">TurboWarp標準 1 / 1　使用例 2 / 2</p>

<figure class="extension-editor-example"><figcaption>TurboWarp Editor: Stage「緑の旗」の言語判定</figcaption><div class="tw-editor"><div class="tw-editor-bar"><strong>Stage</strong><code>when green flag clicked</code></div><div class="tw-script"><div class="tw-block tw-event">⚑ が押されたとき</div><div class="tw-block tw-control">もし <span class="tw-reporter">保存済み uiLanguage がない</span> なら</div><div class="tw-indent"><div class="tw-block tw-control">もし <span class="tw-reporter">viewer language = Japanese / ja / ja-JP</span> なら</div><div class="tw-indent"><div class="tw-block tw-extension">runtime変数 <i>uiLanguage</i> を ja にする</div></div><div class="tw-block tw-control">でなければ English にする</div></div><div class="tw-block tw-event">UI言語を反映 を送って待つ</div></div></div></figure>

<div class="extension-usage-grid"><section><strong>優先1</strong><span>Local Storageに保存済みの利用者選択。</span></section><section><strong>優先2</strong><span>Translateのviewer language。</span></section><section><strong>結果</strong><span>runtime変数を通して全UIへbroadcast。</span></section></div>

<p class="extension-note"><strong>方針:</strong> browser localeを毎回強制せず、利用者が一度選んだUI言語を優先します。Translateは初期値を決める補助です。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/tmpose-kamishibai/blob/b8de78adcc38e7caf6010ad660e49cb89e5ac763/app/project.source.json">Version 3.1.9 project source</a>（Stage: green flag）</p>

## Asset Manager — 素材を名前で扱う {#extension-asset-manager .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">外部埋め込み 1 / 5　機能編 1 / 2</p>

<p class="extension-meta"><span>外部埋め込み</span><code>kubohiroyaassetmanager</code><span>0.4.1</span></p>

Web上の画像・音声、SB3内のcostume・backdrop・sound、実行時textを一つの名前付き登録簿で扱います。
台本は置き場所ではなくasset名だけを使って、表示・再生・animationを指示できます。

<div class="extension-concept-hero"><div class="extension-icon">A<br><small>Assets</small></div><div><strong>素材の住所を隠す登録簿</strong><p>URL、project内素材、textを同じasset名へまとめ、Stage・Actor・音声へ配ります。</p></div></div>

<figure class="extension-flow"><figcaption>名前付きasset登録簿</figcaption><div><span>URL / costume / text</span><b>→</b><span>register + cache</span><b>→</b><span>Stage / Actor / sound</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">読込</p><ul><li>種類判定と取得</li><li>IndexedDB cache</li><li>Loading用assetを先行</li></ul></section><section><p class="extension-subhead">利用</p><ul><li>Stage／sprite skin</li><li>音声再生・停止</li><li>Actor loop／sequence</li></ul></section></div>

<p class="extension-source">出典: <a href="https://kubohiroya.github.io/turbowarp-asset-manager/ja/">Asset Manager図解ガイド</a>、<a href="https://github.com/kubohiroya/turbowarp-asset-manager/tree/c55e65787eed21d2e70b96a28dd6705d118f9995">固定commit c55e657</a></p>

## Asset Manager — Loadingからsceneへ渡す {#extension-asset-manager-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">外部埋め込み 1 / 5　使用例 2 / 2</p>

<figure class="extension-editor-example"><figcaption>TurboWarp Editor: Stage「create asset」のLoading部分</figcaption><div class="tw-editor"><div class="tw-editor-bar"><strong>Stage</strong><code>define create asset</code></div><div class="tw-script"><div class="tw-block tw-custom">定義 create asset</div><div class="tw-block tw-extension">Loading用assetを準備</div><div class="tw-block tw-extension">Loading costume <i>i</i> を取得</div><div class="tw-block tw-extension">asset <i>name</i> を address <i>source</i> から登録</div><div class="tw-block tw-control">もし <span class="tw-reporter">asset is loaded?</span> なら進捗を更新</div><div class="tw-block tw-extension">Stage skinを <i>background</i> にする</div></div></div></figure>

<div class="extension-usage-grid"><section><strong>開始前</strong><span>Loading backdropとcostumeを先に登録。</span></section><section><strong>登録中</strong><span>台本の全assetを名前・addressで登録。</span></section><section><strong>実行中</strong><span>同じ名前で背景、Actor、音、textを操作。</span></section></div>

<p class="extension-note"><strong>address例:</strong> <code>costume:Actor:hero1</code>、<code>backdrop:sea</code>、<code>sound:Stage:bell</code>。project内参照はsprite名と素材名を正確に指定します。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/tmpose-kamishibai/blob/b8de78adcc38e7caf6010ad660e49cb89e5ac763/app/project.source.json">Version 3.1.9 project source</a>（Stage: <code>create asset</code>）</p>

## TMPose — cameraをpose名へ変える {#extension-tmpose .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">外部埋め込み 2 / 5　機能編 1 / 2</p>

<p class="extension-meta"><span>外部埋め込み</span><code>tmpose</code><span>1.4.0</span></p>

Teachable Machine Pose modelとcamera映像を接続し、現在のpose名とconfidenceをTurboWarpの値として返します。
model、camera、preview、predictionを別々に開始・停止できます。

<div class="extension-concept-hero"><div class="extension-icon">◎<br><small>Pose</small></div><div><strong>身体の動きを入力eventへ</strong><p>camera frameを分類し、pose名とscoreをstory runtimeへ渡します。</p></div></div>

<figure class="extension-flow"><figcaption>pose認識pipeline</figcaption><div><span>camera frame</span><b>→</b><span>TM Pose model</span><b>→</b><span>pose + confidence</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">準備</p><ul><li>model URL設定・load</li><li>camera開始</li><li>preview位置・透明度</li></ul></section><section><p class="extension-subhead">認識</p><ul><li>prediction開始・停止</li><li>pose別confidence</li><li>最新errorと計測時間</li></ul></section></div>

<p class="extension-source">出典: <a href="https://kubohiroya.github.io/turbowarp-tmpose/ja/">TMPose図解ガイド</a>、<a href="https://github.com/kubohiroya/turbowarp-tmpose/tree/08fe0cf9da061b1eba75297b8ee187d68549eed4">固定commit 08fe0cf</a></p>

## TMPose — modelを読みposeを待つ {#extension-tmpose-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">外部埋め込み 2 / 5　使用例 2 / 2</p>

<figure class="extension-editor-example"><figcaption>TurboWarp Editor: Stage「setTMPoseURL」「exec pose」の代表部分</figcaption><div class="tw-editor"><div class="tw-editor-bar"><strong>Stage</strong><code>define setTMPoseURL with (url)</code></div><div class="tw-script"><div class="tw-block tw-custom">定義 setTMPoseURL with <i>url</i></div><div class="tw-block tw-extension">model URLを <i>url</i> にする</div><div class="tw-block tw-extension">modelをload</div><div class="tw-block tw-control"><span class="tw-reporter">model loaded?</span> まで待つ</div><div class="tw-block tw-custom">exec pose <i>rescue</i></div><div class="tw-block tw-control"><span class="tw-reporter">pose rescue が 0.8 以上</span> まで待つ</div></div></div></figure>

<div class="extension-usage-grid"><section><strong>scene準備</strong><span><code>TMPoseURL</code>でmodelをload。</span></section><section><strong>action</strong><span>指定poseのscoreが閾値を超えるまで反復。</span></section><section><strong>終了</strong><span>skip、scene終了、stopでpredictionとcameraを停止。</span></section></div>

<p class="extension-note"><strong>実行条件:</strong> camera権限とHTTPSが必要です。modelとTensorFlow／Teachable Machine libraryの取得にはnetwork接続を使います。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/tmpose-kamishibai/blob/b8de78adcc38e7caf6010ad660e49cb89e5ac763/app/project.source.json">Version 3.1.9 project source</a>（Stage: <code>setTMPoseURL</code> / <code>exec pose</code>）</p>

## Text Lines — 台本を行へ分ける {#extension-text-lines .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">外部埋め込み 3 / 5　機能編 1 / 2</p>

<p class="extension-meta"><span>外部埋め込み</span><code>kubohiroyatextlines</code><span>0.1.1</span></p>

長いtextを改行位置で分割し、行数、指定行、Scratch listとして扱います。
LF、CRLF、CRを同じ改行として正規化するため、台本を作ったOSに依存しません。

<div class="extension-concept-hero"><div class="extension-icon">≡<br><small>Lines</small></div><div><strong>一つのtextを物理行へ</strong><p>元sourceの行番号を保ったまま、preflightと実行loopへ渡します。</p></div></div>

<figure class="extension-flow"><figcaption>1入力から3つの結果</figcaption><div><span>複数行text</span><b>→</b><span>改行を正規化</span><b>→</b><span>行数 / 1行 / list</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">入力</p><ul><li>LF、CRLF、CR</li><li>空行を含む全文</li><li>UTF-8の台本文字列</li></ul></section><section><p class="extension-subhead">出力</p><ul><li>行数</li><li>1始まりの指定行</li><li>list全置換</li></ul></section></div>

<p class="extension-source">出典: <a href="https://kubohiroya.github.io/turbowarp-text-lines/ja/">Text Lines図解ガイド</a>、<a href="https://github.com/kubohiroya/turbowarp-text-lines/tree/8655d764cf3af0d783ba6f138086db927abd3570">固定commit 8655d76</a></p>

## Text Lines — source行番号を守る {#extension-text-lines-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">外部埋め込み 3 / 5　使用例 2 / 2</p>

<figure class="extension-editor-example"><figcaption>TurboWarp Editor: Stage「create sceneList」の代表部分</figcaption><div class="tw-editor"><div class="tw-editor-bar"><strong>Stage</strong><code>define create sceneList</code></div><div class="tw-script"><div class="tw-block tw-custom">定義 create sceneList</div><div class="tw-block tw-extension">runtime変数 <i>script</i> の行をlist <i>lines</i> へ書く</div><div class="tw-block tw-control">lines の各項目について繰り返す</div><div class="tw-indent"><div class="tw-block tw-data">空行／comment／commandを分類</div><div class="tw-block tw-data">source line numberを保持</div></div></div></div></figure>

<div class="extension-usage-grid"><section><strong>preflight</strong><span>物理行番号とcommandを一緒に検査。</span></section><section><strong>実行</strong><span>同じ<code>lines</code> listをscene生成へ渡す。</span></section><section><strong>診断</strong><span>errorの行番号を元TXTへ正確に対応。</span></section></div>

<p class="extension-note"><strong>listの扱い:</strong> 書込blockは追記ではなく全置換です。前回台本の行が残らないため、reloadしても行番号がずれません。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/tmpose-kamishibai/blob/b8de78adcc38e7caf6010ad660e49cb89e5ac763/app/project.source.json">Version 3.1.9 project source</a>（Stage: <code>create sceneList</code>）</p>

## Runtime Expression — 条件式を安全に評価 {#extension-runtime-expression .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">外部埋め込み 4 / 5　機能編 1 / 2</p>

<p class="extension-meta"><span>外部埋め込み</span><code>kubohiroyaruntimeexpression</code><span>0.2.0</span></p>

Temporary Variablesのruntime値を、JavaScriptに似た制限付き条件式から参照し、true／falseを返します。
任意codeを実行せず、許可した比較、論理、算術、括弧だけを評価します。

<div class="extension-concept-hero"><div class="extension-icon">{?}<br><small>Expr</small></div><div><strong>分岐の条件だけを読む</strong><p><code>score &gt;= 3 && hasKey</code>のような式をparserで検査してから評価します。</p></div></div>

<figure class="extension-flow"><figcaption>安全な条件評価</figcaption><div><span>runtime variables</span><b>→</b><span>限定parser</span><b>→</b><span>true / false</span><b>→</b><span>scene label</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">許可</p><ul><li>比較、論理、算術</li><li>括弧</li><li><code>vars["日本語名"]</code></li></ul></section><section><p class="extension-subhead">禁止</p><ul><li>代入</li><li>関数呼出し</li><li>任意property／JavaScript</li></ul></section></div>

<p class="extension-source">出典: <a href="https://kubohiroya.github.io/turbowarp-runtime-expression/ja/">Runtime Expression図解ガイド</a>、<a href="https://github.com/kubohiroya/turbowarp-runtime-expression/tree/7e2bd99fa57fa9f0cbe6b91306b4c53322f00aa3">固定commit 7e2bd99</a></p>

## Runtime Expression — 最初のtrueへ分岐 {#extension-runtime-expression-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">外部埋め込み 4 / 5　使用例 2 / 2</p>

<figure class="extension-editor-example"><figcaption>TurboWarp Editor: Stage「exec branch action」の代表部分</figcaption><div class="tw-editor"><div class="tw-editor-bar"><strong>Stage</strong><code>define exec branch action (definition)</code></div><div class="tw-script"><div class="tw-block tw-custom">定義 exec branch action <i>definition</i></div><div class="tw-block tw-control">登録したbranchを上から繰り返す</div><div class="tw-indent"><div class="tw-block tw-control">もし <span class="tw-reporter">runtime condition (expression)</span> なら</div><div class="tw-indent"><div class="tw-block tw-data">scene labelを選ぶ</div><div class="tw-block tw-custom">このcustom blockを終了</div></div></div></div></div></figure>

<div class="extension-usage-grid"><section><strong>登録</strong><span><code>registerBranch</code>が式とscene labelを保持。</span></section><section><strong>評価</strong><span>上から順にruntime値を使って判定。</span></section><section><strong>決定</strong><span>最初にtrueとなった遷移先だけを採用。</span></section></div>

<p class="extension-note"><strong>二段階の安全性:</strong> Kamishibai Runtimeが実行前にsyntaxを検査し、scene移動時にRuntime Expressionが現在値で評価します。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/tmpose-kamishibai/blob/b8de78adcc38e7caf6010ad660e49cb89e5ac763/app/project.source.json">Version 3.1.9 project source</a>（Stage: <code>exec branch action</code>）</p>

## Async Input — 入力を待たずに束ねる {#extension-async-input .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">外部埋め込み 5 / 5　機能編 1 / 2</p>

<p class="extension-meta"><span>外部埋め込み</span><code>kubohiroyaasyncinput</code><span>0.2.0</span></p>

key、sprite／Actorのtouchを、Temporary Variablesのruntime値更新とbroadcastへ接続します。
入力ごとに待機scriptを増やさず、登録したlistenerから同じscene遷移経路へ合流できます。

<div class="extension-concept-hero"><div class="extension-icon">↯<br><small>Input</small></div><div><strong>入力をruntime eventへ変換</strong><p>keyとtouchを「値を更新してmessageを送る」という同じ形へ揃えます。</p></div></div>

<figure class="extension-flow"><figcaption>入力binding</figcaption><div><span>key / touch</span><b>→</b><span>target listener</span><b>→</b><span>runtime更新</span><b>→</b><span>broadcast</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">登録</p><ul><li>KeyboardEvent.code</li><li>sprite／clone／Actor名</li><li>代入または算術更新</li></ul></section><section><p class="extension-subhead">解除</p><ul><li>cover表示</li><li>scene境界</li><li>target削除・stop</li></ul></section></div>

<p class="extension-source">出典: <a href="https://kubohiroya.github.io/turbowarp-async-input/ja/">Async Input図解ガイド</a>、<a href="https://github.com/kubohiroya/turbowarp-async-input/tree/3ecd7ff406b86fd957333ae4978cec118322ebd1">固定commit 3ecd7ff</a></p>

## Async Input — keyをscene移動へ結ぶ {#extension-async-input-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">外部埋め込み 5 / 5　使用例 2 / 2</p>

<figure class="extension-editor-example"><figcaption>TurboWarp Editor: Stage「keyInputToChangeScene」の代表部分</figcaption><div class="tw-editor"><div class="tw-editor-bar"><strong>Stage</strong><code>define exec keyInputToChangeScene (key) (scene)</code></div><div class="tw-script"><div class="tw-block tw-custom">定義 keyInputToChangeScene <i>key</i> <i>scene</i></div><div class="tw-block tw-extension">key <i>key</i> をlistenし、runtime変数 <i>nextScene</i> を <i>scene</i> にして messageを送る</div><div class="tw-block tw-event">inputResolved を受け取ったとき</div><div class="tw-block tw-extension">すべてのinput listenerを停止</div><div class="tw-block tw-custom">nextSceneへ移動</div></div></div></figure>

<div class="extension-usage-grid"><section><strong>key</strong><span>物理keyからscene labelを選ぶ。</span></section><section><strong>touch</strong><span>画面のActor名から同じ遷移へ合流。</span></section><section><strong>競合</strong><span>最初の入力で解決し、残りのlistenerを解除。</span></section></div>

<p class="extension-note"><strong>後片付け:</strong> 登録はtargetごとに所有されます。sceneをまたいだ古いlistenerが次の場面で発火しないよう、境界で必ず停止します。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/tmpose-kamishibai/blob/b8de78adcc38e7caf6010ad660e49cb89e5ac763/app/project.source.json">Version 3.1.9 project source</a>（Stage: <code>keyInputToChangeScene</code>）</p>

## Kamishibai Runtime — 実行前に台本を守る {#extension-kamishibai-runtime .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">アプリ内蔵 1 / 2　機能編 1 / 2</p>

<p class="extension-meta"><span>アプリ内蔵</span><code>kubohiroyakamishibairuntime</code><span>DSL診断</span></p>

紙芝居DSL 3.1を実行前に検査し、失敗時に分類済み診断とSVG error画面を作るproject専用拡張です。
正常な台本の実行は置き換えず、副作用を始めてよいかだけを判定します。

<div class="extension-concept-hero"><div class="extension-icon">✓<br><small>Preflight</small></div><div><strong>安全に失敗する入口</strong><p>cameraや音声を始める前に、version、command、参照、条件式をまとめて検査します。</p></div></div>

<figure class="extension-flow"><figcaption>preflightと安全停止</figcaption><div><span>DSL + project</span><b>→</b><span>構文・参照検証</span><b>→</b><span>実行許可</span><b>／</b><span>SVG診断</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">検査</p><ul><li>version、command、action</li><li>scene／asset参照</li><li>addressと条件式syntax</li></ul></section><section><p class="extension-subhead">診断</p><ul><li>error code</li><li>行・列</li><li>source抜粋とSVG文字</li></ul></section></div>

<p class="extension-source">出典: <a href="internal-specification.md">紙芝居アプリ内部仕様書</a>、<a href="https://github.com/kubohiroya/tmpose-kamishibai/blob/b8de78adcc38e7caf6010ad660e49cb89e5ac763/app/extensions/kubohiroyakamishibairuntime.js">内蔵拡張ソース</a></p>

## Kamishibai Runtime — startStoryの最初で止める {#extension-kamishibai-runtime-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">アプリ内蔵 1 / 2　使用例 2 / 2</p>

<figure class="extension-editor-example"><figcaption>TurboWarp Editor: Stage「startStory」の入口</figcaption><div class="tw-editor"><div class="tw-editor-bar"><strong>Stage</strong><code>when I receive startStory</code></div><div class="tw-script"><div class="tw-block tw-event">startStory を受け取ったとき</div><div class="tw-block tw-extension">scriptを検証し、errorなら停止</div><div class="tw-block tw-control">もし <span class="tw-reporter">preflight OK</span> なら</div><div class="tw-indent"><div class="tw-block tw-custom">create asset</div><div class="tw-block tw-custom">create sceneList</div><div class="tw-block tw-custom">最初のsceneを実行</div></div></div></div></figure>

<div class="extension-usage-grid"><section><strong>位置</strong><span><code>startStory</code>直後、asset／cameraより前。</span></section><section><strong>失敗</strong><span>背景作業を始めず、promptへSVG診断を表示。</span></section><section><strong>成功</strong><span>従来のStage custom block群へ処理を返す。</span></section></div>

<p class="extension-note"><strong>責任境界:</strong> DSL parser／実行器全体ではありません。実行前の限定preflightと、利用者が直せる診断表示に責任を絞っています。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/tmpose-kamishibai/blob/b8de78adcc38e7caf6010ad660e49cb89e5ac763/app/project.source.json">Version 3.1.9 project source</a>（Stage: <code>startStory</code>）</p>

## Web Link — 公式URLだけを開く {#extension-web-link .extension-sheet .extension-sheet-left}

<p class="extension-spread-label">アプリ内蔵 2 / 2　機能編 1 / 2</p>

<p class="extension-meta"><span>アプリ内蔵</span><code>kubohiroyaweblink</code><span>外部navigation</span></p>

受け取ったURLを検証し、新しいbrowser tabで開くproject専用の小さな拡張です。
任意schemeを許可せず、公式Webサイトへの明示的なnavigationだけをblockへします。

<div class="extension-concept-hero"><div class="extension-icon">↗<br><small>HTTPS</small></div><div><strong>アプリの外へ出る一つの安全な扉</strong><p>絶対URL、HTTPS、noopener／noreferrerを確認してから新しいtabを開きます。</p></div></div>

<figure class="extension-flow"><figcaption>安全な外部link</figcaption><div><span>homepage URL</span><b>→</b><span>parse</span><b>→</b><span>HTTPS?</span><b>→</b><span>new tab</span></div></figure>

<div class="extension-columns"><section><p class="extension-subhead">許可</p><ul><li>絶対URL</li><li><code>https:</code></li><li>利用者clickからの呼出し</li></ul></section><section><p class="extension-subhead">拒否</p><ul><li><code>http:</code></li><li><code>file:</code>／<code>javascript:</code></li><li>通常sceneからの任意navigation</li></ul></section></div>

<p class="extension-source">出典: <a href="internal-specification.md">紙芝居アプリ内部仕様書</a>、<a href="https://github.com/kubohiroya/tmpose-kamishibai/blob/b8de78adcc38e7caf6010ad660e49cb89e5ac763/app/extensions/kubohiroyaweblink.js">内蔵拡張ソース</a></p>

## Web Link — title buttonからだけ開く {#extension-web-link-example .extension-sheet .extension-sheet-right}

<p class="extension-spread-label">アプリ内蔵 2 / 2　使用例 2 / 2</p>

<figure class="extension-editor-example"><figcaption>TurboWarp Editor: officialWebsiteButtonのclick</figcaption><div class="tw-editor"><div class="tw-editor-bar"><strong>officialWebsiteButton</strong><code>when this sprite clicked</code></div><div class="tw-script"><div class="tw-block tw-event">このspriteが押されたとき</div><div class="tw-block tw-data">runtime変数 <i>homepage</i> を読む</div><div class="tw-block tw-extension">URL <i>homepage</i> を新しいtabで開く</div></div></div></figure>

<div class="extension-usage-grid"><section><strong>入口</strong><span>title画面の「公式Webサイト」button。</span></section><section><strong>値</strong><span>package metadata由来のhomepageをruntime経由で渡す。</span></section><section><strong>制約</strong><span>通常のscene actionからは呼び出さない。</span></section></div>

<p class="extension-note"><strong>browser policy:</strong> popup blockを避けるため、利用者clickに続けて実行します。新しいtabには<code>noopener,noreferrer</code>を付けます。</p>

<p class="extension-source">ブロック例: <a href="https://github.com/kubohiroya/tmpose-kamishibai/blob/b8de78adcc38e7caf6010ad660e49cb89e5ac763/app/project.source.json">Version 3.1.9 project source</a>（<code>officialWebsiteButton</code>）</p>
