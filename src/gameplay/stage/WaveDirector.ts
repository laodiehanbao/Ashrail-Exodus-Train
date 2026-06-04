import type { StageWaveConfig } from '../../domain/stage/Stage.types.js';

export class WaveDirector {
  private readonly wavesById: Map<string, StageWaveConfig>;

  constructor(waves: StageWaveConfig[]) {
    this.wavesById = new Map(waves.map((wave) => [wave.id, wave]));
  }

  getWave(waveId: string): StageWaveConfig | undefined {
    return this.wavesById.get(waveId);
  }
}
