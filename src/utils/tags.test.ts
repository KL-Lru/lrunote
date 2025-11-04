import { describe, expect, test } from 'vitest';
import { tagExists } from './tags';

describe('tagExists', () => {
  test('returns true for existing tags', () => {
    expect(tagExists('top')).toBe(true);
    expect(tagExists('frontend/react')).toBe(true);
  });

  test('returns false for non-existing tags', () => {
    expect(tagExists('nonexistent')).toBe(false);
  });
});
