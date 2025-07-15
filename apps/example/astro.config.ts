// @ts-check
import { defineConfig } from "astro/config";
import i18n from "astro-nanostores-i18n";
import { C } from "./src/site.config";

// https://astro.build/config
export default defineConfig({
  server: {
    host: true,
  },
  i18n: {
    defaultLocale: C.DEFAULT_LOCALE,
    locales: C.LOCALES,
  },
  integrations: [
    i18n({
      translationLoader: (code) => import(`./src/translations/${code}.json`),
    }),
  ],
});
