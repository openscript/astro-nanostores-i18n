import {
  browser,
  createI18n,
  type Formatter,
  formatter,
  type LocaleStore,
  localeFrom,
  type TranslationLoader,
} from "@nanostores/i18n";
import type { AstroConfig, AstroIntegration } from "astro";
import { atom, type ReadableAtom, type WritableAtom } from "nanostores";
import { name } from "../package.json";

let config: AstroConfig;
export let setting: WritableAtom<string | undefined>;
export let locale: LocaleStore;
export let format: ReadableAtom<Formatter>;
export let i18n: ReturnType<typeof createI18n>;

type Options = {
  translationLoader: TranslationLoader;
};

/**
 * Astro integration for nanostores-i18n.
 *
 * This integration sets up the i18n configuration and provides the necessary
 * stores for managing translations and locale settings.
 *
 * @returns {AstroIntegration} The Astro integration object.
 */
const createPlugin = (options: Options): AstroIntegration => {
  return {
    name,
    hooks: {
      "astro:config:done": ({ config: astroConfig, logger }) => {
        config = astroConfig;

        if (!config.i18n) {
          logger.error(
            `The ${name} integration requires the i18n configuration in your Astro config. Please add it to your astro.config.ts file.`,
          );
          return;
        }

        setting = atom(config.i18n.defaultLocale);
        const availableLocales = config.i18n.locales.flatMap((locale) =>
          typeof locale === "string" ? locale : locale.codes,
        );

        locale = localeFrom(
          setting,
          browser({
            available: availableLocales,
            fallback: config.i18n.defaultLocale,
          }),
        );
        format = formatter(locale);
        i18n = createI18n(locale, {
          baseLocale: config.i18n.defaultLocale,
          get: options.translationLoader,
        });
      },
    },
  };
};

export default createPlugin;
