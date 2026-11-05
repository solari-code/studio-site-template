`message-diff` compares the translation files of a project with the default language and tells you what is missing, what is left over and where the types don't match. There is nothing to configure: point it at a folder of JSON files and it works out the rest.

## Why I built it

Translations drift. A new feature adds ten keys to `en.json`, and three weeks later someone notices that the German page shows English text in one corner. Most i18n libraries fall back to the default language silently, which is great for visitors and bad for noticing.

I wanted a check that:

- runs in a second, locally and in CI,
- needs no config file and no account,
- prints something a translator can act on, not a stack trace.

## Install

```bash
npm install --save-dev message-diff
```

## Usage

Run it on the folder that holds your language files. The first file in alphabetical order is the reference, unless you pass `--base`.

```bash
npx message-diff messages/ --base en
```

```text
Checking messages against "en.json" (locales: en, de, fr)

de.json: 2 missing, 0 extra, 0 type mismatches
  ⚠ de: missing "Checkout.summary.shipping"
  ⚠ de: missing "Checkout.summary.total"
fr.json: 0 missing, 1 extra, 1 type mismatch
  ⚠ fr: extra "Legacy.banner"
  ⚠ fr: "Faq.items" is string, expected object
```

### Options

| Option | Default | What it does |
|---|---|---|
| `--base <locale>` | first file | the language the others are compared with |
| `--strict` | off | exit with code 1 when anything is missing, e.g. to fail a CI job |
| `--json` | off | print the result as JSON, for other tools |
| `--ignore <pattern>` | – | skip keys matching a glob, e.g. `Legacy.*` |

## Use it from code

The CLI is a thin wrapper around one function, so you can build your own reports:

```js
import { diffMessages } from 'message-diff';

const report = await diffMessages('messages/', { base: 'en' });

for (const { locale, missing } of report) {
    if (missing.length > 0) {
        console.log(`${locale}: ${missing.length} texts to translate`);
    }
}
```

> Arrays are compared by position. Reordering the items of a list shows up as changed keys, which is usually what you want for FAQs and feature lists.

## How it relates to this site

This website runs the same check as part of `npm run check`, and its lab pages are written in Markdown per language, a folder next to the messages. The [Scroll Gradient](/lab/scroll-gradient) component came out of the same project.

## Roadmap

- [x] JSON files with nested keys and arrays
- [x] Type mismatches (text vs. list vs. group)
- [ ] YAML files
- [ ] A `--fix` flag that copies missing keys over, marked for translation

Found a bug or missing a feature? Open an issue on [GitHub](https://github.com/).
