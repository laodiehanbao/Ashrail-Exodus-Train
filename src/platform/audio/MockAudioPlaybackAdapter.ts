import type { AudioPlaybackRequest } from '../../shared/audio/AudioCue.types.js';
import type { IAudioPlaybackAdapter } from '../../shared/audio/IAudioPlaybackAdapter.js';

export class MockAudioPlaybackAdapter implements IAudioPlaybackAdapter {
  readonly played: AudioPlaybackRequest[] = [];
  readonly stoppedCueIds: string[] = [];
  readonly stoppedBusIds: AudioPlaybackRequest['bus'][] = [];

  play(request: AudioPlaybackRequest): void {
    this.played.push(request);
  }

  stop(cueId: string): void {
    this.stoppedCueIds.push(cueId);
  }

  stopBus(busId: AudioPlaybackRequest['bus']): void {
    this.stoppedBusIds.push(busId);
  }
}
