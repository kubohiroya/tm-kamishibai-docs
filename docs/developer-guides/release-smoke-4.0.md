# DSL 4.0 release smoke

Copyright © 2026 Hiroya Kubo. この文書は[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)で提供します。

文書状態: 検証済みリリース候補の再現・判定手順<br />
対象Issue: [tmpose-kamishibai-docs #47](https://github.com/kubohiroya/tmpose-kamishibai-docs/issues/47)

この手順は、DSL 4.0のリリース候補を、ソース、Schema、package、Standard SB3、作品SB3、Web版まで
checksum付きで一意に固定し、自動テストだけでは確認できないブラウザ経路を判定するためのものです。
DSL 3.xのrelease smokeとは別のpublication、別URLとして保守します。

2026年8月8日時点の固定実装を起点にしていますが、本書の結果は`v4.0.0`の正式リリースを意味しません。
タグ、GitHub Release、npm、production Pagesの公開状態は、公開元のリリース情報で別に確認してください。
本書だけで公開URLが利用可能だとは保証しません。

## この手順の読み進め方

1. 「候補を固定する」でmanifestとcheckoutが一致することを確認する
2. 「自動検証」でソース、CLI、SB3、Web版の決定性を確認する
3. 「ブラウザ経路」でPreviewとproduction成果物を端から端まで確認する
4. 「release-stop」で公開を止める条件を判定する
5. 「証跡」で個人情報を残さず結果を保存する

実装の責務を調べる場合は[ソフトウェアメンテナンスガイド](developer-guide-4.0.md)、診断と安全停止は
[DSL 4.0 台本診断・安全停止 設計レビュー](dsl-4.0-diagnostics-design.md)を参照します。台本の書き方や
Previewの一般的な使い方は[紙芝居DSL 4.0 台本作成ガイド](../dsl-author-guides/dsl-4.0-author-guide.md)へ
委譲し、本書では重複して説明しません。

## 候補を固定する

正本は`sources/dsl4/release-smoke-4.0-candidate.json`です。2026年8月12日の追試では次を固定しました。

| 対象                | 固定値                                                                               |
| ------------------- | ------------------------------------------------------------------------------------ |
| Runtime candidate   | `tmpose-kamishibai@28d98125573f3186530fba231ecda844752bb14f`                         |
| package version     | `4.0.0`                                                                              |
| release source      | `release-sources/4.0.0/app` / `dc8f65eb9f9b68d778ba3b4fd9da0926b42ff4e9`             |
| Schema SHA-256      | `287867c36feff4d3fd7a5b266ab4f27368dd25ca0edc5b8c400fcc64ad08f230`                   |
| Standard SB3        | 7,633,722 bytes / `ab8bfefab37620538db27e4846334723d567c64bf7972d8a962287feb2a72807` |
| npm tarball dry-run | 5,499,295 bytes / `19117725dc8fa291776087ea9250025a557f0a1db6174cab9d94c4bdf476d8b7` |
| Sample candidate    | `tmpose-kamishibai-samples@dc9f6626de9ef85ca71312402fd139082922b867`                 |
| Sample runtime      | `8ea06bfd100b106f559cb25a280fab5570e42919`                                           |
| Browser             | macOS 27.0 / Chrome 151.0.7922.137                                                   |

サンプルはリリース候補を端から端まで動かすfixtureです。Standard SB3の配布checksumをサンプルのchecksumで
代用しません。sample runtime以降に追加された変更はPreview／debugger中心であり、camera／poseのcore pathに
差分がないことを確認し、最新candidateでも自動capability smokeを再実行しています。camera／poseのcore pathが
変わった場合、この適用判断は無効になり、実カメラ・実ポーズを含む全手順を再実行します。

候補を取得します。

```bash
git clone https://github.com/kubohiroya/tmpose-kamishibai.git
git -C tmpose-kamishibai checkout --detach 28d98125573f3186530fba231ecda844752bb14f
git clone https://github.com/kubohiroya/tmpose-kamishibai-samples.git
git -C tmpose-kamishibai-samples checkout --detach dc9f6626de9ef85ca71312402fd139082922b867
```

`git status --short`が空で、`git rev-parse HEAD`がmanifestと一致することを先に確認します。branch名、`main`、
手元のpackage versionだけで候補を同定しません。

## Feature flagを記録する

DSL 4.0の実装flagはすべて既定OFFです。配布surfaceは起動時に次のsnapshotを明示します。

| Surface               | ONにするflag                                                                                   |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| Standard production   | `dsl4Runtime`、`dsl4AppShell`、`dsl4PoseFeedbackModes`、`dsl4SpeechAdvanceTypewriter`          |
| 非埋め込みdevelopment | Standard productionに加え、`dsl4WebPreviewAdapter`、`dsl4PreviewReloadOverlay`、`dsl4Debugger` |

`include`、asset live reload、camera control等を追加でONにする場合は、候補manifestへ対象、理由、依存、戻し方を
追記し、そのsurfaceだけでなくStandard productionへの混入がないことも再検査します。smoke中にflagの既定値を
変更しません。

## 自動検証

### Runtime、CLI、Standard SB3

```bash
cd tmpose-kamishibai
pnpm install --frozen-lockfile
pnpm verify:full
pnpm release:check
shasum -a 256 dist/downloads/kamishibai-4.0.sb3
npm pack --silent --ignore-scripts
shasum -a 256 kubohiroya-tmpose-kamishibai-4.0.0.tgz
```

2026年8月12日の結果は、full test 1,148件、実Chromium 57件、site build、package smoke、npm publish
dry-runが成功し、Standard SB3とtarballのsize／SHA-256がmanifestと一致しました。`npm publish`は実行しません。

### 作品SB3とWeb版

Sample側の固定runtime commitを別checkoutとして用意し、その絶対pathを渡します。

```bash
cd tmpose-kamishibai-samples
pnpm install --frozen-lockfile
TMPOSE_KAMISHIBAI_DSL4_ROOT=/absolute/path/to/tmpose-kamishibai-8ea06bf pnpm test
TMPOSE_KAMISHIBAI_DSL4_ROOT=/absolute/path/to/tmpose-kamishibai-8ea06bf pnpm build
pnpm test:web
pnpm verify
```

結果はunit 22件、111公開file、48 source asset、DSL 3.2回帰、DSL 4.0埋め込み浦島太郎Web版、
外部YAMLを選ぶmy-urashima Web版が成功しました。次の一致を必須とします。

| 成果物              | SHA-256                                                            |
| ------------------- | ------------------------------------------------------------------ |
| 浦島太郎4.0 SB3     | `a198352ed1785261fe41ba1b0333914664ca33434da1a9bf3ba9dc56ba81de1a` |
| 浦島太郎4.0 Web     | `6a458145f63df77a80258c5ec2956f0608a1b7e2cedd290db0267e1328dc5ae1` |
| my-urashima 4.0 SB3 | `e4e7fe7d9c525ef2f50a438785879e93e00468b8a9e5bd1677a6ec1a14f8359c` |
| my-urashima 4.0 Web | `eeb01e05fdbc8df6d850a8e817d43cfb405b7ca90ab419c5ff18ae01f981f64e` |

## ValidateとBuildを確認する

候補packageのCLIで同じprojectを検証し、2回buildしたSB3が同一になることを確認します。

```bash
pnpm exec tmpose-kamishibai validate-dsl4 \
  --project-root stories/urashima \
  --source-manifest stories/urashima/project.source.json \
  --max-source-bytes 262144 \
  --max-asset-file-bytes 8388608 \
  --max-asset-files 128 \
  --max-total-asset-bytes 67108864

pnpm update:dsl4-artifacts
git diff --exit-code -- stories/urashima/dsl4-artifacts.lock.json \
  stories/urashima/dsl4-web-artifacts.lock.json
```

`valid`以外、lock差分、出力hash差分、入力上限の欠落はrelease-stopです。失敗時に既存lockを書き換えて
通過扱いにせず、候補sourceまたはbuilderの不一致として調査します。

## Browser Previewを確認する

Browser-owned Previewでは、Chromeのuser gestureからproject directoryを選びます。

1. fresh profileまたは検証専用sessionで候補を開く
2. project rootと`.k4.yml`を選択し、最初の有効generationが開始することを確認する
3. YAMLの表示文だけを変更し、既存実行を壊さず自動反映されることを確認する
4. 不正YAMLへ変更し、現在のgenerationが維持され、診断にcodeとsource位置が出ることを確認する
5. 正常YAMLへ戻し、回復後のgenerationが一度だけ開始することを確認する
6. asset追加、内容変更、削除を区別し、full rebuild要求時はreleaseを止める
7. Reload UI、camera control、pose feedbackが重ならず、keyboard focusが失われないことを確認する

source本文、local absolute path、session token、file handle、camera device IDをログやSB3へ保存しません。

## CLI Previewを確認する

```bash
pnpm exec tmpose-kamishibai preview-dsl4 --watch \
  --base stories/urashima/base/kamishibai-4.0.sb3 \
  --project-root stories/urashima \
  --source-manifest stories/urashima/project.source.json \
  --control-profile production \
  --channel bundled \
  --max-source-bytes 262144 \
  --max-asset-file-bytes 8388608 \
  --max-asset-files 128 \
  --max-total-asset-bytes 67108864
```

CLIが表示するtoken付きloopback URLだけをChromeで開きます。runtime-ready、source／asset変更、診断、
safe stop、Ctrl+C後のsocket／watcher／timer解放を確認します。loopback以外へbindした場合、tokenがURLやログから
再利用できる場合、root外fileを読める場合はrelease-stopです。

## Production SB3とWeb版を確認する

`file:` URLではcamera権限とorigin境界を正しく確認できないため、生成した`dist/`をlocalhostから配信します。

```bash
python3 -m http.server 4173 --directory dist
```

fresh Chrome sessionで浦島太郎4.0 Web版を開き、次を端から端まで確認します。

1. titleを閉じ、Loadingが終了して最初のsceneへ進む
2. keyとstage touchがcontrol profileどおり受理される
3. 組み込み画像・音声・pose modelが外部依存なしで準備される
4. camera許可、preview、認識feedback、対象pose成立、次sceneへの遷移が成功する
5. camera拒否、model不成立、asset失敗を再現した場合、安定した診断と安全停止になる
6. 終了時にfinished状態となり、再実行でtitle／menuまたは定義済み開始位置へ戻る
7. 終了、停止、tab closeの前にcamera track、音声、timer、watcher、cache leaseが解放される

my-urashimaではtitleからmenuへ進み、`.k4.yml`のfile選択とdrag-and-dropをそれぞれ確認します。外部sourceを
選ばない状態で勝手に物語を開始した場合、選択したroot外を読んだ場合、sourceをSB3へ永続化した場合は失敗です。

## 実カメラ・実ポーズの証跡

上流の[実Chrome・実カメラ手順](https://github.com/kubohiroya/tmpose-kamishibai/blob/28d98125573f3186530fba231ecda844752bb14f/docs/design/dsl-4-physical-camera-smoke.md)に沿った確認は、
[Issue #510の完了記録](https://github.com/kubohiroya/tmpose-kamishibai/issues/510#issuecomment-5255177777)で
2026年8月12日にユーザー検証済みです。実カメラ、実ポーズ認識、full-stage preview、認識終了後の表示、
camera lifecycleを完了条件へ含めます。camera frameは保存せず、device labelと最初のfeedback時間は完了記録に
保持されていないため、次回実行時に個人を識別しない測定値として補います。

実カメラ確認を自動camera stubで代替しません。一方、同じ物理確認を毎回撮影して保存することも求めません。
候補のcamera／pose core path、TMPose、PoseNet、permissionまたはCSPが変わった場合だけ、本人の同意を得た環境で
再実行します。

## 診断と安全停止

少なくとも次の失敗を、候補の正式な診断surfaceで確認します。

| 失敗               | 成功条件                                                   |
| ------------------ | ---------------------------------------------------------- |
| YAML／Schema不正   | source位置付き診断を表示し、現在の有効generationを維持する |
| asset欠落／改竄    | 部分commitせず、取得済みresourceを解放する                 |
| camera拒否         | 診断を表示し、入力待ち、preview、trackを残さない           |
| pose model不成立   | timeout／cancelで安全停止し、次の実行へ状態を持ち越さない  |
| runtime例外        | 新規入力を止め、action、音、camera、asset leaseを解放する  |
| browser disconnect | candidateを破棄し、再接続時は新sessionとして開始する       |

Console messageだけで成功・失敗を判断せず、画面の診断、runtime state、resource解放を合わせて確認します。

## Release-stop条件

次のいずれか一つでも発生したら公開を止めます。

- commit、version、Schema、source lock、flag snapshot、artifact hashの不一致
- 同じ入力から生成したSB3またはWeb版の非決定性
- Browser Preview、CLI Preview、Production SB3、Web版の診断または挙動差
- title、Loading、input、asset、camera、pose、finished、再実行の主要経路失敗
- camera拒否、asset失敗、無効source、runtime例外での部分commitまたはresource残留
- production成果物へのpreview token、debug session、local path、file handleの混入
- 外部PoseNet取得、許可していないnetwork request、CSP緩和
- Console error、page error、終了後のcamera track／sound／timer／watcher／cache lease残留

release-stopを回避するためにchecksum、lock、CSP、feature flagをその場で書き換えません。修正を別commitへ保存し、
新しいcandidate IDで最初から再実行します。

## 証跡を保存する

実行ごとに次を`tmp/release-smoke-4.0/`へ生成します。

```text
tmp/release-smoke-4.0/
├── candidate-manifest.json
├── results.json
├── commands.log
├── browser-console.log
└── network-summary.json
```

`results.json`には各項目の`pass`／`fail`、開始・終了時刻、candidate ID、browser／OS、診断code、証跡URLを
記録します。camera frame、人物画像、音声、device ID、local absolute path、token、source本文は保存しません。
release PRまたはIssueには、保存期間を定めたCI artifact URLとSHA-256、または個人情報を除いた要約だけを残します。

## 再実行条件

次の変更では全smokeを再実行します。

- runtime candidate、release source、Schema、package、Standard SB3の変更
- sample commit、base SB3、台本、asset、Packager設定の変更
- feature flag snapshotまたはcontrol profileの変更
- camera、pose、TMPose、PoseNet、permission、CSP、resource cleanup pathの変更
- browser major version、対応OS、TurboWarp／Packager versionの変更
- 一度でもrelease-stopとなったcandidateの修正

文章、表記、リンクだけの文書修正は、publication buildとリンク検証を再実行し、artifact smokeを省略できます。

## Rollback

公開前はcandidateを破棄し、`3.2.3`を推奨downloadとして維持します。4.0のtag、npm package、GitHub Release、
Pagesを部分的に公開しません。

公開後は同じversionのartifactを差し替えません。必要に応じてnpm deprecate、GitHub Releaseへの注意追記、
`3.2.3` downloadの復元を行い、修正版を`4.0.1`以降として全smokeへ通します。文書だけを戻す場合は、本書、
candidate manifest、`docs/config.mjs`のpublication、`site/4.0/index.html`のカード、対応testだけをrevertします。

## 2026年8月12日の結果

| 項目               | 結果                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------- |
| candidate固定      | pass — runtime、Schema、release source、package、SB3、Webをmanifest化                   |
| Runtime／CLI       | pass — 1,148 test、57 Chromium test、package smoke                                      |
| Standard SB3       | pass — 7,633,722 bytes、SHA-256一致                                                     |
| 作品SB3／Web       | pass — 22 test、111公開file、4成果物のlock一致                                          |
| 実カメラ／実ポーズ | pass — 上流#510のユーザー検証済み記録を参照                                             |
| privacy            | pass — camera frame、device ID、source本文、local pathを保存しない                      |
| publication        | pass — `pnpm check`で94 test、26 publication、105 HTML、2 PDFを検証。生成HTMLも目視確認 |

正式公開時は、この結果を無期限に流用せず、正式tag、npm integrity、release asset URL、Pages URLをmanifestへ
追加し、変更された範囲のsmokeを再実行します。
