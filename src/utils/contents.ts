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
  sections?: Array<ContentSection>;
}

interface ContentSection {
  title: string;
  items: string[];
}

export function contentCollection(): Array<ContentInfo> {
  const files = globSync('**/contents.toml', { cwd: CONTENT_DIR });

  const contents = files.map((file) => {
    const filePath = path.join(CONTENT_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const parsed = parse(fileContent);

    if (isContentConfig(parsed)) {
      return {
        path: path.relative(CONTENT_DIR, path.dirname(filePath)),
        config: parsed,
      };
    } else {
      throw new Error(`Invalid content config in file: ${file}`);
    }
  });

  return contents;
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
  if (section.title && typeof section.title !== 'string') return false;

  if (!Array.isArray(section.items)) return false;
  for (const item of section.items) {
    if (typeof item !== 'string') return false;
  }

  return true;
}
