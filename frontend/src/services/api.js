/**
 * Central API client for Trusted Milk.
 *
 * All service files import from here so the base URL is defined in one place.
 * Every authenticated request automatically injects the Bearer token that is
 * already stored in AsyncStorage from the login flow.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Change this to your machine's LAN IP when running on a physical device ───
export const API_BASE = 'http://172.21.255.165:8000';

/**
 * Thin fetch wrapper that:
 *  - Prepends API_BASE
 *  - Sets Content-Type: application/json
 *  - Attaches the stored Bearer token (if present)
 *  - Throws an Error with the server message on non-2xx responses
 */
export async function apiFetch(path, options = {}) {
  const token = await AsyncStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // Parse body regardless of status so we can surface server error messages
  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message =
      body?.detail ||
      body?.message ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body;
}
