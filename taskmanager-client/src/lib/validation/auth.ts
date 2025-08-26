import { z } from 'zod';

// Common email validation
export const EmailSchema = z
	.string()
	.trim()
	.min(1, 'Email is required')
	.email('Please enter a valid email address')
	.max(255, 'Email cannot be longer than 255 characters')
	.toLowerCase();

// Common password validation
export const PasswordSchema = z
	.string()
	.min(6, 'Password must be at least 6 characters long')
	.max(128, 'Password cannot be longer than 128 characters')
	.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
		'Password must contain at least one uppercase letter, one lowercase letter, and one number');

// Name validation
export const NameSchema = z
	.string()
	.trim()
	.min(1, 'Name is required')
	.max(100, 'Name cannot be longer than 100 characters')
	.regex(/^[a-zA-Z\s\-'\.]+$/, 'Name can only contain letters, spaces, hyphens, apostrophes, and periods');

// User role validation
export const UserRoleSchema = z.enum(['user', 'publisher', 'admin']);

// Registration schema
export const RegisterSchema = z.object({
	name: NameSchema,
	email: EmailSchema,
	password: PasswordSchema,
});

// Login schema
export const LoginSchema = z.object({
	email: EmailSchema,
	password: z.string().min(1, 'Password is required'), // Don't validate password strength on login
});

// Update profile schema
export const UpdateProfileSchema = z.object({
	name: NameSchema,
	email: EmailSchema,
});

// Update password schema
export const UpdatePasswordSchema = z.object({
	currentPassword: z.string().min(1, 'Current password is required'),
	newPassword: PasswordSchema,
	confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
	message: 'New passwords do not match',
	path: ['confirmPassword'],
});

// Forgot password schema
export const ForgotPasswordSchema = z.object({
	email: EmailSchema,
});

// Reset password schema
export const ResetPasswordSchema = z.object({
	token: z.string().min(1, 'Reset token is required'),
	password: PasswordSchema,
	confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
	message: 'Passwords do not match',
	path: ['confirmPassword'],
});

// Admin create user schema
export const CreateUserSchema = RegisterSchema.extend({
	role: UserRoleSchema.default('user'),
});

// Type exports
export type RegisterData = z.infer<typeof RegisterSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type UpdateProfileData = z.infer<typeof UpdateProfileSchema>;
export type UpdatePasswordData = z.infer<typeof UpdatePasswordSchema>;
export type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof ResetPasswordSchema>;
export type CreateUserData = z.infer<typeof CreateUserSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;