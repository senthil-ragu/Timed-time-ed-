import { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { uid } from '../utils/timeUtils';

// ── Default seed data (only shown on very first launch) ────────
const DEFAULT_TOPICS = [
  { id: uid(), name: 'React', color: '#60a5fa', icon: 'bi-code-slash' },
  { id: uid(), name: 'DSA',   color: '#a78bfa', icon: 'bi-diagram-3' },
];

const TrackerContext = createContext(null);

export function TrackerProvider({ children }) {
  const [topics,   setTopics]   = useLocalStorage('lt_topics',   DEFAULT_TOPICS);
  const [sessions, setSessions] = useLocalStorage('lt_sessions', []);

  // ── Topic CRUD ────────────────────────────────────────────────
  const addTopic = useCallback(({ name, color, icon }) => {
    const topic = { id: uid(), name: name.trim(), color, icon };
    setTopics(prev => [...prev, topic]);
    return topic;
  }, [setTopics]);

  const updateTopic = useCallback((id, patch) => {
    setTopics(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  }, [setTopics]);

  const deleteTopic = useCallback((id) => {
    setTopics(prev => prev.filter(t => t.id !== id));
    // Keep sessions; they'll just show "Deleted topic" as the label.
  }, [setTopics]);

  // ── Session CRUD ──────────────────────────────────────────────
  const addSession = useCallback(({ topicId, startedAt, duration, note }) => {
    const session = { id: uid(), topicId, startedAt, duration, note: note || '' };
    setSessions(prev => [session, ...prev]);
    return session;
  }, [setSessions]);

  const updateSession = useCallback((id, patch) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  }, [setSessions]);

  const deleteSession = useCallback((id) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  }, [setSessions]);

  const clearAllData = useCallback(() => {
    setTopics(DEFAULT_TOPICS);
    setSessions([]);
  }, [setTopics, setSessions]);

  // ── Derived helpers ───────────────────────────────────────────
  const getTopicById = useCallback(
    (id) => topics.find(t => t.id === id) || null,
    [topics]
  );

  const getSessionsByTopic = useCallback(
    (topicId) => sessions.filter(s => s.topicId === topicId),
    [sessions]
  );

  return (
    <TrackerContext.Provider value={{
      topics, sessions,
      addTopic, updateTopic, deleteTopic,
      addSession, updateSession, deleteSession,
      clearAllData, getTopicById, getSessionsByTopic,
    }}>
      {children}
    </TrackerContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTracker() {
  const ctx = useContext(TrackerContext);
  if (!ctx) throw new Error('useTracker must be used inside <TrackerProvider>');
  return ctx;
}
