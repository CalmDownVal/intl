import { CachedTranslationProvider, Format, IntlError, TranslationProvider, Vars } from '@calmdownval/intl';
import { Component, createContext, h } from 'preact';

export interface Translation {
	readonly key: string;
	readonly vars?: Vars;
}

export interface TranslateFn {
	(key: string, vars?: Vars): string;
	(translation: Translation): string;
}

export interface Intl {
	readonly isLoading: boolean;
	readonly t: TranslateFn;
}

export interface IntlProviderProps {
	readonly credentials?: RequestInit['credentials'];
	readonly formats?: Record<string, Format<any>>;
	readonly headers?: RequestInit['headers'];
	readonly onError?: (ex: Error) => void;
	readonly url: string;
}

const WARNING_EMOJI = '\u26a0\ufe0f';
const INITIAL_STATE: Intl = {
	isLoading: true,
	t: () => ''
};

export const IntlContext = createContext<Intl>(INITIAL_STATE);

export class IntlProvider extends Component<IntlProviderProps, Intl> {
	public state = INITIAL_STATE;
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
		return h(IntlContext.Provider, {
			children: this.props.children,
			value: this.state
		});
	}

	private async fetchLocale() {
		try {
			this.setState(INITIAL_STATE);
			this.pendingFetch = new AbortController();

			const { credentials, headers, url } = this.props;
			const response = await fetch(url, {
				credentials,
				headers,
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
			this.props.onError?.(ex);
			this.setState({
				isLoading: false,
				t: () => ''
			});
		}
		finally {
			this.pendingFetch = undefined;
		}
	}
}

function translate(provider: TranslationProvider, keyOrTranslation: string | Translation, vars?: Vars) {
	try {
		return typeof keyOrTranslation === 'string'
			? provider.expand(keyOrTranslation, vars)
			: provider.expand(keyOrTranslation.key, keyOrTranslation.vars);
	}
	catch (ex) {
		return `${WARNING_EMOJI} ${IntlError.is(ex) ? ex.message : 'UnknownError'}`;
	}
}
