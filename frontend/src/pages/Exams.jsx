import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  Users,
  Search,
  BookOpen,
  X,
  FileCheck,
  TrendingUp,
  Percent
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Exams = () => {
  const { role, user, showToast } = useAuth();
  const [exams, setExams] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('');

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({
    groupId: '',
    title: '',
    examDate: new Date().toISOString().split('T')[0],
    maxScore: 100,
    passingScore: 60,
    description: ''
  });

  // Grading Modal
  const [gradingExam, setGradingExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [gradesMap, setGradesMap] = useState({}); // { studentId: { score: 85, feedback: '' } }
  const [savingGrades, setSavingGrades] = useState(false);

  useEffect(() => {
    fetchExams();
    fetchGroups();
  }, [selectedGroup]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await api.exams.getAll(selectedGroup || undefined);
      if (res?.data) {
        setExams(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const teacherIdParam = role === 'Teacher' ? user?.id : undefined;
      const res = await api.groups.getAll(teacherIdParam);
      if (res?.data) {
        setGroups(res.data);
        if (res.data.length > 0 && !form.groupId) {
          setForm((prev) => ({ ...prev, groupId: res.data[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await api.exams.create({
        ...form,
        examDate: `${form.examDate}T12:00:00Z`
      });
      showToast('Yangi imtihon muvaffaqiyatli belgilandi!', 'success');
      setShowCreateModal(false);
      fetchExams();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleOpenGrading = async (exam) => {
    setGradingExam(exam);
    try {
      // Get enrolled students for the group
      const res = await api.groups.getStudents(exam.groupId);
      const studentList = res?.data?.map((e) => e.student) || [];
      setStudents(studentList);

      // Pre-fill grades from existing results
      const map = {};
      studentList.forEach((s) => {
        const existing = exam.results?.find((r) => r.studentId === s.id);
        map[s.id] = {
          score: existing ? existing.score : 80,
          feedback: existing ? existing.teacherFeedback || '' : ''
        };
      });
      setGradesMap(map);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleGradeChange = (studentId, field, value) => {
    setGradesMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSaveAllGrades = async (e) => {
    e.preventDefault();
    if (!gradingExam) return;
    setSavingGrades(true);
    try {
      const results = Object.keys(gradesMap).map((stId) => ({
        studentId: stId,
        score: parseInt(gradesMap[stId].score) || 0,
        teacherFeedback: gradesMap[stId].feedback
      }));

      await api.exams.saveResults({
        examId: gradingExam.id,
        results
      });

      showToast('Barcha baholar muvaffaqiyatli saqlandi!', 'success');
      setGradingExam(null);
      fetchExams();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingGrades(false);
    }
  };

  const getGradeBadge = (score, maxScore = 100) => {
    const pct = (score / maxScore) * 100;
    if (pct >= 90) return <span className="badge badge-emerald">A (A'lo)</span>;
    if (pct >= 80) return <span className="badge badge-emerald">B (Yaxshi)</span>;
    if (pct >= 70) return <span className="badge badge-amber">C (Qoniqarli)</span>;
    if (pct >= 60) return <span className="badge badge-amber">D (Yetarli)</span>;
    return <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>F (Yiqildi)</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>
            📝 Imtihonlar & Akademik Baholash
          </h1>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
            Oraliq (Midterm), Yakuniy (Final) va Modul imtihonlarini tashkillashtirish hamda talabalar bilimini baholash.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="form-control"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', minWidth: '180px' }}
          >
            <option value="" style={{ background: '#1e293b' }}>Barcha Guruhlar</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id} style={{ background: '#1e293b' }}>
                {g.name}
              </option>
            ))}
          </select>

          {(role === 'Admin' || role === 'Teacher') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={16} /> Yangi Imtihon Belgilash
            </button>
          )}
        </div>
      </div>

      {/* Exams Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 12px' }} />
          <div style={{ color: '#9ca3af', fontSize: '13px' }}>Imtihonlar yuklanmoqda...</div>
        </div>
      ) : exams.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af', borderRadius: '16px' }}>
          <Award size={40} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
          <div>Belgilangan imtihonlar mavjud emas.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="card"
              style={{
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span
                    style={{
                      background: 'rgba(56, 189, 248, 0.1)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      color: '#38bdf8',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}
                  >
                    {exam.groupName}
                  </span>

                  <span style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> {new Date(exam.examDate).toLocaleDateString()}
                  </span>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>
                  {exam.title}
                </h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 16px 0', minHeight: '34px', lineHeight: 1.4 }}>
                  {exam.description || 'Kurs bo\'yicha bilimlarni tekshirish imtihoni'}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px', borderRadius: '10px' }}>
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>O'rtacha Ball:</span>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8' }}>
                      {exam.averageScore > 0 ? `${exam.averageScore} / ${exam.maxScore}` : 'Baholanmagan'}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px', borderRadius: '10px' }}>
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>Topshirganlar:</span>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#34d399' }}>
                      {exam.submissionsCount} ta talaba
                    </div>
                  </div>
                </div>
              </div>

              {(role === 'Admin' || role === 'Teacher') && (
                <button
                  onClick={() => handleOpenGrading(exam)}
                  className="btn btn-secondary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700 }}
                >
                  <FileCheck size={16} /> Talabalarni Baholash
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Exam Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>
                Yangi Imtihon Belgilash
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-ghost btn-sm" style={{ padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateExam} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Guruh *</label>
                <select
                  required
                  value={form.groupId}
                  onChange={(e) => setForm({ ...form, groupId: e.target.value })}
                  className="form-control"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id} style={{ background: '#1e293b' }}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Imtihon Nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="masalan: 1-Modul Oraliq Nazorati (Midterm)"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="form-control"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Sana *</label>
                  <input
                    type="date"
                    required
                    value={form.examDate}
                    onChange={(e) => setForm({ ...form, examDate: e.target.value })}
                    className="form-control"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Maksimal Ball</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={form.maxScore}
                    onChange={(e) => setForm({ ...form, maxScore: parseInt(e.target.value) || 100 })}
                    className="form-control"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Tavsif & Yo'riqnoma</label>
                <textarea
                  rows="2"
                  placeholder="Imtihon qamrovi, topshiriqlar va talablar..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="form-control"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-ghost">
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
                  Imtihonni Yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {gradingExam && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Imtihon Baholari: {gradingExam.title}
                </h3>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                  {gradingExam.groupName} — Maksimal ball: {gradingExam.maxScore}
                </span>
              </div>
              <button onClick={() => setGradingExam(null)} className="btn btn-ghost btn-sm" style={{ padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAllGrades} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {students.map((student) => {
                  const currentScore = gradesMap[student.id]?.score ?? 0;
                  return (
                    <div
                      key={student.id}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '14px'
                      }}
                    >
                      <div style={{ minWidth: '160px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{student.fullName}</div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>{student.phone || student.email}</div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '80px' }}>
                          <input
                            type="number"
                            min="0"
                            max={gradingExam.maxScore}
                            value={currentScore}
                            onChange={(e) => handleGradeChange(student.id, 'score', e.target.value)}
                            className="form-control"
                            style={{ textAlign: 'center', fontWeight: 800, background: 'rgba(0,0,0,0.3)', color: '#38bdf8' }}
                          />
                        </div>

                        <div style={{ width: '90px' }}>
                          {getGradeBadge(currentScore, gradingExam.maxScore)}
                        </div>

                        <div style={{ flex: 1, minWidth: '140px' }}>
                          <input
                            type="text"
                            placeholder="O'qituvchi fikri..."
                            value={gradesMap[student.id]?.feedback || ''}
                            onChange={(e) => handleGradeChange(student.id, 'feedback', e.target.value)}
                            className="form-control"
                            style={{ fontSize: '12px', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button type="button" onClick={() => setGradingExam(null)} className="btn btn-ghost">
                  Bekor qilish
                </button>
                <button type="submit" disabled={savingGrades} className="btn btn-primary" style={{ fontWeight: 700 }}>
                  {savingGrades ? 'Saqlanmoqda...' : 'Barcha Baholarni Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams;
