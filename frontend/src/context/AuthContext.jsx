import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../services/api';

const AuthContext = createContext(null);

const STORAGE_KEYS = ['token', 'customer_code', 'full_name', 'user_id'];

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);   // { token, customer_code, full_name, user_id }
  const [loading, setLoading]   = useState(true);   // true during boot-time token check

  // ── Boot: read token, validate against /users/me ──────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.multiGet(STORAGE_KEYS);
        const map = Object.fromEntries(stored.map(([k, v]) => [k, v]));

        if (!map.token) { setLoading(false); return; }

        // Validate the token is still accepted by the server
        const res = await fetch(`${API_BASE}/users/me`, {
          headers: { Authorization: `Bearer ${map.token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUser({
            token:         map.token,
            customer_code: data.user.customer_code,
            full_name:     data.user.full_name,
            user_id:       data.user.id,
            email:         data.user.email,
            gender:        data.user.gender,
            referral_code: data.user.referral_code,
          });
        } else {
          // Token rejected or expired — clear storage and force re-login
          await AsyncStorage.multiRemove(STORAGE_KEYS);
        }
      } catch {
        // Network error during boot — keep user logged in using stored data
        const stored = await AsyncStorage.multiGet(STORAGE_KEYS);
        const map = Object.fromEntries(stored.map(([k, v]) => [k, v]));
        if (map.token) {
          setUser({
            token:         map.token,
            customer_code: map.customer_code,
            full_name:     map.full_name,
            user_id:       map.user_id,
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── login: called by LoginScreen after successful API response ─────────────
  const login = useCallback(async ({ token, customer_code, full_name, user_id }) => {
    await AsyncStorage.multiSet([
      ['token',         token],
      ['customer_code', customer_code],
      ['full_name',     full_name],
      ['user_id',       user_id ?? ''],
    ]);
    setUser({ token, customer_code, full_name, user_id });
  }, []);

  // ── logout: deactivates session on server then clears local state ──────────
  const logout = useCallback(async (navigationRef) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method:  'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // Proceed with local logout even if server call fails
    }
    await AsyncStorage.multiRemove(STORAGE_KEYS);
    setUser(null);
    // Navigate to auth flow if a navigation ref was passed
    navigationRef?.navigate('AuthStack');
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
