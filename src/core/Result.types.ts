import type { ErrorCode } from '../shared/ErrorCodes.js';

export type AppError = {
  code: ErrorCode;
  message: string;
  context?: unknown;
};

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: AppError };

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function fail<T = never>(
  code: ErrorCode,
  message: string,
  context?: unknown,
): Result<T> {
  return { ok: false, error: { code, message, context } };
}
