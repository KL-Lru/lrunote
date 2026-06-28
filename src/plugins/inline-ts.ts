import { type Plugin } from 'vite';
import { buildSync } from 'esbuild';

export function inlineTsPlugin(): Plugin {
    return {
        name: 'inline-bundle',
        transform(_, id) {
            if (id.endsWith('?inline-bundle')) {
                const filePath = id.replace('?inline-bundle', '');

                const result = buildSync({
                    entryPoints: [filePath],
                    bundle: true,
                    write: false,
                    minify: true,
                });
                const bundledCode = result.outputFiles[0].text;

                return { code: `export default ${JSON.stringify(bundledCode)}`, map: null };
            }
        }
    };
}