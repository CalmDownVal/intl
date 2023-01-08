# Intl-React

[@calmdownval/intl](https://github.com/CalmDownVal/intl/tree/master/packages/intl)
bindings for [React](https://reactjs.org/).

## Installation

```sh
# NPM
npm i @calmdownval/intl @calmdownval/intl-react

# Yarn
yarn add @calmdownval/intl @calmdownval/intl-react
```

Both packages already contain TypeScript declarations.

## Usage

First add a top-level provider to load a locale:

```tsx
import { IntlProvider } from '@calmdownval/intl-react';
import React from 'react';

export const App = () => (
  <IntlProvider url='/path/to/locale.json'>
    ...app contents
  </IntlProvider>
);
```

Then use the intl hook within components:

```tsx
import { useIntl } from '@calmdownval/intl-react';
import React from 'react';

export const SubmitButton = () => {
  const { t } = useIntl();
  return (
    <button type='submit'>
      {t('form.submit')}
    </button>
  );
};
```
