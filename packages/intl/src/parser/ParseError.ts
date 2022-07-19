import { IntlError } from '~/IntlError';

export class ParseError extends IntlError {
	public constructor(
		message: string,
		public readonly input: string,
		public readonly at: number
	) {
		super(IntlError.PARSE_ERROR, message);
	}

	public toString() {
		const trimStart = Math.max(this.input.lastIndexOf('\n', this.at - 1), 0) + 1;

		let trimEnd = this.input.indexOf('\n', this.at + 1);
		if (trimEnd === -1) {
			trimEnd = this.input.length;
		}
		else if (this.input[trimEnd - 1] === '\r') {
			// prevent slicing through CRLF pairs
			--trimEnd;
		}

		const snippet = `${this.input.slice(trimStart, trimEnd)}\n${' '.repeat(this.at - trimStart)}^`;
		return `${this.message} at pos ${this.at}:\n\n${snippet}\n\n${this.stack}`;
	}
}
