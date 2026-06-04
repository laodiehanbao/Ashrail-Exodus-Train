import { AdLimitService } from '../../src/gameplay/ads/AdLimitService.js';
import { loadTestConfigs } from '../unit/loadTestConfigs.js';

const configs = loadTestConfigs();
const placement = configs.adPlacements.find((item) => item.placementId === 'ad_reward_stage_clear_double');
if (!placement) {
  throw new Error('Missing stage clear ad placement');
}

const limitService = new AdLimitService({ dailyCounts: {}, lastShownAtMs: {} });
let shown = 0;
let blocked = 0;

for (let minute = 0; minute < 30; minute += 1) {
  const nowMs = minute * 60 * 1000;
  const canShow = limitService.canShow(placement, nowMs);
  if (canShow.ok) {
    limitService.recordShown(placement.placementId, nowMs);
    shown += 1;
  } else {
    blocked += 1;
  }
}

console.info(`30min ad frequency: shown=${shown}, blocked=${blocked}, dailyLimit=${placement.dailyLimit}`);
