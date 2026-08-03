# TMPose紙芝居ドキュメント

このリポジトリは、[TMPose紙芝居](https://github.com/kubohiroya/tmpose-kamishibai)の
一般文書、紙芝居DSL作成者向け文書、開発者向け文書、体験会資料を管理し、
独立したGitHub Pagesとして公開するためのリポジトリです。

文書sourceは`tmpose-kamishibai` PR #238のmerge commit
`8166edb3a8b7ed360685bdcd6534c000054105bd`から履歴付きで移設しています。
同commitで`docs/design/`、`docs/development/`に残っていた開発者向け3文書も、
読者別ディレクトリへ追加移設しています。文書の表示順は`docs/config.mjs`で管理し、
ファイル名には旧来の番号接頭辞を付けません。

## 公開サイトの役割

- `tmpose-kamishibai`: アプリ本体と、アプリ・文書・サンプルへ移動する公開入口
- `tmpose-kamishibai-docs`: 文書のHTML、Vivliostyle Viewer、PDF
- `tmpose-kamishibai-samples`: サンプル台本と実行可能な作品

公開入口は `https://kubohiroya.github.io/tmpose-kamishibai/` に固定します。
このリポジトリのPagesは `https://kubohiroya.github.io/tmpose-kamishibai-docs/` を予定しています。

## 文書の分類

移設元の`docs/general/`をそのまま再現せず、読者と用途により次のように分割します。

| ディレクトリ              | 対象読者                                |
| ------------------------- | --------------------------------------- |
| `docs/user-guides/`       | 一般利用者、保護者、教員、体験参加者    |
| `docs/dsl-author-guides/` | 紙芝居DSLで作品を作成・移行する人       |
| `docs/developer-guides/`  | アプリ、SB3、機能拡張を保守・開発する人 |
| `docs/workshops/`         | 体験会の参加者、スタッフ、運営者        |

具体的なファイル対応、依存境界、実施記録は[MIGRATION.md](MIGRATION.md)を参照してください。

## 開発

Node.js 22.12.0以降とpnpm 11を使用します。

```bash
pnpm install
pnpm check
```

`pnpm build`は、各文書のWeb PublicationとPDFを`dist/`へ、確認用PDFを
`output/pdf/`へ生成します。移設元の固定情報と機能拡張一覧は
[`sources/tmpose-kamishibai.json`](sources/tmpose-kamishibai.json)で管理します。

準備は[Issue #1](https://github.com/kubohiroya/tmpose-kamishibai-docs/issues/1)、
本文移設は[Issue #3](https://github.com/kubohiroya/tmpose-kamishibai-docs/issues/3)、
残存文書と生成機構の移設は[Issue #5](https://github.com/kubohiroya/tmpose-kamishibai-docs/issues/5)で管理します。

## ライセンス

- 一般・DSL作成者・開発者向け文書と共有画像: CC BY-SA 4.0
- 体験会資料: Copyright © 2026 Hiroya Kubo. All rights reserved.
- build scriptなど、個別表示のないsoftware: MPL-2.0

詳細は[LICENSES.md](LICENSES.md)を参照してください。
