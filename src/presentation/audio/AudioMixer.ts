import type { AudioBusId, AudioMixerConfig } from '../../shared/audio/AudioCue.types.js';

export class AudioMixer {
  private readonly buses: Map<AudioBusId, { volume: number; muted: boolean; maxInstances: number }>;

  constructor(private readonly config: AudioMixerConfig) {
    this.buses = new Map(
      config.buses.map((bus) => [
        bus.bus,
        {
          volume: bus.volume,
          muted: bus.muted,
          maxInstances: bus.maxInstances,
        },
      ]),
    );
  }

  getMasterVolume(): number {
    return this.config.masterVolume;
  }

  getMaxTotalInstances(): number {
    return this.config.maxTotalInstances;
  }

  getBusVolume(busId: AudioBusId): number {
    const bus = this.buses.get(busId);
    if (!bus || bus.muted) {
      return 0;
    }

    return bus.volume * this.config.masterVolume;
  }

  getBusMaxInstances(busId: AudioBusId): number {
    return this.buses.get(busId)?.maxInstances ?? 0;
  }

  hasBus(busId: AudioBusId): boolean {
    return this.buses.has(busId);
  }
}
