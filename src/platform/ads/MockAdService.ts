import type { AdPlayRequest, AdPlayResult } from './AdService.types.js';
import type { AdPlayStatus } from '../../shared/GameEnums.js';
import type { IAdService } from './IAdService.js';

export class MockAdService implements IAdService {
  private readonly statuses: AdPlayStatus[];
  private cursor = 0;

  constructor(statuses: AdPlayStatus[] = ['success']) {
    this.statuses = statuses;
  }

  async playRewardedAd(request: AdPlayRequest): Promise<AdPlayResult> {
    const status = this.statuses[this.cursor % this.statuses.length];
    this.cursor += 1;

    return {
      placementId: request.placementId,
      status,
      completedAtMs: request.requestedAtMs + 1000,
    };
  }
}
