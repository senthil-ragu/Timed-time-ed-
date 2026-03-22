import { useState } from 'react';
import { TrackerProvider } from './context/TrackerContext';
import AppNavbar      from './components/Navbar';
import TimerView      from './components/TimerView';
import SessionHistory from './components/SessionHistory';
import StatsPanel     from './components/StatsPanel';

function Layout() {
  const [activeView, setActiveView] = useState('timer');

  const handleSessionSaved = () => {
    // Optional: switch to history tab after saving
    // setActiveView('history');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppNavbar activeView={activeView} setActiveView={setActiveView} />

      <main className="container-lg flex-grow-1 py-4 px-3" style={{ maxWidth: 720 }}>
        {/* View heading */}
        <div className="mb-4">
          <h4 className="fw-bold mb-0" style={{ letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            {activeView === 'timer'   && <><i className="bi bi-stopwatch text-accent me-2" />Focus Timer</>}
            {activeView === 'history' && <><i className="bi bi-clock-history text-accent me-2" />Session History</>}
            {activeView === 'stats'   && <><i className="bi bi-bar-chart-line text-accent me-2" />Statistics</>}
          </h4>
          <p className="mb-0 mt-1" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {activeView === 'timer'   && 'Select a topic and track your focused learning time.'}
            {activeView === 'history' && 'A complete log of your learning sessions.'}
            {activeView === 'stats'   && 'Your progress at a glance.'}
          </p>
        </div>

        {/* Views */}
        {activeView === 'timer'   && <TimerView onSessionSaved={handleSessionSaved} />}
        {activeView === 'history' && <SessionHistory />}
        {activeView === 'stats'   && <StatsPanel />}
      </main>

      <footer className="text-center py-3" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', borderTop: '1px solid var(--border)' }}>
        LearnTracker · Data stored locally in your browser · No server, no tracking
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <TrackerProvider>
      <Layout />
    </TrackerProvider>
  );
}
