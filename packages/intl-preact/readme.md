# Intl-Preact

[@calmdownval/intl](https://github.com/CalmDownVal/intl/tree/master/packages/intl)
bindings for [Preact](https://preactjs.com/).

## Installation

```sh
# NPM
npm i @calmdownval/intl @calmdownval/intl-preact

# Yarn
yarn add @calmdownval/intl @calmdownval/intl-preact
```

Both packages already contain TypeScript declarations.

## Usage

First add a top-level provider to load a locale:

```tsx
import { IntlProvider } from '@calmdownval/intl-preact';
import { h } from 'preact';

export const App = () => (
  <IntlProvider url='/path/to/locale.json'>
    ...app contents
  </IntlProvider>
);
```

Then use the intl hook within components:

```tsx
import { useIntl } from '@calmdownval/intl-preact';
import { h } from 'preact';

export const SubmitButton = () => {
  const { t } = useIntl();
  return (
    <button type='submit'>
      {t('form.submit')}
    </button>
  );
};
```
