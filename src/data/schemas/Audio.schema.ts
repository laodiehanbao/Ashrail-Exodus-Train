import { fail, ok, type Result } from '../../core/Result.types.js';
import { ErrorCode } from '../../shared/ErrorCodes.js';
import type {
  AudioAssetStatus,
  AudioBudgetConfig,
  AudioBusId,
  AudioCueConfig,
  AudioEventConfig,
  AudioLicenseEntry,
  AudioMixerBusConfig,
  AudioMixerConfig,
  AudioPackageTag,
  AudioPitchVarianceConfig,
  AudioVoiceLineConfig,
  ElevenLabsVoiceProfileConfig,
} from '../../shared/audio/AudioCue.types.js';
import { asArray, asRecord, readArray, readBoolean, readNumber, readString, validationError } from './commonValidation.js';
import { validateAudioLicenses } from './AudioLicense.schema.js';
import { validateAudioEvents } from './AudioEvent.schema.js';
import { validateAudioReferences } from './AudioReferences.schema.js';
import { validateAudioVoiceLines } from './AudioVoiceLine.schema.js';
import { validateElevenLabsVoiceProfile } from './AudioVoiceProfile.schema.js';

const AUDIO_BUSES: AudioBusId[] = ['music', 'ambience', 'sfx', 'ui', 'voice'];
const PACKAGE_TAGS: AudioPackageTag[] = ['main', 'subpackage', 'remote', 'placeholder'];
const ASSET_STATUSES: AudioAssetStatus[] = ['release-ready', 'placeholder', 'deferred'];
export interface AudioConfigSources {
  audioCues: unknown;
  audioEvents: unknown;
  audioMixer: unknown;
  audioBudget: unknown;
  audioLicenses: unknown;
  audioVoiceLines: unknown;
  elevenLabsVoiceProfile: unknown;
}

export interface AudioConfigRegistry {
  audioCues: AudioCueConfig[];
  audioEvents: AudioEventConfig[];
  audioMixer: AudioMixerConfig;
  audioBudget: AudioBudgetConfig;
  audioLicenses: AudioLicenseEntry[];
  audioVoiceLines: AudioVoiceLineConfig[];
  elevenLabsVoiceProfile: ElevenLabsVoiceProfileConfig;
}

export function validateAudioConfigSources(sources: AudioConfigSources): Result<AudioConfigRegistry> {
  const audioCues = validateAudioCues(sources.audioCues);
  const audioEvents = validateAudioEvents(sources.audioEvents);
  const audioMixer = validateAudioMixer(sources.audioMixer);
  const audioBudget = validateAudioBudget(sources.audioBudget);
  const audioLicenses = validateAudioLicenses(sources.audioLicenses);
  const audioVoiceLines = validateAudioVoiceLines(sources.audioVoiceLines);
  const elevenLabsVoiceProfile = validateElevenLabsVoiceProfile(sources.elevenLabsVoiceProfile);

  if (!audioCues.ok) return audioCues;
  if (!audioEvents.ok) return audioEvents;
  if (!audioMixer.ok) return audioMixer;
  if (!audioBudget.ok) return audioBudget;
  if (!audioLicenses.ok) return audioLicenses;
  if (!audioVoiceLines.ok) return audioVoiceLines;
  if (!elevenLabsVoiceProfile.ok) return elevenLabsVoiceProfile;

  return validateAudioReferences({
    audioCues: audioCues.value,
    audioEvents: audioEvents.value,
    audioMixer: audioMixer.value,
    audioBudget: audioBudget.value,
    audioLicenses: audioLicenses.value,
    audioVoiceLines: audioVoiceLines.value,
    elevenLabsVoiceProfile: elevenLabsVoiceProfile.value,
  });
}

