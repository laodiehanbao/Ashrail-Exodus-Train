import { fail, ok, type Result } from '../../core/Result.types.js';
import {
  CURRENT_SAVE_VERSION,
  type PlayerProgressSnapshot,
} from '../../domain/player/PlayerProgress.types.js';
import { ErrorCode } from '../../shared/ErrorCodes.js';

export class SaveVersionMigrator {
  migrate(input: unknown): Result<PlayerProgressSnapshot> {
    if (!input || typeof input !== 'object') {
      return fail(ErrorCode.SaveMigrationFailed, 'Save payload must be an object', input);
    }

    const snapshot = input as Partial<PlayerProgressSnapshot>;
    const saveVersion = snapshot.saveVersion ?? 0;
    if (saveVersion > CURRENT_SAVE_VERSION) {
      return fail(ErrorCode.SaveMigrationFailed, `Unsupported future save version ${saveVersion}`);
    }

    return ok({
      ...createDefaultProgress(),
      ...snapshot,
      saveVersion: CURRENT_SAVE_VERSION,
      resources: { ...createDefaultProgress().resources, ...(snapshot.resources ?? {}) },
      inventory: {
        ...createDefaultProgress().inventory,
        ...(snapshot.inventory ?? {}),
      },
      train: {
        ...createDefaultProgress().train,
        ...(snapshot.train ?? {}),
      },
      adRecords: {
        dailyCounts: { ...(snapshot.adRecords?.dailyCounts ?? {}) },
        lastShownAtMs: { ...(snapshot.adRecords?.lastShownAtMs ?? {}) },
      },
      settledRewardIds: [...(snapshot.settledRewardIds ?? [])],
    });
  }
}

export function createDefaultProgress(): PlayerProgressSnapshot {
  return {
    saveVersion: CURRENT_SAVE_VERSION,
    playerLevel: 1,
    currentStageId: 'stage_chapter_01_001',
    resources: { coin: 200 },
    inventory: {
      equipment: [],
      lootBoxes: { lootbox_supply_common: 1 },
      moduleFragments: { module_cannon_basic_001: 5 },
    },
    train: {
      installedModules: [],
    },
    unlockedSystems: ['stage', 'loot_box', 'train_module', 'mock_ad'],
    adRecords: {
      dailyCounts: {},
      lastShownAtMs: {},
    },
    offlineRewardTimestampMs: 0,
    tutorialProgress: {},
    themeSkinId: 'theme_doom_train',
    settledRewardIds: [],
  };
}
