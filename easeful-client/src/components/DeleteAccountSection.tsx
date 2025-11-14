// src/components/DeleteAccountSection.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteMe } from '../lib/me';
import { useAuth } from '../hooks/useAuth';
import { profileToasts } from '../lib/toast';
import { getErrorMessage } from '../lib/getErrorMessage';

export function DeleteAccountSection() {
	const { setUser } = useAuth();
	const navigate = useNavigate();

	const [confirmText, setConfirmText] = useState('');
	const [ack, setAck] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const canDelete = ack && confirmText === 'DELETE' && !isDeleting;

	const handleDelete = async () => {
		if (!canDelete) return;
		setIsDeleting(true);
		setError(null);
		try {
			await deleteMe();
			profileToasts.deleteAccountSuccess();
			setUser(null); // clear client auth
			navigate('/login?deleted=1', { replace: true });
		} catch (err: unknown) {
			const message = getErrorMessage(err);

			profileToasts.deleteAccountError(message);
			setError(message);
		}
		setIsDeleting(false);
	};

	return (
		<section className='mt-10 border border-red-500/40 rounded-xl p-4 space-y-3'>
			<h2 className='text-lg font-semibold text-red-500'>Delete account</h2>
			<p className='text-sm text-base-content/80'>
				This will permanently delete your account, avatar, and all tasks. This
				action
				<strong> cannot be undone</strong>.
			</p>

			<label className='flex items-center gap-2 text-sm'>
				<input
					type='checkbox'
					className='checkbox checkbox-error'
					checked={ack}
					onChange={(e) => setAck(e.target.checked)}
				/>
				<span>I understand that all my data will be deleted permanently.</span>
			</label>

			<div className='form-control'>
				<label className='label'>
					<span className='label-text text-sm'>
						Type <code>DELETE</code> to confirm:
					</span>
				</label>
				<input
					type='text'
					className='input input-bordered input-error w-full max-w-xs'
					value={confirmText}
					onChange={(e) => setConfirmText(e.target.value)}
					placeholder='DELETE'
				/>
			</div>

			{error && <p className='text-sm text-red-500'>{error}</p>}

			<button
				onClick={handleDelete}
				className='btn btn-error btn-outline'
				disabled={!canDelete}>
				{isDeleting ? 'Deleting…' : 'Delete my account'}
			</button>
		</section>
	);
}
