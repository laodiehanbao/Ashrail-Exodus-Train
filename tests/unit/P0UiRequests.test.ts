import type { UiActionId, UiInteractionRequest } from '../../src/shared/ui/P0Ui.types.js';
import { assert, assertEqual, runTest } from './testHarness.js';

const EXPECTED_ACTIONS: UiActionId[] = [
  'ui_request_stage_start',
  'ui_request_lootbox_open',
  'ui_request_reward_claim',
  'ui_request_train_module_upgrade',
  'ui_request_ad_reward_double',
  'ui_request_ad_reward_skip',
];

const REQUEST_SAMPLES: UiInteractionRequest[] = [
  { actionId: 'ui_request_stage_start' },
  { actionId: 'ui_request_lootbox_open', payload: { lootBoxId: 'lootbox_supply_common' } },
  { actionId: 'ui_request_reward_claim', payload: { sourceId: 'reward_stage_clear_001' } },
  { actionId: 'ui_request_train_module_upgrade', payload: { moduleId: 'module_cannon_basic_001' } },
  { actionId: 'ui_request_ad_reward_double', payload: { placementId: 'ad_reward_stage_clear_double' } },
  { actionId: 'ui_request_ad_reward_skip', payload: { placementId: 'ad_reward_stage_clear_double' } },
];

const ALLOWED_PAYLOAD_KEYS: Record<UiActionId, string[]> = {
  ui_request_stage_start: [],
  ui_request_lootbox_open: ['lootBoxId'],
  ui_request_reward_claim: ['sourceId'],
  ui_request_train_module_upgrade: ['moduleId'],
  ui_request_ad_reward_double: ['placementId'],
  ui_request_ad_reward_skip: ['placementId'],
};

export async function testP0UiRequests(): Promise<void> {
  await runTest('P0 UI request contract exposes only stable action payloads', () => {
    assertEqual(REQUEST_SAMPLES.length, EXPECTED_ACTIONS.length, 'request samples should cover every action');

    for (const request of REQUEST_SAMPLES) {
      assert(EXPECTED_ACTIONS.includes(request.actionId), `Unexpected UI action ${request.actionId}`);
      const payload = 'payload' in request ? request.payload : {};
      const keys = Object.keys(payload);
      assertEqual(
        keys.join(','),
        ALLOWED_PAYLOAD_KEYS[request.actionId].join(','),
        `${request.actionId} should only expose allowed payload keys`,
      );
      for (const value of Object.values(payload)) {
        assertEqual(typeof value, 'string', 'UI request payload values should be stable string IDs');
      }
    }
  });
}
