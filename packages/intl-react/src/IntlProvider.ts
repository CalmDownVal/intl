import { CachedTranslationProvider, Format, IntlError, TranslationProvider, Vars } from '@calmdownval/intl';
import { Component, createElement, ReactNode } from 'react';

import { FETCHING_LOCALE_STATE, IntlContext, LOCALE_FETCH_ERROR_STATE } from './IntlContext';
import type { Intl, PassThroughPhrase, Phrase } from './types';
import { formatWarning } from './utils';

export interface IntlProviderProps {
	readonly children: ReactNode;
	readonly fetchCredentials?: RequestInit['credentials'];
	readonly fetchHeaders?: RequestInit['headers'];
	readonly formats?: Record<string, Format<any>>;
	readonly onError?: (ex: Error) => void;
	readonly url: string;
}

export class IntlProvider extends Component<IntlProviderProps, Intl> {
	public state = FETCHING_LOCALE_STATE;
	private pendingFetch?: AbortController;

	public componentDidMount() {
		void this.fetchLocale();
	}

	public componentDidUpdate(prev: IntlProviderProps) {
		const next = this.props;
		if (prev.url !== next.url) {
			void this.fetchLocale();
		}
	}

	public componentWillUnmount() {
		this.pendingFetch?.abort();
	}

	public render() {
		return createElement(IntlContext.Provider, {
			children: this.props.children,
			value: this.state
		});
	}

	private async fetchLocale() {
		try {
			this.setState(FETCHING_LOCALE_STATE);
			this.pendingFetch = new AbortController();

			const response = await fetch(this.props.url, {
				credentials: this.props.fetchCredentials,
				headers: this.props.fetchHeaders,
				method: 'GET',
				signal: this.pendingFetch.signal
			});

			if (!response.ok) {
				throw new Error(`unexpected HTTP response ${response.status} - ${response.statusText}`);
			}

			const locale = await response.json();
			const manager = CachedTranslationProvider.fromLocale(locale, this.props.formats);

			this.setState({
				isLoading: false,
				t: translate.bind(null, manager)
			});
		}
		catch (ex: any) {
			this.setState(LOCALE_FETCH_ERROR_STATE);
			this.props.onError?.(ex);
		}
		finally {
			this.pendingFetch = undefined;
		}
	}
}

function translate(provider: TranslationProvider, phrase: Phrase | string, varsOrFallbackText?: Vars | string, fallbackText?: string) {
	let key;
	let vars;
	let fallback;

	if (typeof phrase === 'string') {
		key = phrase;
		if (typeof varsOrFallbackText === 'string') {
			fallback = varsOrFallbackText;
		}
		else {
			vars = varsOrFallbackText;
			fallback = fallbackText;
		}
	}
	else {
		if (isPassThrough(phrase)) {
			return phrase.text;
		}

		key = phrase.key;
		vars = phrase.vars;
		fallback = phrase.fallbackText;
	}

	try {
		return provider.expand(key, vars);
	}
	catch (ex) {
		return fallback === undefined
			? formatWarning(IntlError.is(ex) ? ex.message : 'UnknownError')
			: fallback;
	}
}

function isPassThrough(phrase: Phrase): phrase is PassThroughPhrase {
	return typeof (phrase as PassThroughPhrase).text === 'string';
}
