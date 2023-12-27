# Generate .d.ts for css modules file

## Install

```sh
npm i -D vite @luban-ui/vite-plugun-css-modules-dts
```

## Create config file

```ts
import { defineConfig } from 'vite';
import cssModulesDts from '@luban-ui/vite-plugun-css-modules-dts';

// vite.config.ts
export default defineConfig(() => {
  const root = __dirname;

  return {
    root,
    server: {
      host: '0.0.0.0',
      port: 5174
    },
    resolve: {
      alias: {
        '@': root
      }
    },
    plugins: [
      cssModulesDts({
        files: [
          '**/*.module.scss'
        ],
        namedExports: true
      })
    ]
    // ...others
  };
});
