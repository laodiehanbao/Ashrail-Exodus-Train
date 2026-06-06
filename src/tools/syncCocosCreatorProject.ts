import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  copyDirectoryContents,
  ensureDirectory,
  listFiles,
  projectAssetPath,
  replaceDirectory,
  stableUuid,
  writeDirectoryMeta,
  writeImageAssetMeta,
  writeJsonAssetMeta,
  writeTypeScriptAssetMeta,
} from './cocosCreatorAssetUtils.js';
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
  syncedTsFiles: number;
  syncedJsonFiles: number;
  remainingJsSpecifiers: number;
}

export function syncCocosCreatorProject(projectRoot = readProjectRootArg()): SyncSummary {
  const creatorRoot = resolve(projectRoot);
  assertCreatorProjectRoot(creatorRoot);

  syncRuntimeAssetDirs(creatorRoot);
  syncScripts(creatorRoot);
  syncConfigs(creatorRoot);
  syncVisualAssetMetas(creatorRoot);

  const scriptsRoot = resolve(creatorRoot, 'assets/scripts/src');
  const configRoot = resolve(creatorRoot, 'assets/configs');
  const syncedTsFiles = listFiles(scriptsRoot, (path) => path.endsWith('.ts')).length;
  const syncedJsonFiles = listFiles(configRoot, (path) => path.endsWith('.json')).length;
  const remainingJsSpecifiers = countRemainingJsSpecifiers(scriptsRoot);
  return { projectRoot: creatorRoot, syncedTsFiles, syncedJsonFiles, remainingJsSpecifiers };
}

function syncRuntimeAssetDirs(projectRoot: string): void {
  for (const name of RUNTIME_ASSET_DIRS) {
    const source = resolve(SOURCE_ROOT, 'assets', name);
    if (!existsSync(source)) continue;
    copyDirectoryContents(source, resolve(projectRoot, 'assets', name), {
      exclude: (path) => path.endsWith('.meta'),
    });
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
