# TMPose紙芝居ドキュメント

このリポジトリは、[TMPose紙芝居](https://github.com/kubohiroya/tmpose-kamishibai)の
一般文書、紙芝居DSL作成者向け文書、開発者向け文書、体験会資料を管理し、
独立したGitHub Pagesとして公開するためのリポジトリです。

現在は移設準備中です。文書本文、画像、Vivliostyle設定、生成物はまだ移設していません。
移設元で進行中の文書作成が完了し、採用するcommitが確定するまで、Pagesの公開も開始しません。

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

具体的なファイル対応、依存境界、実施条件は[MIGRATION.md](MIGRATION.md)を参照してください。

## 現在の制約

- 文書本文をこのリポジトリへcopyまたは移動しない
- 移設元の文書や公開Pagesを変更しない
- 移設元として採用するcommitが決まるまでbuild設定を確定しない
- Pagesを有効化しない

準備作業は[tmpose-kamishibai-docs Issue #1](https://github.com/kubohiroya/tmpose-kamishibai-docs/issues/1)で管理します。
