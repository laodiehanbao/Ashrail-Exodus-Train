import { fail, ok, type Result } from '../../core/Result.types.js';
import { ErrorCode } from '../../shared/ErrorCodes.js';
import type { AudioConfigRegistry } from './Audio.schema.js';

export function validateAudioReferences(configs: AudioConfigRegistry): Result<AudioConfigRegistry> {
  const cueIds = new Set<string>();
  const eventIds = new Set<string>();
  const mixerBuses = new Set(configs.audioMixer.buses.map((bus) => bus.bus));
  const licenseIds = new Set(configs.audioLicenses.map((entry) => entry.assetId));

  for (const cue of configs.audioCues) {
    if (cueIds.has(cue.cueId)) {
      return fail(ErrorCode.ConfigInvalid, `Duplicate audio cue ${cue.cueId}`, cue);
    }
    cueIds.add(cue.cueId);

    if (!mixerBuses.has(cue.bus)) {
      return fail(ErrorCode.ConfigMissingReference, `Audio cue references unknown mixer bus ${cue.bus}`, cue);
    }

    if (!licenseIds.has(cue.cueId)) {
      return fail(ErrorCode.ConfigMissingReference, `Audio cue missing license entry ${cue.cueId}`, cue);
    }

    if (cue.status === 'placeholder' && cue.packageTag === 'main') {
      return fail(ErrorCode.ConfigInvalid, 'Placeholder audio cue must not be tagged as main package', cue);
    }
  }

  for (const cue of configs.audioCues) {
    if (cue.fallbackCueId && !cueIds.has(cue.fallbackCueId)) {
      return fail(ErrorCode.ConfigMissingReference, `Audio cue references unknown fallback ${cue.fallbackCueId}`, cue);
    }
  }

  let voiceCueCount = 0;
  for (const event of configs.audioEvents) {
    if (eventIds.has(event.eventId)) {
      return fail(ErrorCode.ConfigInvalid, `Duplicate audio event ${event.eventId}`, event);
    }
    eventIds.add(event.eventId);

    if (event.variants.length > configs.audioBudget.maxVariantsPerEvent) {
      return fail(ErrorCode.ConfigInvalid, `Audio event ${event.eventId} has too many variants`, event);
    }

    for (const variant of event.variants) {
      const cue = configs.audioCues.find((item) => item.cueId === variant.cueId);
      if (!cue) {
        return fail(ErrorCode.ConfigMissingReference, `Audio event references unknown cue ${variant.cueId}`, event);
      }

      if (event.isVoice) {
        voiceCueCount += 1;
        if (cue.bus !== 'voice') {
          return fail(ErrorCode.ConfigInvalid, `Voice audio event references non-voice cue ${cue.cueId}`, event);
        }
      }
    }
  }

  if (voiceCueCount > configs.audioBudget.maxVoiceCues) {
    return fail(ErrorCode.ConfigInvalid, `Audio voice cue count exceeds budget: ${voiceCueCount}`, configs.audioBudget);
  }

  if (configs.audioBudget.hardMainPackageBytes < configs.audioBudget.targetMainPackageBytes) {
    return fail(ErrorCode.ConfigInvalid, 'Audio hard budget must be >= target budget', configs.audioBudget);
  }

  return ok(configs);
}
