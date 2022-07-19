import { IntlError } from './IntlError';
import type { Placeholder } from './parser/parser';
import type { FormatCallback, FormatProvider } from './types';
import { getFormatName } from './utils/placeholder';

export class MappedFormatProvider implements FormatProvider {
	public constructor(
		private readonly formatMap: Record<string, FormatCallback | undefined>
	) {}

	public getFormat(placeholder: Placeholder): FormatCallback {
		const name = getFormatName(placeholder);
		const format = this.formatMap[name];
		if (!format) {
			throw new IntlError(IntlError.FORMAT_UNAVAILABLE, name);
		}

		return format;
	}
}
