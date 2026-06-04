import type { PlayerProgressSnapshot } from '../../domain/player/PlayerProgress.types.js';

export interface P0UiSnapshot {
  progress: PlayerProgressSnapshot;
  power: number;
}
