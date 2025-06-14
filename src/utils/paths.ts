import fs from 'fs';
import path from 'path';
import { failure, success, type Result } from './results';

export const findConfig = (
  contentPath: string,
  configFile: string,
): Result<string, null> => {
  const contentDir = path.dirname(contentPath);
  const navConfigPath = `${contentDir}/${configFile}`;

  if (contentDir === '/' || contentDir === '.' || contentDir === '') {
    return failure(null);
  }

  if (fs.existsSync(navConfigPath)) {
    return success(navConfigPath);
  } else {
    return findConfig(contentDir, configFile);
  }
};
