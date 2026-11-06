import { useEffect, useState } from 'react';
import api from '../api';

const BIN_COLORS = { organic: '#3A7D44', recyclable: '#2E6F95', residual: '#7A5C46' };
const BIN_ICONS  = { organic: '🍃', recyclable: '♻️', residual: '🗑️' };

// ── helpers ───────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-num" style={color ? { color } : {}}>{value ?? '—'}</div>
      <div className="admin-stat-label">{label}</div>
      {sub && <div className="admin-stat-sub">{sub}</div>}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="admin-section">
      <h2 className="admin-section-title">{title}</h2>
      {children}
    </section>
  );
}

// ── Main admin panel ──────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [tab,       setTab]       = useState('stats');
  const [stats,     setStats]     = useState(null);
  const [users,     setUsers]     = useState([]);
  const [logs,      setLogs]      = useState({ data: [], current_page: 1, last_page: 1 });
  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [logsPage,  setLogsPage]  = useState(1);

  // Waste-item form state
  const [itemForm,     setItemForm]     = useState(null); // null = closed, {} = new, {id,...} = edit
  const [itemFormErr,  setItemFormErr]  = useState('');
  const [itemSaving,   setItemSaving]   = useState(false);

  // ── Load data when tab changes ────────────────────────────────────────────
  useEffect(() => {
    setError('');
    if (tab === 'stats')  fetchStats();
    if (tab === 'users')  fetchUsers();
    if (tab === 'logs')   fetchLogs(logsPage);
    if (tab === 'items')  fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    if (tab === 'logs') fetchLogs(logsPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logsPage]);

  async function fetchStats() {
    setLoading(true);
    try { setStats((await api.get('/admin/stats')).data); }
    catch { setError('Could not load stats.'); }
    finally { setLoading(false); }
  }

  async function fetchUsers() {
    setLoading(true);
    try { setUsers((await api.get('/admin/users')).data); }
    catch { setError('Could not load users.'); }
    finally { setLoading(false); }
  }

  async function fetchLogs(page = 1) {
    setLoading(true);
    try { setLogs((await api.get(`/admin/scan-logs?page=${page}&per_page=20`)).data); }
    catch { setError('Could not load scan logs.'); }
    finally { setLoading(false); }
  }

  async function fetchItems() {
    setLoading(true);
    try { setItems((await api.get('/admin/waste-items')).data); }
    catch { setError('Could not load waste items.'); }
    finally { setLoading(false); }
  }

  async function toggleAdmin(user) {
    if (!window.confirm(`${user.is_admin ? 'Revoke' : 'Grant'} admin for ${user.name}?`)) return;
    try {
      await api.patch(`/admin/users/${user.id}/toggle-admin`);
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed.');
    }
  }

  // ── Waste item form ───────────────────────────────────────────────────────
  function openNewItem() {
    setItemForm({ name: '', icon: '', bin: 'recyclable', tip: '', coco_class: '' });
    setItemFormErr('');
  }

  function openEditItem(item) {
    setItemForm({ ...item });
    setItemFormErr('');
  }

  async function saveItem(e) {
    e.preventDefault();
    setItemSaving(true);
    setItemFormErr('');
    try {
      if (itemForm.id) {
        await api.patch(`/admin/waste-items/${itemForm.id}`, itemForm);
      } else {
        await api.post('/admin/waste-items', itemForm);
      }
      setItemForm(null);
      fetchItems();
    } catch (err) {
      const errs = err.response?.data?.errors;
      setItemFormErr(errs ? Object.values(errs).flat().join(' ') : 'Save failed.');
    } finally {
      setItemSaving(false);
    }
  }

  async function deleteItem(item) {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/waste-items/${item.id}`);
      fetchItems();
    } catch { alert('Delete failed.'); }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="admin-wrap">
      <div className="admin-tabs">
        {[['stats','📊 Stats'],['logs','🔍 Scan Logs'],['users','👥 Users'],['items','🗂️ Waste Items']].map(([key,label]) => (
          <button key={key} className={`admin-tab-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}
      {loading && <div className="admin-loading">Loading…</div>}

      {/* ── Stats tab ─────────────────────────────────────────────────── */}
      {tab === 'stats' && stats && !loading && (
        <>
          <Section title="Overview">
            <div className="admin-stats-grid">
              <StatCard label="Total scans"    value={stats.total_scans?.toLocaleString()} color="var(--accent)" />
              <StatCard label="Camera scans"   value={stats.camera_scans?.toLocaleString()} />
              <StatCard label="Manual taps"    value={stats.manual_scans?.toLocaleString()} />
              <StatCard label="Matched"        value={stats.matched_scans?.toLocaleString()} color="var(--organic)" />
              <StatCard label="Unmatched"      value={stats.unmatched_scans?.toLocaleString()} color="var(--danger)" />
              <StatCard label="Registered users" value={stats.total_users?.toLocaleString()} />
              <StatCard label="Admins"         value={stats.admin_users?.toLocaleString()} />
              <StatCard label="Waste items"    value={stats.total_items?.toLocaleString()} />
            </div>
          </Section>

          {stats.scans_by_bin && (
            <Section title="Scans by bin">
              <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                {Object.entries(stats.scans_by_bin).map(([bin, count]) => (
                  <StatCard key={bin} label={`${BIN_ICONS[bin] ?? ''} ${bin}`} value={Number(count).toLocaleString()} color={BIN_COLORS[bin]} />
                ))}
              </div>
            </Section>
          )}
        </>
      )}

      {/* ── Scan logs tab ─────────────────────────────────────────────── */}
      {tab === 'logs' && !loading && (
        <Section title={`Scan Logs (${logs.total ?? '—'} total)`}>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th><th>Time</th><th>User</th><th>Class</th>
                  <th>Method</th><th>Conf</th><th>Matched</th><th>Item</th>
                </tr>
              </thead>
              <tbody>
                {logs.data?.map((log) => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td className="nowrap">{new Date(log.created_at).toLocaleString()}</td>
                    <td>{log.user ? `${log.user.name}` : <em>guest</em>}</td>
                    <td><code>{log.coco_class}</code></td>
                    <td><span className={`badge badge-${log.method}`}>{log.method}</span></td>
                    <td>{log.confidence != null ? `${Math.round(log.confidence * 100)}%` : '—'}</td>
                    <td>{log.matched ? '✅' : '❌'}</td>
                    <td>
                      {log.waste_item
                        ? <span style={{ color: BIN_COLORS[log.waste_item.bin] }}>{log.waste_item.icon} {log.waste_item.name}</span>
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="admin-pagination">
            <button className="btn" disabled={logsPage <= 1} onClick={() => setLogsPage(p => p - 1)}>‹ Prev</button>
            <span>Page {logs.current_page} of {logs.last_page}</span>
            <button className="btn" disabled={logsPage >= logs.last_page} onClick={() => setLogsPage(p => p + 1)}>Next ›</button>
          </div>
        </Section>
      )}

      {/* ── Users tab ─────────────────────────────────────────────────── */}
      {tab === 'users' && !loading && (
        <Section title={`Users (${users.length})`}>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>#</th><th>Name</th><th>Email</th><th>Admin</th><th>Scans</th><th>Joined</th><th>Action</th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.is_admin ? '✅ Admin' : '—'}</td>
                    <td>{u.scan_logs_count ?? '—'}</td>
                    <td className="nowrap">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn" style={{ fontSize: '0.78rem', padding: '4px 10px' }} onClick={() => toggleAdmin(u)}>
                        {u.is_admin ? 'Revoke admin' : 'Make admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* ── Waste items tab ───────────────────────────────────────────── */}
      {tab === 'items' && !loading && (
        <Section title={`Waste Items (${items.length})`}>
          <button className="btn btn-primary" style={{ marginBottom: 14 }} onClick={openNewItem}>+ Add item</button>

          {/* Inline form */}
          {itemForm && (
            <form className="admin-item-form card" onSubmit={saveItem}>
              <h3 style={{ marginBottom: 14 }}>{itemForm.id ? 'Edit item' : 'New item'}</h3>
              {itemFormErr && <div className="auth-error">{itemFormErr}</div>}
              <div className="admin-form-row">
                <div className="field"><label>Name</label><input required value={itemForm.name} onChange={e => setItemForm(f => ({...f, name: e.target.value}))} /></div>
                <div className="field"><label>Icon (emoji)</label><input required value={itemForm.icon} onChange={e => setItemForm(f => ({...f, icon: e.target.value}))} /></div>
              </div>
              <div className="admin-form-row">
                <div className="field">
                  <label>Bin</label>
                  <select value={itemForm.bin} onChange={e => setItemForm(f => ({...f, bin: e.target.value}))}>
                    <option value="organic">Organic</option>
                    <option value="recyclable">Recyclable</option>
                    <option value="residual">Residual</option>
                  </select>
                </div>
                <div className="field"><label>COCO class (optional)</label><input value={itemForm.coco_class || ''} placeholder="e.g. banana" onChange={e => setItemForm(f => ({...f, coco_class: e.target.value}))} /></div>
              </div>
              <div className="field"><label>Tip</label><textarea required rows={3} value={itemForm.tip} onChange={e => setItemForm(f => ({...f, tip: e.target.value}))} /></div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="btn btn-primary" type="submit" disabled={itemSaving}>{itemSaving ? 'Saving…' : 'Save'}</button>
                <button className="btn" type="button" onClick={() => setItemForm(null)}>Cancel</button>
              </div>
            </form>
          )}

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Icon</th><th>Name</th><th>Bin</th><th>COCO class</th><th>Scans</th><th>Tip</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontSize: '1.4rem' }}>{item.icon}</td>
                    <td>{item.name}</td>
                    <td><span style={{ color: BIN_COLORS[item.bin], fontWeight: 600 }}>{item.bin}</span></td>
                    <td><code>{item.coco_class || '—'}</code></td>
                    <td>{item.scan_logs_count ?? 0}</td>
                    <td className="tip-cell">{item.tip}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn" style={{ fontSize: '0.78rem', padding: '4px 10px', marginRight: 6 }} onClick={() => openEditItem(item)}>Edit</button>
                      <button className="btn" style={{ fontSize: '0.78rem', padding: '4px 10px', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => deleteItem(item)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}
    </div>
  );
}
