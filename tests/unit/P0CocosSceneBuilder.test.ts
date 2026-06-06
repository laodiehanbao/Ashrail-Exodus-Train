import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';

import { buildP0CocosScene } from '../../src/tools/p0CocosSceneBuilder.js';
import { P0_CONFIG_ASSET_PATHS } from '../../src/tools/p0CocosScene.constants.js';
import type { SceneObject, UiLayoutConfig, UiNodeBindingConfig } from '../../src/tools/cocosSceneSerialization.types.js';
import type { AudioCueConfig } from '../../src/shared/audio/AudioCue.types.js';
import type { UiVisualAssetSetConfig } from '../../src/shared/ui/P0Ui.types.js';
import { assert, assertEqual, runTest } from './testHarness.js';

const SCENE_BUILDER_TEST_ROOT = resolve('.tmp/tests/p0-cocos-scene-builder');

export async function testP0CocosSceneBuilder(): Promise<void> {
  await runTest('P0 Cocos scene builder writes readable editor layout and hides list templates', () => {
    const creatorRoot = createFakeCreatorRoot();
    try {
      const bindings = readJson<UiNodeBindingConfig>('configs/ui/P0UiNodeBindings.json');
      const layout = readJson<UiLayoutConfig>('configs/ui/P0UiLayout.json');
      const visualAssets = readJson<UiVisualAssetSetConfig>('configs/ui/P0VisualAssets.json');
      const audioCues = readJson<AudioCueConfig[]>('configs/audio/AudioCues.json');
      const scene = buildP0CocosScene(creatorRoot, bindings, layout, visualAssets, audioCues);

      assertEqual(findNode(scene.objects, scene.nodeIdsByPath, 'Canvas/P0/MainHud/TopStatus')._lpos.x, 360, 'top status panel x should come from UI layout');
      assertEqual(findNode(scene.objects, scene.nodeIdsByPath, 'Canvas/P0/MainHud/TopStatus')._lpos.y, -114, 'top status panel y should come from UI layout');
      assertEqual(findNode(scene.objects, scene.nodeIdsByPath, 'Canvas/P0/LootBox')._lpos.y, -1440, 'secondary screens should be vertically offset for editor readability');
      assertEqual(
        getSpriteFrameAssetIds(scene.objects).includes('tex_bg_stage_wasteland_rail_001'),
        true,
        'asset registry should include configured background sprite frames',
      );
      assert(
        getNodeSpriteFrame(scene.objects, scene.nodeIdsByPath, 'Canvas/P0/MainHud/Frame')?.__uuid__,
        'main HUD frame should have an editor-visible background sprite frame',
      );
      assertEqual(
        getAudioClipCueIds(scene.objects).includes('sfx_ui_tap_metal_001'),
        true,
        'asset registry should include configured audio clips',
      );

      const templatePaths = bindings.screens.flatMap((screen) => screen.bindings.flatMap((binding) => binding.itemTemplatePath ?? []));
      assert(templatePaths.length > 0, 'manifest should declare list templates');
      for (const path of templatePaths) {
        assertEqual(findNode(scene.objects, scene.nodeIdsByPath, path)._active, false, `${path} should be hidden until runtime list render`);
      }

      assert(
        Array.from(scene.nodeIdsByPath.keys()).every((path) => scene.nodeIdsByPath.get(path) !== undefined),
        'generated scene should keep stable node paths',
      );
    } finally {
      rmSync(creatorRoot, { recursive: true, force: true });
    }
  });
}

function createFakeCreatorRoot(): string {
  rmSync(SCENE_BUILDER_TEST_ROOT, { recursive: true, force: true });
  mkdirSync(resolve(SCENE_BUILDER_TEST_ROOT, 'assets'), { recursive: true });
  mkdirSync(resolve(SCENE_BUILDER_TEST_ROOT, 'settings'), { recursive: true });
  for (const assetPath of P0_CONFIG_ASSET_PATHS) {
    const metaPath = resolve(SCENE_BUILDER_TEST_ROOT, `${assetPath}.meta`);
    mkdirSync(dirname(metaPath), { recursive: true });
    writeFileSync(metaPath, JSON.stringify({ uuid: `00000000-0000-4000-8000-${stableTail(assetPath)}` }), 'utf8');
  }
  const visualAssets = readJson<UiVisualAssetSetConfig>('configs/ui/P0VisualAssets.json');
  for (const asset of visualAssets.assets) {
    const metaPath = resolve(SCENE_BUILDER_TEST_ROOT, `${asset.assetPath}.meta`);
    const uuid = `00000000-0000-4000-8001-${stableTail(asset.assetPath)}`;
    mkdirSync(dirname(metaPath), { recursive: true });
    writeFileSync(metaPath, JSON.stringify({
      uuid,
      subMetas: {
        spriteFrame: {
          importer: 'sprite-frame',
          uuid: `${uuid}@sprite`,
          name: 'spriteFrame',
        },
      },
    }), 'utf8');
  }
  const audioCues = readJson<AudioCueConfig[]>('configs/audio/AudioCues.json');
  for (const cue of audioCues.filter((item) => item.status !== 'deferred' && item.packageTag !== 'remote')) {
    const metaPath = resolve(SCENE_BUILDER_TEST_ROOT, `${cue.assetPath}.meta`);
    mkdirSync(dirname(metaPath), { recursive: true });
    writeFileSync(metaPath, JSON.stringify({
      uuid: `00000000-0000-4000-8002-${stableTail(cue.assetPath)}`,
      subMetas: {},
    }), 'utf8');
  }
  return SCENE_BUILDER_TEST_ROOT;
}

function findNode(
  objects: SceneObject[],
  nodeIdsByPath: Map<string, number>,
  path: string,
): SceneObject & { _lpos: { x: number; y: number }; _active: boolean } {
  const nodeId = nodeIdsByPath.get(path);
  assert(nodeId !== undefined, `missing generated node path ${path}`);
  const node = objects[nodeId] as SceneObject & { _lpos?: { x: number; y: number }; _active?: boolean };
  assert(node.__type__ === 'cc.Node', `${path} should resolve to cc.Node`);
  assert(node._lpos, `${path} should have a local position`);
  return node as SceneObject & { _lpos: { x: number; y: number }; _active: boolean };
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function getSpriteFrameAssetIds(objects: SceneObject[]): string[] {
  const registry = objects.find((object) => Array.isArray(object.spriteFrameAssetIds));
  return (registry?.spriteFrameAssetIds as string[] | undefined) ?? [];
}

function getAudioClipCueIds(objects: SceneObject[]): string[] {
  const registry = objects.find((object) => Array.isArray(object.audioClipCueIds));
  return (registry?.audioClipCueIds as string[] | undefined) ?? [];
}

function getNodeSpriteFrame(
  objects: SceneObject[],
  nodeIdsByPath: Map<string, number>,
  path: string,
): { __uuid__?: string } | null {
  const node = findNode(objects, nodeIdsByPath, path);
  const components = (node._components as { __id__: number }[] | undefined) ?? [];
  const componentId = components.find((component) => objects[component.__id__]?.__type__ === 'cc.Sprite')?.__id__;
  return componentId === undefined ? null : (objects[componentId]._spriteFrame as { __uuid__?: string } | null);
}

function stableTail(value: string): string {
  return createHash('sha1').update(value).digest('hex').slice(0, 12);
}
