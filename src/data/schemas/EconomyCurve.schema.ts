import { ok, type Result } from '../../core/Result.types.js';
import { asArray, asRecord, readNumber, validationError } from './commonValidation.js';

export interface EconomyCurvePoint {
  minute: number;
  coinPerMinute: number;
  moduleFragmentPerMinute: number;
}

export function validateEconomyCurve(input: unknown): Result<EconomyCurvePoint[]> {
  const array = asArray(input, 'EconomyCurve');
  if (!array.ok) return array;

  const points: EconomyCurvePoint[] = [];
  for (const item of array.value) {
    const record = asRecord(item, 'EconomyCurvePoint');
    if (!record.ok) return record;

    const minute = readNumber(record.value, 'minute', 0);
    const coinPerMinute = readNumber(record.value, 'coinPerMinute', 0);
    const moduleFragmentPerMinute = readNumber(record.value, 'moduleFragmentPerMinute', 0);
    if (!minute.ok || !coinPerMinute.ok || !moduleFragmentPerMinute.ok) {
      return validationError<EconomyCurvePoint[]>(minute, coinPerMinute, moduleFragmentPerMinute);
    }

    points.push({
      minute: minute.value,
      coinPerMinute: coinPerMinute.value,
      moduleFragmentPerMinute: moduleFragmentPerMinute.value,
    });
  }

  return ok(points);
}
