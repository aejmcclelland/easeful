// app/(protected)/profile/page.tsx
export const dynamic = 'force-dynamic';
import {
	getSession,
	apiJson,
	apiForm,
	safeJson,
} from '@/lib/api';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';

// --- Server Action: update details ---
async function updateDetailsAction(formData: FormData) {
	'use server';
	const cookieStore = await cookies();
	const name = String(formData.get('name') || '').trim();
	const email = String(formData.get('email') || '').trim();

	if (!name || !email) {
		cookieStore.set('flashError', 'Missing name or email', { path: '/' });
		redirect('/profile');
	}

	const res = await apiJson('/api/auth/updatedetails', {
		method: 'PUT',
		body: { name, email },
	});

	if (!res.ok) {
		const j = await safeJson<{ error?: string }>(res);
		cookieStore.set('flashError', j?.error || 'Update failed', { path: '/' });
		redirect('/profile');
	}

	cookieStore.set('flash', 'Profile updated successfully.', { path: '/' });
	redirect('/profile');
}

// --- Server Action: upload avatar ---
async function uploadAvatarAction(formData: FormData) {
	'use server';
	const cookieStore = await cookies();
	const file = formData.get('avatar') as File | null;

	if (!file || file.size === 0) {
		cookieStore.set('flashError', 'Please choose an image', { path: '/' });
		redirect('/profile');
	}

	const fd = new FormData();
	fd.append('avatar', file);

	const res = await apiForm('/api/auth/updateavatar', fd, { method: 'PUT' });

	if (!res.ok) {
		const j = await safeJson<{ error?: string }>(res);
		cookieStore.set('flashError', j?.error || 'Avatar upload failed', {
			path: '/',
		});
		redirect('/profile');
	}

	cookieStore.set('flash', 'Avatar updated', { path: '/' });
	redirect('/profile');
}

// --- Page Component ---
export default async function Page() {
	const me = await getSession();
	if (!me || me.data?.role !== 'admin') {
		redirect('/profile');
	}

	const cookieStore = await cookies();
	const updatedMsg = cookieStore.get('flash')?.value ?? null;
	const errorMsg = cookieStore.get('flashError')?.value ?? null;

	const avatarUrl = me.data?.avatar?.url;
	const name = me.data?.name ?? '';
	const email = me.data?.email ?? '';

	return (
		<main className='min-h-screen bg-base-100 p-6'>
			<div className='mx-auto w-full md:w-1/2 max-w-3xl'>
				<div className='card bg-base-100 shadow-xl rounded-box'>
					<div className='card-body'>
						<h1 className='text-2xl font-bold mb-2'>Profile</h1>

						{/* Flash messages */}
						{updatedMsg && (
							<div role='alert' className='alert alert-success'>
								<span>{updatedMsg}</span>
							</div>
						)}
						{errorMsg && (
							<div role='alert' className='alert alert-error'>
								<span>{errorMsg}</span>
							</div>
						)}

						{/* Header row with avatar + user info */}
						<div className='flex items-center gap-4 py-2'>
							<div className='avatar'>
								<div className='w-16 rounded-full ring ring-base-300 ring-offset-base-100 ring-offset-2 overflow-hidden'>
									{avatarUrl ? (
										// eslint-disable-next-line @next/next/no-img-element
										<img src={avatarUrl} alt='Avatar' />
									) : (
										<div className='bg-base-200 w-full h-full' />
									)}
								</div>
							</div>
							<div className='flex-1'>
								<div className='font-semibold'>{name}</div>
								<div className='text-sm opacity-70'>{email}</div>
							</div>
							{/* Avatar upload */}
							<form
								action={uploadAvatarAction}
								className='flex items-center gap-2'>
								<input
									type='file'
									name='avatar'
									accept='image/*'
									className='file-input file-input-bordered file-input-sm'
								/>
								<button className='btn btn-sm btn-outline'>Upload</button>
							</form>
						</div>

						<div className='divider my-2' />

						{/* Account details form */}
						<form action={updateDetailsAction}>
							<fieldset className='fieldset bg-base-200 border border-base-300 rounded-box p-6'>
								<legend className='fieldset-legend text-lg'>
									Account details
								</legend>

								<label className='label'>Name</label>
								<input
									name='name'
									defaultValue={name}
									className='input input-bordered w-full'
									placeholder='Your name'
									required
								/>

								<label className='label'>Email</label>
								<input
									type='email'
									name='email'
									defaultValue={email}
									className='input input-bordered w-full'
									placeholder='you@example.com'
									required
								/>

								<div className='flex justify-end gap-3 mt-4'>
									<button type='submit' className='btn btn-primary'>
										Save changes
									</button>
									<Link href='/' className='btn btn-ghost'>
										Cancel
									</Link>
								</div>
							</fieldset>
						</form>
					</div>
				</div>
			</div>
		</main>
	);
}
