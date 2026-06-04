import { loadConfigRegistry } from '../../src/data/ConfigLoader.js';
import { validateUiNodeBindingConfig } from '../../src/data/schemas/UiNodeBinding.schema.js';
import type { UiNodeBindingConfig } from '../../src/shared/ui/P0UiNodeBinding.types.js';
import { readJsonConfig } from '../../src/tools/readJsonConfig.js';
import { assert, runTest } from './testHarness.js';
import { loadTestConfigs } from './loadTestConfigs.js';

export async function testP0UiNodeBindingSchema(): Promise<void> {
  await runTest('P0 UI node binding schema accepts the full manifest', () => {
    const configs = loadTestConfigs();
    const result = validateUiNodeBindingConfig(configs.uiNodeBindings, configs.uiLayout);
    assert(result.ok, 'full node binding manifest should validate');
  });

  await runTest('P0 UI node binding schema rejects missing screens and slot mismatches', () => {
    const configs = loadTestConfigs();
    const missingScreen = clone(configs.uiNodeBindings);
    missingScreen.screens = missingScreen.screens.filter((screen) => screen.screenId !== 'ad_reward');
    assert(!validateUiNodeBindingConfig(missingScreen, configs.uiLayout).ok, 'missing screen should fail validation');

    const wrongSlot = clone(configs.uiNodeBindings);
    wrongSlot.screens[0].bindings[0].slotId = 'mainHud.title';
    assert(!validateUiNodeBindingConfig(wrongSlot, configs.uiLayout).ok, 'slot mismatch should fail validation');

    const duplicatePath = clone(configs.uiNodeBindings);
    duplicatePath.screens[0].bindings[1].nodePath = duplicatePath.screens[0].bindings[0].nodePath;
    assert(!validateUiNodeBindingConfig(duplicatePath, configs.uiLayout).ok, 'duplicate node path should fail validation');
  });

  await runTest('P0 UI node binding schema rejects forbidden gameplay fields', () => {
    const configs = loadTestConfigs();
    const forbidden = clone(configs.uiNodeBindings);
    (forbidden.screens[0].bindings[0] as unknown as Record<string, unknown>).amount = 1;
    assert(!validateUiNodeBindingConfig(forbidden, configs.uiLayout).ok, 'forbidden amount field should fail validation');
  });

  await runTest('Config loader rejects unknown node binding panel and component references', () => {
    const raw = readJsonConfig(process.cwd());
    const configs = clone(raw.uiNodeBindings as UiNodeBindingConfig);
    configs.screens[1].bindings[1].panelId = 'missing_panel';
    const result = loadConfigRegistry({ ...raw, uiNodeBindings: configs });
    assert(!result.ok, 'unknown panel should fail config loading');

    const configsWithMissingComponent = clone(raw.uiNodeBindings as UiNodeBindingConfig);
    configsWithMissingComponent.screens[2].bindings[2].componentId = 'missing_component';
    const missingComponentResult = loadConfigRegistry({ ...raw, uiNodeBindings: configsWithMissingComponent });
    assert(!missingComponentResult.ok, 'unknown component should fail config loading');
  });
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
