import { useContext } from 'preact/hooks';

import { Intl, IntlContext } from './IntlProvider';

export function useIntl(): Intl {
	return useContext(IntlContext);
}
