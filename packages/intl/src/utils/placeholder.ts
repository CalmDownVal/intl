import type { Placeholder } from '~/parser/parser';
import type { Vars } from '~/types';

export function getFormatName(placeholder: Placeholder) {
	return placeholder[1] ?? 'variable';
}

export function expand(placeholder: Placeholder, vars?: Vars) {
	const varName = placeholder[0];
	if (vars === undefined || !Object.prototype.hasOwnProperty.call(vars, varName)) {
		return varName;
	}

	return '' + vars[varName];
}
