import { IntlError } from '~/IntlError';

import type { DateTimePartFormat, DateTimeTranslations } from './types';

const formats: Record<string, DateTimePartFormat | undefined> = {
	/* eslint-disable @typescript-eslint/naming-convention */
	// years
	y(date) {
		return '' + (date.getFullYear() % 100);
	},
	yy(date) {
		const y = date.getFullYear() % 100;
		return pad2(y);
	},
	yyyy(date) {
		const y = '' + date.getFullYear();
		return y.padStart(4, '0');
	},

	// months
	M(date) {
		return '' + (date.getMonth() + 1);
	},
	MM(date) {
		const M = date.getMonth() + 1;
		return pad2(M);
	},
	MMM(date, { monthsShort }) {
		assertConfigured(monthsShort);
		return monthsShort[date.getMonth()];
	},
	MMMM(date, { monthsLong }) {
		assertConfigured(monthsLong);
		return monthsLong[date.getMonth()];
	},

	// days
	d(date) {
		return '' + date.getDate();
	},
	dd(date) {
		const d = date.getDate();
		return pad2(d);
	},
	ddd(date, { weekdaysShort }) {
		assertConfigured(weekdaysShort);
		return weekdaysShort[date.getDay()].slice(0, 3);
	},
	dddd(date, { weekdaysLong }) {
		assertConfigured(weekdaysLong);
		return weekdaysLong[date.getDay()];
	},

	// hours
	h(date) {
		const h = date.getHours() % 12;
		return h === 0 ? '12' : '' + h;
	},
	hh(date) {
		const h = date.getHours() % 12;
		return h === 0 ? '12' : pad2(h);
	},
	H(date) {
		return '' + date.getHours();
	},
	HH(date) {
		const H = date.getHours();
		return pad2(H);
	},

	// minutes
	m(date) {
		return '' + date.getMinutes();
	},
	mm(date) {
		const m = date.getMinutes();
		return pad2(m);
	},

	// seconds
	s(date) {
		return '' + date.getSeconds();
	},
	ss(date) {
		const s = date.getSeconds();
		return pad2(s);
	},

	// 12-hour clock
	t(date, { dayPeriodLower }) {
		assertConfigured(dayPeriodLower);
		return dayPeriodLower[date.getHours() >= 12 ? 1 : 0];
	},
	T(date, { dayPeriodUpper }) {
		assertConfigured(dayPeriodUpper);
		return dayPeriodUpper[date.getHours() >= 12 ? 1 : 0];
	}

	// timezone offset
	/*
	z(date) {
		const z = date.getTimezoneOffset();
		if (z === 0) {
			return 'Z';
		}

		const h = Math.floor(Math.abs(z) / 60);
		return (z < 0 ? '-' : '+') + h;
	},
	zz(date) {
		const z = date.getTimezoneOffset();
		if (z === 0) {
			return 'Z';
		}

		const h = Math.floor(Math.abs(z) / 60);
		return (z < 0 ? '-' : '+') + pad2(h);
	},
	zzz(date) {
		const z = date.getTimezoneOffset();
		if (z === 0) {
			return 'Z';
		}

		const h = Math.floor(Math.abs(z) / 60);
		const m = Math.abs(z) % 60;
		return (z < 0 ? '-' : '+') + pad2(h) + ':' + pad2(m);
	}
	*/
};

function assertConfigured<T>(value: T | null | undefined): asserts value is T {
	if (value === null || value === undefined) {
		throw new IntlError(
			IntlError.INVALID_PARAMETER,
			'Cannot use some DateTime formats; Calendar translations missing.'
		);
	}
}

function pad2(n: number) {
	return n < 10 ? '0' + n : '' + n;
}

function formatDateTime(groups: readonly (string | DateTimePartFormat)[], value: unknown, translations: DateTimeTranslations) {
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
			return 'invalid date';
	}

	let result = '';
	for (let group, i = 0; i < groups.length; ++i) {
		group = groups[i];
		result += typeof group === 'function' ? group(date, translations) : group;
	}

	return result;
}

export function parseDateTimeFormat(pattern: string): DateTimePartFormat<unknown> {
	const groups: (DateTimePartFormat | string)[] = [];
	const { length } = pattern;
	if (length === 0) {
		return () => '';
	}

	let index = 1;
	let anchor = 0;
	let prev = pattern[0];

	const addLiteral = (str: string) => {
		const i = groups.length - 1;
		if (i >= 0 && typeof groups[i] === 'string') {
			groups[i] += str;
		}
		else {
			groups.push(str);
		}
	};

	const commit = () => {
		if (prev === '\\') {
			addLiteral(pattern[index]);
		}
		else {
			const group = pattern.slice(anchor, index);
			const format = formats[group];
			if (format) {
				groups.push(format);
			}
			else {
				addLiteral(group);
			}
		}

		anchor = index;
	};

	while (index < length) {
		const current = pattern[index];
		if (current !== prev || prev === '\\') {
			commit();
		}

		prev = current;
		++index;
	}

	commit();
	return formatDateTime.bind(null, groups);
}
