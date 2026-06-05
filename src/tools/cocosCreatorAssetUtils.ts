import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { createHash } from 'node:crypto';

const SCRIPT_CLASS_ID_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export interface CocosMeta {
  ver: string;
  importer: string;
  imported: boolean;
  uuid: string;
  files: string[];
  subMetas: Record<string, unknown>;
  userData: Record<string, unknown>;
}

export function ensureDirectory(path: string): void {
  mkdirSync(path, { recursive: true });
}

export function readJsonFile<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

export function writeJsonFile(path: string, value: unknown): void {
  ensureDirectory(dirname(path));
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export function copyDirectoryContents(source: string, target: string, options: { exclude?: (path: string) => boolean } = {}): void {
  ensureDirectory(target);
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const sourcePath = join(source, entry.name);
    const targetPath = join(target, entry.name);
    if (options.exclude?.(sourcePath)) continue;

    if (entry.isDirectory()) {
      copyDirectoryContents(sourcePath, targetPath, options);
      continue;
    }

    ensureDirectory(dirname(targetPath));
    copyFileSync(sourcePath, targetPath);
  }
}

export function replaceDirectory(source: string, target: string, options: { exclude?: (path: string) => boolean } = {}): void {
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true });
  }
  copyDirectoryContents(source, target, options);
}

export function listFiles(root: string, predicate: (path: string) => boolean): string[] {
  const files: string[] = [];
  if (!existsSync(root)) return files;

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(path, predicate));
    } else if (entry.isFile() && predicate(path)) {
      files.push(path);
    }
  }
  return files;
}

export function writeDirectoryMeta(projectRoot: string, assetRelativePath: string): void {
  const metaPath = join(projectRoot, assetRelativePath.replaceAll('/', '\\')) + '.meta';
  writeJsonFile(metaPath, {
    ver: '1.2.0',
    importer: 'directory',
    imported: true,
    uuid: stableUuid(`cocos-dir:${assetRelativePath}`),
    files: [],
    subMetas: {},
    userData: {},
  } satisfies CocosMeta);
}

export function writeJsonAssetMeta(projectRoot: string, assetRelativePath: string): string {
  const uuid = stableUuid(`cocos-json:${assetRelativePath}`);
  const metaPath = join(projectRoot, assetRelativePath.replaceAll('/', '\\')) + '.meta';
  writeJsonFile(metaPath, {
    ver: '2.0.1',
    importer: 'json',
    imported: true,
    uuid,
    files: ['.json'],
    subMetas: {},
    userData: {},
  } satisfies CocosMeta);
  return uuid;
}

export function writeSceneAssetMeta(projectRoot: string, assetRelativePath: string, uuid: string): void {
  const metaPath = join(projectRoot, assetRelativePath.replaceAll('/', '\\')) + '.meta';
  writeJsonFile(metaPath, {
    ver: '1.1.50',
    importer: 'scene',
    imported: true,
    uuid,
    files: ['.json'],
    subMetas: {},
    userData: {},
  } satisfies CocosMeta);
}

export function writeTypeScriptAssetMeta(projectRoot: string, assetRelativePath: string, uuid: string): void {
  const metaPath = join(projectRoot, assetRelativePath.replaceAll('/', '\\')) + '.meta';
  writeJsonFile(metaPath, {
    ver: '4.0.24',
    importer: 'typescript',
    imported: true,
    uuid,
    files: [],
    subMetas: {},
    userData: {
      moduleId: `project:///${assetRelativePath}`,
      simulateGlobals: [],
    },
  } satisfies CocosMeta);
}

export function readAssetMetaUuid(projectRoot: string, assetRelativePath: string): string {
  const metaPath = join(projectRoot, assetRelativePath.replaceAll('/', '\\')) + '.meta';
  const meta = readJsonFile<CocosMeta>(metaPath);
  return meta.uuid;
}

export function stableUuid(seed: string): string {
  const chars = createHash('sha1').update(seed).digest('hex').slice(0, 32).split('');
  chars[12] = '4';
  chars[16] = ((Number.parseInt(chars[16], 16) & 0x3) | 0x8).toString(16);
  const hex = chars.join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function scriptClassIdToUuid(classId: string): string {
  if (classId.length !== 23) return classId;
  let hex = classId.slice(0, 5);
  for (let index = 5; index < classId.length; index += 2) {
    const left = SCRIPT_CLASS_ID_ALPHABET.indexOf(classId[index]);
    const right = SCRIPT_CLASS_ID_ALPHABET.indexOf(classId[index + 1]);
    if (left < 0 || right < 0) {
      throw new Error(`Invalid Cocos script class id ${classId}`);
    }
    hex += ((left << 6) | right).toString(16).padStart(3, '0');
  }
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function compressScriptUuid(uuid: string): string {
  const hex = uuid.replace(/-/g, '');
  let output = hex.slice(0, 5);
  for (let index = 5; index < hex.length; index += 3) {
    const value = Number.parseInt(hex.slice(index, index + 3), 16);
    output += SCRIPT_CLASS_ID_ALPHABET[value >> 6] + SCRIPT_CLASS_ID_ALPHABET[value & 63];
  }
  return output;
}

export function projectAssetPath(projectRoot: string, filePath: string): string {
  return relative(projectRoot, filePath).replaceAll('\\', '/');
}

export function isDirectory(path: string): boolean {
  return existsSync(path) && statSync(path).isDirectory();
}
