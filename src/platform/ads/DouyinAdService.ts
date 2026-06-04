import type { AdPlayRequest, AdPlayResult } from './AdService.types.js';
import type { IAdService } from './IAdService.js';

export class DouyinAdService implements IAdService {
  async playRewardedAd(request: AdPlayRequest): Promise<AdPlayResult> {
    return {
      placementId: request.placementId,
      status: 'failed',
      completedAtMs: request.requestedAtMs,
    };
  }
}
