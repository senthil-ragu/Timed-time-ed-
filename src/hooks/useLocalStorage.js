import { useState, useEffect } from 'react';

/**
 * Persists state to localStorage under the given key.
 * Falls back to `initialValue` when no stored data is found.
 */
export function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (err) {
      console.warn(`[useLocalStorage] Could not persist key "${key}":`, err);
    }
  }, [key, state]);

  return [state, setState];
}
