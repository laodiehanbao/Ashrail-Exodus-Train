import { fail, ok, type Result } from '../../core/Result.types.js';
import type { AdRecordSnapshot } from '../../domain/player/PlayerProgress.types.js';
import { ErrorCode } from '../../shared/ErrorCodes.js';
import type { AdPlacementConfig } from '../../shared/ads/AdPlacement.types.js';
import { createAdAvailabilityState, type AdAvailabilityState } from './AdRewardAvailability.js';

export class AdLimitService {
  constructor(private readonly records: AdRecordSnapshot) {}

  canShow(config: AdPlacementConfig, nowMs: number): Result<void> {
    const availability = this.getAvailability(config, nowMs);
    if (availability.blockReason === 'daily_limit') {
      return fail(ErrorCode.AdLimitReached, `Daily ad limit reached for ${config.placementId}`);
    }

    if (availability.blockReason === 'cooldown') {
      return fail(ErrorCode.AdUnavailable, `Ad cooldown active for ${config.placementId}`);
    }

    return ok(undefined);
  }

  getAvailability(config: AdPlacementConfig, nowMs: number): AdAvailabilityState {
    return createAdAvailabilityState(this.records, config, nowMs);
  }

  recordShown(placementId: string, nowMs: number): void {
    this.records.dailyCounts[placementId] = (this.records.dailyCounts[placementId] ?? 0) + 1;
    this.records.lastShownAtMs[placementId] = nowMs;
  }

  toSnapshot(): AdRecordSnapshot {
    return {
      dailyCounts: { ...this.records.dailyCounts },
      lastShownAtMs: { ...this.records.lastShownAtMs },
    };
  }
}
