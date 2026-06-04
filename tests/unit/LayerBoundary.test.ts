import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { assert, runTest } from './testHarness.js';

const PRESENTATION_ROOT = join(process.cwd(), 'src', 'presentation');
const UI_CONTRACT_ROOTS = [
  join(process.cwd(), 'src', 'presentation'),
  join(process.cwd(), 'src', 'shared', 'ui'),
  join(process.cwd(), 'src', 'data', 'schemas'),
];

const FORBIDDEN_PRESENTATION_PATTERNS = [
  /from ['"].*app\//,
  /from ['"].*platform\//,
  /from ['"].*gameplay\/(?:loot\/LootBoxSystem|loot\/RewardService|train\/TrainModuleSystem|ads\/AdRewardService|save\/)/,
  /from ['"].*gameplay\/ads\/AdLimitService/,
  /from ['"].*platform\/(?:ads\/(?:DouyinAdService|MockAdService)|save\/)/,
  /from ['"]cc['"]/,
  /\bccclass\b/,
  /@property/,
  /\btt\./,
  /\blocalStorage\b/,
];

export async function testLayerBoundary(): Promise<void> {
  await runTest('Presentation layer does not import app systems mutable services or platform APIs', () => {
    for (const path of listTypeScriptFiles(PRESENTATION_ROOT)) {
      const source = readFileSync(path, 'utf8');
      const matched = FORBIDDEN_PRESENTATION_PATTERNS.find((pattern) => pattern.test(source));
      assert(!matched, `Forbidden presentation dependency in ${relative(process.cwd(), path)}`);
    }
  });

  await runTest('UI contracts schemas and presenters stay free of Cocos and Douyin APIs', () => {
    const forbiddenRuntimePatterns = [/from ['"]cc['"]/, /\bccclass\b/, /@property/, /\btt\./, /\blocalStorage\b/];
    for (const root of UI_CONTRACT_ROOTS) {
      for (const path of listTypeScriptFiles(root)) {
        const source = readFileSync(path, 'utf8');
        const matched = forbiddenRuntimePatterns.find((pattern) => pattern.test(source));
        assert(!matched, `Forbidden runtime API in ${relative(process.cwd(), path)}`);
      }
    }
  });
}

function listTypeScriptFiles(root: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...listTypeScriptFiles(path));
    }
    if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(path);
    }
  }
  return files;
}
