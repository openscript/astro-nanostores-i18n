/// <reference types="vitest" />

import { codecovVitePlugin } from "@codecov/vite-plugin";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/libs/astro-nanostores-i18n",
  plugins: [
    nxViteTsPaths(),
    dts({ entryRoot: "src", tsconfigPath: "tsconfig.lib.json" }),
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: "astro-nanostores-i18n",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
  build: {
    target: "es2022",
    sourcemap: true,
    emptyOutDir: true,
    lib: {
      entry: ["src/astro-nanostores-i18n.ts", "src/extract-messages.ts"],
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "node:fs/promises",
        "node:vm",
        "node:util",
        "@astrojs/compiler",
        "@astrojs/compiler/utils",
        "@nanostores/i18n",
        "fast-glob",
        "typescript",
      ],
      output: {
        globals: {},
      },
    },
  },

  test: {
    globals: true,
    environment: "node",
    coverage: {
      reportsDirectory: "./coverage",
    },
    reporters: ["verbose"],
    include: ["test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },
});
