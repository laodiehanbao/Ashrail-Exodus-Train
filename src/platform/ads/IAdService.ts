import type { AdPlayRequest, AdPlayResult } from './AdService.types.js';

export interface IAdService {
  playRewardedAd(request: AdPlayRequest): Promise<AdPlayResult>;
}
