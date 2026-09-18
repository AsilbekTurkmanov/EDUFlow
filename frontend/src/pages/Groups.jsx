import React, { useState, useEffect } from 'react';
import { FolderKanban, Plus, Users, UserPlus, Trash2, Calendar, BookOpen, X, Check } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Groups = () => {
  const { role, showToast } = useAuth();
  const [groups, setGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupStudents, setGroupStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedStudentToEnroll, setSelectedStudentToEnroll] = useState('');

  // Group Form
  const [groupForm, setGroupForm] = useState({
    name: '',
    courseId: '',
    teacherId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'Active'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [grpRes, crsRes] = await Promise.all([
        api.groups.getAll(),
        api.courses.getAll()
      ]);

      if (grpRes?.data) setGroups(grpRes.data);
      if (crsRes?.data) setCourses(crsRes.data);

      if (role === 'Admin') {
        const [tchRes, stdRes] = await Promise.all([
          api.users.getAll({ role: 'Teacher', pageSize: 100 }),
          api.users.getAll({ role: 'Student', pageSize: 100 })
        ]);
        if (tchRes?.data?.items) setTeachers(tchRes.data.items);
        if (stdRes?.data?.items) setStudents(stdRes.data.items);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openStudentsDrawer = async (group) => {
    setSelectedGroup(group);
    setLoadingStudents(true);
    try {
      const res = await api.groups.getStudents(group.id);
      if (res?.data) {
        setGroupStudents(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await api.groups.create({
        ...groupForm,
        startDate: new Date(groupForm.startDate).toISOString(),
        endDate: groupForm.endDate ? new Date(groupForm.endDate).toISOString() : null
      });
      showToast('Yangi guruh muvaffaqiyatli ochildi', 'success');
      setShowCreateGroupModal(false);
      setGroupForm({
        name: '',
        courseId: '',
        teacherId: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'Active'
      });
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    if (!selectedStudentToEnroll || !selectedGroup) return;

    try {
      await api.groups.enroll({
        groupId: selectedGroup.id,
        studentId: selectedStudentToEnroll
      });
      showToast("O'quvchi guruhga biriktirildi", 'success');
      setShowEnrollModal(false);
      setSelectedStudentToEnroll('');
      openStudentsDrawer(selectedGroup);
      loadData(); // update count
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRemoveStudent = async (enrollmentId, studentName) => {
    if (!window.confirm(`${studentName} ni guruhdan chiqarishni tasdiqlaysizmi?`)) return;
    try {
      await api.groups.removeStudent(enrollmentId);
      showToast('O\'quvchi guruhdan chiqarildi', 'success');
      openStudentsDrawer(selectedGroup);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteGroup = async (id, name) => {
    if (!window.confirm(`Haqiqatan ham '${name}' guruhini o'chirmoqchimisiz?`)) return;
    try {
      await api.groups.delete(id);
      showToast('Guruh o\'chirildi', 'success');
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('uz-UZ');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Guruhlar Boshqaruvi</h1>
          <p className="page-subtitle">O'quv guruhlari, biriktirilgan ustozlar va talabalar ro'yxati</p>
        </div>
        {role === 'Admin' && (
          <button onClick={() => setShowCreateGroupModal(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>Yangi Guruh Ochish</span>
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner" />
        </div>
      ) : groups.length === 0 ? (
        <div className="card empty-state">
          <FolderKanban className="empty-icon" />
          <h3>Hozircha guruhlar mavjud emas</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {groups.map((g) => (
            <div key={g.id} className="card card-amber">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{g.name}</h3>
                  <div style={{ fontSize: '13px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <BookOpen size={14} /> {g.courseName}
                  </div>
                </div>
                <span className={`badge ${g.status === 'Active' ? 'badge-emerald' : 'badge-slate'}`}>
                  {g.status === 'Active' ? 'Faol' : g.status}
                </span>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9ca3af' }}>O'qituvchi:</span>
                  <span style={{ fontWeight: 600, color: '#f3f4f6' }}>{g.teacherName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9ca3af' }}>Talabalar soni:</span>
                  <span className="badge badge-emerald">{g.studentsCount} ta faol talaba</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9ca3af' }}>Boshlanish sanasi:</span>
                  <span style={{ color: '#d1d5db' }}>{formatDate(g.startDate)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button onClick={() => openStudentsDrawer(g)} className="btn btn-secondary btn-sm">
                  <Users size={15} />
                  <span>O'quvchilar ({g.studentsCount})</span>
                </button>

                {role === 'Admin' && (
                  <button onClick={() => handleDeleteGroup(g.id, g.name)} className="btn btn-danger btn-sm" title="O'chirish">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE GROUP MODAL */}
      {showCreateGroupModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">Yangi Guruh Ochish</h3>
              <button onClick={() => setShowCreateGroupModal(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateGroup}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Guruh Nomi / Kodi *</label>
                  <input
                    type="text"
                    required
                    value={groupForm.name}
                    onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                    placeholder="Masalan: DOTNET-102"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kurs *</label>
                  <select
                    required
                    value={groupForm.courseId}
                    onChange={(e) => setGroupForm({ ...groupForm, courseId: e.target.value })}
                    className="form-select"
                  >
                    <option value="">Kursni tanlang</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">O'qituvchi *</label>
                  <select
                    required
                    value={groupForm.teacherId}
                    onChange={(e) => setGroupForm({ ...groupForm, teacherId: e.target.value })}
                    className="form-select"
                  >
                    <option value="">O'qituvchini tanlang</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>{t.fullName} ({t.email})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Boshlanish Sanasi *</label>
                    <input
                      type="date"
                      required
                      value={groupForm.startDate}
                      onChange={(e) => setGroupForm({ ...groupForm, startDate: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tugash Sanasi</label>
                    <input
                      type="date"
                      value={groupForm.endDate}
                      onChange={(e) => setGroupForm({ ...groupForm, endDate: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateGroupModal(false)} className="btn btn-secondary">
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-primary">
                  Guruhni Yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GROUP STUDENTS MODAL / DRAWER */}
      {selectedGroup && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{selectedGroup.name} &mdash; O'quvchilar</h3>
                <div style={{ fontSize: '13px', color: '#9ca3af' }}>{selectedGroup.courseName} | Ustoz: {selectedGroup.teacherName}</div>
              </div>
              <button onClick={() => setSelectedGroup(null)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {role === 'Admin' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                  <button onClick={() => setShowEnrollModal(true)} className="btn btn-primary btn-sm">
                    <UserPlus size={16} />
                    <span>O'quvchi Biriktirish</span>
                  </button>
                </div>
              )}

              {loadingStudents ? (
                <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" /></div>
              ) : groupStudents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>
                  Ushbu guruhda hozircha o'quvchilar yo'q.
                </div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>O'quvchi</th>
                        <th>Email</th>
                        <th>Qo'shilgan Sana</th>
                        {role === 'Admin' && <th style={{ textAlign: 'right' }}>Amal</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {groupStudents.map((s) => (
                        <tr key={s.id}>
                          <td style={{ fontWeight: 600, color: '#fff' }}>{s.studentName}</td>
                          <td style={{ fontSize: '13px', color: '#9ca3af' }}>{s.studentEmail}</td>
                          <td style={{ fontSize: '12px', color: '#6b7280' }}>{formatDate(s.joinedAt)}</td>
                          {role === 'Admin' && (
                            <td style={{ textAlign: 'right' }}>
                              <button
                                onClick={() => handleRemoveStudent(s.id, s.studentName)}
                                className="btn btn-ghost btn-icon"
                                title="Guruhdan chiqarish"
                              >
                                <Trash2 size={16} color="#fb7185" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setSelectedGroup(null)} className="btn btn-secondary">
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ENROLL STUDENT MODAL */}
      {showEnrollModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-box" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Guruhga O'quvchi Biriktirish</h3>
              <button onClick={() => setShowEnrollModal(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEnrollStudent}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Talabani tanlang *</label>
                  <select
                    required
                    value={selectedStudentToEnroll}
                    onChange={(e) => setSelectedStudentToEnroll(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Ro'yxatdan tanlang...</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.fullName} ({s.email})</option>
                    ))}
                  </select>
                </div>
                <div style={{ fontSize: '12px', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '10px', borderRadius: '8px' }}>
                  &bull; Faqat faol statusdagi o'quvchilar qo'shiladi.<br />
                  &bull; Dublikat qo'shish avtomatik bloklanadi.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowEnrollModal(false)} className="btn btn-secondary">
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-primary">
                  Biriktirish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
