export function dig(obj: unknown, ...keys: string[]): unknown {
  let current = obj;

  for (const key of keys) {
    if (typeof current === 'object' && current !== null && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return current;
}