export function validateAudioCues(input: unknown): Result<AudioCueConfig[]> {
  const array = asArray(input, 'AudioCues');
  if (!array.ok) return array;

  const cues: AudioCueConfig[] = [];
  for (const item of array.value) {
    const record = asRecord(item, 'AudioCue');
    if (!record.ok) return record;

    const cueId = readString(record.value, 'cueId');
    const assetPath = readString(record.value, 'assetPath');
    const bus = readString(record.value, 'bus');
    const volume = readNumber(record.value, 'volume', 0);
    const loop = readBoolean(record.value, 'loop');
    const priority = readNumber(record.value, 'priority', 0);
    const cooldownMs = readNumber(record.value, 'cooldownMs', 0);
    const maxInstances = readNumber(record.value, 'maxInstances', 1);
    const packageTag = readString(record.value, 'packageTag');
    const status = readString(record.value, 'status');
    const targetMaxBytes = readNumber(record.value, 'targetMaxBytes', 1);
    const tags = readArray(record.value, 'tags');

    if (
      !cueId.ok ||
      !assetPath.ok ||
      !bus.ok ||
      !volume.ok ||
      !loop.ok ||
      !priority.ok ||
      !cooldownMs.ok ||
      !maxInstances.ok ||
      !packageTag.ok ||
      !status.ok ||
      !targetMaxBytes.ok ||
      !tags.ok
    ) {
      return validationError<AudioCueConfig[]>(
        cueId,
        assetPath,
        bus,
        volume,
        loop,
        priority,
        cooldownMs,
        maxInstances,
        packageTag,
        status,
        targetMaxBytes,
        tags,
      );
    }

    const enumCheck = validateCueEnums(bus.value, packageTag.value, status.value, record.value);
    if (!enumCheck.ok) return enumCheck;

    const pitchVariance = parsePitchVariance(record.value.pitchVariance);
    if (!pitchVariance.ok) return pitchVariance;

    cues.push({
      cueId: cueId.value,
      assetPath: assetPath.value,
      bus: bus.value as AudioBusId,
      volume: volume.value,
      loop: loop.value,
      priority: priority.value,
      cooldownMs: cooldownMs.value,
      maxInstances: maxInstances.value,
      packageTag: packageTag.value as AudioPackageTag,
      status: status.value as AudioAssetStatus,
      targetMaxBytes: targetMaxBytes.value,
      pitchVariance: pitchVariance.value,
      fallbackCueId: typeof record.value.fallbackCueId === 'string' ? record.value.fallbackCueId : undefined,
      tags: tags.value.map(String),
    });
  }

  return ok(cues);
}

export function validateAudioMixer(input: unknown): Result<AudioMixerConfig> {
  const record = asRecord(input, 'AudioMixer');
  if (!record.ok) return record;

  const buses = readArray(record.value, 'buses');
  const masterVolume = readNumber(record.value, 'masterVolume', 0);
  const maxTotalInstances = readNumber(record.value, 'maxTotalInstances', 1);
  if (!buses.ok || !masterVolume.ok || !maxTotalInstances.ok) {
    return validationError<AudioMixerConfig>(buses, masterVolume, maxTotalInstances);
  }

  const parsedBuses: AudioMixerBusConfig[] = [];
  for (const busItem of buses.value) {
    const busRecord = asRecord(busItem, 'AudioMixerBus');
    if (!busRecord.ok) return busRecord;

    const bus = readString(busRecord.value, 'bus');
    const volume = readNumber(busRecord.value, 'volume', 0);
    const muted = readBoolean(busRecord.value, 'muted');
    const maxInstances = readNumber(busRecord.value, 'maxInstances', 1);
    if (!bus.ok || !volume.ok || !muted.ok || !maxInstances.ok) {
      return validationError<AudioMixerConfig>(bus, volume, muted, maxInstances);
    }

    if (!AUDIO_BUSES.includes(bus.value as AudioBusId)) {
      return fail(ErrorCode.ConfigInvalid, `Unknown audio mixer bus ${bus.value}`, busRecord.value);
    }

    parsedBuses.push({
      bus: bus.value as AudioBusId,
      volume: volume.value,
      muted: muted.value,
      maxInstances: maxInstances.value,
    });
  }

  return ok({
    buses: parsedBuses,
    masterVolume: masterVolume.value,
    maxTotalInstances: maxTotalInstances.value,
  });
}

