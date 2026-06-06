import { AudioSource } from 'cc';
import type { AudioBusId, AudioPlaybackRequest } from '../../shared/audio/AudioCue.types.js';
import type { IAudioPlaybackAdapter } from '../../shared/audio/IAudioPlaybackAdapter.js';
import { CocosCreatorAssetRegistryComponent } from '../../presentation/ui/cocos/creator/CocosCreatorAssetRegistryComponent.js';

export class CocosCreatorAudioPlaybackAdapter implements IAudioPlaybackAdapter {
  private readonly activeLoopCueIds = new Set<string>();

  constructor(
    private readonly registry: CocosCreatorAssetRegistryComponent | null,
    private readonly audioSource: AudioSource,
  ) {}

  play(request: AudioPlaybackRequest): void {
    const clip = this.registry?.resolveAudioClip(request.cueId);
    if (!clip) return;

    if (request.loop) {
      this.audioSource.clip = clip;
      this.audioSource.loop = true;
      this.audioSource.volume = request.volume;
      this.audioSource.play();
      this.activeLoopCueIds.add(request.cueId);
      return;
    }

    this.audioSource.playOneShot(clip, request.volume);
  }

  stop(cueId: string): void {
    if (!this.activeLoopCueIds.has(cueId)) return;
    this.audioSource.stop();
    this.activeLoopCueIds.delete(cueId);
  }

  stopBus(_busId: AudioBusId): void {
    this.audioSource.stop();
    this.activeLoopCueIds.clear();
  }
}
