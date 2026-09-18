import React, { useState, useEffect } from 'react';
import { History, Shield, User, Clock, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AuditLogs = () => {
  const { showToast } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.auditLogs.getAll(50);
      if (res?.data) {
        setLogs(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'LOGIN': return 'badge-violet';
      case 'CREATE': return 'badge-emerald';
      case 'UPDATE': return 'badge-amber';
      case 'DELETE': return 'badge-rose';
      case 'PAYMENT': return 'badge-emerald';
      case 'ATTENDANCE': return 'badge-slate';
      default: return 'badge-slate';
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleString('uz-UZ', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tizim Audit Tarixi</h1>
          <p className="page-subtitle">Xavfsizlik, kirish va amallar jurnalining to'liq nazorati</p>
        </div>
        <button onClick={fetchLogs} className="btn btn-secondary">
          <RefreshCw size={16} />
          <span>Yangilash</span>
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div className="spinner" />
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <History className="empty-icon" />
            <h3>Hozircha audit yozuvlari yo'q</h3>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Vaqt</th>
                  <th>Amal</th>
                  <th>Ob'ekt</th>
                  <th>Foydalanuvchi</th>
                  <th>Batafsil / Izoh</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                      <Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                      {formatDate(log.createdAt)}
                    </td>
                    <td>
                      <span className={`badge ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#f3f4f6' }}>{log.entity}</span>
                      {log.entityId && (
                        <div style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace' }}>
                          ID: {log.entityId.substring(0, 8)}...
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} color="#10b981" />
                        <span style={{ color: '#fff', fontWeight: 600 }}>{log.userName}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: '#d1d5db' }}>
                      {log.metadata || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
