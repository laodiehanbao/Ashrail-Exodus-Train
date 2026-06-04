import { Random } from '../../src/core/Random.js';
import { AudioMixer } from '../../src/presentation/audio/AudioMixer.js';
import { AudioService } from '../../src/presentation/audio/AudioService.js';
import { MockAudioPlaybackAdapter } from '../../src/platform/audio/MockAudioPlaybackAdapter.js';
import type { AudioCueConfig, AudioEventConfig, AudioMixerConfig } from '../../src/shared/audio/AudioCue.types.js';
import { assert, assertEqual, runTest } from './testHarness.js';

export async function testAudioService(): Promise<void> {
  await runTest('AudioService applies mixer volume cooldown and fallback cue', () => {
    const cues: AudioCueConfig[] = [
      createCue('sfx_ui_confirm_steam_001', 'assets/audio/ui/sfx_ui_confirm_steam_001.ogg', 200),
      {
        ...createCue('sfx_stage_clear_whistle_001', 'assets/audio/placeholders/sfx_stage_clear_whistle_001.ogg', 0),
        status: 'deferred',
        fallbackCueId: 'sfx_ui_confirm_steam_001',
      },
    ];
    const mixerConfig: AudioMixerConfig = {
      masterVolume: 0.5,
      maxTotalInstances: 8,
      buses: [{ bus: 'ui', volume: 0.8, muted: false, maxInstances: 4 }],
    };
    const events: AudioEventConfig[] = [
      {
        eventId: 'audio_ui_confirm_steam',
        category: 'ui',
        variants: [
          { cueId: 'sfx_ui_confirm_steam_001', weight: 1 },
          { cueId: 'sfx_stage_clear_whistle_001', weight: 1 },
        ],
        cooldownMs: 100,
        maxPlaysPerWindow: 2,
        windowMs: 1000,
        priority: 90,
        isVoice: false,
        pitchVariance: { minSemitones: -1, maxSemitones: 1 },
        volumeVariance: { min: -0.01, max: 0.01 },
        panVariance: { min: -0.1, max: 0.1 },
        tags: ['test'],
      },
    ];
    const adapter = new MockAudioPlaybackAdapter();
    const service = new AudioService(cues, events, new AudioMixer(mixerConfig), adapter, new Random(7));

    const first = service.play('sfx_ui_confirm_steam_001', 1000);
    const blocked = service.play('sfx_ui_confirm_steam_001', 1100);
    const fallback = service.play('sfx_stage_clear_whistle_001', 1400);

    assert(first, 'first playback should create a request');
    assertClose(first.volume, 0.32, 'cue volume should multiply bus and master volume');
    assertEqual(blocked, undefined, 'cooldown should block repeated playback');
    assert(fallback, 'deferred cue should resolve fallback');
    assertEqual(fallback.cueId, 'sfx_ui_confirm_steam_001', 'fallback should play configured cue');
    assertEqual(adapter.played.length, 2, 'adapter should receive accepted requests only');
  });

  await runTest('AudioService picks audio event variants with event-level jitter and cooldown', () => {
    const cues = [
      createCue('sfx_combat_hit_iron_001', 'assets/audio/sfx/sfx_combat_hit_iron_001.ogg', 0),
      createCue('sfx_combat_hit_iron_002', 'assets/audio/sfx/sfx_combat_hit_iron_002.ogg', 0),
    ];
    const events: AudioEventConfig[] = [
      {
        eventId: 'audio_combat_hit_iron',
        category: 'combat',
        variants: [
          { cueId: 'sfx_combat_hit_iron_001', weight: 1 },
          { cueId: 'sfx_combat_hit_iron_002', weight: 1 },
        ],
        cooldownMs: 50,
        maxPlaysPerWindow: 1,
        windowMs: 75,
        priority: 62,
        isVoice: false,
        pitchVariance: { minSemitones: -2, maxSemitones: 1 },
        volumeVariance: { min: -0.05, max: 0.05 },
        panVariance: { min: -0.12, max: 0.12 },
        tags: ['test'],
      },
    ];
    const mixerConfig: AudioMixerConfig = {
      masterVolume: 1,
      maxTotalInstances: 8,
      buses: [{ bus: 'ui', volume: 1, muted: false, maxInstances: 4 }],
    };
    const adapter = new MockAudioPlaybackAdapter();
    const service = new AudioService(cues, events, new AudioMixer(mixerConfig), adapter, new Random(9));

    const first = service.playEvent('audio_combat_hit_iron', 1000);
    const blockedByCooldown = service.playEvent('audio_combat_hit_iron', 1020);
    const blockedByWindow = service.playEvent('audio_combat_hit_iron', 1060);
    const next = service.playEvent('audio_combat_hit_iron', 1100);

    assert(first, 'event should play one variant');
    assertEqual(blockedByCooldown, undefined, 'event cooldown should block repeat');
    assertEqual(blockedByWindow, undefined, 'event window limit should block repeat');
    assert(next, 'event should play again after window');
    assert(first.pan >= -0.12 && first.pan <= 0.12, 'event pan jitter should apply');
    assert(first.pitchSemitones >= -2 && first.pitchSemitones <= 1, 'event pitch jitter should apply');
  });
}

function assertClose(actual: number, expected: number, message: string): void {
  assert(Math.abs(actual - expected) < 0.000001, `${message}. Expected ${expected}, got ${actual}`);
}

function createCue(cueId: string, assetPath: string, cooldownMs: number): AudioCueConfig {
  return {
    cueId,
    assetPath,
    bus: 'ui',
    volume: 0.8,
    loop: false,
    priority: 70,
    cooldownMs,
    maxInstances: 2,
    packageTag: 'main',
    status: 'release-ready',
    targetMaxBytes: 16000,
    tags: ['test'],
  };
}
