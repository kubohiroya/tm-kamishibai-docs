# 一般・DSL作成者・開発者向け文書のライセンス

Copyright © 2026 Hiroya Kubo.

個別に異なる表示がある場合を除き、`docs/user-guides/`、`docs/tutorials/`、
`docs/dsl-author-guides/`、`docs/developer-guides/`以下の文書と`docs/images/`の共有図版は
[Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/)
（CC BY-SA 4.0）で提供します。

再利用時は、著作者名「Hiroya Kubo」、文書名、一次配布元
<https://github.com/kubohiroya/tmpose-kamishibai-docs>、ライセンス名とそのURLを表示し、
変更した場合は変更内容を示してください。改変物を配布する場合は、CC BY-SA 4.0が
定める同一ライセンス条件を適用してください。

文書内で参照するソフトウェアのソースコード、第三者の著作物、個別にライセンスを
表示した素材には、それぞれのライセンスまたは利用条件が適用されます。

## TurboWarp Extension Galleryのバナー

次の図版は
[TurboWarp/extensionsの固定commit `9c0ae4f`](https://github.com/TurboWarp/extensions/tree/9c0ae4f045dfb021cf329ea1ea6e595502c56a8a)
から内容を変更せず、ファイル名だけを変更して収録した第三者素材です。

- `images/extension-gallery-consoles.svg`
- `images/extension-gallery-temporary-variables.svg`
- `images/extension-gallery-text.svg`
- `images/extension-gallery-local-storage.svg`
- `images/extension-gallery-more-timers.svg`
- `images/extension-gallery-files.svg`
- `images/extension-gallery-animated-text.svg`

これら7図版にはCC BY-SA 4.0ではなく、引用元の
[Mozilla Public License 2.0](../LICENSES/MPL-2.0.txt)（MPL-2.0）が適用されます。
図版を含む生成PDFやHTMLでも、該当図版部分のライセンスは変わりません。

## 機能拡張ガイドの実画面キャプチャ

`images/extension-editor-svg-text.png`を除く`images/extension-editor-*.png`の15図版は、2026年8月4日に
[TurboWarp Editor](https://turbowarp.org/editor)で
[TMPose紙芝居 Version 3.1.9のSB3](https://github.com/kubohiroya/tmpose-kamishibai/releases/tag/v3.1.9)
を開き、2560×1440の表示領域で撮影し、説明対象の前後だけを切り出した
画面キャプチャです。対応するproject sourceは
[固定commit `b8de78a`](https://github.com/kubohiroya/tmpose-kamishibai/blob/b8de78adcc38e7caf6010ad660e49cb89e5ac763/app/project.source.json)
で確認できます。

`images/extension-editor-svg-text.png`は、2026年8月4日に
[SVG Text日本語図解ガイド](https://kubohiroya.github.io/turbowarp-svg-text/ja/)の、say、think、
SVG text actorの使用例を同一範囲で撮影した画面キャプチャです。対応する機能拡張は
[`@kubohiroya/turbowarp-svg-text@0.1.0`](https://www.npmjs.com/package/@kubohiroya/turbowarp-svg-text/v/0.1.0)です。

図版中のTurboWarp Editor UI、Scratch block由来の視覚要素、機能拡張およびアプリの
block実装には、それぞれの権利者によるライセンスまたは利用条件が適用されます。
この文書のCC BY-SA 4.0表示は、それら第三者要素を別途再許諾するものではありません。

## DSL 4.0実装スナップショット

次の3図版は、2026年8月12日に固定した浦島太郎DSL 4.0 Web成果物をローカルで実行し、
1280×720のブラウザー表示から説明対象を切り出した画面キャプチャです。

- `images/dsl4-implementation-title.jpg`
- `images/dsl4-implementation-scene.jpg`
- `images/dsl4-implementation-pose-feedback.jpg`

runtimeは`kubohiroya/tmpose-kamishibai@8ea06bfd100b106f559cb25a280fab5570e42919`、サンプルと
Web成果物は`kubohiroya/tmpose-kamishibai-samples@dc9f6626de9ef85ca71312402fd139082922b867`を
基準にしています。入力・出力hash、Packager version、撮影条件と各画像hashは
[`DSL4-IMPLEMENTATION-VISUALS.md`](../DSL4-IMPLEMENTATION-VISUALS.md)に記録しています。

キャプチャ内のTMPose紙芝居ランタイム、UI、浦島太郎の台本・背景・Actor画像は、引用元の
Mozilla Public License 2.0（MPL-2.0）の適用範囲を保持します。図版としての選択、切り出し、
captionには本書のCC BY-SA 4.0を適用しますが、キャプチャ内のMPL-2.0対象要素を別途再許諾する
ものではありません。

## Noto Sans JP

`fonts/NotoSansJP-VF.ttf`は、
[Google Fontsの固定commit `2796410`](https://github.com/google/fonts/tree/2796410152d4f9524b68ed46e69c1b60f8e0f7c3/ofl/notosansjp)
から内容を変更せず収録した第三者フォントです。日本語字形をPDFへ確実に埋め込み、
build環境や閲覧環境によって文字が四角形へ置換されることを防ぐために使用します。

このフォントにはCC BY-SA 4.0ではなく、
[SIL Open Font License 1.1](fonts/NotoSansJP-OFL.txt)（OFL-1.1）が適用されます。
フォントを含む生成PDFやHTMLでも、フォント部分のライセンスは変わりません。
