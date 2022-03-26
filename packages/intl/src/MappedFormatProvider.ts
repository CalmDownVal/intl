import type { Placeholder } from './parser/parser';
import { TranslationError } from './TranslationError';
import type { Format, FormatProvider } from './types';
import { getFormatName } from './utils/placeholder';

export class MappedFormatProvider implements FormatProvider {
	public constructor(
		private readonly formatMap: Record<string, Format | undefined>
	) {}

	public getFormat(placeholder: Placeholder): Format {
		const name = getFormatName(placeholder);
		const format = this.formatMap[name];
		if (!format) {
			throw new TranslationError(TranslationError.FORMAT_UNAVAILABLE, name);
		}

		return format;
	}
}
