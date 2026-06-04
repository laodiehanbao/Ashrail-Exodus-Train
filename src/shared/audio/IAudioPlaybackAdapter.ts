import type { AudioPlaybackRequest } from './AudioCue.types.js';

export interface IAudioPlaybackAdapter {
  play(request: AudioPlaybackRequest): void;
  stop(cueId: string): void;
  stopBus(busId: AudioPlaybackRequest['bus']): void;
}
