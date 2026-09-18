import React, { useState, useEffect } from 'react';
import { CheckSquare, Calendar, Users, Save, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Attendance = () => {
  const { role, showToast } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [attendanceList, setAttendanceList] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    setLoadingLessons(true);
    try {
      const res = await api.lessons.getAll();
      if (res?.data) {
        setLessons(res.data);
        if (res.data.length > 0) {
          setSelectedLessonId(res.data[0].id);
          fetchAttendance(res.data[0].id);
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingLessons(false);
    }
  };

  const fetchAttendance = async (lessonId) => {
    setLoadingList(true);
    try {
      const res = await api.attendance.getByLesson(lessonId);
      if (res?.data) {
        setAttendanceList(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingList(false);
    }
  };

  const handleLessonChange = (lessonId) => {
    setSelectedLessonId(lessonId);
    fetchAttendance(lessonId);
  };

  const updateStudentStatus = (studentId, status) => {
    setAttendanceList((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, status } : item))
    );
  };

  const updateStudentNote = (studentId, note) => {
    setAttendanceList((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, note } : item))
    );
  };

  const handleSaveBatch = async () => {
    if (!selectedLessonId) return;
    setSaving(true);
    try {
      const payload = {
        lessonId: selectedLessonId,
        items: attendanceList.map((a) => ({
          studentId: a.studentId,
          status: a.status,
          note: a.note
        }))
      };
      await api.attendance.saveBatch(payload);
      showToast('Davomad muvaffaqiyatli saqlandi!', 'success');
      fetchAttendance(selectedLessonId);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const selectedLesson = lessons.find((l) => l.id === selectedLessonId);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Davomad Jurnali</h1>
          <p className="page-subtitle">Har bir dars uchun talabalar ishtirokini belgilash va izoh qoldirish</p>
        </div>
        {attendanceList.length > 0 && (
          <button
            onClick={handleSaveBatch}
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? <div className="spinner" style={{ width: '18px', height: '18px' }} /> : (
              <>
                <Save size={18} />
                <span>Davomadni Saqlash</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Lesson Selector Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>
              Darsni Tanlang:
            </label>
            <select
              value={selectedLessonId}
              onChange={(e) => handleLessonChange(e.target.value)}
              className="form-select"
            >
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.groupName} &mdash; {l.title} ({new Date(l.startsAt).toLocaleDateString('uz-UZ')})
                </option>
              ))}
            </select>
          </div>

          {selectedLesson && (
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>Guruh</div>
                <div style={{ fontWeight: 700, color: '#fbbf24' }}>{selectedLesson.groupName}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>Xona</div>
                <div style={{ fontWeight: 700, color: '#fff' }}>{selectedLesson.room || 'Online'}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>O'qituvchi</div>
                <div style={{ fontWeight: 700, color: '#34d399' }}>{selectedLesson.teacherName}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card" style={{ padding: 0 }}>
        {loadingList ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div className="spinner" />
          </div>
        ) : attendanceList.length === 0 ? (
          <div className="empty-state">
            <Users className="empty-icon" />
            <h3>O'quvchilar ro'yxati bo'sh</h3>
            <p>Ushbu guruhga hali faol o'quvchilar biriktirilmagan.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Talaba Ismi</th>
                  <th style={{ textAlign: 'center' }}>Holat (Keldi / Kechikdi / Kelmadi)</th>
                  <th>Izoh / Sabab</th>
                </tr>
              </thead>
              <tbody>
                {attendanceList.map((item, idx) => (
                  <tr key={item.studentId}>
                    <td style={{ color: '#6b7280', width: '40px' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 700, color: '#fff' }}>{item.studentName}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => updateStudentStatus(item.studentId, 'Present')}
                          className={`btn btn-sm ${item.status === 'Present' ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ padding: '6px 14px' }}
                        >
                          <CheckCircle2 size={14} />
                          <span>Keldi</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStudentStatus(item.studentId, 'Late')}
                          className={`btn btn-sm ${item.status === 'Late' ? 'btn-amber' : 'btn-secondary'}`}
                          style={{ padding: '6px 14px' }}
                        >
                          <AlertCircle size={14} />
                          <span>Kechikdi</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStudentStatus(item.studentId, 'Absent')}
                          className={`btn btn-sm ${item.status === 'Absent' ? 'btn-danger' : 'btn-secondary'}`}
                          style={{ padding: '6px 14px' }}
                        >
                          <XCircle size={14} />
                          <span>Kelmadi</span>
                        </button>
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.note || ''}
                        onChange={(e) => updateStudentNote(item.studentId, e.target.value)}
                        placeholder="Izoh yozing..."
                        className="form-input"
                        style={{ padding: '6px 12px', fontSize: '13px', maxWidth: '300px' }}
                      />
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
