import { ok, type Result } from '../../core/Result.types.js';
import type { AudioVoiceLineConfig } from '../../shared/audio/AudioCue.types.js';
import { asArray, asRecord, readNumber, readString, validationError } from './commonValidation.js';

export function validateAudioVoiceLines(input: unknown): Result<AudioVoiceLineConfig[]> {
  const array = asArray(input, 'VoiceLines');
  if (!array.ok) return array;

  const voiceLines: AudioVoiceLineConfig[] = [];
  for (const item of array.value) {
    const record = asRecord(item, 'VoiceLine');
    if (!record.ok) return record;

    const voiceCueId = readString(record.value, 'voiceCueId');
    const text = readString(record.value, 'text');
    const eventId = readString(record.value, 'eventId');
    const trigger = readString(record.value, 'trigger');
    const cooldownMs = readNumber(record.value, 'cooldownMs', 1000);
    const targetMaxBytes = readNumber(record.value, 'targetMaxBytes', 1);
    if (!voiceCueId.ok || !text.ok || !eventId.ok || !trigger.ok || !cooldownMs.ok || !targetMaxBytes.ok) {
      return validationError<AudioVoiceLineConfig[]>(voiceCueId, text, eventId, trigger, cooldownMs, targetMaxBytes);
    }

    voiceLines.push({
      voiceCueId: voiceCueId.value,
      text: text.value,
      eventId: eventId.value,
      trigger: trigger.value,
      cooldownMs: cooldownMs.value,
      targetMaxBytes: targetMaxBytes.value,
    });
  }

  return ok(voiceLines);
}
