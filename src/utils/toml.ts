import TOML from 'smol-toml';
import fs from 'fs';
import { failure, success } from './results';

export function loadToml(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return success(TOML.parse(content));
  } catch {
    return failure({});
  }
}
