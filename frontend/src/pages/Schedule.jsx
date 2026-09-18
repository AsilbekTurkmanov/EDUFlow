import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, MapPin, Video, Trash2, X, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Schedule = () => {
  const { role, showToast } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [conflictError, setConflictError] = useState('');
  const [form, setForm] = useState({
    groupId: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '16:00',
    room: 'Auditoriya 101',
    onlineUrl: ''
  });

  useEffect(() => {
    fetchSchedule();
    fetchGroups();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await api.lessons.getAll();
      if (res?.data) {
        setLessons(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await api.groups.getAll();
      if (res?.data) {
        setGroups(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    setConflictError('');

    try {
      const startsAt = new Date(`${form.date}T${form.startTime}:00`).toISOString();
      const endsAt = new Date(`${form.date}T${form.endTime}:00`).toISOString();

      await api.lessons.create({
        groupId: form.groupId,
        title: form.title,
        startsAt,
        endsAt,
        room: form.room,
        onlineUrl: form.onlineUrl
      });

      showToast('Dars muvaffaqiyatli jadvalga kiritildi', 'success');
      setShowModal(false);
      setForm({
        groupId: '',
        title: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '16:00',
        room: 'Auditoriya 101',
        onlineUrl: ''
      });
      fetchSchedule();
    } catch (err) {
      setConflictError(err.message);
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`'${title}' darsini o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await api.lessons.delete(id);
      showToast('Dars o\'chirildi', 'success');
      fetchSchedule();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const formatDateTime = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleString('uz-UZ', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Darslar Jadvali</h1>
          <p className="page-subtitle">Mashg'ulotlar, o'quv xonalari va video konferensiya havolalari</p>
        </div>
        {(role === 'Admin' || role === 'Teacher') && (
          <button onClick={() => { setConflictError(''); setShowModal(true); }} className="btn btn-primary">
            <Plus size={18} />
            <span>Yangi Dars Qo'shish</span>
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner" />
        </div>
      ) : lessons.length === 0 ? (
        <div className="card empty-state">
          <Calendar className="empty-icon" />
          <h3>Hozircha darslar rejalashtirilmagan</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {lessons.map((l) => (
            <div key={l.id} className="card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#34d399',
                    flexShrink: 0
                  }}
                >
                  <Clock size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0 }}>{l.title}</h3>
                    <span className="badge badge-amber">{l.groupName}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span>Ustoz: <strong style={{ color: '#d1d5db' }}>{l.teacherName}</strong></span>
                    <span>&bull;</span>
                    <span>{formatDateTime(l.startsAt)} &mdash; {new Date(l.endsAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {l.room && (
                  <span className="badge badge-slate" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} color="#10b981" /> {l.room}
                  </span>
                )}

                {l.onlineUrl && (
                  <a
                    href={l.onlineUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ borderColor: 'rgba(16, 185, 129, 0.3)', color: '#34d399' }}
                  >
                    <Video size={14} />
                    <span>Ulanish</span>
                  </a>
                )}

                {(role === 'Admin' || role === 'Teacher') && (
                  <button
                    onClick={() => handleDelete(l.id, l.title)}
                    className="btn btn-ghost btn-icon"
                    title="O'chirish"
                  >
                    <Trash2 size={16} color="#fb7185" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE LESSON MODAL WITH CONFLICT CHECK */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">Dars Jadvaliga Qo'shish</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateLesson}>
              <div className="modal-body">
                {conflictError && (
                  <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: '10px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fb7185', fontSize: '13px' }}>
                    <AlertTriangle size={18} flexShrink={0} />
                    <span>{conflictError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Guruh *</label>
                  <select
                    required
                    value={form.groupId}
                    onChange={(e) => setForm({ ...form, groupId: e.target.value })}
                    className="form-select"
                  >
                    <option value="">Guruhni tanlang...</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name} &mdash; {g.courseName}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Dars Mavzusi *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Masalan: ASP.NET Core Middleware va Routing"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Dars Sanasi *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Boshlanish Vaqti *</label>
                    <input
                      type="time"
                      required
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tugash Vaqti *</label>
                    <input
                      type="time"
                      required
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Xona / Auditoriya</label>
                    <input
                      type="text"
                      value={form.room}
                      onChange={(e) => setForm({ ...form, room: e.target.value })}
                      placeholder="Auditoriya 101"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Online Havola (Zoom / Meet)</label>
                    <input
                      type="url"
                      value={form.onlineUrl}
                      onChange={(e) => setForm({ ...form, onlineUrl: e.target.value })}
                      placeholder="https://meet.google.com/..."
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-primary">
                  Jadvalga Kiritish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
