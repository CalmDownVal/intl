import type { AST, Placeholder } from './parser/parser';

/**
 * A map of variables used for substitution of placeholders in a translation
 * phrase.
 */
export interface Vars {
	readonly [key: string]: string | number | Date | undefined;
}

/**
 * A callback that expands a placeholder to a localized string.
 */
export interface PlaceholderExpansion {
	(vars?: Vars): string;
}

export interface Interpreter {
	interpret(ast: AST, octothorpeParam?: string): PlaceholderExpansion;
}

/**
 * A configured formatter able to expand placeholders.
 */
export interface Format {
	(placeholder: Placeholder, interpreter: Interpreter): PlaceholderExpansion;
}

/**
 * A factory function used to create Formatters with a specific configuration.
 */
export interface FormatFactory<TConfig = void> {
	(...args: (TConfig extends void ? [] : [ config: TConfig ])): Format;
}

/**
 * A service able to provide Formats by a name.
 */
export interface FormatProvider {
	getFormat(placeholder: Placeholder): Format;
}

/**
 * A map of translation phrases.
 */
export interface TranslationMap {
	readonly [key: string]: TranslationMap | string | null | undefined;
}

/**
 * A map of translation phrases and a bundled set of formatter configurations.
 */
export interface Locale extends TranslationMap {
	readonly $format?: Record<string, any>;
}

export interface TranslationProvider {
	expand(key: string, vars?: Vars): string;
}
