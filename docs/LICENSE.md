# 一般・DSL作成者・開発者向け文書のライセンス

Copyright © 2026 Hiroya Kubo.

個別に異なる表示がある場合を除き、`docs/user-guides/`、
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

## TurboWarp Editorの実画面キャプチャ

`images/extension-editor-*.png`の15図版は、2026年8月4日に
[TurboWarp Editor](https://turbowarp.org/editor)で
[TMPose紙芝居 Version 3.1.9のSB3](https://kubohiroya.github.io/tmpose-kamishibai/downloads/kamishibai.sb3)
を開き、Stageまたは対象spriteごとにTurboWarp Editorの「きれいにする」を実行して
block同士の重なりを解消した後、2560×1440の表示領域で撮影し、説明対象の前後だけを
切り出した画面キャプチャです。対応するproject sourceは
[固定commit `b8de78a`](https://github.com/kubohiroya/tmpose-kamishibai/blob/b8de78adcc38e7caf6010ad660e49cb89e5ac763/app/project.source.json)
で確認できます。

図版中のTurboWarp Editor UI、Scratch block由来の視覚要素、機能拡張およびアプリの
block実装には、それぞれの権利者によるライセンスまたは利用条件が適用されます。
この文書のCC BY-SA 4.0表示は、それら第三者要素を別途再許諾するものではありません。

## Noto Sans JP

`fonts/NotoSansJP-VF.ttf`は、
[Google Fontsの固定commit `2796410`](https://github.com/google/fonts/tree/2796410152d4f9524b68ed46e69c1b60f8e0f7c3/ofl/notosansjp)
から内容を変更せず収録した第三者フォントです。日本語字形をPDFへ確実に埋め込み、
build環境や閲覧環境によって文字が四角形へ置換されることを防ぐために使用します。

このフォントにはCC BY-SA 4.0ではなく、
[SIL Open Font License 1.1](fonts/NotoSansJP-OFL.txt)（OFL-1.1）が適用されます。
フォントを含む生成PDFやHTMLでも、フォント部分のライセンスは変わりません。
