// src/lib/getErrorMessage.ts

export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}

	if (
		error &&
		typeof error === 'object' &&
		'message' in error &&
		typeof (error as Record<string, unknown>).message === 'string'
	) {
		return (error as Record<string, unknown>).message as string;
	}

	return String(error);
}
