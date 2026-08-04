# ライセンス区分

Copyright © 2026 Hiroya Kubo.

このリポジトリ全体に適用される単一のライセンスはありません。対象ごとに、以下の
ライセンスまたは利用条件を適用します。あるファイルが複数の区分に該当する場合は、
そのファイル内または直近のディレクトリにある個別表示を優先します。

## CC BY-SA 4.0で提供する文書と図版

次のファイルを
[Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/)
（CC BY-SA 4.0）で提供します。

- `README.md`
- `MIGRATION.md`
- `docs/user-guides/**`
- `docs/dsl-author-guides/**`
- `docs/developer-guides/**`
- `docs/images/**`（`docs/LICENSE.md`に列挙した第三者図版を除く）
- `sources/**`

これらから生成される次の公開用HTML、PDF、画像および付随データにも、生成元と同じ
CC BY-SA 4.0を適用します。

- `dist/user-guides/**`
- `dist/dsl-author-guides/**`
- `dist/developer-guides/**`
- `output/pdf/user-guides/**`
- `output/pdf/dsl-author-guides/**`
- `output/pdf/developer-guides/**`

帰属表示などの詳細は[`docs/LICENSE.md`](docs/LICENSE.md)を参照してください。

## 明示的な利用許諾を付与しない体験会資料

次のファイルについては、Copyright © 2026 Hiroya Kubo. All rights reserved.とし、
明示的な利用許諾を付与しません。

- `docs/workshops/**`
- `dist/workshops/**`
- `output/pdf/workshops/**`

生成済みの体験会用HTML、PDF、画像および付随データも、生成元と同じ条件です。詳細は
[`docs/workshops/LICENSE.md`](docs/workshops/LICENSE.md)を参照してください。

## MPL-2.0で提供するソフトウェアと設定

本プロジェクトが著作権を持つ次のファイルを
[Mozilla Public License 2.0](LICENSES/MPL-2.0.txt)（MPL-2.0）で提供します。

- `.github/workflows/**`
- `.gitignore`
- `.prettierrc.json`
- `eslint.config.mjs`
- `package.json`
- `pnpm-lock.yaml`
- `tsconfig.json`
- `docs/config.mjs`
- `docs/vivliostyle.*.config.mjs`
- `docs/*.css`
- `scripts/**`
- `site/**`
- `test/**`

`dist/index.html`、`dist/site-shell.css`、`dist/site-shell.js`、`dist/favicon.png`および
`dist/build-info.json`は、それぞれ対応するMPL-2.0対象ファイルから生成または複製される
ため、MPL-2.0を適用します。

## 生成物、中間ファイル、第三者の素材

`dist/**`、`output/**`、`tmp/**`などの生成先へ移動または変換しても、生成元の
ライセンスや利用条件は変わりません。複数の生成元を含む場合は、それぞれの部分に
対応する条件が適用されます。

第三者のソフトウェア、フォント、画像、音声その他の素材には、それぞれの権利者が
定めたライセンスまたは利用条件が適用されます。個別のライセンス表示がある場合は、
この一覧より個別表示を優先します。依存パッケージはこの一覧の対象外であり、それぞれの
パッケージに含まれるライセンスに従います。

`LICENSE`、このファイル、`LICENSES/**`、`docs/LICENSE.md`および
`docs/workshops/LICENSE.md`は、適用条件を示すためのライセンス本文または通知文です。
