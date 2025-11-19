import { toNullable } from './string';

interface DiffOptions<T extends Record<string, unknown>> {
  skipKeys?: Array<keyof T>;
}

export const buildDiffPayload = <T extends Record<string, unknown>>(
  current: Partial<T>,
  next: Partial<T>,
  options: DiffOptions<T> = {}
) => {
  const payload: Record<string, unknown> = {};
  const skip = new Set(options.skipKeys ?? []);

  (Object.keys(next) as Array<keyof T>).forEach((key) => {
    if (skip.has(key)) {
      return;
    }

    const nextValue = next[key];
    const currentValue = current[key];

    if (nextValue === currentValue) {
      return;
    }

    if (typeof nextValue === 'string') {
      payload[key as string] = toNullable(nextValue);
      return;
    }

    payload[key as string] = nextValue ?? null;
  });

  return payload;
};
