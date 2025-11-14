
export async function deleteMe() {
  const response = await fetch('/api/auth/me', {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ confirm: true }),
  });

  if (response.status === 204) {
    // Successful delete, no content to return
    return;
  }

  let message = 'Failed to delete user account';
  try {
    const data = await response.json();
    if (data?.error) message = data.error;
  } catch {
    // ignore JSON parse errors, keep default message
  }

  throw new Error(message);
}
