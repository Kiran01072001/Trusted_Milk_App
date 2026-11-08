import { apiFetch } from './api';

/**
 * Validate the stored token by fetching the user's own profile.
 * Returns the user object on success, throws on failure.
 */
export async function fetchMe() {
  const data = await apiFetch('/users/me');
  return data.user;
}

/**
 * Call the server logout endpoint (deactivates the session row).
 * The caller (AuthContext.logout) handles clearing AsyncStorage.
 */
export async function serverLogout() {
  return apiFetch('/auth/logout', { method: 'POST' });
}
