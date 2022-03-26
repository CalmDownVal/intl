import type { AST, Element } from './parser/parser';
import type { FormatProvider, Interpreter, Vars, PlaceholderExpansion } from './types';

export class DefaultInterpreter implements Interpreter {
	public constructor(
		private readonly formatProvider: FormatProvider
	) {}

	public interpret(ast: AST, octothorpeParam?: string): PlaceholderExpansion {
		const { length } = ast;
		if (length === 1) {
			return this.interpretElement(ast[0], octothorpeParam);
		}

		const placeholders = new Array<PlaceholderExpansion>(length);
		for (let i = 0; i < length; ++i) {
			placeholders[i] = this.interpretElement(ast[i], octothorpeParam);
		}

		return formatAndJoin.bind(null, placeholders);
	}

	private interpretElement(element: Element, octothorpeParam?: string) {
		if (typeof element === 'string') {
			return () => element;
		}

		let placeholder = element;
		if (placeholder.length === 1 && placeholder[0] === '#') {
			if (octothorpeParam === undefined) {
				return () => '#';
			}

			placeholder = [ octothorpeParam ];
		}

		return this.formatProvider.getFormat(placeholder)(placeholder, this);
	}
}

function formatAndJoin(placeholders: readonly PlaceholderExpansion[], vars?: Vars) {
	let str = '';
	for (let i = 0; i < placeholders.length; ++i) {
		str += placeholders[i](vars);
	}

	return str;
}
