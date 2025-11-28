import fs, { globSync } from 'fs';
import path from 'path';
import { parse } from '@std/toml';

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content', 'articles');

interface ContentInfo {
  path: string;
  config: ContentConfig;
}

interface ContentConfig {
  title: string;
  items?: string[];
  sections?: Array<ContentSection>;
}

interface ContentSection {
  title: string;
  description?: string;
  items: string[];
}

function allContentPaths(): Array<string> {
  const files = globSync('**/*.md', { cwd: CONTENT_DIR });
  return files.map((file) => path.join(CONTENT_DIR, file));
}

function allParsedConfigs(): Array<{ id: string; config: ContentConfig }> {
  const contents = allContentPaths();
  return contents.map((content_file) => {
    const fileContent = fs.readFileSync(content_file, 'utf-8');
    const parsed = parse(fileContent);

    if (isContentConfig(parsed)) {
      return {
        id: contentId(content_file),
        config: parsed,
      };
    } else {
      throw new Error(`Invalid content config in file: ${content_file}`);
    }
  });
}

function contentId(content_file: string): string {
  return path.relative(CONTENT_DIR, path.dirname(content_file));
}

function absoluteLink(content_id: string) {
  return `/${content_id}`;
}

export function contentCollection(): Array<ContentInfo> {
  const files = globSync('**/contents.toml', { cwd: CONTENT_DIR });

  const contents = files.map((file) => {
    const filePath = path.join(CONTENT_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const parsed = parse(fileContent);

    if (isContentConfig(parsed)) {
      return {
        path: contentId(filePath),
        config: parsed,
      };
    } else {
      throw new Error(`Invalid content config in file: ${file}`);
    }
  });

  return contents;
}

export function getContentInfo(folder: string): ContentInfo | null {
  const contents = contentCollection();
  const content = contents.find((c) => c.path === folder);

  return content || null;
}

function isContentConfig(obj: unknown): obj is ContentConfig {
  if (typeof obj !== 'object' || obj === null) return false;

  const content = obj as ContentConfig;
  if (typeof content.title !== 'string') return false;

  if (content.sections) {
    if (!Array.isArray(content.sections)) return false;

    if (!content.sections.every(isContentSection)) return false;
  }
  return true;
}

function isContentSection(obj: unknown): obj is ContentSection {
  if (typeof obj !== 'object' || obj === null) return false;

  const section = obj as ContentSection;
  if (typeof section.title !== 'string') return false;

  if (!Array.isArray(section.items)) return false;
  for (const item of section.items) {
    if (typeof item !== 'string') return false;
  }

  return true;
}
