import type { Vars } from '@calmdownval/intl';

/**
 * Represents a phrase that can be translated depending on the locale.
 */
export interface TranslatedPhrase {
	/** The translation key. */
	readonly key: string;

	/** Optional Vars object to use with the translation. */
	readonly vars?: Vars;

	/** Optional fallback text to display in case of a missing translation. */
	readonly fallbackText?: string;
}

/**
 * Represents a static text phrase for which no translation attempts should be made.
 */
export interface PassThroughPhrase {
	/** The text to display. */
	readonly text: string;
}

/**
 * Represents a phrase for translation.
 */
export type Phrase = TranslatedPhrase | PassThroughPhrase;

export interface TranslateFn {
	/**
	 * Translates a phrase identified by either a Phrase object or given as
	 * individual arguments.
	 *
	 * Returns the translated phrase, fallback text or an error text when no
	 * fallback is provided.
	 */
	(phrase: Phrase): string;
	(key: string, vars?: Vars, fallbackText?: string): string;
	(key: string, fallbackText?: string): string;
}

export interface Intl {
	readonly isLoading: boolean;
	readonly t: TranslateFn;
}
