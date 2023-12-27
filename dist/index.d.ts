import { Plugin } from 'vite';

interface Options {
    files?: string[];
    namedExports?: boolean;
}
declare function cssModulesDtsPlugin(options?: Options): Plugin;

export { type Options, cssModulesDtsPlugin as default };
