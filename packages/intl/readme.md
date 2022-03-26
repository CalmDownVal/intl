# Intl

A generic intl library with ICU Message Format support.

## Installation

```sh
# NPM
npm i @calmdownval/intl

# Yarn
yarn add @calmdownval/intl
```

The package already contains TypeScript declaration.

## Motivation

The motivation for this library is to provide a simple runtime API for
JavaScript apps with no additional build steps or loaders needed. The library
features a fast parser for the ICU message format and a fully JSON-compatible
configuration structure.

No locale presets are bundled; Instead, it is necessary to include configuration
of used formatters (e.g. date/time formats) within the locale file itself.

This shrinks the size of resources to a bare minimum, which is sadly an
important metric of web applications to this day.

If the above reasons aren't on your list of requirements, you'll likely be
better off with a more mature set of tools like
[MessageFormat](https://github.com/messageformat/messageformat).

### Other Useful Links

- [ICU Message Format Specification](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [ICU Message Format Playground](https://format-message.github.io/icu-message-format-for-translators/editor.html)
