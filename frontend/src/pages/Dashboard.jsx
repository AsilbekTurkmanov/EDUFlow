import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  FolderKanban,
  CreditCard,
  Calendar,
  FileCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Dashboard = ({ setTab }) => {
  const { role, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [role]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.dashboard.get();
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  if (!data) {
    return <div className="card">Ma'lumot topilmadi.</div>;
  }

  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString('uz-UZ') + " so'm";
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

  // 1. ADMIN DASHBOARD
  if (role === 'Admin') {
    return (
      <div>
        <div className="stat-grid">
          <div className="stat-card">
            <div>
              <div className="stat-label">Jami O'quvchilar</div>
              <div className="stat-value">{data.totalStudents}</div>
            </div>
            <div className="stat-icon emerald">
              <GraduationCap size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-label">O'qituvchilar</div>
              <div className="stat-value">{data.totalTeachers}</div>
            </div>
            <div className="stat-icon amber">
              <Users size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-label">Faol Guruhlar</div>
              <div className="stat-value">{data.activeGroups}</div>
            </div>
            <div className="stat-icon violet">
              <FolderKanban size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-label">Jami Tushum</div>
              <div className="stat-value" style={{ fontSize: '20px', color: '#10b981' }}>
                {formatCurrency(data.totalRevenue)}
              </div>
            </div>
            <div className="stat-icon emerald">
              <CreditCard size={24} />
            </div>
          </div>
        </div>

        {/* Tables Split */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {/* Recent Payments */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} color="#10b981" /> So'nggi To'lovlar
              </h3>
              <button onClick={() => setTab('payments')} className="btn btn-ghost btn-sm">
                Barchasi &rarr;
              </button>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>O'quvchi</th>
                    <th>Summa</th>
                    <th>Usul</th>
                    <th>Sana</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentPayments?.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.studentName}</td>
                      <td style={{ color: '#34d399', fontWeight: 700 }}>{formatCurrency(p.amount)}</td>
                      <td>
                        <span className="badge badge-slate">{p.method}</span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#9ca3af' }}>{formatDate(p.paidAt)}</td>
                    </tr>
                  ))}
                  {(!data.recentPayments || data.recentPayments.length === 0) && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: '#9ca3af' }}>
                        Hozircha to'lovlar yo'q
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Enrollments */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#f59e0b" /> So'nggi Qo'shilgan O'quvchilar
              </h3>
              <button onClick={() => setTab('groups')} className="btn btn-ghost btn-sm">
                Barchasi &rarr;
              </button>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>O'quvchi</th>
                    <th>Guruh</th>
                    <th>Sana</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentEnrollments?.map((e) => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 600 }}>{e.studentName}</td>
                      <td>
                        <span className="badge badge-amber">{e.groupName}</span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#9ca3af' }}>{formatDate(e.joinedAt)}</td>
                    </tr>
                  ))}
                  {(!data.recentEnrollments || data.recentEnrollments.length === 0) && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', color: '#9ca3af' }}>
                        Hozircha o'quvchi biriktirilmagan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. TEACHER DASHBOARD
  if (role === 'Teacher') {
    return (
      <div>
        <div className="stat-grid">
          <div className="stat-card">
            <div>
              <div className="stat-label">Mening Guruhlarim</div>
              <div className="stat-value">{data.myGroupsCount}</div>
            </div>
            <div className="stat-icon emerald">
              <FolderKanban size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-label">O'qitayotgan Talabalarim</div>
              <div className="stat-value">{data.myStudentsCount}</div>
            </div>
            <div className="stat-icon amber">
              <Users size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-label">Tekshirish Kutilmoqda</div>
              <div className="stat-value" style={{ color: '#fbbf24' }}>
                {data.pendingSubmissionsCount}
              </div>
            </div>
            <div className="stat-icon amber">
              <FileCheck size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-label">Yaqinlashayotgan Darslar</div>
              <div className="stat-value">{data.upcomingLessonsCount}</div>
            </div>
            <div className="stat-icon violet">
              <Calendar size={24} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {/* Upcoming lessons */}
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="#10b981" /> Navbatdagi Darslarim
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.upcomingLessons?.map((l) => (
                <div key={l.id} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{l.title}</span>
                    <span className="badge badge-emerald">{l.room || 'Online'}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '6px' }}>
                    Guruh: <strong style={{ color: '#34d399' }}>{l.groupName}</strong> &bull; {formatDate(l.startsAt)}
                  </div>
                </div>
              ))}
              {(!data.upcomingLessons || data.upcomingLessons.length === 0) && (
                <div style={{ color: '#9ca3af', padding: '20px 0', textAlign: 'center' }}>
                  Rejalashtirilgan darslar yo'q
                </div>
              )}
            </div>
          </div>

          {/* Pending submissions */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck size={18} color="#f59e0b" /> Baholash Kutilayotgan Topshiriqlar
              </h3>
              <button onClick={() => setTab('assignments')} className="btn btn-ghost btn-sm">
                Baholashga o'tish &rarr;
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.pendingSubmissions?.map((s) => (
                <div key={s.id} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{s.studentName}</span>
                    <span className="badge badge-amber">Baholanmagan</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
                    Vazifa: {s.assignmentTitle}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    Topshirildi: {formatDate(s.submittedAt)}
                  </div>
                </div>
              ))}
              {(!data.pendingSubmissions || data.pendingSubmissions.length === 0) && (
                <div style={{ color: '#10b981', padding: '20px 0', textAlign: 'center' }}>
                  Hamma topshiriqlar baholangan!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. STUDENT DASHBOARD
  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">A'zo Kurslarim</div>
            <div className="stat-value">{data.enrolledCoursesCount}</div>
          </div>
          <div className="stat-icon emerald">
            <GraduationCap size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Davomad Ko'rsatkichi</div>
            <div className="stat-value" style={{ color: '#34d399' }}>
              {data.attendanceRatePercentage}%
            </div>
          </div>
          <div className="stat-icon emerald">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Kutilayotgan Vazifalar</div>
            <div className="stat-value" style={{ color: data.pendingAssignmentsCount > 0 ? '#fbbf24' : '#10b981' }}>
              {data.pendingAssignmentsCount}
            </div>
          </div>
          <div className="stat-icon amber">
            <FileCheck size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Qarzdorlik / Balans</div>
            <div className="stat-value" style={{ fontSize: '18px', color: data.balanceDebt > 0 ? '#fb7185' : '#10b981' }}>
              {data.balanceDebt > 0 ? formatCurrency(data.balanceDebt) : "To'liq to'langan"}
            </div>
          </div>
          <div className="stat-icon rose">
            <CreditCard size={24} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Upcoming lessons */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="#10b981" /> Kelgusi Darslarim
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.upcomingLessons?.map((l) => (
              <div key={l.id} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{l.title}</span>
                  <span className="badge badge-emerald">{l.room || 'Online'}</span>
                </div>
                <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '6px' }}>
                  Ustoz: {l.teacherName} &bull; Vaqti: {formatDate(l.startsAt)}
                </div>
              </div>
            ))}
            {(!data.upcomingLessons || data.upcomingLessons.length === 0) && (
              <div style={{ color: '#9ca3af', padding: '20px 0', textAlign: 'center' }}>
                Hozircha dars belgilanmagan
              </div>
            )}
          </div>
        </div>

        {/* Pending assignments */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} color="#f59e0b" /> Topshirilishi Kerak Bo'lgan Vazifalar
            </h3>
            <button onClick={() => setTab('assignments')} className="btn btn-ghost btn-sm">
              Topshirish &rarr;
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.pendingAssignments?.map((a) => (
              <div key={a.id} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{a.title}</span>
                  <span className="badge badge-amber">{a.maxScore} ball</span>
                </div>
                <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
                  Guruh: {a.groupName}
                </div>
                <div style={{ fontSize: '12px', color: '#fb7185', marginTop: '4px' }}>
                  Muddati: {formatDate(a.deadline)}
                </div>
              </div>
            ))}
            {(!data.pendingAssignments || data.pendingAssignments.length === 0) && (
              <div style={{ color: '#10b981', padding: '20px 0', textAlign: 'center' }}>
                Ajoyib! Barcha vazifalar topshirilgan.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
