export async function syncUserWithBackend(token: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured');
  }

  const response = await fetch(`${apiUrl}/auth/sync`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to sync user with backend');
  }

  return response.json();
}

export function getRoleFromToken(token: string): string | undefined {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload['custom:role'];
}
