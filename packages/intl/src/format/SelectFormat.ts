import { IntlError } from '~/IntlError';
import type { Format, PlaceholderExpansion } from '~/types';
import { expand, getFormatName } from '~/utils/placeholder';
import { assertMessages, assertParamsValid } from '~/utils/validation';

const paramTypes = [ assertMessages ] as const;

export const SelectFormat: Format = () => (placeholder, interpreter) => {
	assertParamsValid(placeholder, paramTypes);

	const optionsAST = placeholder[2];
	if (!optionsAST.other) {
		throw new IntlError(
			IntlError.INVALID_PARAMETER,
			`messages of format '${getFormatName(placeholder)}' must contain the key 'other'`
		);
	}

	const options: Record<string, PlaceholderExpansion | undefined> = {};
	for (const key in optionsAST) {
		options[key] = interpreter.interpret(optionsAST[key]!);
	}

	return vars => (options[expand(placeholder, vars)] ?? options.other!)(vars);
};
