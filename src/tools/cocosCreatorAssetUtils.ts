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

interface CocosSubMeta {
  importer?: string;
  uuid?: string;
  name?: string;
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

export function writeImageAssetMeta(projectRoot: string, assetRelativePath: string, width: number, height: number): void {
  const uuid = stableUuid(`cocos-image:${assetRelativePath}`);
  const textureUuid = `${uuid}@6c48a`;
  const spriteFrameUuid = `${uuid}@f9941`;
  const metaPath = join(projectRoot, assetRelativePath.replaceAll('/', '\\')) + '.meta';
  writeJsonFile(metaPath, {
    ver: '1.0.27',
    importer: 'image',
    imported: true,
    uuid,
    files: ['.json', `.${assetRelativePath.split('.').at(-1) ?? 'png'}`],
    subMetas: {
      '6c48a': {
        importer: 'texture',
        uuid: textureUuid,
        displayName: assetRelativePath.split('/').at(-1)?.replace(/\.[^.]+$/, '') ?? assetRelativePath,
        id: '6c48a',
        name: 'texture',
        userData: {
          wrapModeS: 'clamp-to-edge',
          wrapModeT: 'clamp-to-edge',
          imageUuidOrDatabaseUri: uuid,
          isUuid: true,
          visible: false,
          minfilter: 'linear',
          magfilter: 'linear',
          mipfilter: 'none',
          anisotropy: 0,
        },
        ver: '1.0.22',
        imported: true,
        files: ['.json'],
        subMetas: {},
      },
      f9941: {
        importer: 'sprite-frame',
        uuid: spriteFrameUuid,
        displayName: assetRelativePath.split('/').at(-1)?.replace(/\.[^.]+$/, '') ?? assetRelativePath,
        id: 'f9941',
        name: 'spriteFrame',
        userData: createSpriteFrameUserData(width, height, textureUuid),
        ver: '1.0.12',
        imported: true,
        files: ['.json'],
        subMetas: {},
      },
    },
    userData: {
      type: 'sprite-frame',
      fixAlphaTransparencyArtifacts: false,
      hasAlpha: false,
      redirect: textureUuid,
    },
  } satisfies CocosMeta);
}

export function readAssetMetaUuid(projectRoot: string, assetRelativePath: string): string {
  const metaPath = join(projectRoot, assetRelativePath.replaceAll('/', '\\')) + '.meta';
  const meta = readJsonFile<CocosMeta>(metaPath);
  return meta.uuid;
}

function createSpriteFrameUserData(width: number, height: number, textureUuid: string): Record<string, unknown> {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  return {
    trimThreshold: 1,
    rotated: false,
    offsetX: 0,
    offsetY: 0,
    trimX: 0,
    trimY: 0,
    width,
    height,
    rawWidth: width,
    rawHeight: height,
    borderTop: 0,
    borderBottom: 0,
    borderLeft: 0,
    borderRight: 0,
    packable: true,
    pixelsToUnit: 100,
    pivotX: 0.5,
    pivotY: 0.5,
    meshType: 0,
    vertices: {
      rawPosition: [
        -halfWidth,
        -halfHeight,
        0,
        halfWidth,
        -halfHeight,
        0,
        -halfWidth,
        halfHeight,
        0,
        halfWidth,
        halfHeight,
        0,
      ],
      indexes: [0, 1, 2, 2, 1, 3],
      uv: [0, height, width, height, 0, 0, width, 0],
      nuv: [0, 0, 1, 0, 0, 1, 1, 1],
      minPos: [-halfWidth, -halfHeight, 0],
      maxPos: [halfWidth, halfHeight, 0],
    },
    isUuid: true,
    imageUuidOrDatabaseUri: textureUuid,
    atlasUuid: '',
    trimType: 'auto',
  };
}

export function readSpriteFrameMetaUuid(projectRoot: string, assetRelativePath: string): string {
  const metaPath = join(projectRoot, assetRelativePath.replaceAll('/', '\\')) + '.meta';
  const meta = readJsonFile<CocosMeta>(metaPath);
  const spriteFrame = Object.values(meta.subMetas)
    .map((value) => value as CocosSubMeta)
    .find((value) => value.importer === 'sprite-frame' || value.name === 'spriteFrame');
  if (!spriteFrame?.uuid) {
    throw new Error(`Missing Cocos sprite-frame subMeta: ${metaPath}`);
  }
  return spriteFrame.uuid;
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
