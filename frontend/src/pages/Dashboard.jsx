import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import SortPanel  from '../components/SortPanel.jsx';
import GamePanel  from '../components/GamePanel.jsx';
import QuizPanel  from '../components/QuizPanel.jsx';
import AdminPanel from './AdminPanel.jsx';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('sort');

  const tabs = [
    { key: 'sort',  label: 'Sort'  },
    { key: 'game',  label: 'Play'  },
    { key: 'quiz',  label: 'Quiz'  },
    ...(user?.is_admin ? [{ key: 'admin', label: '🛡️ Admin' }] : []),
  ];

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner topbar-flex">
          <div>
            <div className="brand"><span className="leaf">♻️</span><h1>EcoSort</h1></div>
            <p className="brand-sub">Point your camera at trash, learn where it goes, then test your skills.</p>
          </div>
          <div className="topbar-user">
            <span className="game-stat">{user?.name}{user?.is_admin && <span className="admin-badge">Admin</span>}</span>
            <button className="btn-link" onClick={logout}>Logout</button>
          </div>
        </div>
        <div className="topbar-inner">
          <nav className="tabs">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                className={`tab-btn ${tab === key ? 'active' : ''}`}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main>
        {tab === 'sort'  && <SortPanel />}
        {tab === 'game'  && <GamePanel />}
        {tab === 'quiz'  && <QuizPanel />}
        {tab === 'admin' && user?.is_admin && <AdminPanel />}
      </main>
    </>
  );
}
