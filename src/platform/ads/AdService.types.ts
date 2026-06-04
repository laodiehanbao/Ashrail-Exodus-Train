import type { AdPlayStatus } from '../../shared/GameEnums.js';
import type { AdPlacementId } from '../../shared/ids.types.js';

export interface AdPlayRequest {
  placementId: AdPlacementId;
  requestedAtMs: number;
}

export interface AdPlayResult {
  placementId: AdPlacementId;
  status: AdPlayStatus;
  completedAtMs: number;
}
