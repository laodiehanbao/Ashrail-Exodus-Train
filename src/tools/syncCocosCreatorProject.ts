import { copyFileSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  ensureDirectory,
  listFiles,
  projectAssetPath,
  replaceDirectory,
  stableUuid,
  writeAudioClipAssetMeta,
  writeDirectoryMeta,
  writeImageAssetMeta,
  writeJsonAssetMeta,
  writeTypeScriptAssetMeta,
} from './cocosCreatorAssetUtils.js';
import { loadConfigRegistry } from '../data/ConfigLoader.js';
import { readJsonConfig } from './readJsonConfig.js';
import { P0_SCENE_ASSET_PATH } from './p0CocosScene.constants.js';
import type { AudioCueConfig } from '../shared/audio/AudioCue.types.js';
import type { UiVisualAssetSetConfig } from '../shared/ui/P0Ui.types.js';

const DEFAULT_CREATOR_PROJECT_ROOT = 'C:/Users/zhang/NewProject_1';
const SOURCE_ROOT = process.cwd();
const SCRIPT_UUID_OVERRIDES = new Map<string, string>([
  ['assets/scripts/src/app/cocos/P0CocosCreatorBootstrap.ts', '4d8002ea-0fda-4a28-8a2e-a23fcdac0f49'],
  [
    'assets/scripts/src/presentation/ui/cocos/creator/CocosCreatorAssetRegistryComponent.ts',
    '95ed4400-2132-4d08-937e-3cddf1379136',
  ],
]);

const RUNTIME_ASSET_DIRS = ['audio', 'effects', 'fonts', 'icons', 'prefabs', 'scenes', 'spine', 'textures', 'ui'];

interface SyncSummary {
  projectRoot: string;
  syncedRuntimeAssetFiles: number;
  syncedTsFiles: number;
  syncedJsonFiles: number;
  remainingJsSpecifiers: number;
}

export function syncCocosCreatorProject(projectRoot = readProjectRootArg()): SyncSummary {
  const creatorRoot = resolve(projectRoot);
  assertCreatorProjectRoot(creatorRoot);

  const syncedRuntimeAssetFiles = syncRuntimeAssets(creatorRoot);
  syncScripts(creatorRoot);
  syncConfigs(creatorRoot);
  syncVisualAssetMetas(creatorRoot);
  syncAudioAssetMetas(creatorRoot);

  const scriptsRoot = resolve(creatorRoot, 'assets/scripts/src');
  const configRoot = resolve(creatorRoot, 'assets/configs');
  const syncedTsFiles = listFiles(scriptsRoot, (path) => path.endsWith('.ts')).length;
  const syncedJsonFiles = listFiles(configRoot, (path) => path.endsWith('.json')).length;
  const remainingJsSpecifiers = countRemainingJsSpecifiers(scriptsRoot);
  return { projectRoot: creatorRoot, syncedRuntimeAssetFiles, syncedTsFiles, syncedJsonFiles, remainingJsSpecifiers };
}

function syncRuntimeAssets(projectRoot: string): number {
  const assetPaths = collectRuntimeAssetPaths();
  clearRuntimeAssetDirs(projectRoot);
  for (const assetPath of assetPaths) {
    copyRuntimeAsset(projectRoot, assetPath);
  }
  writeRuntimeAssetDirectoryMetas(projectRoot, assetPaths);
  return assetPaths.length;
}

function clearRuntimeAssetDirs(projectRoot: string): void {
  for (const name of RUNTIME_ASSET_DIRS) {
    const target = resolve(projectRoot, 'assets', name);
    assertSafeAssetTarget(projectRoot, target);
    if (existsSync(target)) {
      rmSync(target, { recursive: true, force: true });
    }
  }
}

