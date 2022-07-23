import { IntlError } from '~/IntlError';

import type { DateTimePartFormat, DateTimeTranslations } from './types';

interface PartFormatter {
	(date: Date, length: number, translations: DateTimeTranslations): string;
}

const PARTS: Record<string, PartFormatter | undefined> = {
	/* eslint-disable @typescript-eslint/naming-convention */
	// years
	y(date, length) {
		let y = date.getFullYear();
		if (length === 2) {
			y %= 100;
		}

		return pad(y, length);
	},

	// months
	M(date, length, { monthsLong, monthsShort }) {
		const m = date.getMonth();
		switch (length) {
			case 1:
			case 2:
				return pad(m + 1, length);

			case 3:
				assertConfigured(monthsShort);
				return monthsShort[m];

			case 4:
				assertConfigured(monthsLong);
				return monthsLong[m];

			default:
				throw notSupported();
		}
	},

	// days, weekdays
	d(date, length) {
		return pad(date.getDate(), length);
	},
	E(date, length, { weekdaysLong, weekdaysShort }) {
		const e = date.getDay();
		switch (length) {
			case 1:
			case 2:
			case 3:
				assertConfigured(weekdaysShort);
				return weekdaysShort[e];

			case 4:
				assertConfigured(weekdaysLong);
				return weekdaysLong[e];

			default:
				throw notSupported();
		}
	},

	// period
	a(date, _length, { dayPeriod }) {
		assertConfigured(dayPeriod);
		return dayPeriod[date.getHours() >= 12 ? 1 : 0];
	},

	// hours
	h(date, length) {
		const h = date.getHours() % 12;
		return pad(h === 0 ? 12 : h, length);
	},
	H(date, length) {
		return pad(date.getHours(), length);
	},

	// minutes
	m(date, length) {
		return pad(date.getMinutes(), length);
	},

	// seconds
	s(date, length) {
		return pad(date.getSeconds(), length);
	},

	// timezone offset
	X(date, length) {
		const z = date.getTimezoneOffset();
		if (z === 0) {
			return 'Z';
		}

		const h = Math.floor(Math.abs(z) / 60);
		const m = Math.abs(z) % 60;
		return (
			(z < 0 ? '-' : '+') +
			pad(h) +
			(m !== 0 || length > 1 ? (length > 2 ? ':' : '') + pad(m) : '')
		);
	}
};

function assertConfigured<T>(value: T | null | undefined): asserts value is T {
	if (value === null || value === undefined) {
		throw new IntlError(
			IntlError.FORMAT_UNAVAILABLE,
			'Cannot use some DateTime formats; Required translations are missing.'
		);
	}
}

function notSupported() {
	return new IntlError(
		IntlError.FORMAT_UNAVAILABLE,
		'DateTime format not supported.'
	);
}

function pad(n: number, length = 2) {
	return ('' + n).padStart(length, '0');
}

function formatDateTime(sequence: readonly (PartFormatter | number | string)[], value: unknown, translations: DateTimeTranslations) {
	let date: Date;
	switch (typeof value) {
		case 'number':
		case 'string':
			date = new Date(value);
			break;

		case 'object':
			if (value !== null && value instanceof Date) {
				date = value;
				break;
			}

			// fall through otherwise

		default:
			throw new IntlError(IntlError.INVALID_PARAMETER, 'invalid date');
	}

	let result = '';
	let part;
	let i = 0;

	while (i < sequence.length) {
		part = sequence[i++];
		result += typeof part === 'function' ? part(date, sequence[i++] as number, translations) : part;
	}

	return result;
}

const CC_QUOTE = 39;
const CC_UCA = 65;
const CC_UCZ = 90;
const CC_LCA = 97;
const CC_LCZ = 122;

export function parseDateTimeFormat(pattern: string): DateTimePartFormat {
	const sequence: (PartFormatter | number | string)[] = [];
	const { length } = pattern;
	if (length === 0) {
		return () => '';
	}

	let index = 0;
	let anchor = 0;
	let isEscaped = false;
	let cc = pattern.charCodeAt(0);

	const addLiteral = (str: string) => {
		const i = sequence.length - 1;
		if (i >= 0 && typeof sequence[i] === 'string') {
			sequence[i] += str;
		}
		else {
			sequence.push(str);
		}
	};

	const commit = () => {
		const part = pattern.slice(anchor, index);
		if (isEscaped) {
			addLiteral(part || '\'');
		}
		else if ((cc >= CC_UCA && cc <= CC_UCZ) || (cc >= CC_LCA && cc <= CC_LCZ)) {
			const formatter = PARTS[part[0]];
			if (formatter) {
				sequence.push(formatter, part.length);
			}
		}
		else {
			addLiteral(part);
		}

		anchor = index;
	};

	while (index < length) {
		const next = pattern.charCodeAt(index);
		if (next === CC_QUOTE) {
			commit();

			if (pattern.charCodeAt(index + 1) === CC_QUOTE) {
				addLiteral('\'');
				anchor += 2;
				++index;
			}
			else {
				isEscaped = !isEscaped;
				++anchor;
			}
		}
		else if (!isEscaped && next !== cc) {
			commit();
		}

		cc = next;
		++index;
	}

	commit();
	return formatDateTime.bind(null, sequence);
}
