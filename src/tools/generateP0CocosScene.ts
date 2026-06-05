import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  ensureDirectory,
  readJsonFile,
  stableUuid,
  writeJsonFile,
  writeSceneAssetMeta,
} from './cocosCreatorAssetUtils.js';
import {
  DEFAULT_CREATOR_PROJECT_ROOT,
  P0_CONFIG_ASSET_PATHS,
  P0_SCENE_ASSET_PATH,
} from './p0CocosScene.constants.js';
import { buildP0CocosScene, collectP0ManifestPaths } from './p0CocosSceneBuilder.js';
import type { UiLayoutConfig, UiNodeBindingConfig } from './cocosSceneSerialization.types.js';

export interface GenerateP0CocosSceneSummary {
  projectRoot: string;
  scenePath: string;
  nodeCount: number;
  configAssetCount: number;
  missingManifestPaths: string[];
}

export function generateP0CocosScene(projectRoot = readProjectRootArg()): GenerateP0CocosSceneSummary {
  const creatorRoot = resolve(projectRoot);
  assertCreatorProjectRoot(creatorRoot);
  assertRequiredMetaFiles(creatorRoot);

  const bindings = readJsonFile<UiNodeBindingConfig>(resolve(creatorRoot, 'assets/configs/ui/P0UiNodeBindings.json'));
  const layout = readJsonFile<UiLayoutConfig>(resolve(creatorRoot, 'assets/configs/ui/P0UiLayout.json'));
  const scene = buildP0CocosScene(creatorRoot, bindings, layout);
  const scenePath = resolve(creatorRoot, P0_SCENE_ASSET_PATH);
  ensureDirectory(dirname(scenePath));
  writeJsonFile(scenePath, scene.objects);
  writeSceneAssetMeta(creatorRoot, P0_SCENE_ASSET_PATH, stableUuid(`cocos-scene:${P0_SCENE_ASSET_PATH}`));

  const missingManifestPaths = collectP0ManifestPaths(bindings).filter((path) => !scene.nodeIdsByPath.has(path));
  if (missingManifestPaths.length > 0) {
    throw new Error(`Generated scene is missing manifest paths: ${missingManifestPaths.join(', ')}`);
  }

  return {
    projectRoot: creatorRoot,
    scenePath,
    nodeCount: scene.nodeIdsByPath.size,
    configAssetCount: P0_CONFIG_ASSET_PATHS.length,
    missingManifestPaths,
  };
}

function assertRequiredMetaFiles(projectRoot: string): void {
  for (const assetPath of P0_CONFIG_ASSET_PATHS) {
    const metaPath = resolve(projectRoot, `${assetPath}.meta`);
    if (!existsSync(metaPath)) {
      throw new Error(`Missing Cocos config meta: ${metaPath}`);
    }
  }
}

function assertCreatorProjectRoot(projectRoot: string): void {
  if (!existsSync(resolve(projectRoot, 'assets')) || !existsSync(resolve(projectRoot, 'settings'))) {
    throw new Error(`Not a Cocos Creator project root: ${projectRoot}`);
  }
}

function readProjectRootArg(): string {
  const explicit = process.argv.find((arg) => arg.startsWith('--project='));
  return explicit?.slice('--project='.length) ?? process.env.COCOS_CREATOR_PROJECT_ROOT ?? DEFAULT_CREATOR_PROJECT_ROOT;
}

if (pathToFileURL(fileURLToPath(import.meta.url)).href === pathToFileURL(resolve(process.argv[1] ?? '')).href) {
  const summary = generateP0CocosScene();
  console.log(JSON.stringify(summary, null, 2));
}