function collectRuntimeAssetPaths(): string[] {
  const registry = loadConfigRegistry(readJsonConfig(SOURCE_ROOT));
  if (!registry.ok) {
    throw new Error(`Cannot sync runtime assets from invalid config: ${registry.error.message}`);
  }

  const assetPaths = new Set<string>();
  for (const asset of registry.value.uiVisualAssets.assets) {
    if (asset.packageTag !== 'remote') {
      assetPaths.add(asset.assetPath);
    }
  }
  for (const cue of collectLocalAudioCues(registry.value.audioCues)) {
    assetPaths.add(cue.assetPath);
  }
  if (existsSync(resolve(SOURCE_ROOT, P0_SCENE_ASSET_PATH))) {
    assetPaths.add(P0_SCENE_ASSET_PATH);
  }
  return [...assetPaths].sort();
}

function collectLocalAudioCues(audioCues: AudioCueConfig[]): AudioCueConfig[] {
  return audioCues.filter((cue) => cue.status !== 'deferred' && cue.packageTag !== 'remote');
}

function copyRuntimeAsset(projectRoot: string, assetPath: string): void {
  const source = resolve(SOURCE_ROOT, assetPath);
  if (!existsSync(source)) {
    throw new Error(`Missing runtime asset source: ${source}`);
  }
  const target = resolve(projectRoot, assetPath);
  assertSafeAssetTarget(projectRoot, target);
  ensureDirectory(dirname(target));
  copyFileSync(source, target);
}

function writeRuntimeAssetDirectoryMetas(projectRoot: string, assetPaths: string[]): void {
  const directories = new Set<string>();
  for (const assetPath of assetPaths) {
    const segments = assetPath.split('/').slice(0, -1);
    for (let index = 1; index <= segments.length; index += 1) {
      directories.add(segments.slice(0, index).join('/'));
    }
  }
  for (const directory of [...directories].filter(Boolean).sort()) {
    writeDirectoryMeta(projectRoot, directory);
  }
}

function syncScripts(projectRoot: string): void {
  const source = resolve(SOURCE_ROOT, 'src');
  const target = resolve(projectRoot, 'assets/scripts/src');
  assertSafeAssetTarget(projectRoot, target);
  replaceDirectory(source, target, {
    exclude: (path) => {
      const rel = relative(source, path).replaceAll('\\', '/');
      return rel === 'tools' || rel.startsWith('tools/') || rel === 'app/runPrototypeCli.ts';
    },
  });
  stripRelativeJsImportSpecifiers(target);
  writeMetasForTree(projectRoot, 'assets/scripts/src');
  for (const path of listFiles(target, (filePath) => filePath.endsWith('.ts'))) {
    const assetPath = projectAssetPath(projectRoot, path);
    writeTypeScriptAssetMeta(projectRoot, assetPath, SCRIPT_UUID_OVERRIDES.get(assetPath) ?? stableUuid(`cocos-ts:${assetPath}`));
  }
}

function syncConfigs(projectRoot: string): void {
  const target = resolve(projectRoot, 'assets/configs');
  assertSafeAssetTarget(projectRoot, target);
  replaceDirectory(resolve(SOURCE_ROOT, 'configs'), target);
  writeMetasForTree(projectRoot, 'assets/configs');
  for (const path of listFiles(target, (filePath) => filePath.endsWith('.json'))) {
    writeJsonAssetMeta(projectRoot, projectAssetPath(projectRoot, path));
  }
}

function syncAudioAssetMetas(projectRoot: string): void {
  const registry = loadConfigRegistry(readJsonConfig(SOURCE_ROOT));
  if (!registry.ok) {
    throw new Error(`Cannot write audio metas from invalid config: ${registry.error.message}`);
  }
  for (const cue of collectLocalAudioCues(registry.value.audioCues)) {
    const targetPath = resolve(projectRoot, cue.assetPath);
    if (!existsSync(targetPath)) {
      throw new Error(`Missing synced audio asset: ${targetPath}`);
    }
    writeAudioClipAssetMeta(projectRoot, cue.assetPath);
  }
}

