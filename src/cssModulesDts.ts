import path from 'node:path';
import process from 'node:process';
import fs from 'node:fs';
import type { Watcher } from 'node-watch';
import nodeWatch from 'node-watch';
import { glob } from 'glob';
import { minimatch } from 'minimatch';

export const start = (opts: {
  root?: string;
  files?: string[];
  generateAll?: boolean;
  namedExports?: boolean;
  watch?: boolean;
  getKeys: (f: string, code: string) => Promise<string[]>;
}) => {
  const {
    root = process.cwd(),
    files = ['**/*.module.scss'],
    generateAll = true,
    namedExports = true,
    watch = true,
    getKeys
  } = opts;

  async function updateFile(f: string) {
    try {
      const css = await fs.promises.readFile(f, 'utf-8');
      const keys = await getKeys(f, css);

      let output = '';
      if (namedExports) {
        output += 'export const __esModule: true;';
        keys.forEach((key) => {
          output += `\nexport const ${key}: string;`;
        });
      } else {
        output += 'declare const styles: {';
        keys.forEach((key) => {
          output += `\n  readonly '${key}': string;`;
        });
        output += '\n}';
        output += '\nexport = styles;';
      }

      const outpuFile = `${f}.d.ts`;
      await fs.promises.writeFile(outpuFile, output, 'utf-8');
    } catch (e) {
      console.log('[cssModulesDts Error]');
      console.error(e);
    }
  }

  try {
    // watch files
    let watchers: Watcher[] = [];

    files.forEach((p) => {
      // generate all
      if (generateAll) {
        glob(p, {
          cwd: root
        }).then((files) => {
          files.forEach((f) => {
            updateFile(path.resolve(root, f));
          });
        });
      }

      if (watch) {
        const watcher = nodeWatch(
          root,
          {
            recursive: true,
            filter: f => minimatch(f, p)
          },
          (evt, name) => {
            if (evt === 'update')
              updateFile(name);
          }
        );
        watcher.on('error', (e) => {
          console.log('[cssModulesDts Error]');
          console.log(e);
        });
        watchers.push(watcher);
      }
    });

    const stop = () => {
      watchers.forEach((watcher) => {
        watcher.close();
      });
      watchers = [];
    };

    return stop;
  } catch (e) {
    console.log('[cssModulesDts Error]');
    console.log(e);
  }
};
