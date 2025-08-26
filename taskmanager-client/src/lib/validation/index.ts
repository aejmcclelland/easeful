// Main validation exports
export * from './task';
export * from './auth';

// Utility functions for form validation
import { ZodError, ZodSchema } from 'zod';

export type ValidationError = {
	field: string;
	message: string;
};

export type ValidationResult<T> = {
	success: true;
	data: T;
	errors: never;
} | {
	success: false;
	data: never;
	errors: ValidationError[];
};

/**
 * Validates data against a Zod schema and returns a formatted result
 */
export function validateData<T>(
	schema: ZodSchema<T>,
	data: unknown
): ValidationResult<T> {
	try {
		const validatedData = schema.parse(data);
		return {
			success: true,
			data: validatedData,
			errors: undefined as never,
		};
	} catch (error) {
		if (error instanceof ZodError) {
			const errors: ValidationError[] = error.issues.map((err) => ({
				field: err.path.join('.'),
				message: err.message,
			}));
			
			return {
				success: false,
				data: undefined as never,
				errors,
			};
		}
		
		// Fallback for unexpected errors
		return {
			success: false,
			data: undefined as never,
			errors: [{ field: 'general', message: 'Validation failed' }],
		};
	}
}

/**
 * Formats validation errors for display in forms
 */
export function formatValidationErrors(errors: ValidationError[]): Record<string, string> {
	return errors.reduce((acc, error) => {
		acc[error.field] = error.message;
		return acc;
	}, {} as Record<string, string>);
}

/**
 * Gets the first validation error for a specific field
 */
export function getFieldError(errors: ValidationError[], fieldName: string): string | undefined {
	return errors.find(error => error.field === fieldName)?.message;
}