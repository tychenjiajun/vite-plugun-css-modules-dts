import { Plugin } from 'vite';

interface Options {
    files?: string[];
    namedExports?: boolean;
    watch?: boolean;
}
declare function cssModulesDtsPlugin(options?: Options): Plugin;

export { type Options, cssModulesDtsPlugin as default };
