import { GameApp } from '../../src/app/GameApp.js';
import { P0UiRequestRouter } from '../../src/app/P0UiRequestRouter.js';
import type { PlayerProgressSnapshot } from '../../src/domain/player/PlayerProgress.types.js';
import { createDefaultProgress } from '../../src/gameplay/save/SaveVersionMigrator.js';
import { MockAudioPlaybackAdapter } from '../../src/platform/audio/MockAudioPlaybackAdapter.js';
import { assert, assertEqual, runTest } from './testHarness.js';
import { loadTestConfigs } from './loadTestConfigs.js';

export async function testP0UiRequestRouter(): Promise<void> {
  await runTest('P0UiRequestRouter stages reward preview ad double and claim through gameplay services', async () => {
    const app = new GameApp(loadTestConfigs(), createProgress(), 11);
    const router = new P0UiRequestRouter(app);

    const stage = await router.handleRequest({ actionId: 'ui_request_stage_start' }, 100000);
    assert(stage.ok, 'stage start should succeed');
    if (!stage.ok) return;
    assertEqual(stage.value.refreshAfterMs, 850, 'stage start should schedule reward reveal after combat feedback');
    assertEqual(stage.value.state.rewardPanel, null, 'stage reward should stay hidden until combat feedback finishes');
    assertEqual(stage.value.state.mainHud.combatPreview.combatRunRevision, 1, 'stage start should trigger combat presentation revision');
    assertEqual(stage.value.state.mainHud.combatPreview.statusText, '威胁清除', 'stage start state should expose visible combat clear status');
    assertEqual(stage.value.state.mainHud.combatPreview.damageText, '-240', 'stage start should expose combat result damage text');
    assertEqual(stage.value.state.mainHud.actions[0].enabled, false, 'stage start action should lock while reward reveal is pending');

    const revealed = router.getState(100850);
    assert(revealed.rewardPanel !== null, 'stage reward should be previewed after combat feedback finishes');

    const doubled = await router.handleRequest({
      actionId: 'ui_request_ad_reward_double',
      payload: { placementId: 'ad_reward_stage_clear_double' },
    }, 110000);
    assert(doubled.ok, 'ad double should succeed for pending reward');
    if (!doubled.ok) return;
    assertEqual(doubled.value.state.rewardPanel?.items[0].amount, 240, 'ad double should update preview amount');

    const claimed = await router.handleRequest({
      actionId: 'ui_request_reward_claim',
      payload: { sourceId: 'reward_stage_clear_001_x2' },
    }, 120000);
    assert(claimed.ok, 'reward claim should grant pending stage reward');
    if (!claimed.ok) return;
    const snapshot = app.snapshot();
    assertEqual(snapshot.progress.currentStageId, 'stage_chapter_01_002', 'claim should advance to next stage');
    assert(snapshot.progress.settledRewardIds.length >= 1, 'claim should settle reward through RewardService');
    assertEqual(
      claimed.value.state.mainHud.combatPreview.statusText,
      '轨道清理待命',
      'claim should reset combat preview status for the next stage',
    );
  });

  await runTest('P0UiRequestRouter opens loot boxes upgrades modules and clears granted reward display', async () => {
    const audioAdapter = new MockAudioPlaybackAdapter();
    const app = new GameApp(loadTestConfigs(), createProgress(), 17, audioAdapter);
    const router = new P0UiRequestRouter(app);

    const opened = await router.handleRequest({
      actionId: 'ui_request_lootbox_open',
      payload: { lootBoxId: 'lootbox_supply_common' },
    }, 200000);
    assert(opened.ok, 'loot box open should succeed through LootBoxSystem');
    if (!opened.ok) return;
    assert(opened.value.state.rewardPanel !== null, 'opened loot box reward should be displayed');

    const sourceId = opened.value.state.rewardPanel?.sourceId ?? '';
    const cleared = await router.handleRequest({
      actionId: 'ui_request_reward_claim',
      payload: { sourceId },
    }, 210000);
    assert(cleared.ok, 'claim should clear already granted loot box reward display');
    if (!cleared.ok) return;
    assertEqual(cleared.value.state.rewardPanel, null, 'claim should hide granted loot box reward panel');

    const upgraded = await router.handleRequest({
      actionId: 'ui_request_train_module_upgrade',
      payload: { moduleId: 'module_cannon_basic_001' },
    }, 220000);
    assert(upgraded.ok, 'module upgrade should succeed through TrainModuleSystem');
    assert(app.snapshot().power > 20, 'module upgrade should increase app snapshot power');
    assert(
      audioAdapter.played.some((request) => request.eventId === 'audio_lootbox_open_mech'),
      'accepted loot box request should play configured audio event',
    );
    assert(
      audioAdapter.played.some((request) => request.eventId === 'audio_train_module_upgrade'),
      'accepted module upgrade request should play configured audio event',
    );
  });

  await runTest('P0UiRequestRouter rejects invalid or premature requests', async () => {
    const progress = createProgress();
    progress.resources.coin = 0;
    const audioAdapter = new MockAudioPlaybackAdapter();
    const app = new GameApp(loadTestConfigs(), progress, 23, audioAdapter);
    const router = new P0UiRequestRouter(app);

    const rejectedLoot = await router.handleRequest({
      actionId: 'ui_request_lootbox_open',
      payload: { lootBoxId: 'lootbox_supply_common' },
    }, 300000);
    assert(!rejectedLoot.ok, 'loot box open should reject when gameplay cannot spend cost');

    const rejectedAd = await router.handleRequest({
      actionId: 'ui_request_ad_reward_double',
      payload: { placementId: 'ad_reward_stage_clear_double' },
    }, 310000);
    assert(!rejectedAd.ok, 'ad double should reject without pending stage reward');
    assertEqual(audioAdapter.played.length, 0, 'rejected UI requests should not play audio');
  });

  await runTest('P0UiRequestRouter rejects mismatched ad placement for pending stage reward', async () => {
    const app = new GameApp(loadTestConfigs(), createProgress(), 29);
    const router = new P0UiRequestRouter(app);
    const stage = await router.handleRequest({ actionId: 'ui_request_stage_start' }, 400000);
    assert(stage.ok, 'stage should create pending reward');

    const mismatchedAd = await router.handleRequest({
      actionId: 'ui_request_ad_reward_double',
      payload: { placementId: 'ad_reward_lootbox_double' },
    }, 410000);
    assert(!mismatchedAd.ok, 'stage reward should reject loot box ad placement');
  });

  await runTest('P0UiRequestRouter rejects pending-state duplicate stage and loot commands', async () => {
    const app = new GameApp(loadTestConfigs(), createProgress(), 31);
    const router = new P0UiRequestRouter(app);
    const stage = await router.handleRequest({ actionId: 'ui_request_stage_start' }, 500000);
    assert(stage.ok, 'stage should create pending reward');

    const secondStage = await router.handleRequest({ actionId: 'ui_request_stage_start' }, 510000);
    assert(!secondStage.ok, 'second stage start should reject while reward is pending');

    const loot = await router.handleRequest({
      actionId: 'ui_request_lootbox_open',
      payload: { lootBoxId: 'lootbox_supply_common' },
    }, 520000);
    assert(!loot.ok, 'loot box open should reject while stage reward is pending');
  });

  await runTest('P0UiRequestRouter rejects claim source mismatch and insufficient module upgrade', async () => {
    const app = new GameApp(loadTestConfigs(), createProgress(), 37);
    const router = new P0UiRequestRouter(app);
    const stage = await router.handleRequest({ actionId: 'ui_request_stage_start' }, 600000);
    assert(stage.ok, 'stage should create pending reward');

    const mismatch = await router.handleRequest({
      actionId: 'ui_request_reward_claim',
      payload: { sourceId: 'reward_wrong_source' },
    }, 610000);
    assert(!mismatch.ok, 'claim should reject mismatched reward source');

    const poorProgress = createProgress();
    poorProgress.inventory.moduleFragments.module_cannon_basic_001 = 0;
    const poorApp = new GameApp(loadTestConfigs(), poorProgress, 41);
    const poorRouter = new P0UiRequestRouter(poorApp);
    const upgrade = await poorRouter.handleRequest({
      actionId: 'ui_request_train_module_upgrade',
      payload: { moduleId: 'module_cannon_basic_001' },
    }, 620000);
    assert(!upgrade.ok, 'module upgrade should reject insufficient fragments');
  });
}

function createProgress(): PlayerProgressSnapshot {
  return JSON.parse(JSON.stringify(createDefaultProgress())) as PlayerProgressSnapshot;
}
