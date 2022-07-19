import { IntlError } from '~/IntlError';
import type { Attributes, Messages, Placeholder } from '~/parser/parser';

import { getFormatName } from './placeholder';

type Validator<T> = (value: unknown, type: string, index: number) => asserts value is T;
type ValidatedTypes<V extends readonly any[]> = { [I in keyof V]: V[I] extends Validator<infer T> ? T : never };

export function assertParamsValid<TValidators extends readonly Validator<any>[]>(
	placeholder: readonly any[],
	validators: TValidators
): asserts placeholder is [ string, string?, ...ValidatedTypes<TValidators> ] {
	const { length } = validators;
	const formatName = getFormatName(placeholder as Placeholder);

	if (placeholder.length - 2 > length) {
		throw new IntlError(
			IntlError.INVALID_PARAMETER,
			`too many parameters for format '${formatName}'`
		);
	}

	for (let paramIndex = 0; paramIndex < length; ++paramIndex) {
		validators[paramIndex].call(null, placeholder[2 + paramIndex], formatName, paramIndex);
	}
}


export function assertIdentifier(value: unknown, formatName: string, paramIndex: number): asserts value is string {
	if (typeof value !== 'string') {
		fail('an identifier', formatName, paramIndex);
	}
}

export function assertMessages(obj: unknown, formatName: string, paramIndex: number): asserts obj is Messages {
	if (!(isObject(obj) && Array.isArray(getAnyValue(obj)))) {
		fail('a map of messages', formatName, paramIndex);
	}
}

export function assertAttributes(obj: unknown, formatName: string, paramIndex: number): asserts obj is Attributes {
	if (!(isObject(obj) && typeof getAnyValue(obj) === 'string')) {
		fail('a map of attributes', formatName, paramIndex);
	}
}

export function optional<T>(validator: Validator<T>): Validator<T | undefined> {
	return (value, format, index): asserts value is T | undefined => {
		if (value === null || value === undefined) {
			return;
		}

		validator(value, format, index);
	};
}


function isObject(value: unknown): value is {} {
	return value !== null && typeof value === 'object';
}

function getAnyValue(obj: {}): unknown {
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			return obj[key as never];
		}
	}

	return undefined;
}

function fail(expected: string, formatName: string, paramIndex: number) {
	throw new IntlError(
		IntlError.INVALID_PARAMETER,
		`expected parameter ${paramIndex + 1} of format '${formatName}' to be ${expected}`
	);
}
