export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${String(expected)}, got ${String(actual)}`);
  }
}

export async function runTest(name: string, test: () => void | Promise<void>): Promise<void> {
  await test();
  console.info(`[pass] ${name}`);
}
