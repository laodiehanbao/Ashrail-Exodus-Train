import { Random } from '../../core/Random.js';
import type { IAudioPlaybackAdapter } from '../../shared/audio/IAudioPlaybackAdapter.js';
import type { AudioCueConfig, AudioEventConfig, AudioPlaybackRequest, AudioScalarVarianceConfig } from '../../shared/audio/AudioCue.types.js';
import { AudioMixer } from './AudioMixer.js';

export class AudioService {
  private readonly cuesById: Map<string, AudioCueConfig>;
  private readonly eventsById: Map<string, AudioEventConfig>;
  private readonly lastPlayTimeByCue = new Map<string, number>();
  private readonly lastPlayTimeByEvent = new Map<string, number>();
  private readonly recentCueByEvent = new Map<string, string>();
  private readonly eventPlayWindows = new Map<string, number[]>();

  constructor(
    cues: AudioCueConfig[],
    events: AudioEventConfig[],
    private readonly mixer: AudioMixer,
    private readonly adapter: IAudioPlaybackAdapter,
    private readonly random: Random,
  ) {
    this.cuesById = new Map(cues.map((cue) => [cue.cueId, cue]));
    this.eventsById = new Map(events.map((event) => [event.eventId, event]));
  }

  play(cueId: string, nowMs: number): AudioPlaybackRequest | undefined {
    const cue = this.resolveCue(cueId);
    if (!cue || !this.canPlay(cue, nowMs)) {
      return undefined;
    }

    const busVolume = this.mixer.getBusVolume(cue.bus);
    if (busVolume <= 0) {
      return undefined;
    }

    const request = this.createRequest(cue, nowMs, undefined, undefined);
    if (!request) {
      return undefined;
    }

    this.lastPlayTimeByCue.set(cue.cueId, nowMs);
    this.adapter.play(request);
    return request;
  }

  playEvent(eventId: string, nowMs: number): AudioPlaybackRequest | undefined {
    const event = this.eventsById.get(eventId);
    if (!event || !this.canPlayEvent(event, nowMs)) {
      return undefined;
    }

    const variant = this.pickVariant(event);
    const cue = this.resolveCue(variant?.cueId ?? '');
    if (!cue || !this.canPlay(cue, nowMs)) {
      return undefined;
    }

    const request = this.createRequest(cue, nowMs, event, eventId);
    if (!request) {
      return undefined;
    }

    this.lastPlayTimeByCue.set(cue.cueId, nowMs);
    this.lastPlayTimeByEvent.set(eventId, nowMs);
    this.recentCueByEvent.set(eventId, cue.cueId);
    this.recordEventWindow(event, nowMs);
    this.adapter.play(request);
    return request;
  }

  stop(cueId: string): void {
    this.adapter.stop(cueId);
  }

  stopBus(busId: AudioPlaybackRequest['bus']): void {
    this.adapter.stopBus(busId);
  }

  private createRequest(cue: AudioCueConfig, nowMs: number, event: AudioEventConfig | undefined, eventId: string | undefined): AudioPlaybackRequest | undefined {
    const busVolume = this.mixer.getBusVolume(cue.bus);
    if (busVolume <= 0) {
      return undefined;
    }

    const volumeJitter = event?.volumeVariance ? this.rollScalar(event.volumeVariance) : 0;
    const pitchJitter = event?.pitchVariance ? this.rollPitch(event.pitchVariance) : this.rollPitch(cue.pitchVariance);
    const pan = event?.panVariance ? this.rollScalar(event.panVariance) : 0;

    return {
      eventId,
      cueId: cue.cueId,
      assetPath: cue.assetPath,
      bus: cue.bus,
      loop: cue.loop,
      volume: Math.max(0, cue.volume * busVolume + volumeJitter),
      priority: event?.priority ?? cue.priority,
      pitchSemitones: pitchJitter,
      pan,
    };
  }

  private resolveCue(cueId: string): AudioCueConfig | undefined {
    const cue = this.cuesById.get(cueId);
    if (!cue || cue.status !== 'deferred') {
      return cue;
    }

    return cue.fallbackCueId ? this.cuesById.get(cue.fallbackCueId) : undefined;
  }

  private canPlay(cue: AudioCueConfig, nowMs: number): boolean {
    const lastPlayTime = this.lastPlayTimeByCue.get(cue.cueId);
    return lastPlayTime === undefined || nowMs - lastPlayTime >= cue.cooldownMs;
  }

  private canPlayEvent(event: AudioEventConfig, nowMs: number): boolean {
    const lastPlayTime = this.lastPlayTimeByEvent.get(event.eventId);
    if (lastPlayTime !== undefined && nowMs - lastPlayTime < event.cooldownMs) {
      return false;
    }

    const windowStart = nowMs - event.windowMs;
    const plays = (this.eventPlayWindows.get(event.eventId) ?? []).filter((time) => time >= windowStart);
    this.eventPlayWindows.set(event.eventId, plays);
    return plays.length < event.maxPlaysPerWindow;
  }

  private pickVariant(event: AudioEventConfig): AudioEventConfig['variants'][number] | undefined {
    const recentCueId = this.recentCueByEvent.get(event.eventId);
    const entries = event.variants.map((variant) => ({
      value: variant,
      weight: variant.cueId === recentCueId && event.variants.length > 1 ? variant.weight * 0.05 : variant.weight,
    }));

    return this.random.pickWeighted(entries);
  }

  private recordEventWindow(event: AudioEventConfig, nowMs: number): void {
    const plays = this.eventPlayWindows.get(event.eventId) ?? [];
    plays.push(nowMs);
    this.eventPlayWindows.set(event.eventId, plays);
  }

  private rollPitch(variance: AudioCueConfig['pitchVariance']): number {
    if (!variance) {
      return 0;
    }

    const range = variance.maxSemitones - variance.minSemitones;
    return variance.minSemitones + this.random.next() * range;
  }

  private rollScalar(variance: AudioScalarVarianceConfig): number {
    return variance.min + this.random.next() * (variance.max - variance.min);
  }
}
