// app/(protected)/profile/page.tsx
import { getSession, apiJson, apiForm } from '@/lib/api';
import { redirect } from 'next/navigation';
import { cookies as nextCookies } from 'next/headers';

// --- Server Action: update details ---
async function updateDetailsAction(formData: FormData) {
	'use server';
	const cookieStore = await nextCookies();
	const name = String(formData.get('name') || '').trim();
	const email = String(formData.get('email') || '').trim();

	if (!name || !email) {
		cookieStore.set('flashError', 'Missing name or email', { path: '/', maxAge: 10 });
		cookieStore.delete('flash');
		redirect('/profile');
	}

	const res = await apiJson('/api/auth/updatedetails', {
		method: 'PUT',
		body: { name, email },
	});

	if (!res.ok) {
		const j = await res.json().catch(() => ({} as any));
		cookieStore.set('flashError', j?.error || 'Update failed', { path: '/', maxAge: 10 });
		cookieStore.delete('flash');
		redirect('/profile');
	}

	cookieStore.set('flash', 'Profile updated successfully.', { path: '/', maxAge: 10 });
	cookieStore.delete('flashError');
	redirect('/profile');
}

// --- Server Action: upload avatar ---
async function uploadAvatarAction(formData: FormData) {
	'use server';
	const cookieStore = await nextCookies();
	const file = formData.get('avatar') as File | null;
	if (
		!file ||
		(typeof file === 'object' && 'size' in file && file.size === 0)
	) {
		cookieStore.set('flashError', 'Please choose an image', { path: '/', maxAge: 10 });
		cookieStore.delete('flash');
		redirect('/profile');
	}

	const fd = new FormData();
	if (file) fd.append('avatar', file);

	const res = await apiForm('/api/auth/updateavatar', fd, { method: 'PUT' });

	if (!res.ok) {
		const j = await res.json().catch(() => ({} as any));
		cookieStore.set('flashError', j?.error || 'Avatar upload failed', { path: '/', maxAge: 10 });
		cookieStore.delete('flash');
		redirect('/profile');
	}

	cookieStore.set('flash', 'Avatar updated', { path: '/', maxAge: 10 });
	cookieStore.delete('flashError');
	redirect('/profile');
}

export default async function Page() {
	const me = await getSession();
	if (!me) redirect('/login');

	const cookieStore = await nextCookies();
	const updatedMsg = cookieStore.get('flash')?.value || null;
	const errorMsg = cookieStore.get('flashError')?.value || null;

	// Prefer email/name for header; avatar URL if present
	const avatarUrl = me.data?.avatar?.url as string | undefined;

	return (
		<main className='min-h-screen bg-base-100 p-6'>
			<div className='mx-auto w-full md:w-1/2 max-w-3xl'>
				<div className='card bg-base-100 shadow-xl rounded-box'>
					<div className='card-body'>
						<div className='flex items-center justify-between'>
							<h1 className='text-2xl font-bold'>Profile</h1>
							{/* Optional close button/place-holder */}
						</div>

						{/* Alerts */}
						{errorMsg ? (
							<div role='alert' className='alert alert-error'>
								<span>{errorMsg}</span>
							</div>
						) : updatedMsg ? (
							<div role='alert' className='alert alert-success'>
								<span>{updatedMsg}</span>
							</div>
						) : null}

						{/* Header row with avatar + name/email */}
						<div className='flex items-center gap-4 py-2'>
							<div className='avatar'>
								<div className='w-16 rounded-full ring ring-base-300 ring-offset-base-100 ring-offset-2 overflow-hidden'>
									{/* Fallback circle if no avatar */}
									{avatarUrl ? (
										// eslint-disable-next-line @next/next/no-img-element
										<img src={avatarUrl} alt='Avatar' />
									) : (
										<div className='bg-base-200 w-full h-full' />
									)}
								</div>
							</div>
							<div className='flex-1'>
								<div className='font-semibold'>{me.data.name}</div>
								<div className='text-sm text-base-content/70'>
									{me.data.email}
								</div>
							</div>
							{/* Avatar upload (right side) */}
							<form
								action={uploadAvatarAction}
								className='flex flex-wrap items-center gap-3'>
								<input
									type='file'
									name='avatar'
									accept='image/*'
									className='file-input file-input-primary file-input-sm rounded-full w-auto'
								/>
								<button type='submit' className='btn btn-sm btn-primary rounded-full'>
									Upload
								</button>
							</form>
						</div>

						<div className='divider my-2' />

						{/* Details fieldset */}
						<form action={updateDetailsAction}>
							<fieldset className='fieldset bg-base-200 border border-base-300 rounded-box p-6'>
								<legend className='fieldset-legend text-lg'>
									Account details
								</legend>

								<label className='label'>Name</label>
								<input
									name='name'
									defaultValue={me.data.name}
									className='input input-bordered w-full'
									placeholder='Your name'
									required
								/>

								<label className='label'>Email</label>
								<input
									type='email'
									name='email'
									defaultValue={me.data.email}
									className='input input-bordered w-full'
									placeholder='you@example.com'
									required
								/>

								<div className='flex justify-end gap-3 mt-4'>
									<button type='submit' className='btn btn-primary rounded-full hover:opacity-90'>
										Save changes
									</button>
									<a href='/' className='btn rounded-full hover:bg-base-200'>
										Cancel
									</a>
								</div>
							</fieldset>
						</form>
					</div>
				</div>
			</div>
		</main>
	);
}
