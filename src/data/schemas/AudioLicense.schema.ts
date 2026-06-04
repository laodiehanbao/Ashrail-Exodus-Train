import { fail, ok, type Result } from '../../core/Result.types.js';
import { ErrorCode } from '../../shared/ErrorCodes.js';
import type { AudioAssetStatus, AudioLicenseEntry, AudioLicenseSource } from '../../shared/audio/AudioCue.types.js';
import { asArray, asRecord, readBoolean, readString, validationError } from './commonValidation.js';

const ASSET_STATUSES: AudioAssetStatus[] = ['release-ready', 'placeholder', 'deferred'];
const LICENSE_SOURCES: AudioLicenseSource[] = [
  'procedural_synthesis',
  'procedural_synthesis_placeholder',
  'third_party_cc0',
  'third_party_commercial',
  'elevenlabs_creator',
  'elevenlabs_deferred',
];

export function validateAudioLicenses(input: unknown): Result<AudioLicenseEntry[]> {
  const array = asArray(input, 'AudioLicenseManifest');
  if (!array.ok) return array;

  const licenses: AudioLicenseEntry[] = [];
  for (const item of array.value) {
    const record = asRecord(item, 'AudioLicenseEntry');
    if (!record.ok) return record;

    const assetId = readString(record.value, 'assetId');
    const filePath = readString(record.value, 'filePath');
    const source = readString(record.value, 'source');
    const license = readString(record.value, 'license');
    const authoring = readString(record.value, 'authoring');
    const status = readString(record.value, 'status');
    const commercialUseAllowed = readBoolean(record.value, 'commercialUseAllowed');
    const attributionRequired = readBoolean(record.value, 'attributionRequired');
    const acquiredDate = readString(record.value, 'acquiredDate');

    if (
      !assetId.ok ||
      !filePath.ok ||
      !source.ok ||
      !license.ok ||
      !authoring.ok ||
      !status.ok ||
      !commercialUseAllowed.ok ||
      !attributionRequired.ok ||
      !acquiredDate.ok
    ) {
      return validationError<AudioLicenseEntry[]>(
        assetId,
        filePath,
        source,
        license,
        authoring,
        status,
        commercialUseAllowed,
        attributionRequired,
        acquiredDate,
      );
    }

    const enumCheck = validateLicenseEnums(source.value, status.value, record.value);
    if (!enumCheck.ok) return enumCheck;

    licenses.push({
      assetId: assetId.value,
      filePath: filePath.value,
      source: source.value as AudioLicenseSource,
      license: license.value,
      authoring: authoring.value,
      status: status.value as AudioAssetStatus,
      commercialUseAllowed: commercialUseAllowed.value,
      attributionRequired: attributionRequired.value,
      acquiredDate: acquiredDate.value,
      sourceUrl: typeof record.value.sourceUrl === 'string' ? record.value.sourceUrl : undefined,
      promptSummary: typeof record.value.promptSummary === 'string' ? record.value.promptSummary : undefined,
      replacementPlan: typeof record.value.replacementPlan === 'string' ? record.value.replacementPlan : undefined,
    });
  }

  return ok(licenses);
}

function validateLicenseEnums(source: string, status: string, context: unknown): Result<void> {
  if (!LICENSE_SOURCES.includes(source as AudioLicenseSource)) {
    return fail(ErrorCode.ConfigInvalid, `Unknown audio license source ${source}`, context);
  }

  if (!ASSET_STATUSES.includes(status as AudioAssetStatus)) {
    return fail(ErrorCode.ConfigInvalid, `Unknown audio license status ${status}`, context);
  }

  return ok(undefined);
}
