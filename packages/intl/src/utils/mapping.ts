import type { TranslationMap } from '~/types';

function flattenTranslationMapInto(
	source: TranslationMap,
	destination: Record<string, string | undefined>,
	prefix: string
) {
	for (const key in source) {
		if (key.startsWith('$')) {
			continue;
		}

		const value = source[key];
		switch (typeof value) {
			case 'string':
				destination[prefix + key] = value;
				break;

			case 'object':
				if (value !== null) {
					flattenTranslationMapInto(value, destination, `${prefix}${key}.`);
				}

				break;
		}
	}

	return destination;
}

export function flattenTranslationMap(map: TranslationMap): Record<string, string | undefined> {
	return flattenTranslationMapInto(map, {}, '');
}

export function mapObjectValuesNotNull<TKey extends keyof any, TIn, TOut>(source: Record<TKey, TIn>, callback: (value: TIn, key: TKey) => TOut) {
	const result = {} as Record<TKey, NonNullable<TOut>>;
	for (const key in source) {
		if (Object.prototype.hasOwnProperty.call(source, key)) {
			const value = callback(source[key], key);
			if (value !== null && value !== undefined) {
				result[key] = value;
			}
		}
	}

	return result;
}
