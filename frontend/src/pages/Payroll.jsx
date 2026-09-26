import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  Building2,
  RefreshCw,
  Search,
  Percent,
  X,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Payroll = () => {
  const { role, user, showToast } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [search, setSearch] = useState('');

  // Selected period month: defaults to current month e.g. "2026-09"
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [periodMonth, setPeriodMonth] = useState(currentMonthStr);

  // Pay Modal
  const [payingPayroll, setPayingPayroll] = useState(null);
  const [payForm, setPayForm] = useState({
    bonus: 0,
    deductions: 0,
    note: ''
  });

  useEffect(() => {
    fetchPayrolls();
  }, [periodMonth]);

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const teacherIdParam = role === 'Teacher' ? user?.id : undefined;
      const res = await api.payroll.getAll({ periodMonth, ...(teacherIdParam ? { teacherId: teacherIdParam } : {}) });
      if (res?.data) {
        setPayrolls(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculateAll = async () => {
    setCalculating(true);
    try {
      await api.payroll.generateCenter({ periodMonth });
      showToast(`${periodMonth} oyi uchun o'qituvchilar maoshi yangilandi!`, 'success');
      fetchPayrolls();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCalculating(false);
    }
  };

  const handleOpenPay = (payroll) => {
    setPayingPayroll(payroll);
    setPayForm({
      bonus: payroll.bonus || 0,
      deductions: payroll.deductions || 0,
      note: payroll.paymentNote || 'Bank kartasiga o\'tkazildi'
    });
  };

  const handleConfirmPay = async (e) => {
    e.preventDefault();
    if (!payingPayroll) return;
    try {
      await api.payroll.pay(payingPayroll.id, payForm);
      showToast(`${payingPayroll.teacherName} ga maosh to'langan deb belgilandi!`, 'success');
      setPayingPayroll(null);
      fetchPayrolls();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // KPI calculations
  const totalRevenue = payrolls.reduce((acc, p) => acc + (p.totalRevenueGenerated || 0), 0);
  const totalSalaries = payrolls.reduce((acc, p) => acc + (p.finalAmount || 0), 0);
  const centerMargin = totalRevenue - totalSalaries;
  const pendingPayouts = payrolls
    .filter((p) => p.status !== 2 && p.statusText !== 'To\'langan')
    .reduce((acc, p) => acc + (p.finalAmount || 0), 0);

  const filteredPayrolls = payrolls.filter(
    (p) =>
      p.teacherName.toLowerCase().includes(search.toLowerCase()) ||
      p.compensationTypeName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>
            💰 O'qituvchilar Maoshi & Payroll Tizimi
          </h1>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
            Talabalar tushumidan foizli ulush, o'quvchi boshiga fiks yoki oylik oklad bo'yicha to'liq avtomatik hisob-kitob.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '10px' }}>
            <Calendar size={16} color="#38bdf8" />
            <input
              type="month"
              value={periodMonth}
              onChange={(e) => setPeriodMonth(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, outline: 'none' }}
            />
          </div>

          {role === 'Admin' && (
            <button
              onClick={handleRecalculateAll}
              disabled={calculating}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <RefreshCw size={15} className={calculating ? 'spin' : ''} />
              <span>{calculating ? 'Hisoblanmoqda...' : 'Qayta Hisoblash'}</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '18px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#38bdf8', marginBottom: '8px' }}>
            <TrendingUp size={18} />
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>O'qituvchilar Keltirgan Tushum</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>
            {totalRevenue.toLocaleString()} <span style={{ fontSize: '14px', color: '#9ca3af' }}>UZS</span>
          </div>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '18px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#34d399', marginBottom: '8px' }}>
            <DollarSign size={18} />
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Jami O'qituvchilar Maoshi</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>
            {totalSalaries.toLocaleString()} <span style={{ fontSize: '14px', color: '#9ca3af' }}>UZS</span>
          </div>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)', border: '1px solid rgba(168, 85, 247, 0.25)', padding: '18px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#c084fc', marginBottom: '8px' }}>
            <Building2 size={18} />
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Markaz Sof Ulushi (Marja)</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>
            {centerMargin.toLocaleString()} <span style={{ fontSize: '14px', color: '#9ca3af' }}>UZS</span>
          </div>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '18px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fbbf24', marginBottom: '8px' }}>
            <Clock size={18} />
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Kutilayotgan To'lovlar</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>
            {pendingPayouts.toLocaleString()} <span style={{ fontSize: '14px', color: '#9ca3af' }}>UZS</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', width: '320px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#9ca3af' }} />
        <input
          type="text"
          placeholder="O'qituvchi ismi bo'yicha..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control"
          style={{ paddingLeft: '38px', width: '100%', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
        />
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 12px' }} />
            <div style={{ color: '#9ca3af', fontSize: '13px' }}>Oylik hisobotlari yuklanmoqda...</div>
          </div>
        ) : filteredPayrolls.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
            <DollarSign size={36} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
            <div>Ushbu oy ({periodMonth}) uchun hisob-kitoblar mavjud emas.</div>
            {role === 'Admin' && (
              <button onClick={handleRecalculateAll} className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }}>
                Hisoblashni Boshlash
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '14px 18px', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase' }}>O'qituvchi</th>
                  <th style={{ padding: '14px 18px', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase' }}>Kompensatsiya Turi</th>
                  <th style={{ padding: '14px 18px', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase' }}>O'quvchilar</th>
                  <th style={{ padding: '14px 18px', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase' }}>Jami Tushum</th>
                  <th style={{ padding: '14px 18px', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase' }}>Asosiy Maosh</th>
                  <th style={{ padding: '14px 18px', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase' }}>Bonus / Chegirma</th>
                  <th style={{ padding: '14px 18px', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase' }}>To'lanadigan Summa</th>
                  <th style={{ padding: '14px 18px', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase' }}>Holati</th>
                  {role === 'Admin' && (
                    <th style={{ padding: '14px 18px', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase', textAlign: 'right' }}>Amal</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredPayrolls.map((p) => {
                  const isPaid = p.statusText === 'To\'langan' || p.status === 2;
                  return (
                    <tr
                      key={p.id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s ease' }}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 800, color: '#fff', fontSize: '14px' }}>{p.teacherName}</div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>{p.teacherPhone || p.teacherEmail}</div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'rgba(56, 189, 248, 0.1)',
                            border: '1px solid rgba(56, 189, 248, 0.2)',
                            color: '#38bdf8',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700
                          }}
                        >
                          <Percent size={11} /> {p.compensationTypeName}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#e5e7eb', fontSize: '13px' }}>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{p.activeStudentsCount}</span> ta faol
                      </td>
                      <td style={{ padding: '14px 18px', color: '#9ca3af', fontSize: '13px' }}>
                        {p.totalRevenueGenerated.toLocaleString()} UZS
                      </td>
                      <td style={{ padding: '14px 18px', color: '#e5e7eb', fontSize: '13px' }}>
                        {p.baseAmount.toLocaleString()} UZS
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '12px' }}>
                        {p.bonus > 0 && <span style={{ color: '#34d399', display: 'block' }}>+{p.bonus.toLocaleString()} UZS</span>}
                        {p.deductions > 0 && <span style={{ color: '#f87171', display: 'block' }}>-{p.deductions.toLocaleString()} UZS</span>}
                        {p.bonus === 0 && p.deductions === 0 && <span style={{ color: '#6b7280' }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontWeight: 900, color: '#34d399', fontSize: '15px' }}>
                          {p.finalAmount.toLocaleString()} UZS
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span className={isPaid ? 'badge badge-emerald' : 'badge badge-amber'} style={{ fontSize: '11px' }}>
                          {p.statusText}
                        </span>
                      </td>
                      {role === 'Admin' && (
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          {!isPaid ? (
                            <button
                              onClick={() => handleOpenPay(p)}
                              className="btn btn-primary btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                            >
                              <CheckCircle size={14} /> To'lash
                            </button>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                              {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : 'To\'langan'}
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pay Teacher Modal */}
      {payingPayroll && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>
                Maoshni To'langan deb belgilash
              </h3>
              <button onClick={() => setPayingPayroll(null)} className="btn btn-ghost btn-sm" style={{ padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>{payingPayroll.teacherName}</div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>{payingPayroll.periodMonth} oyi uchun hisoblangan summa:</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#34d399', marginTop: '4px' }}>
                {payingPayroll.baseAmount.toLocaleString()} UZS
              </div>
            </div>

            <form onSubmit={handleConfirmPay} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
                  Bonus / Mukofot (UZS)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={payForm.bonus}
                  onChange={(e) => setPayForm({ ...payForm, bonus: parseFloat(e.target.value) || 0 })}
                  className="form-control"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
                  Chegirma / Jarima (UZS)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={payForm.deductions}
                  onChange={(e) => setPayForm({ ...payForm, deductions: parseFloat(e.target.value) || 0 })}
                  className="form-control"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
                  To'lov Izohi / Chek raqami
                </label>
                <input
                  type="text"
                  placeholder="masalan: Uzcard/Humo orqali o'tkazildi"
                  value={payForm.note}
                  onChange={(e) => setPayForm({ ...payForm, note: e.target.value })}
                  className="form-control"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
                />
              </div>

              <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '12px', borderRadius: '10px', marginTop: '6px' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>Yakuniy to'lanadigan summa:</span>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>
                  {(payingPayroll.baseAmount + (payForm.bonus || 0) - (payForm.deductions || 0)).toLocaleString()} UZS
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button type="button" onClick={() => setPayingPayroll(null)} className="btn btn-ghost">
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
                  To'lovni Tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
