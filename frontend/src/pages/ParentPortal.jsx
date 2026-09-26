import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Award,
  BookOpen,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Phone,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ParentPortal = () => {
  const { user, showToast } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const res = await api.parent.getChildren();
      if (res?.data && res.data.length > 0) {
        setChildren(res.data);
      } else {
        // Fallback demo child if no linked children yet
        setChildren([
          {
            childId: 'c1',
            fullName: 'Jasur Bekmirzayev',
            phone: '+998 90 987 65 43',
            email: 'jasur@eduflow.uz',
            groupName: '.NET Backend Architecture (G101)',
            courseName: '.NET FullStack Dasturlash',
            teacherName: 'Anvar Mahmudov',
            attendancePercentage: 92.5,
            balance: 0,
            monthlyTuition: 800000,
            averageGradeScore: 89.0,
            recentAttendances: [
              { id: 'a1', lessonTitle: 'Clean Architecture va CQRS Pattern', status: 0, lessonDate: new Date().toISOString() },
              { id: 'a2', lessonTitle: 'Entity Framework Core va Npgsql', status: 0, lessonDate: new Date(Date.now() - 86400000 * 2).toISOString() },
              { id: 'a3', lessonTitle: 'JWT Authentication & Refresh Tokens', status: 1, lessonDate: new Date(Date.now() - 86400000 * 4).toISOString() }
            ],
            recentExamResults: [
              { id: 'e1', examTitle: '1-Modul Oraliq Nazorati', score: 92, gradeLetter: 'A', teacherFeedback: 'Mustaqil va sifatli yechimlar ko\'rsatdi.' },
              { id: 'e2', examTitle: 'REST API va Validatsiya Testi', score: 86, gradeLetter: 'B', teacherFeedback: 'Yaxshi natija, xatoliklar bilan ishlashni kuchaytirish kerak.' }
            ],
            recentPayments: [
              { id: 'p1', amount: 800000, paidAt: new Date(Date.now() - 86400000 * 10).toISOString(), method: 4, status: 0, note: 'Payme orqali to\'landi' }
            ]
          }
        ]);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const currentChild = children[selectedChildIndex] || children[0];

  const handleOnlinePay = () => {
    showToast('To\'lov tizimiga yo\'naltirilmoqda (Payme / Click)...', 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={28} color="#38bdf8" /> Ota-ona Portali (Parent Hub)
        </h1>
        <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
          Farzandlaringizning o'quv markazidagi davomati, imtihon baholari, uy vazifalari va to'lovlarini real vaqtda kuzatib boring.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 12px' }} />
          <div style={{ color: '#9ca3af', fontSize: '13px' }}>Farzandlar ma'lumotlari yuklanmoqda...</div>
        </div>
      ) : children.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af', borderRadius: '16px' }}>
          <Users size={40} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
          <div>Sizning hisobingizga biriktirilgan o'quvchi topilmadi.</div>
          <p style={{ fontSize: '12px', marginTop: '6px' }}>
            Administrator bilan bog'lanib, telefon raqamingizni farzandingiz hisobiga biriktiring.
          </p>
        </div>
      ) : (
        <>
          {/* Children Selector Cards */}
          {children.length > 1 && (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
              {children.map((child, idx) => (
                <button
                  key={child.childId}
                  onClick={() => setSelectedChildIndex(idx)}
                  className="card"
                  style={{
                    padding: '12px 18px',
                    borderRadius: '12px',
                    background: idx === selectedChildIndex ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${idx === selectedChildIndex ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#fff',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#38bdf8', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>
                    {child.fullName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14px' }}>{child.fullName}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>{child.groupName || 'Guruh biriktirilgan'}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Current Child Card Banner */}
          {currentChild && (
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '18px',
                padding: '24px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '22px',
                      boxShadow: '0 4px 14px rgba(56, 189, 248, 0.4)'
                    }}
                  >
                    {currentChild.fullName.charAt(0)}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: '0 0 4px 0' }}>
                      {currentChild.fullName}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#9ca3af' }}>
                      <span style={{ color: '#38bdf8', fontWeight: 600 }}>{currentChild.courseName || 'Kurs'}</span>
                      <span>•</span>
                      <span>Guruh: <strong>{currentChild.groupName || 'G101'}</strong></span>
                      {currentChild.teacherName && (
                        <>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <UserCheck size={14} color="#10b981" /> Ustoz: {currentChild.teacherName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Balance & Pay Button */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>Oylik To'lov Holati</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: currentChild.balance < 0 ? '#f87171' : '#34d399', margin: '2px 0 6px 0' }}>
                    {currentChild.balance < 0 ? `${currentChild.balance.toLocaleString()} UZS (Qarz)` : 'To\'lov to\'liq amalga oshirilgan'}
                  </div>
                  {currentChild.balance < 0 && (
                    <button onClick={handleOnlinePay} className="btn btn-primary btn-sm" style={{ fontWeight: 700 }}>
                      <CreditCard size={14} /> Payme / Click orqali to'lash
                    </button>
                  )}
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Davomat Ko'rsatkichi</div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: currentChild.attendancePercentage >= 85 ? '#34d399' : '#fbbf24' }}>
                    {currentChild.attendancePercentage}%
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>Darslarda muntazam ishtirok</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>O'rtacha Imtihon Bali</div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#38bdf8' }}>
                    {currentChild.averageGradeScore > 0 ? `${currentChild.averageGradeScore} ball` : 'Topshirilmagan'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>Oraliq va yakuniy baholar</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Oylik Kurs To'lovi</div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>
                    {currentChild.monthlyTuition.toLocaleString()} UZS
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>Har oy 10-sanasigacha</div>
                </div>
              </div>
            </div>
          )}

          {/* Details Grid: Attendance & Exams */}
          {currentChild && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
              {/* Recent Attendances */}
              <div className="card" style={{ borderRadius: '16px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Calendar size={18} color="#38bdf8" />
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0 }}>
                    So'nggi Darslardagi Davomati
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {currentChild.recentAttendances.map((att) => {
                    const isPresent = att.status === 0 || att.status === 'Present';
                    const isLate = att.status === 1 || att.status === 'Late';
                    return (
                      <div
                        key={att.id}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          background: 'rgba(255,255,255,0.03)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{att.lessonTitle}</div>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                            {new Date(att.lessonDate).toLocaleDateString()}
                          </div>
                        </div>

                        <div>
                          {isPresent && <span className="badge badge-emerald" style={{ fontSize: '11px' }}>Qatnashdi</span>}
                          {isLate && <span className="badge badge-amber" style={{ fontSize: '11px' }}>Kechikdi</span>}
                          {!isPresent && !isLate && <span className="badge badge-danger" style={{ fontSize: '11px' }}>Kelmagan</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Exams & Academic Grades */}
              <div className="card" style={{ borderRadius: '16px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Award size={18} color="#fbbf24" />
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0 }}>
                    Imtihon Natijalari & Baholar
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {currentChild.recentExamResults.length === 0 ? (
                    <div style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                      Hali imtihon baholari kiritilmagan.
                    </div>
                  ) : (
                    currentChild.recentExamResults.map((exam) => (
                      <div
                        key={exam.id}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          background: 'rgba(255,255,255,0.03)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{exam.examTitle}</span>
                          <span className="badge badge-emerald" style={{ fontSize: '11px' }}>
                            {exam.score} ball ({exam.gradeLetter})
                          </span>
                        </div>
                        {exam.teacherFeedback && (
                          <div style={{ fontSize: '11px', color: '#9ca3af', fontStyle: 'italic' }}>
                            Ustoz izohi: "{exam.teacherFeedback}"
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ParentPortal;
