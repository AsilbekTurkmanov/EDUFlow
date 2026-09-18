import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Search, Plus, Edit2, Trash2, X, Check, Filter } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Users = () => {
  const { showToast } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Forms
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'Student',
    phone: ''
  });

  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    role: 'Student',
    status: 'Active',
    phone: '',
    newPassword: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, pageSize: 10 };
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.users.getAll(params);
      if (res?.data) {
        setUsers(res.data.items || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.users.create(createForm);
      showToast("Foydalanuvchi muvaffaqiyatli qo'shildi", 'success');
      setShowCreateModal(false);
      setCreateForm({ fullName: '', email: '', password: '', role: 'Student', phone: '' });
      fetchUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await api.users.update(currentUser.id, editForm);
      showToast('Foydalanuvchi ma\'lumotlari yangilandi', 'success');
      setShowEditModal(false);
      setCurrentUser(null);
      fetchUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`${name} ni o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await api.users.delete(id);
      showToast('Foydalanuvchi o\'chirildi', 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openEdit = (u) => {
    setCurrentUser(u);
    setEditForm({
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      status: u.status,
      phone: u.phone || '',
      newPassword: ''
    });
    setShowEditModal(true);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Foydalanuvchilar Boshqaruvi</h1>
          <p className="page-subtitle">O'quv markazi ma'muriyati, o'qituvchilari va talabalari ro'yxati</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>Yangi Foydalanuvchi</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#6b7280' }} />
            <input
              type="text"
              placeholder="Ism yoki email bo'yicha qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '36px' }}
            />
          </div>

          <div style={{ width: '160px' }}>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="form-select"
            >
              <option value="">Barcha Rollar</option>
              <option value="Admin">Admin</option>
              <option value="Teacher">Teacher</option>
              <option value="Student">Student</option>
            </select>
          </div>

          <div style={{ width: '160px' }}>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="form-select"
            >
              <option value="">Barcha Statuslar</option>
              <option value="Active">Faol</option>
              <option value="Inactive">Nofaol</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary">
            <Filter size={16} />
            <span>Qidirish</span>
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: '0' }}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Foydalanuvchi</th>
                <th>Roli</th>
                <th>Status</th>
                <th>Telefon</th>
                <th style={{ textAlign: 'right' }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="spinner" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                    Foydalanuvchilar topilmadi
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{u.fullName}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>{u.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'Admin' ? 'badge-amber' : u.role === 'Teacher' ? 'badge-emerald' : 'badge-violet'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.status === 'Active' ? 'badge-emerald' : 'badge-rose'}`}>
                        {u.status === 'Active' ? 'Faol' : 'Nofaol'}
                      </span>
                    </td>
                    <td style={{ color: '#d1d5db', fontSize: '13px' }}>{u.phone || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => openEdit(u)}
                          className="btn btn-ghost btn-icon"
                          title="Tahrirlash"
                        >
                          <Edit2 size={16} color="#34d399" />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id, u.fullName)}
                          className="btn btn-ghost btn-icon"
                          title="O'chirish"
                        >
                          <Trash2 size={16} color="#fb7185" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '13px', color: '#9ca3af' }}>
            Sahifa: <strong>{page}</strong> / {totalPages || 1}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn btn-secondary btn-sm"
            >
              Oldingi
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn btn-secondary btn-sm"
            >
              Keyingi
            </button>
          </div>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">Yangi Foydalanuvchi Qo'shish</h3>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">To'liq Ism Familiya *</label>
                  <input
                    type="text"
                    required
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                    placeholder="Masalan: Sardor Aliyev"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Manzil *</label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="sardor@eduflow.uz"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Dastlabki Parol *</label>
                  <input
                    type="password"
                    required
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="Kamida 6 belgi"
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Rol</label>
                    <select
                      value={createForm.role}
                      onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                      className="form-select"
                    >
                      <option value="Student">Student (O'quvchi)</option>
                      <option value="Teacher">Teacher (O'qituvchi)</option>
                      <option value="Admin">Admin (Ma'mur)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Telefon</label>
                    <input
                      type="text"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                      placeholder="+998 90 123 45 67"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-primary">
                  Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">Foydalanuvchini Tahrirlash</h3>
              <button onClick={() => setShowEditModal(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">To'liq Ism Familiya</label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Manzil</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Rol</label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="form-select"
                    >
                      <option value="Student">Student</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="form-select"
                    >
                      <option value="Active">Faol</option>
                      <option value="Inactive">Nofaol</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Telefon</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Yangi Parol (Ixtiyoriy)</label>
                  <input
                    type="password"
                    value={editForm.newPassword}
                    onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                    placeholder="Bo'sh qoldirilsa, parol o'zgarmaydi"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-primary">
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
