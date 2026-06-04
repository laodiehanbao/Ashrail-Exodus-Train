import type { AdRecordSnapshot } from '../../domain/player/PlayerProgress.types.js';
import type { AdPlacementConfig } from '../../shared/ads/AdPlacement.types.js';

export type AdAvailabilityBlockReason = 'daily_limit' | 'cooldown';

export interface AdAvailabilityState {
  placementId: string;
  dailyUsed: number;
  dailyRemaining: number;
  cooldownRemainingMs: number;
  available: boolean;
  blockReason?: AdAvailabilityBlockReason;
}

export function createAdAvailabilityState(
  records: AdRecordSnapshot,
  config: AdPlacementConfig,
  nowMs: number,
): AdAvailabilityState {
  const dailyUsed = records.dailyCounts[config.placementId] ?? 0;
  const dailyRemaining = Math.max(0, config.dailyLimit - dailyUsed);
  const lastShownAtMs = records.lastShownAtMs[config.placementId] ?? 0;
  const cooldownRemainingMs = getCooldownRemainingMs(lastShownAtMs, config.cooldownSeconds, nowMs);
  const blockReason = getBlockReason(dailyRemaining, cooldownRemainingMs);

  return {
    placementId: config.placementId,
    dailyUsed,
    dailyRemaining,
    cooldownRemainingMs,
    available: blockReason === undefined,
    blockReason,
  };
}

function getCooldownRemainingMs(lastShownAtMs: number, cooldownSeconds: number, nowMs: number): number {
  if (lastShownAtMs <= 0) return 0;
  return Math.max(0, cooldownSeconds * 1000 - (nowMs - lastShownAtMs));
}

function getBlockReason(
  dailyRemaining: number,
  cooldownRemainingMs: number,
): AdAvailabilityBlockReason | undefined {
  if (dailyRemaining <= 0) return 'daily_limit';
  return cooldownRemainingMs > 0 ? 'cooldown' : undefined;
}
