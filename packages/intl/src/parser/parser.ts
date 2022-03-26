/* eslint-disable max-depth */
import { ParseError } from './ParseError';

export interface Messages {
	[name: string]: AST | undefined;
}

export interface Attributes {
	[name: string]: string | undefined;
}

export type Placeholder = [ varName: string, formatName?: string, ...params: (string | Messages | Attributes)[] ];
export type Element = string | Placeholder;
export type AST = Element[];

const C_ATTRIBUTE = ':';
const C_ESCAPE = "'";
const C_OCTOTHORPE = '#';
const C_PLACEHOLDER_OPEN = '{';
const C_PLACEHOLDER_CLOSE = '}';
const C_SEPARATOR = ',';

function isWhitespace(code: number) {
	return (
		code === 0x20 ||
		(code >= 0x09 && code <= 0x0D) ||
		code === 0x85 ||
		code === 0xA0 ||
		code === 0x180E ||
		(code >= 0x2000 && code <= 0x200D) ||
		code === 0x2028 ||
		code === 0x2029 ||
		code === 0x202F ||
		code === 0x205F ||
		code === 0x2060 ||
		code === 0x3000 ||
		code === 0xFEFF
	);
}

function skipWhitespace(input: string, offset: number) {
	const { length } = input;

	let index = offset;
	while (index < length && isWhitespace(input.charCodeAt(index))) {
		++index;
	}

	return index;
}

function parseIdentifier(input: string, offset: number) {
	const { length } = input;

	let index = offset;
	let char;

	while (index < length) {
		char = input[index];
		if (
			char === C_PLACEHOLDER_OPEN ||
			char === C_PLACEHOLDER_CLOSE ||
			char === C_SEPARATOR ||
			char === C_OCTOTHORPE ||
			char === C_ESCAPE ||
			char === C_ATTRIBUTE ||
			isWhitespace(char.charCodeAt(0))
		) {
			break;
		}

		++index;
	}

	if (offset === index) {
		throw new ParseError(`expected an identifier but ${char ? `saw '${char}'` : 'saw the end of pattern'} instead`, input, offset);
	}

	return input.slice(offset, index);
}

function parseText(input: string, offset: number, isWithinPlaceholder: boolean) {
	const { length } = input;

	let anchor = offset;
	let index = offset;
	let char;
	let text = '';

	while (index < length) {
		char = input[index];
		if (
			char === C_PLACEHOLDER_OPEN ||
			char === C_PLACEHOLDER_CLOSE ||
			(isWithinPlaceholder && char === C_OCTOTHORPE)
		) {
			break;
		}

		if (char === C_ESCAPE) {
			char = input[++index];

			// double escape is always transformed into a single char
			if (char === C_ESCAPE) {
				text += input.slice(anchor, index);
				anchor = index + 1;
			}

			// an escape sequence is only started when directly followed by a special
			else if (
				char === C_PLACEHOLDER_OPEN ||
				char === C_PLACEHOLDER_CLOSE ||
				(isWithinPlaceholder && char === C_OCTOTHORPE)
			) {
				text += input.slice(anchor, index - 1);
				anchor = index;

				while (++index < length) {
					char = input[index];
					if (char === C_ESCAPE) {
						char = input[index + 1];
						if (char === C_ESCAPE) {
							text += input.slice(anchor, ++index);
							anchor = index + 1;
						}
						else {
							break;
						}
					}
				}

				text += input.slice(anchor, index);
				anchor = ++index;
			}
		}

		++index;
	}

	text += input.slice(anchor, index);
	return text;
}

function parseMessages(input: string, offset: number, placeholder: Placeholder, firstKey: string) {
	const { length } = input;
	const messages: Messages = {};
	placeholder.push(messages);

	let key = firstKey;
	let char;
	let ast: AST = [];
	let index = parseAST(input, offset, ast, true);
	messages[key] = ast;

	while (index < length) {
		index = skipWhitespace(input, index);
		char = input[index];
		if (char === C_SEPARATOR || char === C_PLACEHOLDER_CLOSE) {
			break;
		}

		key = parseIdentifier(input, index);
		index = skipWhitespace(input, index + key.length);

		char = input[index];
		if (char !== C_PLACEHOLDER_OPEN) {
			throw new ParseError(`expected '${C_PLACEHOLDER_OPEN}'`, input, index);
		}

		ast = [];
		index = parseAST(input, index + 1, ast, true);
		messages[key] = ast;
	}

	return index;
}

