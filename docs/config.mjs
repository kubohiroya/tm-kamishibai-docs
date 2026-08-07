export const documentCollections = [
  {
    id: 'user-guides',
    title: '一般向けドキュメント',
    documents: [
      {
        sourceFilename: 'executive-summary-adult.md',
        title: '紙芝居アプリ 概要説明書 大人向け',
        audience: '保護者・教員・運営者',
        description: 'アプリの価値、仕組み、利用場面、教育的な意義を簡潔にまとめています。',
      },
      {
        sourceFilename: 'executive-summary-kids.md',
        title: '紙芝居アプリ 概要説明書 子供向け',
        audience: '子供・初めての方',
        description: '紙芝居でできることや安全な使い方を、やさしい言葉で紹介します。',
        addFurigana: true,
      },
      {
        sourceFilename: 'user-guide.md',
        title: '紙芝居アプリ 操作説明書',
        audience: 'アプリを使う方',
        description: '台本の読み込み、再生、ポーズ認識、本番前の確認方法を説明します。',
      },
    ],
  },
  {
    id: 'dsl-3.2-guides',
    title: '紙芝居DSL 3.2 公式ドキュメント',
    documents: [
      {
        sourceFilename: 'dsl-manual.md',
        sourceDirectory: 'dsl-author-guides',
        outputDirectory: 'dsl-author-guides',
        title: '紙芝居DSL 3.2 ファイル作成マニュアル',
        audience: 'DSL 3.2の作品を作る方',
        description:
          '3.1／3.2宣言の互換性、3.2台本の設計、旧Text Assetの互換期間、SVG Textへの移行を含む作成・テスト手順を説明します。',
      },
      {
        sourceFilename: 'command-reference.md',
        sourceDirectory: 'dsl-author-guides',
        outputDirectory: 'dsl-author-guides',
        title: '紙芝居DSL 3.2 コマンドリファレンス',
        audience: 'DSL 3.2の台本文法を調べる方',
        description:
          '過去リリースから引き継いだ手書きMarkdownで、3.2.xが受理する3.1／3.2宣言、コマンド、アクション、Text Asset互換仕様、注意事項を保守しています。',
      },
      {
        sourceFilename: 'history.md',
        sourceDirectory: 'dsl-author-guides',
        outputDirectory: 'dsl-author-guides',
        title: '紙芝居DSL 2.0から3.2への変更履歴',
        audience: '2.0から移行する方',
        description:
          '2.0から3.1の累積差分と、3.2.xの宣言互換性、旧Text Asset互換期間、SVG Textへの段階移行をまとめています。',
      },
    ],
  },
  {
    id: 'dsl-4.0-guides',
    title: '紙芝居DSL 4.0 公式ドキュメント',
    documents: [
      {
        sourceFilename: 'dsl-4.0-author-guide.md',
        sourceDirectory: 'dsl-author-guides',
        outputDirectory: 'dsl-author-guides',
        title: '紙芝居DSL 4.0 台本作成ガイド',
        audience: 'DSL 4.0の作品を作る方',
        description:
          '完成したDSL 4.0について、Source Graph、project配置、live reload、camera preview、speech、透明度、分岐、診断を説明します。',
      },
      {
        sourceFilename: 'dsl-4.0-schema-reference.md',
        sourceDirectory: 'dsl-author-guides',
        outputDirectory: 'dsl-author-guides',
        title: '紙芝居DSL 4.0 Schemaリファレンス',
        audience: 'DSL 4.0のSchemaを確認する方',
        description:
          '完成commitの規範JSON Schemaから、camera preview、speech、think、moveTo easing、setTransparencyを含む型と制約を生成しています。',
      },
    ],
  },
  {
    id: 'developer-guides',
    title: '開発者向けドキュメント',
    documents: [
      {
        sourceFilename: 'application-materials-guide.md',
        outputDirectory: 'user-guides',
        title: 'TMPose紙芝居 3.2 アプリ・教材・ツールチェインガイド',
        audience: 'DSL 3.2のアプリ、教材、ツールチェインを把握する方',
        description:
          'DSL 3.2系列のアプリ、浦島太郎、体験会教材、台本、sb3-toolchainを図解付き・全8ページで紹介します。',
      },
      {
        sourceFilename: 'application-materials-guide-4.0.md',
        title: 'TMPose紙芝居 4.0 アプリ・教材・ツールチェインガイド',
        audience: 'DSL 4.0のアプリ、教材、ツールチェインを把握する方',
        description:
          'DSL 4.0系列のproject、Source Graph、体験教材の構成、YAML台本、preview、buildを図解付き・全8ページで紹介します。',
      },
      {
        sourceFilename: 'developer-guide.md',
        title: '紙芝居アプリ ソフトウェアメンテナンスガイド',
        audience: 'ソフトウェア開発者',
        description:
          '成果物とビルダーの利用、アプリ本体、SB3、ドキュメントの変更、検証、公開手順を案内します。',
      },
      {
        sourceFilename: 'internal-specification.md',
        title: '紙芝居アプリ内部仕様書',
        audience: 'アプリの実装を調査・変更する方',
        description:
          '現行の汎用アプリSB3におけるtarget、変数、block、message、呼出し関係、状態遷移を記録します。',
      },
      {
        sourceFilename: 'extension-guide.md',
        title: 'TMPose紙芝居 機能拡張ガイド',
        audience: 'アプリの依存機能を調査・変更する方',
        description:
          '16個の依存機能拡張を1拡張2ページで図解し、sb3-toolchainによるbundle構成も説明する全34ページのガイドです。',
      },
      {
        sourceFilename: 'dsl-3.1-diagnostics-design.md',
        title: 'DSL 3.1 台本診断・安全停止 設計レビュー',
        audience: '台本診断と安全停止を保守する方',
        description:
          'DSL 3.1の限定preflight、診断データモデル、機能拡張との境界、安全停止の設計判断を記録します。',
      },
      {
        sourceFilename: 'dependency-audit.md',
        title: '依存関係監査記録',
        audience: '依存更新とsecurity overrideを保守する方',
        description:
          '2026年8月に実施したアプリ本体の依存更新、脆弱性監査、overrideの理由と解除条件を記録します。',
      },
      {
        sourceFilename: 'release-smoke.md',
        title: 'DSL 3.1 release smoke',
        audience: 'リリース候補をブラウザで検証する方',
        description:
          'Scratch VMテストでは確認できないEditor、カメラ、TMPose、Packagerのrelease smoke手順をまとめます。',
      },
    ],
  },
];

