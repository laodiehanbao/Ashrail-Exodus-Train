import type { AdRecordSnapshot } from '../../domain/player/PlayerProgress.types.js';
import {
  createAdAvailabilityState,
  type AdAvailabilityBlockReason,
} from '../../gameplay/ads/AdRewardAvailability.js';
import type { AdPlacementConfig } from '../../shared/ads/AdPlacement.types.js';
import type { UiActionState, UiMetricState, UiScreenLayoutConfig } from '../../shared/ui/P0Ui.types.js';
import type { UiTextService } from './UiTextService.js';

export interface AdRewardPanelState {
  title: string;
  placementId: string;
  multiplier: number;
  dailyRemaining: number;
  cooldownRemainingMs: number;
  statusText: string;
  metrics: UiMetricState[];
  actions: UiActionState[];
  layout?: UiScreenLayoutConfig;
}

export function createAdRewardPanelState(
  placement: AdPlacementConfig,
  records: AdRecordSnapshot,
  nowMs: number,
  text?: UiTextService,
  layout?: UiScreenLayoutConfig,
): AdRewardPanelState {
  const availability = createAdAvailabilityState(records, placement, nowMs);
  const unavailableKey = getUnavailableKey(availability.blockReason);

  return {
    title: getText(text, 'ui.screen.adReward.title'),
    placementId: placement.placementId,
    multiplier: placement.rewardMultiplier,
    dailyRemaining: availability.dailyRemaining,
    cooldownRemainingMs: availability.cooldownRemainingMs,
    statusText: getText(text, availability.available ? 'ui.status.ad.available' : unavailableKey),
    metrics: [
      {
        labelKey: 'ui.button.ad.double',
        label: getText(text, 'ui.button.ad.double'),
        value: `x${placement.rewardMultiplier}`,
        accentToken: availability.available ? 'reward_gold' : 'ash_gray',
      },
    ],
    actions: createAdActions(availability.available, unavailableKey, text),
    layout,
  };
}

function createAdActions(available: boolean, unavailableKey: string, text?: UiTextService): UiActionState[] {
  return [
    {
      actionId: 'ui_request_ad_reward_double',
      labelKey: available ? 'ui.button.ad.double' : unavailableKey,
      label: getText(text, available ? 'ui.button.ad.double' : unavailableKey),
      enabled: available,
      disabledReasonKey: available ? undefined : unavailableKey,
      disabledReason: available ? undefined : getText(text, unavailableKey),
    },
    {
      actionId: 'ui_request_ad_reward_skip',
      labelKey: 'ui.button.ad.skip',
      label: getText(text, 'ui.button.ad.skip'),
      enabled: true,
    },
  ];
}

function getUnavailableKey(reason: AdAvailabilityBlockReason | undefined): string {
  if (reason === 'cooldown') return 'ui.button.ad.cooldown';
  return 'ui.status.ad.unavailable';
}

function getText(text: UiTextService | undefined, key: string): string {
  return text?.text(key) ?? key;
}
