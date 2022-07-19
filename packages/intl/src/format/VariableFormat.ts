import type { Format } from '~/types';
import { expand } from '~/utils/placeholder';
import { assertParamsValid } from '~/utils/validation';

const paramTypes = [] as const;

export const VariableFormat: Format = () => placeholder => {
	assertParamsValid(placeholder, paramTypes);
	return vars => expand(placeholder, vars);
};
