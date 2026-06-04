import type { RawConfigSources } from '../../src/data/ConfigLoader.js';
import { loadConfigRegistry } from '../../src/data/ConfigLoader.js';
import { validateUiCopy, validateUiLayout } from '../../src/data/schemas/Ui.schema.js';
import type { UiCopyConfig, UiLayoutConfig } from '../../src/shared/ui/P0Ui.types.js';
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

  await runTest('Config loader rejects missing UI copy references', () => {
    const raw = readJsonConfig(process.cwd());
    const copy = clone(raw.uiCopy as UiCopyConfig);
    copy.entries = copy.entries.filter((entry) => entry.key !== 'equipment.rifle.rusty.name');
    const result = loadConfigRegistry({ ...raw, uiCopy: copy } as RawConfigSources);
    assert(!result.ok, 'missing equipment display copy should fail config loading');
  });
}

function clone<T extends UiCopyConfig | UiLayoutConfig>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
