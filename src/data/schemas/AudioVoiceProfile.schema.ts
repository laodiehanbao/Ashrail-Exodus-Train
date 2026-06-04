import { fail, ok, type Result } from '../../core/Result.types.js';
import { ErrorCode } from '../../shared/ErrorCodes.js';
import type {
  ElevenLabsVoicePostProcessConfig,
  ElevenLabsVoiceProfileConfig,
  ElevenLabsSelectedVoiceConfig,
  ElevenLabsVoiceSettingsConfig,
} from '../../shared/audio/AudioCue.types.js';
import { asRecord, readArray, readBoolean, readNumber, readString, validationError } from './commonValidation.js';

export function validateElevenLabsVoiceProfile(input: unknown): Result<ElevenLabsVoiceProfileConfig> {
  const record = asRecord(input, 'ElevenLabsVoiceProfile');
  if (!record.ok) return record;

  const profileId = readString(record.value, 'profileId');
  const displayName = readString(record.value, 'displayName');
  const primaryDirection = readString(record.value, 'primaryDirection');
  const fallbackDirection = readString(record.value, 'fallbackDirection');
  const selectedVoice = parseSelectedVoice(record.value.selectedVoice);
  const searchKeywords = readStringArray(record.value, 'searchKeywords');
  const rejectKeywords = readStringArray(record.value, 'rejectKeywords');
  const auditionRules = readStringArray(record.value, 'auditionRules');
  const modelId = readString(record.value, 'modelId');
  const languageCode = readString(record.value, 'languageCode');
  const outputFormat = readString(record.value, 'outputFormat');
  const seed = readNumber(record.value, 'seed', 0);
  const voiceSettings = parseVoiceSettings(record.value.voiceSettings);
  const postProcess = parsePostProcess(record.value.postProcess);

  if (
    !profileId.ok ||
    !displayName.ok ||
    !primaryDirection.ok ||
    !fallbackDirection.ok ||
    !selectedVoice.ok ||
    !searchKeywords.ok ||
    !rejectKeywords.ok ||
    !auditionRules.ok ||
    !modelId.ok ||
    !languageCode.ok ||
    !outputFormat.ok ||
    !seed.ok ||
    !voiceSettings.ok ||
    !postProcess.ok
  ) {
    return validationError<ElevenLabsVoiceProfileConfig>(
      profileId,
      displayName,
      primaryDirection,
      fallbackDirection,
      selectedVoice,
      searchKeywords,
      rejectKeywords,
      auditionRules,
      modelId,
      languageCode,
      outputFormat,
      seed,
      voiceSettings,
      postProcess,
    );
  }

  return ok({
    profileId: profileId.value,
    displayName: displayName.value,
    primaryDirection: primaryDirection.value,
    fallbackDirection: fallbackDirection.value,
    selectedVoice: selectedVoice.value,
    searchKeywords: searchKeywords.value,
    rejectKeywords: rejectKeywords.value,
    auditionRules: auditionRules.value,
    modelId: modelId.value,
    languageCode: languageCode.value,
    outputFormat: outputFormat.value,
    seed: seed.value,
    voiceSettings: voiceSettings.value,
    postProcess: postProcess.value,
  });
}

function parseSelectedVoice(input: unknown): Result<ElevenLabsSelectedVoiceConfig> {
  const record = asRecord(input, 'ElevenLabsSelectedVoice');
  if (!record.ok) return record;

  const voiceId = readString(record.value, 'voiceId');
  const name = readString(record.value, 'name');
  const category = readString(record.value, 'category');
  const selectionReason = readString(record.value, 'selectionReason');
  if (!voiceId.ok || !name.ok || !category.ok || !selectionReason.ok) {
    return validationError<ElevenLabsSelectedVoiceConfig>(voiceId, name, category, selectionReason);
  }

  return ok({
    voiceId: voiceId.value,
    name: name.value,
    category: category.value,
    selectionReason: selectionReason.value,
  });
}

function parseVoiceSettings(input: unknown): Result<ElevenLabsVoiceSettingsConfig> {
  const record = asRecord(input, 'ElevenLabsVoiceSettings');
  if (!record.ok) return record;

  const stability = readUnitNumber(record.value, 'stability');
  const similarityBoost = readUnitNumber(record.value, 'similarityBoost');
  const style = readUnitNumber(record.value, 'style');
  const useSpeakerBoost = readBoolean(record.value, 'useSpeakerBoost');
  const speed = readNumber(record.value, 'speed', 0.7);
  if (!stability.ok || !similarityBoost.ok || !style.ok || !useSpeakerBoost.ok || !speed.ok) {
    return validationError<ElevenLabsVoiceSettingsConfig>(
      stability,
      similarityBoost,
      style,
      useSpeakerBoost,
      speed,
    );
  }

  if (speed.value > 1.2) {
    return fail(ErrorCode.ConfigInvalid, 'ElevenLabs voice speed must be <= 1.2', record.value);
  }

  return ok({
    stability: stability.value,
    similarityBoost: similarityBoost.value,
    style: style.value,
    useSpeakerBoost: useSpeakerBoost.value,
    speed: speed.value,
  });
}

function parsePostProcess(input: unknown): Result<ElevenLabsVoicePostProcessConfig> {
  const record = asRecord(input, 'ElevenLabsVoicePostProcess');
  if (!record.ok) return record;

  const channels = readNumber(record.value, 'channels', 1);
  const sampleRate = readNumber(record.value, 'sampleRate', 8000);
  const ffmpegFilter = readString(record.value, 'ffmpegFilter');
  const codec = readString(record.value, 'codec');
  const quality = readNumber(record.value, 'quality', 0);
  if (!channels.ok || !sampleRate.ok || !ffmpegFilter.ok || !codec.ok || !quality.ok) {
    return validationError<ElevenLabsVoicePostProcessConfig>(
      channels,
      sampleRate,
      ffmpegFilter,
      codec,
      quality,
    );
  }

  if (channels.value !== 1) {
    return fail(ErrorCode.ConfigInvalid, 'Runtime voice must be mono', record.value);
  }

  return ok({
    channels: channels.value,
    sampleRate: sampleRate.value,
    ffmpegFilter: ffmpegFilter.value,
    codec: codec.value,
    quality: quality.value,
  });
}

function readStringArray(record: Record<string, unknown>, field: string): Result<string[]> {
  const array = readArray(record, field);
  if (!array.ok) return array;

  if (array.value.some((item) => typeof item !== 'string' || item.length === 0)) {
    return fail(ErrorCode.ConfigInvalid, `${field} must contain non-empty strings`, record);
  }

  return ok(array.value as string[]);
}

function readUnitNumber(record: Record<string, unknown>, field: string): Result<number> {
  const value = readNumber(record, field, 0);
  if (!value.ok) return value;

  if (value.value > 1) {
    return fail(ErrorCode.ConfigInvalid, `${field} must be <= 1`, record);
  }

  return value;
}
