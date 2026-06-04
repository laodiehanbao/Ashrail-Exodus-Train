export type AudioBusId = 'music' | 'ambience' | 'sfx' | 'ui' | 'voice';

export type AudioPackageTag = 'main' | 'subpackage' | 'remote' | 'placeholder';

export type AudioAssetStatus = 'release-ready' | 'placeholder' | 'deferred';

export type AudioLicenseSource =
  | 'procedural_synthesis'
  | 'procedural_synthesis_placeholder'
  | 'third_party_cc0'
  | 'third_party_commercial'
  | 'elevenlabs_creator'
  | 'elevenlabs_deferred';

export interface AudioPitchVarianceConfig {
  minSemitones: number;
  maxSemitones: number;
}

export interface AudioScalarVarianceConfig {
  min: number;
  max: number;
}

export interface AudioCueConfig {
  cueId: string;
  assetPath: string;
  bus: AudioBusId;
  volume: number;
  loop: boolean;
  priority: number;
  cooldownMs: number;
  maxInstances: number;
  packageTag: AudioPackageTag;
  status: AudioAssetStatus;
  targetMaxBytes: number;
  pitchVariance?: AudioPitchVarianceConfig;
  fallbackCueId?: string;
  tags: string[];
}

export interface AudioEventVariantConfig {
  cueId: string;
  weight: number;
}

export interface AudioEventConfig {
  eventId: string;
  category: string;
  variants: AudioEventVariantConfig[];
  cooldownMs: number;
  maxPlaysPerWindow: number;
  windowMs: number;
  priority: number;
  isVoice: boolean;
  pitchVariance?: AudioPitchVarianceConfig;
  volumeVariance?: AudioScalarVarianceConfig;
  panVariance?: AudioScalarVarianceConfig;
  tags: string[];
}

export interface AudioMixerBusConfig {
  bus: AudioBusId;
  volume: number;
  muted: boolean;
  maxInstances: number;
}

export interface AudioMixerConfig {
  buses: AudioMixerBusConfig[];
  masterVolume: number;
  maxTotalInstances: number;
}

export interface AudioBudgetConfig {
  targetMainPackageBytes: number;
  hardMainPackageBytes: number;
  generatedP0TargetBytes: number;
  maxRuntimeSfxBytes: number;
  maxRuntimeLoopBytes: number;
  maxVariantsPerEvent: number;
  maxVoiceCues: number;
  maxVoiceBytes: number;
  allowedRuntimeExtensions: string[];
  allowRuntimeWav: boolean;
}

export interface AudioLicenseEntry {
  assetId: string;
  filePath: string;
  source: AudioLicenseSource;
  license: string;
  authoring: string;
  status: AudioAssetStatus;
  commercialUseAllowed: boolean;
  attributionRequired: boolean;
  acquiredDate: string;
  sourceUrl?: string;
  promptSummary?: string;
  replacementPlan?: string;
}

export interface AudioVoiceLineConfig {
  voiceCueId: string;
  text: string;
  eventId: string;
  trigger: string;
  cooldownMs: number;
  targetMaxBytes: number;
}

export interface ElevenLabsVoiceSettingsConfig {
  stability: number;
  similarityBoost: number;
  style: number;
  useSpeakerBoost: boolean;
  speed: number;
}

export interface ElevenLabsVoicePostProcessConfig {
  channels: number;
  sampleRate: number;
  ffmpegFilter: string;
  codec: string;
  quality: number;
}

export interface ElevenLabsSelectedVoiceConfig {
  voiceId: string;
  name: string;
  category: string;
  selectionReason: string;
}

export interface ElevenLabsVoiceProfileConfig {
  profileId: string;
  displayName: string;
  primaryDirection: string;
  fallbackDirection: string;
  selectedVoice: ElevenLabsSelectedVoiceConfig;
  searchKeywords: string[];
  rejectKeywords: string[];
  auditionRules: string[];
  modelId: string;
  languageCode: string;
  outputFormat: string;
  seed: number;
  voiceSettings: ElevenLabsVoiceSettingsConfig;
  postProcess: ElevenLabsVoicePostProcessConfig;
}

export interface AudioPlaybackRequest {
  eventId?: string;
  cueId: string;
  assetPath: string;
  bus: AudioBusId;
  loop: boolean;
  volume: number;
  priority: number;
  pitchSemitones: number;
  pan: number;
}