function parseMessagesWithAttributes(input: string, offset: number, placeholder: Placeholder, firstKey: string) {
	const { length } = input;
	const attributes: Attributes = {};
	placeholder.push(attributes);

	let key = firstKey;
	let char;
	let index = skipWhitespace(input, offset);
	let value = parseIdentifier(input, index);
	index += value.length;
	attributes[key] = value;

	while (index < length) {
		index = skipWhitespace(input, index);
		char = input[index];
		if (char === C_SEPARATOR || char === C_PLACEHOLDER_CLOSE) {
			break;
		}

		key = parseIdentifier(input, index);
		index = skipWhitespace(input, index + key.length);

		char = input[index];
		if (char === C_PLACEHOLDER_OPEN) {
			return parseMessages(input, index + 1, placeholder, key);
		}

		if (char !== C_ATTRIBUTE) {
			throw new ParseError(`expected '${C_ATTRIBUTE}' or '${C_PLACEHOLDER_OPEN}'`, input, index);
		}

		index = skipWhitespace(input, index + 1);
		value = parseIdentifier(input, index);
		index += value.length;

		attributes[key] = value;
	}

	return index;
}

function parsePlaceholder(input: string, offset: number, placeholder: Placeholder) {
	let index = offset;
	let char = input[index];

	if (char === C_OCTOTHORPE) {
		placeholder.push('#');
		return index + 1;
	}

	if (char !== C_PLACEHOLDER_OPEN) {
		throw new ParseError(`expected '${C_OCTOTHORPE}' or '${C_PLACEHOLDER_OPEN}'`, input, index);
	}

	const { length } = input;

	do {
		index = skipWhitespace(input, index + 1);
		const id = parseIdentifier(input, index);
		index = skipWhitespace(input, index + id.length);

		char = input[index];
		switch (char) {
			case C_SEPARATOR:
			case C_PLACEHOLDER_CLOSE:
				placeholder.push(id);
				break;

			case C_PLACEHOLDER_OPEN:
				if (placeholder.length < 2) {
					throw new ParseError('expected an identifier but saw a message instead', input, index);
				}

				index = parseMessages(input, index + 1, placeholder, id);
				char = input[index];
				break;

			case C_ATTRIBUTE:
				if (placeholder.length < 2) {
					throw new ParseError('expected an identifier but saw an attribute instead', input, index);
				}

				index = parseMessagesWithAttributes(input, index + 1, placeholder, id);
				char = input[index];
				break;

			default:
				throw new ParseError(`unexpected character '${char}'`, input, index);
		}
	}
	while (index < length && char !== C_PLACEHOLDER_CLOSE);

	return index + 1;
}

function parseAST(input: string, offset: number, ast: AST, isWithinPlaceholder: boolean) {
	let char;
	let index = offset;
	let text = parseText(input, index, isWithinPlaceholder);

	if (text) {
		ast.push(text);
		index += text.length;
	}

	const { length } = input;
	while (index < length) {
		char = input[index];
		if (char === C_PLACEHOLDER_CLOSE) {
			if (!isWithinPlaceholder) {
				throw new ParseError(`unexpected '${C_PLACEHOLDER_CLOSE}'`, input, index);
			}

			++index;
			break;
		}

		const placeholder: any = [];
		index = parsePlaceholder(input, index, placeholder);
		ast.push(placeholder);

		text = parseText(input, index, isWithinPlaceholder);
		if (text) {
			ast.push(text);
			index += text.length;
		}
	}

	return index;
}

export function parse(input: string) {
	const ast: AST = [];
	parseAST(input, 0, ast, false);
	return ast;
}
