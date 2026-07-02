import { describe, it, expect, vi, beforeEach } from 'vitest';
import { siteTree, layerTree, pathTo, type TreeNode } from '@/utils/tree';
import { getCollection } from 'astro:content';

vi.mock('astro:content', () => ({
  getCollection: vi.fn(),
  getEntry: vi.fn(),
}));

// 階層構造（順序検証用に order をあえて宣言順とずらしている）:
// /                      HOME       order: about, linux, database
// ├─ about               (article)
// ├─ linux               Linux      order: shell, configuration
// │  ├─ shell            Shell      order: test, command
// │  │  ├─ test          (article)
// │  │  └─ command       Command
// │  │     └─ ls         (article)
// │  └─ configuration    Configuration
// │     └─ hosts         (article)
// ├─ database            Database   (order 未指定 → 名前昇順)
// │  ├─ transaction      (article)
// │  └─ normalization    (article)
// └─ orphan/lost         (article, .layer.toml の無いディレクトリ配下 → 列挙対象外)
const mockLayers = [
  { id: '/', data: { title: 'HOME', order: ['about', 'linux', 'database'] }, collection: 'layers' as const },
  { id: '/linux', data: { title: 'Linux', description: 'Linux のノート', order: ['shell', 'configuration'] }, collection: 'layers' as const },
  { id: '/linux/shell', data: { title: 'Shell', order: ['test', 'command'] }, collection: 'layers' as const },
  { id: '/linux/shell/command', data: { title: 'Command' }, collection: 'layers' as const },
  { id: '/linux/configuration', data: { title: 'Configuration' }, collection: 'layers' as const },
  { id: '/database', data: { title: 'Database' }, collection: 'layers' as const },
];

const mockArticles = [
  { id: '/about', data: { title: 'About', permalink: 'about' }, body: '', collection: 'articles' as const },
  { id: '/linux/shell/test', data: { title: 'Test', permalink: 'test' }, body: '', collection: 'articles' as const },
  { id: '/linux/shell/command/ls', data: { title: 'ls', permalink: 'ls' }, body: '', collection: 'articles' as const },
  { id: '/linux/configuration/hosts', data: { title: 'hosts', permalink: 'hosts' }, body: '', collection: 'articles' as const },
  { id: '/database/transaction', data: { title: 'Transaction', permalink: 'transaction' }, body: '', collection: 'articles' as const },
  { id: '/database/normalization', data: { title: 'Normalization', permalink: 'normalization' }, body: '', collection: 'articles' as const },
  { id: '/orphan/lost', data: { title: 'Lost', permalink: 'lost' }, body: '', collection: 'articles' as const },
];

const titlesOf = (nodes: TreeNode[]) => nodes.map((node) => node.title);
const childByTitle = (node: TreeNode, title: string) =>
  node.type === 'layer' ? node.children.find((child) => child.title === title) : undefined;

