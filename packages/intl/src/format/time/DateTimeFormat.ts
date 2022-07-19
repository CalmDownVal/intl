import { IntlError } from '~/IntlError';
import type { Format } from '~/types';
import { mapObjectValues } from '~/utils/mapping';
import { expand } from '~/utils/placeholder';
import { assertIdentifier, assertParamsValid } from '~/utils/validation';

import { parseDateTimeFormat } from './parser';
import { DateTimePartFormat, DateTimeTranslations } from './types';

const paramTypes = [ assertIdentifier ] as const;

export interface TimeFormatConfig extends DateTimeTranslations {
	/**
	 * Any formats (e.g. 'long', 'short') used within translation phrases must
	 * be defined here.
	 */
	formats: Record<string, string>;
}

export const DateTimeFormat: Format<TimeFormatConfig> = config => {
	const formats: Record<string, DateTimePartFormat<unknown> | undefined> = mapObjectValues(config.formats, parseDateTimeFormat);
	return placeholder => {
		assertParamsValid(placeholder, paramTypes);

		const format = formats[placeholder[2]];
		if (!format) {
			throw new IntlError(
				IntlError.INVALID_PARAMETER,
				`DateTime format '${placeholder[2]}' is not configured.`
			);
		}

		return vars => format(expand(placeholder, vars), config);
	};
};
