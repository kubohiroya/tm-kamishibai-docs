import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read = (filename) =>
  readFileSync(new URL(`../docs/turbowarp-programmer-guides/${filename}`, import.meta.url), 'utf8');

const broadcastGuide = read('dsl-4.0-turbowarp-broadcast-guide.md');
const blockReference = read('dsl-4.0-runtime-block-reference.md');

const publicOpcodes = {
  runtime: [
    'stage',
    'bgm',
    'sound',
    'wait',
    'debugger',
    'broadcastMessageAndWait',
    'transition',
    'goto',
    'branch',
    'keyInputToChangeScene',
    'touchInputToChangeScene',
    'poseInputToChangeScene',
    'show',
    'hide',
    'setTransparency',
    'moveTo',
    'say',
    'think',
    'setSkin',
    'setLayer',
    'loop',
    'setText',
    'pose',
  ],
  assetManager: [
    'registerAsset',
    'assetErrorType',
    'assetErrorLabel',
    'deleteMemoryAsset',
    'deleteAllMemoryAssets',
    'deleteCachedAsset',
    'deleteAllCachedAssets',
    'isLoaded',
    'setTextValue',
    'setTextStyle',
    'setThisSpriteSkin',
    'setSpriteSkin',
    'startActorLoop',
    'startActorSequence',
    'stopActorAnimation',
    'finishAllActorSequences',
    'setStageSkin',
    'playSound',
    'playSoundUntilDone',
    'stopSound',
    'stopAllSounds',
    'getAssetMimeType',
    'getVersion',
  ],
  asyncInput: [
    'listenForKey',
    'listenForKeyAndBroadcast',
    'stopListeningForKey',
    'stopAllKeyListeners',
    'listenForTouch',
    'listenForTouchAndBroadcast',
    'stopListeningForTouch',
    'listenForPose',
    'stopListeningForPose',
    'stopAllPoseListeners',
    'stopAllInputListeners',
  ],
  bubble: [
    'defineBubbleStyle',
    'setBubblePlacement',
    'setPortraitBase',
    'setPortraitLayout',
    'setBubbleDistance',
    'setBubbleVisualStyle',
    'setBubbleTailLength',
    'setBubbleOffset',
    'setBlinkFrames',
    'setLipSyncFrames',
    'setContinueFrames',
    'setBubbleReveal',
    'setBubbleWordDelimiters',
    'setBubbleRevealSound',
    'setBubbleVoice',
    'finishBubbleReveal',
    'setBubbleShowAnimation',
    'setBubbleHideAnimation',
    'animateBubble',
    'shakeBubble',
    'explodeBubble',
    'animateBubbleShape',
    'sayWithBubbleStyle',
    'thinkWithBubbleStyle',
    'setBubbleAnimationMode',
    'waitForBubbleContinue',
    'closeBubble',
    'getVersion',
  ],
  runtimeExpression: [
    'runtimeCondition',
    'registerConditionalBroadcast',
    'unregisterConditionalBroadcast',
  ],
  svgText: ['defineStyle', 'setText'],
  tmpose: [
    'versionReporter',
    'setModelURL',
    'startCamera',
    'stopCamera',
    'isCameraRunning',
    'refreshCameraList',
    'setCameraSelection',
    'cameraCountReporter',
    'cameraDeviceIdReporter',
    'cameraDeviceNameReporter',
    'showPreview',
    'hidePreview',
    'isPreviewVisible',
    'setPreviewOpacity',
    'setPreviewPosition',
    'setPreviewMirroring',
    'previewMirroringReporter',
    'loadModel',
    'isModelLoaded',
    'startPredict',
    'stopPredict',
    'isPredicting',
    'currentPoseReporter',
    'scoreReporter',
    'poseScoreReporter',
    'isPose',
    'isPoseWithThreshold',
    'cameraMsReporter',
    'modelLoadMsReporter',
    'firstPredictMsReporter',
    'lastErrorReporter',
  ],
};

test('explains exact broadcast-and-wait behavior from YAML through TurboWarp receivers', () => {
  for (const term of [
    'broadcastMessageAndWait',
    'メッセージを受け取ったとき',
    'すべての受信scriptが終了',
    '大文字・小文字',
    'clone',
    '有限時間',
    'キャンセル',
    '直ちに完了',
  ]) {
    assert.match(broadcastGuide, new RegExp(term, 'u'));
  }
});

test('lists every public bundled block and member documentation URI', () => {
  const allOpcodes = Object.values(publicOpcodes).flat();
  assert.equal(allOpcodes.length, 121);
  for (const opcode of new Set(allOpcodes)) {
    assert.ok(blockReference.includes('`' + opcode + '`'), `missing opcode ${opcode}`);
  }
  for (const slug of [
    'turbowarp-asset-manager',
    'turbowarp-async-input',
    'turbowarp-bubble',
    'turbowarp-runtime-expression',
    'turbowarp-svg-text',
    'turbowarp-tmpose',
  ]) {
    assert.match(blockReference, new RegExp(`https://kubohiroya\\.github\\.io/${slug}/`, 'u'));
  }
  assert.match(blockReference, /121ブロック/u);
  assert.match(blockReference, /Open Documentation/u);
});

test('distinguishes feature-gated and host-only APIs from palette blocks', () => {
  assert.match(blockReference, /temporalPoseScoring`が既定OFF/u);
  assert.match(blockReference, /latest-needed/u);
  assert.match(blockReference, /Composition API/u);
  assert.match(blockReference, /パレットには表示されません/u);
});
