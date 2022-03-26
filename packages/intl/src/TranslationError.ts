export class TranslationError extends Error {
	private readonly isTranslationError = true;

	public constructor(
		public readonly code: string,
		extra: string
	) {
		super(`${code} ${extra}`);
	}

	public static readonly FORMAT_UNAVAILABLE = 'FormatUnavailable';
	public static readonly INVALID_PARAMETER = 'InvalidParameter';
	public static readonly KEY_NOT_FOUND = 'KeyNotFound';

	public static is(obj: unknown): obj is TranslationError {
		return (obj as TranslationError | undefined)?.isTranslationError === true;
	}
}
