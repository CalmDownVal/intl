export class IntlError extends Error {
	private readonly isIntlError = true;

	public constructor(
		public readonly code: string,
		message: string
	) {
		super(`${code} ${message}`);
	}

	public static readonly FORMAT_UNAVAILABLE = 'FormatUnavailable';
	public static readonly INVALID_PARAMETER = 'InvalidParameter';
	public static readonly KEY_NOT_FOUND = 'KeyNotFound';
	public static readonly PARSE_ERROR = 'KeyNotFound';

	public static is(obj: unknown): obj is IntlError {
		return (obj as IntlError | undefined)?.isIntlError === true;
	}
}
