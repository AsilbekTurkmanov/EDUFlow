import React, { useState, useEffect } from 'react';
import { FileCode, Plus, CheckCircle2, Clock, Send, Star, ExternalLink, X, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Assignments = () => {
  const { role, showToast } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    groupId: '',
    title: '',
    description: '',
    deadline: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    maxScore: 100
  });

  // Submissions Modal (Teacher)
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Grade Modal (Teacher)
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeForm, setGradeForm] = useState({ score: 90, feedback: '' });

  // Submit Modal (Student)
  const [submittingAssignment, setSubmittingAssignment] = useState(null);
  const [studentSubmitForm, setStudentSubmitForm] = useState({ url: '', text: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [asgRes, grpRes] = await Promise.all([
        api.assignments.getAll(),
        api.groups.getAll()
      ]);
      if (asgRes?.data) setAssignments(asgRes.data);
      if (grpRes?.data) setGroups(grpRes.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await api.assignments.create({
        ...createForm,
        deadline: new Date(createForm.deadline).toISOString(),
        maxScore: parseInt(createForm.maxScore)
      });
      showToast('Vazifa muvaffaqiyatli e\'lon qilindi', 'success');
      setShowCreateModal(false);
      setCreateForm({
        groupId: '',
        title: '',
        description: '',
        deadline: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        maxScore: 100
      });
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    setLoadingSubmissions(true);
    try {
      const res = await api.assignments.getSubmissions(assignment.id);
      if (res?.data) {
        setSubmissions(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const openGradeModal = (sub) => {
    setGradingSubmission(sub);
    setGradeForm({
      score: sub.score || sub.maxScore,
      feedback: sub.feedback || ''
    });
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    try {
      await api.assignments.grade(gradingSubmission.id, {
        score: parseInt(gradeForm.score),
        feedback: gradeForm.feedback
      });
      showToast('Baho muvaffaqiyatli saqlandi', 'success');
      setGradingSubmission(null);
      if (selectedAssignment) {
        openSubmissions(selectedAssignment);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!submittingAssignment) return;

    try {
      await api.assignments.submit({
        assignmentId: submittingAssignment.id,
        url: studentSubmitForm.url,
        text: studentSubmitForm.text
      });
      showToast('Vazifa topshirildi!', 'success');
      setSubmittingAssignment(null);
      setStudentSubmitForm({ url: '', text: '' });
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleString('uz-UZ', {
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
          <h1 className="page-title">Uy Vazifalari & Topshiriqlar</h1>
          <p className="page-subtitle">Amaliy topshiriqlar, kod havolalari va o'qituvchi baholash tizimi</p>
        </div>
        {(role === 'Admin' || role === 'Teacher') && (
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>Yangi Vazifa Yaratish</span>
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="card empty-state">
          <FileCode className="empty-icon" />
          <h3>Hozircha vazifalar mavjud emas</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
          {assignments.map((a) => (
            <div key={a.id} className="card card-violet" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span className="badge badge-amber">{a.groupName}</span>
                  <span className="badge badge-emerald">{a.maxScore} ball</span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>{a.title}</h3>
                <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '18px', minHeight: '44px' }}>
                  {a.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: a.isPassedDeadline ? '#fb7185' : '#34d399', marginBottom: '18px' }}>
                  <Clock size={16} />
                  <span>Muddati: {formatDate(a.deadline)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                  Topshirganlar: <strong style={{ color: '#fff' }}>{a.submissionsCount}</strong>
                </span>

                {(role === 'Teacher' || role === 'Admin') && (
                  <button onClick={() => openSubmissions(a)} className="btn btn-secondary btn-sm">
                    <CheckCircle2 size={15} color="#10b981" />
                    <span>Topshiriqlar ({a.submissionsCount})</span>
                  </button>
                )}

                {role === 'Student' && (
                  <button onClick={() => { setSubmittingAssignment(a); }} className="btn btn-primary btn-sm">
                    <Send size={15} />
                    <span>Vazifani Topshirish</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">Yangi Vazifa E'lon Qilish</h3>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateAssignment}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Guruhni Tanlang *</label>
                  <select
                    required
                    value={createForm.groupId}
                    onChange={(e) => setCreateForm({ ...createForm, groupId: e.target.value })}
                    className="form-select"
                  >
                    <option value="">Guruhni tanlang...</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name} &mdash; {g.courseName}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Vazifa Nomi *</label>
                  <input
                    type="text"
                    required
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    placeholder="Masalan: Entity Framework Core bilan CRUD"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tavsif va Qo'llanma *</label>
                  <textarea
                    required
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    placeholder="Talabalar nima qilishi kerak, texnik talablar..."
                    className="form-textarea"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Topshirish Muddati (Deadline) *</label>
                    <input
                      type="date"
                      required
                      value={createForm.deadline}
                      onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Maksimal Ball</label>
                    <input
                      type="number"
                      required
                      min="10"
                      max="1000"
                      value={createForm.maxScore}
                      onChange={(e) => setCreateForm({ ...createForm, maxScore: e.target.value })}
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
                  E'lon Qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEACHER SUBMISSIONS MODAL */}
      {selectedAssignment && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{selectedAssignment.title}</h3>
                <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                  Guruh: {selectedAssignment.groupName} &bull; Max ball: {selectedAssignment.maxScore}
                </div>
              </div>
              <button onClick={() => setSelectedAssignment(null)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {loadingSubmissions ? (
                <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" /></div>
              ) : submissions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                  Hali hech kim vazifa topshirmagan.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {submissions.map((sub) => (
                    <div key={sub.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{sub.studentName}</div>
                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>{formatDate(sub.submittedAt)}</div>
                        </div>
                        <div>
                          {sub.score !== null ? (
                            <span className="badge badge-emerald" style={{ fontSize: '14px' }}>
                              {sub.score} / {sub.maxScore} ball
                            </span>
                          ) : (
                            <span className="badge badge-amber">Baholanmagan</span>
                          )}
                        </div>
                      </div>

                      {sub.url && (
                        <div style={{ margin: '8px 0' }}>
                          <a
                            href={sub.url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', gap: '6px' }}
                          >
                            <ExternalLink size={14} />
                            <span>Kod / Havola: {sub.url}</span>
                          </a>
                        </div>
                      )}

                      {sub.text && (
                        <p style={{ fontSize: '13px', color: '#d1d5db', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '8px', margin: '8px 0' }}>
                          {sub.text}
                        </p>
                      )}

                      {sub.feedback && (
                        <div style={{ fontSize: '12px', color: '#34d399', marginTop: '6px' }}>
                          Ustoz izohi: {sub.feedback}
                        </div>
                      )}

                      {(role === 'Teacher' || role === 'Admin') && (
                        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                          <button onClick={() => openGradeModal(sub)} className="btn btn-amber btn-sm">
                            <Star size={14} />
                            <span>{sub.score !== null ? 'Qayta Baholash' : 'Baholash'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setSelectedAssignment(null)} className="btn btn-secondary">
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GRADE MODAL */}
      {gradingSubmission && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-box" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{gradingSubmission.studentName} ni Baholash</h3>
              <button onClick={() => setGradingSubmission(null)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleGrade}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Qo'yiladigan Ball (0 &mdash; {gradingSubmission.maxScore}) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max={gradingSubmission.maxScore}
                    value={gradeForm.score}
                    onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">O'qituvchi Izohi / Fikr-mulohazasi</label>
                  <textarea
                    value={gradeForm.feedback}
                    onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                    placeholder="Yaxshi bajarilgan, lekin..."
                    className="form-textarea"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setGradingSubmission(null)} className="btn btn-secondary">
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-primary">
                  Bahoni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT SUBMIT MODAL */}
      {submittingAssignment && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Vazifani Topshirish</h3>
              <button onClick={() => setSubmittingAssignment(null)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleStudentSubmit}>
              <div className="modal-body">
                <div style={{ marginBottom: '16px', background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                  <div style={{ fontWeight: 700, color: '#34d399' }}>{submittingAssignment.title}</div>
                  <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>{submittingAssignment.description}</div>
                </div>

                <div className="form-group">
                  <label className="form-label">GitHub / Loyiha Havolasi</label>
                  <input
                    type="url"
                    value={studentSubmitForm.url}
                    onChange={(e) => setStudentSubmitForm({ ...studentSubmitForm, url: e.target.value })}
                    placeholder="https://github.com/foydalanuvchi/loyiha"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Izoh / Qilingan ishlar haqida matn</label>
                  <textarea
                    value={studentSubmitForm.text}
                    onChange={(e) => setStudentSubmitForm({ ...studentSubmitForm, text: e.target.value })}
                    placeholder="Topshiriq yechimi bo'yicha tushuntirish..."
                    className="form-textarea"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setSubmittingAssignment(null)} className="btn btn-secondary">
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-primary">
                  Topshirish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
