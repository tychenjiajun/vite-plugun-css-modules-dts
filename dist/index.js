// src/index.ts
import process2 from "process";
import { preprocessCSS } from "vite";

// src/cssModulesDts.ts
import path from "path";
import process from "process";
import fs from "fs";
import watch from "node-watch";
import { glob } from "glob";
import { minimatch } from "minimatch";
var start = (opts) => {
  const {
    root = process.cwd(),
    files = ["**/*.module.scss"],
    generateAll = true,
    namedExports = true,
    getKeys
  } = opts;
  async function updateFile(f) {
    try {
      const css = await fs.promises.readFile(f, "utf-8");
      const keys = await getKeys(f, css);
      let output = "";
      if (namedExports) {
        output += "export const __esModule: true;";
        keys.forEach((key) => {
          output += `
export const ${key}: string;`;
        });
      } else {
        output += "declare const styles: {";
        keys.forEach((key) => {
          output += `
  readonly ${key}: string;`;
        });
        output += "\n}";
        output += "\nexport = styles;";
      }
      const outpuFile = `${f}.d.ts`;
      await fs.promises.writeFile(outpuFile, output, "utf-8");
    } catch (e) {
      console.log("[cssModulesDts Error]");
      console.error(e);
    }
  }
  try {
    let watchers = [];
    files.forEach((p) => {
      if (generateAll) {
        glob(p, {
          cwd: root
        }).then((files2) => {
          files2.forEach((f) => {
            updateFile(path.resolve(root, f));
          });
        });
      }
      const watcher = watch(
        root,
        {
          recursive: true,
          filter: (f) => minimatch(f, p)
        },
        (evt, name) => {
          if (evt === "update")
            updateFile(name);
        }
      );
      watcher.on("error", (e) => {
        console.log("[cssModulesDts Error]");
        console.log(e);
      });
      watchers.push(watcher);
    });
    const stop = () => {
      watchers.forEach((watcher) => {
        watcher.close();
      });
      watchers = [];
    };
    return stop;
  } catch (e) {
    console.log("[cssModulesDts Error]");
    console.log(e);
  }
};

// src/index.ts
function cssModulesDtsPlugin(options = {}) {
  let root = "";
  let config;
  let stop;
  return {
    name: "luban:css-moduless-dts",
    configResolved: (conf) => {
      config = conf;
      root = conf.root;
    },
    buildStart: () => {
      const started = !!process2.env.LUBAN_CSS_MODULES_DTS_PLUGIN_STARTED;
      const { files = ["**/*.module.scss"], namedExports = true } = options;
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
      process2.env.LUBAN_CSS_MODULES_DTS_PLUGIN_STARTED = "true";
    },
    buildEnd: () => {
      stop?.();
    }
  };
}
var src_default = cssModulesDtsPlugin;
export {
  src_default as default
};
