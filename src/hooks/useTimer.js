import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Encapsulates all timer logic.
 * Returns elapsed seconds and control functions.
 * Persists an in-progress session to localStorage so a page refresh
 * won't silently drop a running timer.
 */

const ACTIVE_KEY = 'lt_active_session';

export function useTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed]     = useState(0);   // seconds
  const [startedAt, setStartedAt] = useState(null); // ISO string

  const intervalRef = useRef(null);

  // ── Restore an interrupted session on mount ──────────────────
  useEffect(() => {
    const raw = localStorage.getItem(ACTIVE_KEY);
    if (!raw) return;
    try {
      const { startedAt: sa } = JSON.parse(raw);
      const diff = Math.floor((Date.now() - new Date(sa).getTime()) / 1000);
      setStartedAt(sa);
      setElapsed(diff);
      setIsRunning(true);
    } catch {
      localStorage.removeItem(ACTIVE_KEY);
    }
  }, []);

  // ── Tick every second when running ───────────────────────────
  useEffect(() => {
    if (!isRunning) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setElapsed(s => s + 1);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const start = useCallback((topicId) => {
    const now = new Date().toISOString();
    setStartedAt(now);
    setElapsed(0);
    setIsRunning(true);
    localStorage.setItem(ACTIVE_KEY, JSON.stringify({ startedAt: now, topicId }));
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    localStorage.removeItem(ACTIVE_KEY);
    return { startedAt, elapsed };
  }, [startedAt, elapsed]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setElapsed(0);
    setStartedAt(null);
    clearInterval(intervalRef.current);
    localStorage.removeItem(ACTIVE_KEY);
  }, []);

  return { isRunning, elapsed, startedAt, start, stop, reset };
}
