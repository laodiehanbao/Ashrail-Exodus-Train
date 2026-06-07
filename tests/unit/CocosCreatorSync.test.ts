import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

import { syncCocosCreatorProject } from '../../src/tools/syncCocosCreatorProject.js';
import { assert, assertEqual, runTest } from './testHarness.js';

const COCOS_SYNC_TEST_ROOT = resolve('.tmp/tests/cocos-sync-whitelist');

export async function testCocosCreatorSync(): Promise<void> {
  await runTest('Cocos sync copies only declared P0 runtime assets', () => {
    const creatorRoot = createFakeCreatorRoot();
    try {
      const summary = syncCocosCreatorProject(creatorRoot);
      assert(summary.syncedRuntimeAssetFiles > 0, 'runtime asset whitelist should copy declared files');

      assertExists('assets/ui/runtime/ui_primary_button_ember.png');
      assertExists('assets/textures/runtime/tex_bg_stage_wasteland_rail_001.jpg');
      assertExists('assets/textures/trains/runtime/tex_train_head_rust_001.png');
      assertExists('assets/textures/enemies/runtime/tex_enemy_raider_basic_001.png');
      assertExists('assets/icons/resources/runtime/icon_resource_coin_001.png');
      assertExists('assets/audio/ui/sfx_ui_tap_metal_001.ogg');
      assertExists('assets/scenes/scene_p0_exodus_train_main.scene');
      assertExists('assets/ui/runtime/ui_primary_button_ember.png.meta');
      assertExists('assets/textures/trains/runtime/tex_train_head_rust_001.png.meta');
      assertExists('assets/audio/ui/sfx_ui_tap_metal_001.ogg.meta');

      assertMissing('assets/ui/core/sheet_ui_core_p0_001.png');
      assertMissing('assets/textures/concept/ashrail_key_visual_v02.png');
      assertMissing('assets/icons/equipment/sheet_equipment_icons_p0_001.png');
      assertMissing('assets/textures/trains/sheet_train_carriages_p0_001.png');
      assertMissing('assets/textures/enemies/sheet_enemies_p0_001.png');
      assertMissing('assets/audio/voice/vo_radio_stage_depart_zh_001.ogg');

      const uiMeta = readJson<{ userData: { hasAlpha: boolean } }>('assets/ui/runtime/ui_primary_button_ember.png.meta');
      assertEqual(uiMeta.userData.hasAlpha, true, 'synced UI skin image meta should preserve alpha');
      const audioMeta = readJson<{ importer: string }>('assets/audio/ui/sfx_ui_tap_metal_001.ogg.meta');
      assertEqual(audioMeta.importer, 'audio-clip', 'synced audio should have a stable Cocos audio meta');
    } finally {
      rmSync(creatorRoot, { recursive: true, force: true });
    }
  });
}

function createFakeCreatorRoot(): string {
  rmSync(COCOS_SYNC_TEST_ROOT, { recursive: true, force: true });
  mkdirSync(resolve(COCOS_SYNC_TEST_ROOT, 'assets'), { recursive: true });
  mkdirSync(resolve(COCOS_SYNC_TEST_ROOT, 'settings'), { recursive: true });
  return COCOS_SYNC_TEST_ROOT;
}

function assertExists(assetPath: string): void {
  assert(existsSync(resolve(COCOS_SYNC_TEST_ROOT, assetPath)), `expected synced asset ${assetPath}`);
}

function assertMissing(assetPath: string): void {
  assert(!existsSync(resolve(COCOS_SYNC_TEST_ROOT, assetPath)), `unexpected source or remote asset ${assetPath}`);
}

function readJson<T>(assetPath: string): T {
  return JSON.parse(readFileSync(resolve(COCOS_SYNC_TEST_ROOT, assetPath), 'utf8')) as T;
}
