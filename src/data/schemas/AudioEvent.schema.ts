import { fail, ok, type Result } from '../../core/Result.types.js';
import { ErrorCode } from '../../shared/ErrorCodes.js';
import type { AudioEventConfig, AudioEventVariantConfig, AudioPitchVarianceConfig, AudioScalarVarianceConfig } from '../../shared/audio/AudioCue.types.js';
import { asArray, asRecord, readArray, readBoolean, readNumber, readString, validationError } from './commonValidation.js';

export function validateAudioEvents(input: unknown): Result<AudioEventConfig[]> {
  const array = asArray(input, 'AudioEvents');
  if (!array.ok) return array;

  const events: AudioEventConfig[] = [];
  for (const item of array.value) {
    const record = asRecord(item, 'AudioEvent');
    if (!record.ok) return record;

    const eventId = readString(record.value, 'eventId');
    const category = readString(record.value, 'category');
    const variants = readArray(record.value, 'variants');
    const cooldownMs = readNumber(record.value, 'cooldownMs', 0);
    const maxPlaysPerWindow = readNumber(record.value, 'maxPlaysPerWindow', 1);
    const windowMs = readNumber(record.value, 'windowMs', 1);
    const priority = readNumber(record.value, 'priority', 0);
    const isVoice = readBoolean(record.value, 'isVoice');
    const tags = readArray(record.value, 'tags');
    if (!eventId.ok || !category.ok || !variants.ok || !cooldownMs.ok || !maxPlaysPerWindow.ok || !windowMs.ok || !priority.ok || !isVoice.ok || !tags.ok) {
      return validationError<AudioEventConfig[]>(eventId, category, variants, cooldownMs, maxPlaysPerWindow, windowMs, priority, isVoice, tags);
    }

    const parsedVariants = parseVariants(variants.value);
    const pitchVariance = parsePitchVariance(record.value.pitchVariance);
    const volumeVariance = parseScalarVariance(record.value.volumeVariance, 'AudioEventVolumeVariance');
    const panVariance = parseScalarVariance(record.value.panVariance, 'AudioEventPanVariance');
    if (!parsedVariants.ok) return parsedVariants;
    if (!pitchVariance.ok) return pitchVariance;
    if (!volumeVariance.ok) return volumeVariance;
    if (!panVariance.ok) return panVariance;

    events.push({
      eventId: eventId.value,
      category: category.value,
      variants: parsedVariants.value,
      cooldownMs: cooldownMs.value,
      maxPlaysPerWindow: maxPlaysPerWindow.value,
      windowMs: windowMs.value,
      priority: priority.value,
      isVoice: isVoice.value,
      pitchVariance: pitchVariance.value,
      volumeVariance: volumeVariance.value,
      panVariance: panVariance.value,
      tags: tags.value.map(String),
    });
  }

  return ok(events);
}

function parseVariants(input: unknown[]): Result<AudioEventVariantConfig[]> {
  const variants: AudioEventVariantConfig[] = [];
  for (const item of input) {
    const record = asRecord(item, 'AudioEventVariant');
    if (!record.ok) return record;

    const cueId = readString(record.value, 'cueId');
    const weight = readNumber(record.value, 'weight', 0.0001);
    if (!cueId.ok || !weight.ok) {
      return validationError<AudioEventVariantConfig[]>(cueId, weight);
    }

    variants.push({ cueId: cueId.value, weight: weight.value });
  }

  return ok(variants);
}

function parsePitchVariance(input: unknown): Result<AudioPitchVarianceConfig | undefined> {
  if (input === undefined) return ok(undefined);
  const record = asRecord(input, 'AudioEventPitchVariance');
  if (!record.ok) return record;

  const minSemitones = readNumber(record.value, 'minSemitones', -24);
  const maxSemitones = readNumber(record.value, 'maxSemitones', -24);
  if (!minSemitones.ok || !maxSemitones.ok) {
    return validationError<AudioPitchVarianceConfig | undefined>(minSemitones, maxSemitones);
  }

  if (minSemitones.value > maxSemitones.value) {
    return fail(ErrorCode.ConfigInvalid, 'Audio event pitch minSemitones must be <= maxSemitones', record.value);
  }

  return ok({ minSemitones: minSemitones.value, maxSemitones: maxSemitones.value });
}

function parseScalarVariance(input: unknown, label: string): Result<AudioScalarVarianceConfig | undefined> {
  if (input === undefined) return ok(undefined);
  const record = asRecord(input, label);
  if (!record.ok) return record;

  const min = readNumber(record.value, 'min', -1);
  const max = readNumber(record.value, 'max', -1);
  if (!min.ok || !max.ok) {
    return validationError<AudioScalarVarianceConfig | undefined>(min, max);
  }

  if (min.value > max.value) {
    return fail(ErrorCode.ConfigInvalid, `${label} min must be <= max`, record.value);
  }

  return ok({ min: min.value, max: max.value });
}
