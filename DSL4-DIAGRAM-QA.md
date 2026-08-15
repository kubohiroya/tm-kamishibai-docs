# DSL 4.0 概念図・フラグメントQA記録

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

最終確認日: 2026年8月15日

## 自動検証

| 対象         | 条件                     | 結果                                                                                    |
| ------------ | ------------------------ | --------------------------------------------------------------------------------------- |
| 通常HTML     | 33出版物、136 HTML       | 全出版物を生成し、図をraw MermaidコードにせずHTMLの`figure`として出力                   |
| フラグメント | 生成後の全ローカル`href` | リンク先HTMLと`id`の実在を検査。見つかった文書間リンクの問題を`document.html#...`へ修正 |
| 図の構造     | 7個の`concept-flow`      | `figcaption`、3個以上の段階、`aria-hidden="true"`の矢印、本文注記を確認                 |
| 図の向き     | すべての画面幅           | ノードを常に縦方向へ接続し、各ノード間の矢印を下向きに表示                              |
| 狭い画面     | 320×568px                | 7図すべてで段階順、矢印、ノード内文字が図の幅に収まることを確認                         |
| 通常幅       | 1280×800px               | 7段の内部仕様図を含め、文字と矢印が重ならず縦方向に並ぶことを確認                       |
| 印刷         | `@media print`           | `break-inside: avoid-page`、縮小した間隔・文字寸法を確認                                |
| rc.5実装図   | 7個のSVG                 | `title`、`desc`、`role="img"`、`aria-labelledby`、本文キャプションを確認                |

## 目視確認

### Vivliostyle印刷

- 環境: Vivliostyle CLI 11.1.0、Vivliostyle.js 2.44.1、Chrome 150
- 用紙: A4
- 対象: 「紙芝居アプリ 4.0 内部仕様書」22ページ中4ページ
- 結果: 7段の縦方向図全体、キャプション、6本の下向き矢印、本文注記が同じページに収まった
- 結果: 図を途中で分割せず次ページの先頭へ送り、文字の切れ、横方向のはみ出し、矢印の孤立はなかった
- 対象: 「紙芝居アプリ 4.0 概要説明書 子供向け」7ページ中6ページ
- 結果: 安全停止の5段図、キャプション、4本の下向き矢印、注意書きが同じページに収まり、後続本文も欠落しなかった

### ブラウザー表示

- 環境: ローカルHTTP、Codex In-app Browser
- viewport: 320×568px、1280×800px
- 対象: 7個の`concept-flow`
- 結果: すべての幅でノードを縦方向へ接続し、矢印をノード間の中央へ下向きに配置した
- 結果: 7段の内部仕様図を含め、ノード内文字のはみ出し、文字と矢印の重なり、図自体の横overflowはなかった

## rc.5実装解析図の確認

2026年8月15日に、固定実装commit `f323a54`を根拠として追加した次の7図を確認しました。

- `dsl4-architecture.svg`
- `dsl4-source-build-sequence.svg`
- `dsl4-runtime-state-transition.svg`
- `dsl4-runtime-sequence.svg`
- `dsl4-live-reload-state-transition.svg`
- `dsl4-live-reload-sequence.svg`
- `dsl4-asset-reload-sequence.svg`

### ブラウザー表示

- 環境: ローカルHTTP、Codex In-app Browser、1280×720px
- 対象: 生成済み「紙芝居アプリ 4.0 内部仕様書」の7個のSVG
- 結果: 7図すべてで画像を読み込み、natural sizeを取得できた
- 結果: すべて本文幅へ収まり、ページ全体にも横overflowはなかった
- 結果: アーキテクチャ図、source build、runtime、live reload、asset transactionの文字、線、キャプションに欠落や重なりはなかった

### Vivliostyle印刷

- 環境: Vivliostyle CLI 11.1.0、Vivliostyle.js 2.44.1、Chrome 150
- 用紙: A4
- 対象: 「紙芝居アプリ 4.0 内部仕様書」27ページ
- 確認ページ: 3、8、13、15、19〜23ページ
- 結果: 7図を実寸レンダリングし、図本体、線、ラベル、キャプションに切れや横方向のはみ出しはなかった
- 結果: source build、runtime実行、source live reload、asset transactionの各sequenceは一つのページ内に収まった
- 結果: `RuntimeStatus`と`LiveReloadSession.status`の比較表、代表的な同時状態の表は行分割や文字切れなく収まった
- 注記: 印刷用の一時PDFでは対話用`site-shell.js`を読み込まなかったが、本文・SVG・印刷CSSの組版結果には影響しなかった

## Mermaidの扱い

現在の出版工程はMermaidコードブロックを図へ変換しません。短い直線的な流れはsemantic HTMLと
`.concept-flow`を標準とし、分岐、循環、複数経路でMermaidが必要な場合は、公開前にレンダラー、印刷、
読み上げ、JavaScript無効時の代替表現を同じ変更で導入します。raw Mermaidコードは公開しません。
