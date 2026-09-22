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
  AlertCircle,
  Percent,
  Sparkles,
  Wallet,
  ArrowRight,
  BarChart3,
  XCircle
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

  const formatBalance = (val) => {
    const num = Number(val || 0);
    if (num > 0) return `+${num.toLocaleString('uz-UZ')} so'm`;
    if (num < 0) return `-${Math.abs(num).toLocaleString('uz-UZ')} so'm`;
    return '+0 so\'m';
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
              <div className="stat-value">{data.totalStudents} nafar</div>
            </div>
            <div className="stat-icon emerald">
              <GraduationCap size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-label">O'qituvchilar</div>
              <div className="stat-value">{data.totalTeachers} nafar</div>
            </div>
            <div className="stat-icon amber">
              <Users size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-label">Faol Guruhlar</div>
              <div className="stat-value">{data.activeGroups} ta</div>
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

        {/* Financial Highlights (Debts & Prepaids) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="card" style={{ padding: '16px 20px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <span style={{ fontSize: '12px', color: '#34d399', fontWeight: 700 }}>To'liq To'laganlar</span>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>
              {data.fullyPaidCount} nafar
            </div>
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>Balans: +0 so'm</span>
          </div>

          <div className="card" style={{ padding: '16px 20px', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
            <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 700 }}>9 Oylik Oldindan To'laganlar</span>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#8b5cf6', marginTop: '4px' }}>
              {data.prepaidCount} nafar
            </div>
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>Balans: +7 200 000 so'm</span>
          </div>

          <div className="card" style={{ padding: '16px 20px', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
            <span style={{ fontSize: '12px', color: '#fb7185', fontWeight: 700 }}>Qarzdorlar (-800 000 so'm)</span>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#f43f5e', marginTop: '4px' }}>
              {data.debtorsCount} nafar
            </div>
            <span style={{ fontSize: '11px', color: '#fb7185' }}>Jami qarz: {formatCurrency(data.totalDebts)}</span>
          </div>
        </div>

        {/* Monthly Revenue Chart Diagram */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <BarChart3 size={18} color="#10b981" /> Oylik To'lovlar Statistikasi (Diagramma)
            </h3>
            <button onClick={() => setTab('payments')} className="btn btn-ghost btn-sm">
              Batafsil moliya &rarr;
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px', alignItems: 'flex-end', minHeight: '160px', padding: '10px 0' }}>
            {(data.revenueChart || []).map((m, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>
                  {formatCurrency(m.amount)}
                </span>
                <div
                  style={{
                    width: '100%',
                    maxWidth: '50px',
                    height: `${Math.max(30, Math.min(100, (m.amount / 70000000) * 100))}%`,
                    background: 'linear-gradient(180deg, #10b981 0%, rgba(16, 185, 129, 0.2) 100%)',
                    borderRadius: '6px 6px 0 0',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                  }}
                />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#cbd5e1' }}>
                  {m.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tables Split */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {/* Recent Payments */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
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
                    <th>Telefon</th>
                    <th>Summa</th>
                    <th>Sana</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentPayments?.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.studentName}</td>
                      <td style={{ fontSize: '12px', color: '#9ca3af' }}>{p.studentPhone || '—'}</td>
                      <td style={{ color: '#34d399', fontWeight: 700 }}>{formatCurrency(p.amount)}</td>
                      <td style={{ fontSize: '12px', color: '#9ca3af' }}>{formatDate(p.paidAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Enrollments */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Users size={18} color="#f59e0b" /> So'nggi Guruh A'zolari
              </h3>
              <button onClick={() => setTab('users')} className="btn btn-ghost btn-sm">
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
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. TEACHER DASHBOARD (EXPERIENCE YEARS & 70% PERCENTAGE REVENUE SHARE)
  if (role === 'Teacher') {
    return (
      <div>
        {/* Experience & Share Percentage Hero */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '24px',
            padding: '26px 30px',
            marginBottom: '26px',
            boxShadow: '0 15px 35px rgba(0,0,0,0.5)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span className="badge badge-emerald" style={{ fontSize: '12px', fontWeight: 800 }}>
                  Ustozlik Staji & Oylik Ulush Tizimi
                </span>
                <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                  {data.experienceYears >= 3 ? '3+ yil (70%)' : data.experienceYears >= 2 ? '2 yil (60%)' : data.experienceYears >= 1 ? '1 yil (50%)' : '<1 yil (40%)'}
                </span>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', margin: 0 }}>
                {user?.fullName} &mdash; Shaxsiy Daromad Portali
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '6px' }}>
                Ish stajingiz: <strong style={{ color: '#fff' }}>{data.experienceYears} yil</strong>.
                Siz har bir talabangizning 800 000 so'mlik oylik to'lovidan <strong style={{ color: '#34d399' }}>{data.sharePercentage}%</strong> ({formatCurrency(800000 * (data.sharePercentage / 100))}) olasiz.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {/* Share Percentage Badge Box */}
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '2px solid #10b981',
                  borderRadius: '16px',
                  padding: '12px 20px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
                  Foiz Stavka
                </div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: '#10b981' }}>
                  {data.sharePercentage}%
                </div>
                <div style={{ fontSize: '11px', color: '#cbd5e1' }}>to'lovdan ulush</div>
              </div>

              {/* Monthly Earnings Box */}
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '2px solid #f59e0b',
                  borderRadius: '16px',
                  padding: '12px 20px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase' }}>
                  Bu Oylik Maosh
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#f59e0b' }}>
                  {formatCurrency(data.monthlyEarnings)}
                </div>
                <div style={{ fontSize: '11px', color: '#cbd5e1' }}>{data.myStudentsCount} nafar talabadan</div>
              </div>
            </div>
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <div>
              <div className="stat-label">Mening Guruhlarim</div>
              <div className="stat-value">{data.myGroupsCount} ta</div>
            </div>
            <div className="stat-icon emerald">
              <FolderKanban size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-label">O'qitayotgan Talabalarim</div>
              <div className="stat-value">{data.myStudentsCount} nafar</div>
            </div>
            <div className="stat-icon amber">
              <Users size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-label">Jami Ishlangan Summa</div>
              <div className="stat-value" style={{ color: '#10b981', fontSize: '18px' }}>
                {formatCurrency(data.totalLifetimeEarnings)}
              </div>
            </div>
            <div className="stat-icon emerald">
              <Wallet size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-label">Yaqinlashayotgan Darslar</div>
              <div className="stat-value">{data.upcomingLessonsCount} ta</div>
            </div>
            <div className="stat-icon violet">
              <Calendar size={24} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {/* Assigned Students List */}
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="#10b981" /> O'quvchilarim Ro'yxati ({data.myStudentNames?.length || 0} nafar)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
              {(data.myStudentNames || []).map((sName, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: '13px' }}>
                    {idx + 1}. {sName}
                  </span>
                  <span className="badge badge-emerald" style={{ fontSize: '11px' }}>
                    +{formatCurrency(800000 * (data.sharePercentage / 100))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming lessons */}
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="#f59e0b" /> Navbatdagi Darslarim (Kundalik)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.upcomingLessons?.map((l) => (
                <div key={l.id} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{l.title}</span>
                    <span className="badge badge-emerald">{l.room || 'Online'}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '6px' }}>
                    Guruh: <strong style={{ color: l.groupColor || '#34d399' }}>{l.groupName}</strong> &bull; {formatDate(l.startsAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. STUDENT DASHBOARD (800K TUITION, EXACT BALANCE +0 / -800K / +7.2M, ATTENDANCE STATS)
  return (
    <div>
      {/* Student Hero Financial Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '24px',
          padding: '26px 30px',
          marginBottom: '26px',
          boxShadow: '0 15px 35px rgba(0,0,0,0.5)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className="badge badge-emerald" style={{ fontSize: '12px', fontWeight: 800 }}>
                Oylik To'lov Tizimi
              </span>
              <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                800 000 so'm / oy
              </span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', margin: 0 }}>
              Salom, {user?.fullName}!
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '6px' }}>
              Sizning oylik to'lovingiz: <strong style={{ color: '#fff' }}>800 000 so'm</strong>. Har oy hisobingizdan ushbu summa yechiladi.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {/* Balance Box */}
            <div
              style={{
                background: data.balance >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                border: `2px solid ${data.balance >= 0 ? '#10b981' : '#fb7185'}`,
                borderRadius: '16px',
                padding: '14px 22px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: data.balance >= 0 ? '#34d399' : '#fb7185', textTransform: 'uppercase' }}>
                Joriy Balans
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: data.balance >= 0 ? '#10b981' : '#fb7185', marginTop: '2px' }}>
                {formatBalance(data.balance)}
              </div>
              <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                {data.balance > 0 ? 'Oldindan to\'langan summa' : data.balance === 0 ? 'To\'liq to\'langan (+0)' : 'To\'lanmagan qarzdorlik'}
              </div>
            </div>

            {/* Quick Pay Button */}
            <button
              onClick={() => setTab('payments')}
              className="btn btn-primary"
              style={{ padding: '14px 22px', fontSize: '14px', fontWeight: 800 }}
            >
              <CreditCard size={18} />
              <span>To'lov Qilish</span>
            </button>
          </div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">A'zo Kurslarim</div>
            <div className="stat-value">{data.enrolledCoursesCount} ta</div>
          </div>
          <div className="stat-icon emerald">
            <GraduationCap size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Davomat Ko'rsatkichi</div>
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
            <div className="stat-label">Darsga Kelgan / Kelmagan</div>
            <div className="stat-value" style={{ fontSize: '18px', color: '#fff' }}>
              <span style={{ color: '#34d399' }}>{data.presentCount} kelgan</span> / <span style={{ color: '#fb7185' }}>{data.absentCount} sababsiz</span>
            </div>
          </div>
          <div className="stat-icon amber">
            <Clock size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Jami To'langan Summa</div>
            <div className="stat-value" style={{ fontSize: '18px', color: '#10b981' }}>
              {formatCurrency(data.totalPaid)}
            </div>
          </div>
          <div className="stat-icon emerald">
            <Wallet size={24} />
          </div>
        </div>
      </div>

      {/* Monthly Payment Diagram for Student */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} color="#10b981" /> Oylik To'lov Statistikasi (Aprel &ndash; Sentabr)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', textAlign: 'center' }}>
          {(data.monthlyPaymentStats || []).map((m, idx) => (
            <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: m.isPaid ? '1px solid #10b981' : '1px solid #fb7185' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>{m.month}</div>
              <div
                style={{
                  height: '40px',
                  borderRadius: '8px',
                  background: m.isPaid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: m.isPaid ? '#34d399' : '#fb7185',
                  fontWeight: 900,
                  fontSize: '14px'
                }}
              >
                {m.isPaid ? '✓ To\'langan' : '✗ Qarz'}
              </div>
              <div style={{ fontSize: '11px', color: m.isPaid ? '#10b981' : '#fb7185', marginTop: '6px', fontWeight: 700 }}>
                {formatCurrency(m.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Upcoming lessons */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="#10b981" /> Kelgusi Darslarim (Kundalik.com)
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
