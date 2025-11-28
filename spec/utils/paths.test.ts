import { describe, it, expect } from 'vitest';
import { parent, absolute, relative } from '@/utils/paths';

describe('paths utilities', () => {
  describe('parent', () => {
    describe('relative', () => {
      it('should return null for empty string', () => {
        expect(parent('')).toBeNull();
      });

      it('should return empty string for root directory', () => {
        expect(parent('foo')).toBe('');
      });

      it('should return parent directory for nested path', () => {
        expect(parent('foo/bar')).toBe('foo');
      });
    });

    describe('absolute', () => {
      it('should return null for empty string', () => {
        expect(parent('/')).toBeNull();
      });

      it('should return / for absolute root directory', () => {
        expect(parent('/foo')).toBe('/');
      });

      it('should return parent directory for nested absolute path', () => {
        expect(parent('/foo/bar')).toBe('/foo');
      });
    });
  });

  describe('absolute', () => {
    it('should return path as-is if already absolute', () => {
      expect(absolute('/foo/bar')).toBe('/foo/bar');
    });

    it('should add leading slash for relative path', () => {
      expect(absolute('foo/bar')).toBe('/foo/bar');
    });

    it('should return single slash for empty string', () => {
      expect(absolute('')).toBe('/');
    });
  });

  describe('relative', () => {
    it('should remove leading slash from absolute path', () => {
      expect(relative('/foo/bar')).toBe('foo/bar');
    });

    it('should return path as-is if already relative', () => {
      expect(relative('foo/bar')).toBe('foo/bar');
    });

    it('should return empty string for single slash', () => {
      expect(relative('/')).toBe('');
    });
  });
});