function syncVisualAssetMetas(projectRoot: string): void {
  const configPath = resolve(projectRoot, 'assets/configs/ui/P0VisualAssets.json');
  if (!existsSync(configPath)) return;
  const config = JSON.parse(readFileSync(configPath, 'utf8')) as UiVisualAssetSetConfig;
  for (const asset of config.assets) {
    if (asset.kind !== 'spriteFrame') continue;
    const targetPath = resolve(projectRoot, asset.assetPath);
    if (!existsSync(targetPath)) {
      throw new Error(`Missing synced visual asset: ${targetPath}`);
    }
    const directoryPath = asset.assetPath.split('/').slice(0, -1).join('/');
    if (directoryPath) {
      writeDirectoryMeta(projectRoot, directoryPath);
    }
    writeImageAssetMeta(projectRoot, asset.assetPath, asset.width, asset.height);
  }
}

function writeMetasForTree(projectRoot: string, assetRelativeRoot: string): void {
  writeDirectoryMeta(projectRoot, assetRelativeRoot);
  writeChildDirectoryMetas(projectRoot, resolve(projectRoot, assetRelativeRoot));
}

function writeChildDirectoryMetas(projectRoot: string, directory: string): void {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (!entry.isDirectory()) continue;
    writeDirectoryMeta(projectRoot, projectAssetPath(projectRoot, path));
    writeChildDirectoryMetas(projectRoot, path);
  }
}

function stripRelativeJsImportSpecifiers(root: string): void {
  const specifierPattern = /((?:from\s+|import\s*\(\s*)['"])(\.{1,2}\/[^'"]+)\.js(['"])/g;
  for (const path of listFiles(root, (filePath) => filePath.endsWith('.ts'))) {
    const source = readFileSync(path, 'utf8');
    const next = source.replace(specifierPattern, '$1$2$3');
    if (next !== source) {
      ensureDirectory(dirname(path));
      writeFileSync(path, next, 'utf8');
    }
  }
}

function countRemainingJsSpecifiers(root: string): number {
  let count = 0;
  const pattern = /(?:from\s+|import\s*\(\s*)['"]\.{1,2}\/[^'"]+\.js['"]/g;
  for (const path of listFiles(root, (filePath) => filePath.endsWith('.ts'))) {
    count += readFileSync(path, 'utf8').match(pattern)?.length ?? 0;
  }
  return count;
}

function assertCreatorProjectRoot(projectRoot: string): void {
  if (!existsSync(resolve(projectRoot, 'assets')) || !existsSync(resolve(projectRoot, 'settings'))) {
    throw new Error(`Not a Cocos Creator project root: ${projectRoot}`);
  }
}

function assertSafeAssetTarget(projectRoot: string, target: string): void {
  const assetsRoot = resolve(projectRoot, 'assets');
  const resolvedTarget = resolve(target);
  if (!resolvedTarget.startsWith(`${assetsRoot}\\`) && resolvedTarget !== assetsRoot) {
    throw new Error(`Refusing to write outside Creator assets: ${resolvedTarget}`);
  }
  if (['library', 'temp', 'profiles', 'local'].some((name) => resolvedTarget.includes(`\\${name}\\`))) {
    throw new Error(`Refusing to write Creator cache directory: ${resolvedTarget}`);
  }
}

function readProjectRootArg(): string {
  const explicit = process.argv.find((arg) => arg.startsWith('--project='));
  return explicit?.slice('--project='.length) ?? process.env.COCOS_CREATOR_PROJECT_ROOT ?? DEFAULT_CREATOR_PROJECT_ROOT;
}

if (pathToFileURL(fileURLToPath(import.meta.url)).href === pathToFileURL(resolve(process.argv[1] ?? '')).href) {
  const summary = syncCocosCreatorProject();
  console.log(JSON.stringify(summary, null, 2));
}
