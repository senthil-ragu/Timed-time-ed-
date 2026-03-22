import { useTracker } from '../context/TrackerContext';
import { sumSeconds, formatDurationShort, todayKey, isoToDateKey } from '../utils/timeUtils';

export default function AppNavbar({ activeView, setActiveView }) {
  const { sessions } = useTracker();

  const todaySeconds = sessions
    .filter(s => isoToDateKey(s.startedAt) === todayKey())
    .reduce((acc, s) => acc + s.duration, 0);

  return (
    <nav style={{
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="container-lg d-flex align-items-center justify-content-between py-2 px-3">
        {/* Brand */}
        <div className="d-flex align-items-center gap-2">
          <span className="text-accent" style={{ fontSize: '1.3rem' }}>
            <i className="bi bi-lightning-charge-fill" />
          </span>
          <span className="fw-bold" style={{ fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
            LearnTracker
          </span>
        </div>

        {/* Nav tabs */}
        <div className="d-flex gap-1">
          {[
            { key: 'timer',   icon: 'bi-stopwatch',  label: 'Timer'   },
            { key: 'history', icon: 'bi-clock-history', label: 'History' },
            { key: 'stats',   icon: 'bi-bar-chart-line', label: 'Stats' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key)}
              className="btn btn-sm d-flex align-items-center gap-1"
              style={{
                background: activeView === tab.key ? 'var(--accent-dim)' : 'transparent',
                color: activeView === tab.key ? 'var(--accent)' : 'var(--text-secondary)',
                border: `1px solid ${activeView === tab.key ? 'var(--border-focus)' : 'transparent'}`,
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                fontWeight: activeView === tab.key ? 600 : 400,
                transition: 'var(--transition)',
              }}
            >
              <i className={`bi ${tab.icon}`} />
              <span className="d-none d-sm-inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Today's total */}
        {todaySeconds > 0 && (
          <div className="d-none d-md-flex align-items-center gap-1 font-mono"
            style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <i className="bi bi-sun" style={{ color: 'var(--warning)' }} />
            <span>Today: <span style={{ color: 'var(--text-secondary)' }}>{formatDurationShort(todaySeconds)}</span></span>
          </div>
        )}
      </div>
    </nav>
  );
}
