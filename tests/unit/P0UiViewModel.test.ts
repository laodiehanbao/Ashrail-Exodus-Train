import type { GameConfigRegistry } from '../../src/data/ConfigRegistry.js';
import type { PlayerProgressSnapshot } from '../../src/domain/player/PlayerProgress.types.js';
import type { RewardBundle } from '../../src/domain/reward/Reward.types.js';
import { createDefaultProgress } from '../../src/gameplay/save/SaveVersionMigrator.js';
import { AdRewardPanelView } from '../../src/presentation/ui/AdRewardPanelView.js';
import { LootBoxView } from '../../src/presentation/ui/LootBoxView.js';
import { MainHudView } from '../../src/presentation/ui/MainHudView.js';
import { RewardPanelView } from '../../src/presentation/ui/RewardPanelView.js';
import { TrainModuleView } from '../../src/presentation/ui/TrainModuleView.js';
import { createP0UiState } from '../../src/presentation/viewmodels/P0UiViewModel.js';
import type { P0UiSnapshot } from '../../src/presentation/viewmodels/P0UiSnapshot.types.js';
import { UiTextService } from '../../src/presentation/viewmodels/UiTextService.js';
import type { UiInteractionRequest } from '../../src/shared/ui/P0Ui.types.js';
import { assert, assertEqual, runTest } from './testHarness.js';
import { loadTestConfigs } from './loadTestConfigs.js';

const NOW_MS = 120000;

export async function testP0UiViewModel(): Promise<void> {
  await runTest('P0 UI builds configured display state for all P0 screens', () => {
    const configs = loadTestConfigs();
    const text = new UiTextService(configs.uiCopy);
    const state = createP0UiState({
      configs,
      snapshot: createSnapshot(createProgress()),
      nowMs: NOW_MS,
      latestReward: createRewardBundle(configs, 'reward_stage_clear_001'),
    });

    assertEqual(text.text('ui.screen.mainHud.title'), '废轨巡航', 'UI text service should read copy config');
    assertEqual(state.mainHud.title, '废轨巡航', 'main HUD should use configured title');
    assertEqual(state.mainHud.layout?.screenId, 'main_hud', 'main HUD should attach layout');
    assertEqual(state.lootBox.costText, '煤币 100', 'loot box cost should use resource copy');
    assertEqual(state.lootBox.actions[0].enabled, true, 'default loot box should be openable');
    assert(state.rewardPanel !== null, 'reward panel should be created when latest reward is provided');
    assertEqual(state.rewardPanel.items[1].label, '普通补给箱', 'reward panel should resolve loot box display name');
    assertEqual(state.trainModule.modules[0].canUpgrade, true, 'default fragments should enable module upgrade');
    assertEqual(state.adReward.actions[0].enabled, true, 'default ad reward should be available');
    assertEqual(state.adReward.actions[1].enabled, true, 'skip action should always remain available');
  });

  await runTest('P0 UI maps gameplay availability states into disabled button copy', () => {
    const configs = loadTestConfigs();
    const noCoin = createProgress();
    noCoin.resources.coin = 0;
    const noCoinState = createP0UiState({ configs, snapshot: createSnapshot(noCoin), nowMs: NOW_MS });
    assertEqual(
      noCoinState.lootBox.actions[0].disabledReasonKey,
      'ui.status.cost.insufficient',
      'loot box should show resource shortage reason',
    );

    const noBox = createProgress();
    noBox.inventory.lootBoxes.lootbox_supply_common = 0;
    const noBoxState = createP0UiState({ configs, snapshot: createSnapshot(noBox), nowMs: NOW_MS });
    assertEqual(
      noBoxState.lootBox.actions[0].disabledReasonKey,
      'ui.button.lootbox.locked',
      'loot box should show missing box reason',
    );

    const noFragments = createProgress();
    noFragments.inventory.moduleFragments.module_cannon_basic_001 = 0;
    const noFragmentState = createP0UiState({ configs, snapshot: createSnapshot(noFragments), nowMs: NOW_MS });
    assertEqual(
      noFragmentState.trainModule.modules[0].action.disabledReasonKey,
      'ui.status.module.fragment.insufficient',
      'module panel should show fragment shortage reason',
    );

    const maxModule = createProgress();
    maxModule.train.installedModules = [{ moduleId: 'module_cannon_basic_001', level: 3 }];
    maxModule.inventory.moduleFragments.module_cannon_basic_001 = 100;
    const maxModuleState = createP0UiState({ configs, snapshot: createSnapshot(maxModule), nowMs: NOW_MS });
    assertEqual(
      maxModuleState.trainModule.modules[0].action.disabledReasonKey,
      'ui.status.module.max',
      'module panel should show max level reason',
    );
  });

  await runTest('P0 UI maps ad cooldown and daily limit into panel state', () => {
    const configs = loadTestConfigs();
    const cooldownProgress = createProgress();
    cooldownProgress.adRecords.lastShownAtMs.ad_reward_stage_clear_double = 100000;
    const cooldownState = createP0UiState({
      configs,
      snapshot: createSnapshot(cooldownProgress),
      nowMs: 120000,
    });
    assertEqual(cooldownState.adReward.actions[0].enabled, false, 'ad double should be disabled on cooldown');
    assertEqual(cooldownState.adReward.actions[0].disabledReasonKey, 'ui.button.ad.cooldown', 'cooldown key should be exposed');

    const limitProgress = createProgress();
    limitProgress.adRecords.dailyCounts.ad_reward_stage_clear_double = 10;
    const limitState = createP0UiState({ configs, snapshot: createSnapshot(limitProgress), nowMs: NOW_MS });
    assertEqual(limitState.adReward.dailyRemaining, 0, 'daily remaining should clamp to zero');
    assertEqual(limitState.adReward.actions[0].disabledReasonKey, 'ui.status.ad.unavailable', 'daily limit should use unavailable copy');
    assertEqual(limitState.adReward.actions[1].enabled, true, 'skip should remain enabled when ad is unavailable');
  });

  await runTest('P0 UI thin views only record stable ui requests', () => {
    const configs = loadTestConfigs();
    const state = createP0UiState({
      configs,
      snapshot: createSnapshot(createProgress()),
      nowMs: NOW_MS,
      latestReward: createRewardBundle(configs, 'reward_module_fragment_cannon_basic'),
    });
    assert(state.rewardPanel !== null, 'test reward state should exist');

    const mainHud = new MainHudView();
    const lootBox = new LootBoxView();
    const rewardPanel = new RewardPanelView();
    const trainModule = new TrainModuleView();
    const adReward = new AdRewardPanelView();

    mainHud.requestStageStart();
    lootBox.requestOpen();
    rewardPanel.requestClaim();
    trainModule.requestUpgrade('module_cannon_basic_001');
    adReward.requestDouble();
    adReward.requestSkip();
    assertEqual(
      [
        ...mainHud.getRequests(),
        ...lootBox.getRequests(),
        ...rewardPanel.getRequests(),
        ...trainModule.getRequests(),
        ...adReward.getRequests(),
      ].length,
      0,
      'views should ignore requests before render state exists',
    );

    mainHud.render(state.mainHud);
    lootBox.render(state.lootBox);
    rewardPanel.render(state.rewardPanel);
    trainModule.render(state.trainModule);
    adReward.render(state.adReward);

    mainHud.requestStageStart();
    lootBox.requestOpen();
    rewardPanel.requestClaim();
    trainModule.requestUpgrade('module_cannon_basic_001');
    adReward.requestDouble();
    adReward.requestSkip();

    const requests = [
      ...mainHud.getRequests(),
      ...lootBox.getRequests(),
      ...rewardPanel.getRequests(),
      ...trainModule.getRequests(),
      ...adReward.getRequests(),
    ];
    assertEqual(requests.length, 6, 'all thin views should record one request per click');
    assert(requests.every((request) => request.actionId.startsWith('ui_request_')), 'views should only emit ui requests');
    assertRequestPayloadsStayThin(requests);
  });

  await runTest('P0 UI thin views do not emit disabled requests', () => {
    const configs = loadTestConfigs();
    const progress = createProgress();
    progress.resources.coin = 0;
    progress.inventory.moduleFragments.module_cannon_basic_001 = 0;
    progress.adRecords.lastShownAtMs.ad_reward_stage_clear_double = 100000;
    const state = createP0UiState({
      configs,
      snapshot: createSnapshot(progress),
      nowMs: 120000,
    });

    const lootBox = new LootBoxView();
    const trainModule = new TrainModuleView();
    const adReward = new AdRewardPanelView();
    lootBox.render(state.lootBox);
    trainModule.render(state.trainModule);
    adReward.render(state.adReward);

    lootBox.requestOpen();
    trainModule.requestUpgrade('module_cannon_basic_001');
    adReward.requestDouble();
    adReward.requestSkip();

    assertEqual(lootBox.getRequests().length, 0, 'disabled loot box view should not emit request');
    assertEqual(trainModule.getRequests().length, 0, 'disabled train module view should not emit request');
    assertEqual(adReward.getRequests().length, 1, 'skip should still emit while disabled double is blocked');
    assertEqual(adReward.getRequests()[0].actionId, 'ui_request_ad_reward_skip', 'skip request should remain available');
  });

  await runTest('P0 UI state creation does not mutate input snapshot', () => {
    const configs = loadTestConfigs();
    const progress = createProgress();
    const before = JSON.stringify(progress);
    createP0UiState({ configs, snapshot: createSnapshot(progress), nowMs: NOW_MS });
    assertEqual(JSON.stringify(progress), before, 'view model creation must not mutate progress snapshot');
  });
}

