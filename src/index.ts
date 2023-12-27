import process from 'node:process';
import { preprocessCSS } from 'vite';
import type { Plugin } from 'vite';
import { start } from './cssModulesDts';

export interface Options {
  files?: string[];
  namedExports?: boolean;
}

function cssModulesDtsPlugin(options: Options = {}): Plugin {
  let root = '';
  let config: any;
  let stop: (() => void) | undefined;

  return {
    name: 'luban:css-moduless-dts',
    configResolved: (conf) => {
      config = conf;
      root = conf.root;
    },
    buildStart: () => {
      const started = !!process.env.LUBAN_CSS_MODULES_DTS_PLUGIN_STARTED;
      const { files = ['**/*.module.scss'], namedExports = true } = options;
      stop = start({
        root,
        files,
        generateAll: !started,
        namedExports,
        getKeys: async (file, code) => {
          const res = await preprocessCSS(code, file, config);
          return Object.keys(res.modules || {});
        }
      });
      process.env.LUBAN_CSS_MODULES_DTS_PLUGIN_STARTED = 'true';
    },
    buildEnd: () => {
      stop?.();
    }
  };
}

export default cssModulesDtsPlugin;
