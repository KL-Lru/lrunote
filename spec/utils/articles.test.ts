import { describe, it, expect, vi, beforeEach } from 'vitest';
import { articleCollection, permanentArticle, articlesInFolder, articleExists } from '@/utils/articles';
import { getCollection } from 'astro:content';

vi.mock('astro:content', () => ({
  getCollection: vi.fn(),
}));

const mockArticles = [
  {
    id: '/security/oauth2',
    data: {
      title: 'OAuth Security',
      permalink: 'oauth2',
    },
    body: '',
    collection: 'articles' as const,
  },
  {
    id: '/frontend/react/state',
    data: {
      title: 'State Management',
      permalink: 'react_state',
    },
    body: '',
    collection: 'articles' as const,
  },
];

describe('articles', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getCollection).mockResolvedValue(mockArticles);
  });

  describe('articleCollection', () => {
    it('should retrieve all articles', async () => {
      const articles = await articleCollection();

      expect(articles).toHaveLength(mockArticles.length);
      expect(articles.map((article) => article.id)).toMatchObject(mockArticles.map((a) => a.id));
    });

    it('should add slug property to each article', async () => {
      const articles = await articleCollection();

      articles.forEach((article) => {
        expect(article).toHaveProperty('slug');
        expect(typeof article.slug).toBe('string');
        expect(article.slug).toBe(article.id.slice(1));
      });
    });
  });

  describe('permanentArticle', () => {
    it('should retrieve article by absolute permalink', async () => {
      const article = await permanentArticle('/oauth2');

      expect(article).toBeDefined();
      expect(article?.data.title).toBe('OAuth Security');
    });

    it('should retrieve article by relative permalink', async () => {
      const article = await permanentArticle('oauth2');
      expect(article).toBeDefined();
      expect(article?.data.title).toBe('OAuth Security');
    });

    it('should return undefined for non-existent permalink', async () => {
      const article = await permanentArticle('/nonexistent');

      expect(article).toBeUndefined();
    });
  });

  describe('articlesInFolder', () => {
    it('should retrieve articles in specified absolute path', async () => {
      const articles = await articlesInFolder('/frontend/react');

      expect(articles).toHaveLength(1);
      expect(articles.every((a) => a.id.startsWith('/frontend/react/'))).toBe(true);
    });

    it('should retrieve articles in specified relative path', async () => {
      const articles = await articlesInFolder('frontend/react');

      expect(articles).toHaveLength(1);
      expect(articles.every((a) => a.id.startsWith('/frontend/react/'))).toBe(true);
    });

    it('should return empty array for non-existent folder', async () => {
      const articles = await articlesInFolder('backend/api');

      expect(articles).toHaveLength(0);
    });

    it('should retrieve only direct children when specifying parent folder', async () => {
      const articles = await articlesInFolder('frontend');

      expect(articles).toHaveLength(0);
    });
  });

  describe('articleExists', () => {
    it('should return true for existing article absolute path', async () => {
      const exists = await articleExists('/frontend/react/state');

      expect(exists).toBe(true);
    });

    it('should return true for existing article relative path', async () => {
      const exists = await articleExists('frontend/react/state');

      expect(exists).toBe(true);
    });

    it('should return false for non-existent article path', async () => {
      const exists = await articleExists('nonexistent.md');

      expect(exists).toBe(false);
    });
  });
});
