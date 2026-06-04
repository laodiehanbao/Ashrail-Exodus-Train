import { fail, ok, type Result } from '../../core/Result.types.js';
import { ErrorCode } from '../../shared/ErrorCodes.js';

export function asRecord(value: unknown, label: string): Result<Record<string, unknown>> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return fail(ErrorCode.ConfigInvalid, `${label} must be an object`, value);
  }

  return ok(value as Record<string, unknown>);
}

export function asArray(value: unknown, label: string): Result<unknown[]> {
  if (!Array.isArray(value)) {
    return fail(ErrorCode.ConfigInvalid, `${label} must be an array`, value);
  }

  return ok(value);
}

export function readString(record: Record<string, unknown>, field: string): Result<string> {
  const value = record[field];
  if (typeof value !== 'string' || value.length === 0) {
    return fail(ErrorCode.ConfigInvalid, `${field} must be a non-empty string`, record);
  }

  return ok(value);
}

export function readNumber(record: Record<string, unknown>, field: string, min = 0): Result<number> {
  const value = record[field];
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min) {
    return fail(ErrorCode.ConfigInvalid, `${field} must be a number >= ${min}`, record);
  }

  return ok(value);
}

export function readBoolean(record: Record<string, unknown>, field: string): Result<boolean> {
  const value = record[field];
  if (typeof value !== 'boolean') {
    return fail(ErrorCode.ConfigInvalid, `${field} must be a boolean`, record);
  }

  return ok(value);
}

export function readArray(record: Record<string, unknown>, field: string): Result<unknown[]> {
  return asArray(record[field], field);
}

export function validationError<T>(...results: Result<unknown>[]): Result<T> {
  const error = results.find((result) => !result.ok);
  if (error && !error.ok) {
    return fail(error.error.code, error.error.message, error.error.context);
  }

  return fail(ErrorCode.ConfigInvalid, 'Unknown config validation error');
}
