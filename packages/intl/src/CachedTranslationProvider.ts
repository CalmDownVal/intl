import { DefaultInterpreter } from './DefaultInterpreter';
import * as builtInFormats from './format';
import { MappedFormatProvider } from './MappedFormatProvider';
import { parse } from './parser/parser';
import { TranslationError } from './TranslationError';
import type { FormatFactory, Interpreter, Locale, PlaceholderExpansion, TranslationMap, TranslationProvider, Vars } from './types';
import { flattenTranslationMap, mapObjectValues } from './utils/mapping';

export enum CacheMode {
	/**
	 * All phrases are interpreted and cached immediately upon construction.
	 *
	 * Useful to detect any syntax errors right away and avoid parsing during
	 * app runtime.
	 */
	Eager,

	/**
	 * Phrases are interpreted on-demand, then cached. This is a balanced
	 * compromise between the `Eager` and `Off` suitable for most apps.
	 *
	 * This is the default mode.
	 */
	Lazy,

	/**
	 * Each time a translation is requested, it is interpreted anew; No caching
	 * takes place.
	 *
	 * Useful to lower memory usage when individual phrases are only used
	 * scarcely.
	 */
	Off
}

export interface CachedTranslationProviderArgs {
	cacheMode?: CacheMode;
	interpreter: Interpreter;
	translations: TranslationMap;
}

export class CachedTranslationProvider implements TranslationProvider {
	private readonly cacheMode: CacheMode;
	private readonly expansions: Record<string, PlaceholderExpansion | string | undefined>;
	private readonly interpreter: Interpreter;

	public constructor({ cacheMode, interpreter, translations }: CachedTranslationProviderArgs) {
		this.cacheMode = cacheMode ?? CacheMode.Lazy;
		this.interpreter = interpreter;
		this.expansions = flattenTranslationMap(translations);

		if (cacheMode === CacheMode.Eager) {
			this.expansions = mapObjectValues(this.expansions, phrase => interpreter.interpret(parse(phrase as string)));
		}
	}

	public expand(key: string, vars?: Vars) {
		let expand = this.expansions[key];
		if (expand === undefined) {
			throw new TranslationError(TranslationError.KEY_NOT_FOUND, key);
		}

		if (typeof expand === 'string') {
			expand = this.interpreter.interpret(parse(expand));
			if (this.cacheMode !== CacheMode.Off) {
				this.expansions[key] = expand;
			}
		}

		return expand(vars);
	}

	public static fromLocale(locale: Locale, formats: Record<string, FormatFactory<any>> = builtInFormats) {
		const formatMap = mapObjectValues(formats, (factory, formatName) => factory(locale.$format?.[formatName]));
		const formatProvider = new MappedFormatProvider(formatMap);
		return new CachedTranslationProvider({
			cacheMode: CacheMode.Lazy,
			interpreter: new DefaultInterpreter(formatProvider),
			translations: locale
		});
	}
}
