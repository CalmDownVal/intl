import type { FormatFactory } from '~/types';
import { expand } from '~/utils/placeholder';
import { assertParamsValid } from '~/utils/validation';

const paramTypes = [] as const;

export const variable: FormatFactory = () => placeholder => {
	assertParamsValid(placeholder, paramTypes);
	return vars => expand(placeholder, vars);
};