export const documentationConfig = {
  title: 'TMPose紙芝居 ドキュメント',
  author: 'Hiroya Kubo',
  tocSectionDepth: 3,
  standaloneArticleHtmlFilename: 'document.html',
  standaloneTocHtmlFilename: 'index.html',
  collections: documentCollections,
  documents: documentCollections.flatMap((collection) =>
    collection.documents.map((document) => ({
      ...document,
      collectionId: collection.id,
      sourceDirectory: document.sourceDirectory ?? collection.id,
      outputDirectory: document.outputDirectory ?? collection.id,
    })),
  ),
};

export const workshopDocumentConfig = {
  title: 'AIを使って「紙芝居の物語に参加する仕組み」を作ろう！',
  author: 'Hiroya Kubo',
  sourceDirectory: 'workshops/2026-08-01',
  outputDirectory: 'workshops/2026-08-01',
  learnedThroughGrade: 3,
  coverFilename: 'tmpose-kamishibai-cover-20260801.md',
  coverHtmlFilename: 'index.html',
  sourceFilename: 'tmpose-kamishibai-20260801.md',
  tocHtmlFilename: 'toc.html',
  pdfFilename: 'tmpose-kamishibai-20260801.pdf',
  tocSectionDepth: 3,
  rubyOverrides: [
    '久保裕也:裕也:ひろや',
    '竜宮城:りゅうぐうじょう',
    '玉手箱:たまてばこ',
    '浦島太郎:うらしまたろう',
    '未習漢字:みしゅうかんじ',
  ],
};

export const staffDocumentConfig = {
  title: '親子AIプログラミング体験会スタッフ向け資料2026年8月1日版',
  author: 'Hiroya Kubo',
  sourceDirectory: 'workshops/2026-08-01',
  outputDirectory: 'workshops/2026-08-01/staff',
  sourceFilename: 'tmpose-kamishibai-staff-20260801.md',
  htmlFilename: 'index.html',
  pdfFilename: 'tmpose-kamishibai-staff-20260801.pdf',
};

export function findDocument(sourceFilename) {
  return documentationConfig.documents.find(
    (document) => document.sourceFilename === sourceFilename,
  );
}

export function resolveLearnedThroughGrade(value = process.env.RUBYGANA_GRADE) {
  const grade =
    value === undefined || value === ''
      ? workshopDocumentConfig.learnedThroughGrade
      : Number(value);

  if (!Number.isInteger(grade) || grade < 1 || grade > 6) {
    throw new RangeError('RUBYGANA_GRADE must be an integer from 1 through 6.');
  }

  return grade;
}
