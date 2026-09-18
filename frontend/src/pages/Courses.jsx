import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Clock, FolderKanban, X } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Courses = () => {
  const { role, showToast } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    durationWeeks: 12,
    status: 'Active'
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.courses.getAll();
      if (res?.data) {
        setCourses(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingCourse(null);
    setForm({ name: '', description: '', price: '', durationWeeks: 12, status: 'Active' });
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditingCourse(c);
    setForm({
      name: c.name,
      description: c.description,
      price: c.price,
      durationWeeks: c.durationWeeks,
      status: c.status
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        durationWeeks: parseInt(form.durationWeeks)
      };

      if (editingCourse) {
        await api.courses.update(editingCourse.id, payload);
        showToast('Kurs muvaffaqiyatli yangilandi', 'success');
      } else {
        await api.courses.create(payload);
        showToast('Yangi kurs yaratildi', 'success');
      }

      setShowModal(false);
      fetchCourses();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Haqiqatan ham '${name}' kursini o'chirmoqchimisiz?`)) return;
    try {
      await api.courses.delete(id);
      showToast('Kurs o\'chirildi', 'success');
      fetchCourses();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString('uz-UZ') + " so'm";
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Kurslar Katalogi</h1>
          <p className="page-subtitle">Markazda o'qitiladigan barcha o'quv dasturlari va yo'nalishlari</p>
        </div>
        {role === 'Admin' && (
          <button onClick={openCreate} className="btn btn-primary">
            <Plus size={18} />
            <span>Yangi Kurs Qo'shish</span>
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner" />
        </div>
      ) : courses.length === 0 ? (
        <div className="card empty-state">
          <BookOpen className="empty-icon" />
          <h3>Hozircha kurslar mavjud emas</h3>
          <p>Yangi kurs yaratish uchun yuqoridagi tugmani bosing.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {courses.map((c) => (
            <div key={c.id} className="card card-emerald" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{c.name}</h3>
                  <span className={`badge ${c.status === 'Active' ? 'badge-emerald' : 'badge-slate'}`}>
                    {c.status === 'Active' ? 'Faol' : c.status}
                  </span>
                </div>

                <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px', minHeight: '42px' }}>
                  {c.description || 'Kurs haqida qo\'shimcha ma\'lumot kiritilmagan.'}
                </p>

                <div style={{ display: 'flex', gap: '16px', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#9ca3af' }}>
                    <Clock size={16} color="#10b981" />
                    <span>{c.durationWeeks} hafta</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#9ca3af' }}>
                    <FolderKanban size={16} color="#f59e0b" />
                    <span>{c.groupsCount} ta guruh</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Kurs Narxi</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#34d399' }}>
                    {formatCurrency(c.price)}
                  </div>
                </div>

                {role === 'Admin' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openEdit(c)} className="btn btn-secondary btn-sm" title="Tahrirlash">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => handleDelete(c.id, c.name)} className="btn btn-danger btn-sm" title="O'chirish">
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT COURSE MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">{editingCourse ? 'Kursni Tahrirlash' : 'Yangi Kurs Qo\'shish'}</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Kurs Nomi *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Masalan: Full-Stack Web Development"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tavsifi</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Kurs mazmuni, o'rganiladigan texnologiyalar..."
                    className="form-textarea"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Narxi (UZS) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="10000"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="3500000"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Davomiyligi (hafta) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={form.durationWeeks}
                      onChange={(e) => setForm({ ...form, durationWeeks: e.target.value })}
                      placeholder="12"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="form-select"
                  >
                    <option value="Active">Faol</option>
                    <option value="Inactive">Nofaol</option>
                    <option value="Archived">Arxiv</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCourse ? 'Saqlash' : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
