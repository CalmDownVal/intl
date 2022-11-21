import { ComponentClass, ComponentType, createContext, FunctionComponent, h } from 'preact';
import { useContext } from 'preact/hooks';

import type { Intl } from './types';
import { formatWarning } from './utils';

export const FETCHING_LOCALE_STATE: Intl = {
	isLoading: true,
	t: () => ''
};

export const LOCALE_FETCH_ERROR_STATE: Intl = {
	isLoading: false,
	t: () => formatWarning('LocaleFetchError')
};

export const CONTEXT_MISSING_STATE: Intl = {
	isLoading: false,
	t: () => formatWarning('IntlContextMissing')
};

export const IntlContext = createContext<Intl>(FETCHING_LOCALE_STATE);

// Hook-style consumer:

export function useIntl(): Intl {
	return useContext(IntlContext);
}

// HOC-style consumer:

export interface WithIntlProps {
	readonly intl: Intl;
}

export function withIntl<TProps extends WithIntlProps>(component: FunctionComponent<TProps>): FunctionComponent<Omit<TProps, 'intl'>>;
export function withIntl<TProps extends WithIntlProps>(component: ComponentClass<TProps, any>): FunctionComponent<Omit<TProps, 'intl'>>;
export function withIntl(component: ComponentType<any>) {
	return (props: any) => h(
		component,
		{
			...props,
			intl: useContext(IntlContext)
		}
	);
}
