// src/lib/getErrorMessage.ts

export function getErrorMessage(error: unknown): string {
	if (error instanceof Error && error.message) {
		return error.message;
	}

	if (error && typeof error === 'object') {
		const maybeError = error as Record<string, unknown>;

		if (typeof maybeError.error === 'string' && maybeError.error) {
			return maybeError.error;
		}

		if (typeof maybeError.message === 'string' && maybeError.message) {
			return maybeError.message;
		}
	}

	if (typeof error === 'string' && error) {
		return error;
	}

	return 'Something went wrong. Please try again.';
}