export function validateAudioBudget(input: unknown): Result<AudioBudgetConfig> {
  const record = asRecord(input, 'AudioBudget');
  if (!record.ok) return record;

  const targetMainPackageBytes = readNumber(record.value, 'targetMainPackageBytes', 1);
  const hardMainPackageBytes = readNumber(record.value, 'hardMainPackageBytes', 1);
  const generatedP0TargetBytes = readNumber(record.value, 'generatedP0TargetBytes', 1);
  const maxRuntimeSfxBytes = readNumber(record.value, 'maxRuntimeSfxBytes', 1);
  const maxRuntimeLoopBytes = readNumber(record.value, 'maxRuntimeLoopBytes', 1);
  const maxVariantsPerEvent = readNumber(record.value, 'maxVariantsPerEvent', 1);
  const maxVoiceCues = readNumber(record.value, 'maxVoiceCues', 0);
  const maxVoiceBytes = readNumber(record.value, 'maxVoiceBytes', 0);
  const allowedRuntimeExtensions = readArray(record.value, 'allowedRuntimeExtensions');
  const allowRuntimeWav = readBoolean(record.value, 'allowRuntimeWav');
  if (
    !targetMainPackageBytes.ok ||
    !hardMainPackageBytes.ok ||
    !generatedP0TargetBytes.ok ||
    !maxRuntimeSfxBytes.ok ||
    !maxRuntimeLoopBytes.ok ||
    !maxVariantsPerEvent.ok ||
    !maxVoiceCues.ok ||
    !maxVoiceBytes.ok ||
    !allowedRuntimeExtensions.ok ||
    !allowRuntimeWav.ok
  ) {
    return validationError<AudioBudgetConfig>(
      targetMainPackageBytes,
      hardMainPackageBytes,
      generatedP0TargetBytes,
      maxRuntimeSfxBytes,
      maxRuntimeLoopBytes,
      maxVariantsPerEvent,
      maxVoiceCues,
      maxVoiceBytes,
      allowedRuntimeExtensions,
      allowRuntimeWav,
    );
  }

  return ok({
    targetMainPackageBytes: targetMainPackageBytes.value,
    hardMainPackageBytes: hardMainPackageBytes.value,
    generatedP0TargetBytes: generatedP0TargetBytes.value,
    maxRuntimeSfxBytes: maxRuntimeSfxBytes.value,
    maxRuntimeLoopBytes: maxRuntimeLoopBytes.value,
    maxVariantsPerEvent: maxVariantsPerEvent.value,
    maxVoiceCues: maxVoiceCues.value,
    maxVoiceBytes: maxVoiceBytes.value,
    allowedRuntimeExtensions: allowedRuntimeExtensions.value.map(String),
    allowRuntimeWav: allowRuntimeWav.value,
  });
}

function parsePitchVariance(input: unknown): Result<AudioPitchVarianceConfig | undefined> {
  if (input === undefined) {
    return ok(undefined);
  }

  const record = asRecord(input, 'AudioPitchVariance');
  if (!record.ok) return record;

  const minSemitones = readNumber(record.value, 'minSemitones', -24);
  const maxSemitones = readNumber(record.value, 'maxSemitones', -24);
  if (!minSemitones.ok || !maxSemitones.ok) {
    return validationError<AudioPitchVarianceConfig | undefined>(minSemitones, maxSemitones);
  }

  if (minSemitones.value > maxSemitones.value) {
    return fail(ErrorCode.ConfigInvalid, 'Audio pitch variance minSemitones must be <= maxSemitones', record.value);
  }

  return ok({ minSemitones: minSemitones.value, maxSemitones: maxSemitones.value });
}

function validateCueEnums(bus: string, packageTag: string, status: string, context: unknown): Result<void> {
  if (!AUDIO_BUSES.includes(bus as AudioBusId)) {
    return fail(ErrorCode.ConfigInvalid, `Unknown audio cue bus ${bus}`, context);
  }

  if (!PACKAGE_TAGS.includes(packageTag as AudioPackageTag)) {
    return fail(ErrorCode.ConfigInvalid, `Unknown audio package tag ${packageTag}`, context);
  }

  if (!ASSET_STATUSES.includes(status as AudioAssetStatus)) {
    return fail(ErrorCode.ConfigInvalid, `Unknown audio status ${status}`, context);
  }

  return ok(undefined);
}
