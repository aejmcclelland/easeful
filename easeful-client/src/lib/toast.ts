// src/lib/toast.ts
import { toast, type ToastOptions } from 'react-toastify';

export const TOAST_IDS = {
	profileUpdateSuccess: 'profile-update-success',
	profileUpdateError: 'profile-update-error',
	passwordChangeSuccess: 'password-change-success',
	passwordChangeError: 'password-change-error',
	deleteAccountSuccess: 'delete-account-success',
	deleteAccountError: 'delete-account-error',

	//auth-related IDs
	loginError: 'auth-login-error',
	loginSuccess: 'login-success',
	registerSuccess: 'auth-register-success',
	registerError: 'register-error',
} as const;

export type ToastIdKey = keyof typeof TOAST_IDS;

export function showToast(
	id: ToastIdKey,
	message: string,
	type: 'success' | 'error' | 'info'
) {
	toast[type](message, { toastId: id });
}

const defaultOpts: ToastOptions = {
	position: 'top-center',
	autoClose: 3000,
	hideProgressBar: false,
	pauseOnHover: true,
	closeOnClick: true,
	draggable: true,
};

export const profileToasts = {
	updated() {
		toast.success('Profile updated', {
			...defaultOpts,
			toastId: TOAST_IDS.profileUpdateSuccess,
		});
	},
	updateError(message: string) {
		toast.error(message || 'Failed to update profile', {
			...defaultOpts,
			toastId: TOAST_IDS.profileUpdateError,
		});
	},
	passwordChanged() {
		toast.success('Password updated', {
			...defaultOpts,
			toastId: TOAST_IDS.passwordChangeSuccess,
		});
	},
	passwordError(message: string) {
		toast.error(message || 'Failed to update password', {
			...defaultOpts,
			toastId: TOAST_IDS.passwordChangeError,
		});
	},
	deleteAccountSuccess() {
		toast.success('Your account has been deleted', {
			...defaultOpts,
			toastId: TOAST_IDS.deleteAccountSuccess,
		});
	},
	deleteAccountError(message: string) {
		toast.error(message || 'Failed to delete account', {
			...defaultOpts,
			toastId: TOAST_IDS.deleteAccountError,
		});
	},
};

export const authToasts = {
	loginSuccess() {
		toast.success('Logged in successfully', {
			...defaultOpts,
			toastId: TOAST_IDS.loginSuccess,
		});
	},
	loginError(message: string) {
		toast.error(message || 'Login failed', {
			...defaultOpts,
			toastId: TOAST_IDS.loginError,
		});
	},
    registerSuccess() {
        toast.success('Registered successfully', {
            ...defaultOpts,
            toastId: TOAST_IDS.registerSuccess,
        });
    },
    registerError(message: string) {
        toast.error(message || 'Registration failed', {
            ...defaultOpts,
            toastId: TOAST_IDS.registerError,
        });
    }
};