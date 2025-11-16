// src/lib/toast.ts
import { toast, type ToastOptions } from 'react-toastify';

export const TOAST_IDS = {
	profileUpdateSuccess: 'profile-update-success',
	profileUpdateError: 'profile-update-error',
	passwordChangeSuccess: 'password-change-success',
	passwordChangeError: 'password-change-error',
	deleteAccountSuccess: 'delete-account-success',
	deleteAccountError: 'delete-account-error',

	updateAvatarSuccess: 'update-avatar-success',
	updateAvatarError: 'update-avatar-error',

	//auth-related IDs
	loginError: 'auth-login-error',
	loginSuccess: 'login-success',
	registerSuccess: 'auth-register-success',
	registerError: 'register-error',

	//task-related IDs can be added here
	createTaskSuccess: 'create-task-success',
	createTaskError: 'create-task-error',
	updateTaskSuccess: 'update-task-success',
	updateTaskError: 'update-task-error',
	deleteTaskSuccess: 'delete-task-success',
	deleteTaskError: 'delete-task-error',
} as const;

export type ToastIdKey = keyof typeof TOAST_IDS;

export function showToast(
	id: ToastIdKey,
	message: string,
	type: 'success' | 'error' | 'info'
) {
	toast[type](message, { ...defaultOpts, toastId: TOAST_IDS[id] });
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
	},
};
export const taskToasts = {
	createSuccess() {
		toast.success('Task created successfully', {
			...defaultOpts,
			toastId: TOAST_IDS.createTaskSuccess,
		});
	},
	createError(message: string) {
		toast.error(message || 'Failed to create task', {
			...defaultOpts,
			toastId: TOAST_IDS.createTaskError,
		});
	},
	updateSuccess() {
		toast.success('Task updated successfully', {
			...defaultOpts,
			toastId: TOAST_IDS.updateTaskSuccess,
		});
	},
	updateError(message: string) {
		toast.error(message || 'Failed to update task', {
			...defaultOpts,
			toastId: TOAST_IDS.updateTaskError,
		});
	},
	deleteSuccess() {
		toast.success('Task deleted successfully', {
			...defaultOpts,
			toastId: TOAST_IDS.deleteTaskSuccess,
		});
	},
	deleteError(message: string) {
		toast.error(message || 'Failed to delete task', {
			...defaultOpts,
			toastId: TOAST_IDS.deleteTaskError,
		});
	},
};

export function toastSuccess(message: string, id?: ToastIdKey) {
	toast.success(message, {
		...defaultOpts,
		toastId: id ? TOAST_IDS[id] : undefined,
	});
}

export function toastError(message: string, id?: ToastIdKey) {
	toast.error(message, {
		...defaultOpts,
		toastId: id ? TOAST_IDS[id] : undefined,
	});
}

export function toastInfo(message: string, id?: ToastIdKey) {
	toast.info(message, {
		...defaultOpts,
		toastId: id ? TOAST_IDS[id] : undefined,
	});
}