function createProgress(): PlayerProgressSnapshot {
  return JSON.parse(JSON.stringify(createDefaultProgress())) as PlayerProgressSnapshot;
}

function createSnapshot(progress: PlayerProgressSnapshot): P0UiSnapshot {
  return {
    progress,
    power: 20,
  };
}

function createRewardBundle(configs: GameConfigRegistry, rewardId: string): RewardBundle {
  const reward = configs.rewardDefinitions.find((item) => item.id === rewardId);
  assert(reward, `Missing test reward ${rewardId}`);
  return {
    sourceId: reward.id,
    items: reward.items,
  };
}

function assertRequestPayloadsStayThin(requests: UiInteractionRequest[]): void {
  const serialized = JSON.stringify(requests);
  assert(!serialized.includes('amount'), 'UI requests must not contain reward amounts');
  assert(!serialized.includes('cost'), 'UI requests must not contain economy costs');
  assert(!serialized.includes('save'), 'UI requests must not contain save patches');
  assert(!serialized.includes('multiplier'), 'UI requests must not contain ad multiplier decisions');
  assert(!serialized.includes('settlement'), 'UI requests must not contain settlement decisions');
  assert(!serialized.includes('adWatched'), 'UI requests must not contain ad completion flags');
  for (const request of requests) {
    const payload = 'payload' in request ? request.payload : {};
    for (const value of Object.values(payload)) {
      assertEqual(typeof value, 'string', 'UI request payload values should be stable string IDs');
    }
  }
}
