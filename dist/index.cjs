"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);
var import_node_process2 = __toESM(require("process"), 1);
var import_vite = require("vite");

// src/cssModulesDts.ts
var import_node_path = __toESM(require("path"), 1);
var import_node_process = __toESM(require("process"), 1);
var import_node_fs = __toESM(require("fs"), 1);
var import_node_watch = __toESM(require("node-watch"), 1);
var import_glob = require("glob");
var import_minimatch = require("minimatch");
var start = (opts) => {
  const {
    root = import_node_process.default.cwd(),
    files = ["**/*.module.scss"],
    generateAll = true,
    namedExports = true,
    getKeys
  } = opts;
  async function updateFile(f) {
    try {
      const css = await import_node_fs.default.promises.readFile(f, "utf-8");
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
      await import_node_fs.default.promises.writeFile(outpuFile, output, "utf-8");
    } catch (e) {
      console.log("[cssModulesDts Error]");
      console.error(e);
    }
  }
  try {
    let watchers = [];
    files.forEach((p) => {
      if (generateAll) {
        (0, import_glob.glob)(p, {
          cwd: root
        }).then((files2) => {
          files2.forEach((f) => {
            updateFile(import_node_path.default.resolve(root, f));
          });
        });
      }
      const watcher = (0, import_node_watch.default)(
        root,
        {
          recursive: true,
          filter: (f) => (0, import_minimatch.minimatch)(f, p)
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
      const started = !!import_node_process2.default.env.LUBAN_CSS_MODULES_DTS_PLUGIN_STARTED;
      const { files = ["**/*.module.scss"], namedExports = true } = options;
      stop = start({
        root,
        files,
        generateAll: !started,
        namedExports,
        getKeys: async (file, code) => {
          const res = await (0, import_vite.preprocessCSS)(code, file, config);
          return Object.keys(res.modules || {});
        }
      });
      import_node_process2.default.env.LUBAN_CSS_MODULES_DTS_PLUGIN_STARTED = "true";
    },
    buildEnd: () => {
      stop?.();
    }
  };
}
var src_default = cssModulesDtsPlugin;