describe('tree utilities', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getCollection).mockImplementation(((collection: string) =>
      Promise.resolve(collection === 'layers' ? mockLayers : mockArticles)) as typeof getCollection);
  });

  describe('siteTree', () => {
    it('should return the root layer node', async () => {
      const root = await siteTree();

      expect(root.type).toBe('layer');
      expect(root.id).toBe('/');
      expect(root.title).toBe('HOME');
    });

    it('should order root children by the root order list', async () => {
      const root = await siteTree();

      expect(titlesOf(root.children)).toEqual(['About', 'Linux', 'Database']);
    });

    it('should classify children as article or layer', async () => {
      const root = await siteTree();

      const about = root.children.find((child) => child.title === 'About');
      const linux = root.children.find((child) => child.title === 'Linux');
      expect(about?.type).toBe('article');
      expect(linux?.type).toBe('layer');
    });

    it('should build nested layers recursively following each order', async () => {
      const root = await siteTree();

      const linux = childByTitle(root, 'Linux')!;
      expect(titlesOf((linux as Extract<TreeNode, { type: 'layer' }>).children)).toEqual([
        'Shell',
        'Configuration',
      ]);

      const shell = childByTitle(linux, 'Shell')!;
      // order: ['test', 'command'] → 記事 Test が先、レイヤー Command が後
      expect(titlesOf((shell as Extract<TreeNode, { type: 'layer' }>).children)).toEqual(['Test', 'Command']);

      const command = childByTitle(shell, 'Command')!;
      expect(titlesOf((command as Extract<TreeNode, { type: 'layer' }>).children)).toEqual(['ls']);
    });

    it('should fall back to name-ascending order when order is omitted', async () => {
      const root = await siteTree();

      const database = childByTitle(root, 'Database')!;
      // order 未指定 → ファイル名昇順（normalization < transaction）
      expect(titlesOf((database as Extract<TreeNode, { type: 'layer' }>).children)).toEqual([
        'Normalization',
        'Transaction',
      ]);
    });

    it('should expose the layer description', async () => {
      const root = await siteTree();
      const linux = childByTitle(root, 'Linux');

      expect(linux?.type === 'layer' && linux.description).toBe('Linux のノート');
    });

    it('should exclude articles under directories without a .layer.toml', async () => {
      const root = await siteTree();

      const flatten = (node: TreeNode): string[] => [
        node.id,
        ...(node.type === 'layer' ? node.children.flatMap(flatten) : []),
      ];

      expect(flatten(root)).not.toContain('/orphan/lost');
    });

    it('should throw when the root layer is missing', async () => {
      vi.mocked(getCollection).mockImplementation(((collection: string) =>
        Promise.resolve(collection === 'layers' ? [] : mockArticles)) as typeof getCollection);

      await expect(siteTree()).rejects.toThrow();
    });
  });

  describe('layerNode', () => {
    it('should return the node for an absolute layer id', async () => {
      const node = await layerTree('/linux');

      expect(node?.type).toBe('layer');
      expect(node?.title).toBe('Linux');
      expect(titlesOf(node!.children)).toEqual(['Shell', 'Configuration']);
    });

    it('should accept a relative layer id', async () => {
      const node = await layerTree('linux/shell');

      expect(node?.id).toBe('/linux/shell');
      expect(titlesOf(node!.children)).toEqual(['Test', 'Command']);
    });

    it('should return null for a non-existent layer', async () => {
      const node = await layerTree('/nonexistent');

      expect(node).toBeNull();
    });

    it('should return null for an article id (not a layer)', async () => {
      const node = await layerTree('/about');

      expect(node).toBeNull();
    });
  });

  describe('pathTo', () => {
    it('should return ancestors and self for a deep article, excluding root', async () => {
      const crumbs = await pathTo('/linux/shell/test');

      expect(crumbs.map((crumb) => crumb.title)).toEqual(['Linux', 'Shell', 'Test']);
      expect(crumbs.map((crumb) => crumb.type)).toEqual(['layer', 'layer', 'article']);
    });

    it('should include every ancestor layer for the deepest article', async () => {
      const crumbs = await pathTo('/linux/shell/command/ls');

      expect(crumbs.map((crumb) => crumb.title)).toEqual(['Linux', 'Shell', 'Command', 'ls']);
    });

    it('should return only itself for a top-level layer', async () => {
      const crumbs = await pathTo('/linux');

      expect(crumbs.map((crumb) => crumb.title)).toEqual(['Linux']);
    });

    it('should return ancestors and self for a nested layer', async () => {
      const crumbs = await pathTo('/linux/shell');

      expect(crumbs.map((crumb) => crumb.title)).toEqual(['Linux', 'Shell']);
    });

    it('should return an empty array for the root', async () => {
      const crumbs = await pathTo('/');

      expect(crumbs).toEqual([]);
    });

    it('should accept a relative id', async () => {
      const crumbs = await pathTo('linux/shell/test');

      expect(crumbs.map((crumb) => crumb.title)).toEqual(['Linux', 'Shell', 'Test']);
    });
  });
});
