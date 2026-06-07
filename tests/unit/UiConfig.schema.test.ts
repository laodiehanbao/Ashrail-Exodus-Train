import type { RawConfigSources } from '../../src/data/ConfigLoader.js';
import { loadConfigRegistry } from '../../src/data/ConfigLoader.js';
import {
  validateUiCopy,
  validateUiLayout,
  validateUiVisualAssets,
  validateUiVisualBindings,
} from '../../src/data/schemas/Ui.schema.js';
import type {
  UiCopyConfig,
  UiLayoutConfig,
  UiVisualAssetSetConfig,
  UiVisualBindingConfig,
} from '../../src/shared/ui/P0Ui.types.js';
import { readJsonConfig } from '../../src/tools/readJsonConfig.js';
import { assert, runTest } from './testHarness.js';
import { loadTestConfigs } from './loadTestConfigs.js';

export async function testUiConfigSchema(): Promise<void> {
  await runTest('UI schema rejects duplicate copy keys', () => {
    const copy = clone(loadTestConfigs().uiCopy);
    copy.entries.push({ ...copy.entries[0] });
    const result = validateUiCopy(copy);
    assert(!result.ok, 'duplicate UI copy key should fail validation');
  });

  await runTest('UI schema rejects invalid colors and panel bounds', () => {
    const invalidColor = clone(loadTestConfigs().uiLayout);
    invalidColor.colorTokens[0].hex = 'ember';
    assert(!validateUiLayout(invalidColor).ok, 'invalid UI color should fail validation');

    const outOfBounds = clone(loadTestConfigs().uiLayout);
    outOfBounds.screens[0].panels[0].x = outOfBounds.designWidth;
    assert(!validateUiLayout(outOfBounds).ok, 'out-of-bounds panel should fail validation');
  });

  await runTest('UI schema requires every P0 screen', () => {
    const layout = clone(loadTestConfigs().uiLayout);
    layout.screens = layout.screens.filter((screen) => screen.screenId !== 'ad_reward');
    const result = validateUiLayout(layout);
    assert(!result.ok, 'missing P0 ad reward screen should fail validation');
  });

  await runTest('UI schema validates visual asset ids and layout background references', () => {
    const configs = loadTestConfigs();
    const duplicate = clone(configs.uiVisualAssets);
    duplicate.assets.push({ ...duplicate.assets[0] });
    assert(!validateUiVisualAssets(duplicate).ok, 'duplicate UI visual asset should fail validation');

    const raw = readJsonConfig(process.cwd());
    const missingBackground = clone(raw.uiVisualAssets as UiVisualAssetSetConfig);
    missingBackground.assets = missingBackground.assets.filter((asset) => asset.assetId !== configs.uiLayout.screens[0].backgroundAssetId);
    const result = loadConfigRegistry({ ...raw, uiVisualAssets: missingBackground } as RawConfigSources);
    assert(!result.ok, 'missing screen background visual asset should fail config loading');
  });

  await runTest('Config loader rejects missing or wrong-usage UI component skins', () => {
    const raw = readJsonConfig(process.cwd());
    const layout = clone(raw.uiLayout as UiLayoutConfig);
    const firstSkin = layout.componentSkins[0];
    const missingSkinAssets = clone(raw.uiVisualAssets as UiVisualAssetSetConfig);
    missingSkinAssets.assets = missingSkinAssets.assets.filter((asset) => asset.assetId !== firstSkin.assetId);
    assert(
      !loadConfigRegistry({ ...raw, uiLayout: layout, uiVisualAssets: missingSkinAssets } as RawConfigSources).ok,
      'missing UI component skin visual asset should fail config loading',
    );

    const wrongUsageAssets = clone(raw.uiVisualAssets as UiVisualAssetSetConfig);
    firstSkin.assetId = (raw.uiLayout as UiLayoutConfig).screens[0].backgroundAssetId;
    assert(
      !loadConfigRegistry({ ...raw, uiLayout: layout, uiVisualAssets: wrongUsageAssets } as RawConfigSources).ok,
      'UI component skin referencing a screen background should fail config loading',
    );
  });

  await runTest('Config loader rejects missing or wrong-usage UI visual bindings', () => {
    const raw = readJsonConfig(process.cwd());
    const configs = loadTestConfigs();
    const duplicate = clone(configs.uiVisualBindings);
    duplicate.entries.push({ ...duplicate.entries[0], bindingId: 'duplicate_binding_id' });
    assert(!validateUiVisualBindings(duplicate).ok, 'duplicate visual binding domain should fail validation');

    const missingAssetBindings = clone(raw.uiVisualBindings as UiVisualBindingConfig);
    missingAssetBindings.entries[0].assetId = 'missing_resource_icon';
    assert(
      !loadConfigRegistry({ ...raw, uiVisualBindings: missingAssetBindings } as RawConfigSources).ok,
      'visual binding referencing a missing asset should fail config loading',
    );

    const wrongUsageBindings = clone(raw.uiVisualBindings as UiVisualBindingConfig);
    wrongUsageBindings.entries[0].assetId = (raw.uiLayout as UiLayoutConfig).screens[0].backgroundAssetId;
    assert(
      !loadConfigRegistry({ ...raw, uiVisualBindings: wrongUsageBindings } as RawConfigSources).ok,
      'resource visual binding referencing a background should fail config loading',
    );
  });

  await runTest('Config loader rejects missing UI copy references', () => {
    const raw = readJsonConfig(process.cwd());
    const copy = clone(raw.uiCopy as UiCopyConfig);
    copy.entries = copy.entries.filter((entry) => entry.key !== 'equipment.rifle.rusty.name');
    const result = loadConfigRegistry({ ...raw, uiCopy: copy } as RawConfigSources);
    assert(!result.ok, 'missing equipment display copy should fail config loading');
  });

  await runTest('Config loader rejects missing default P0 entry configs', () => {
    const raw = readJsonConfig(process.cwd());
    const missingDefaultLootBox = {
      ...raw,
      lootBoxes: (raw.lootBoxes as Array<{ id: string }>).filter((lootBox) => lootBox.id !== 'lootbox_supply_common'),
    };
    assert(!loadConfigRegistry(missingDefaultLootBox as RawConfigSources).ok, 'missing default P0 loot box should fail config loading');

    const missingDefaultAd = {
      ...raw,
      adPlacements: (raw.adPlacements as Array<{ placementId: string }>).filter(
        (placement) => placement.placementId !== 'ad_reward_stage_clear_double',
      ),
    };
    assert(!loadConfigRegistry(missingDefaultAd as RawConfigSources).ok, 'missing default P0 ad placement should fail config loading');
  });
}

function clone<T extends UiCopyConfig | UiLayoutConfig | UiVisualAssetSetConfig | UiVisualBindingConfig>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
