import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Wallet,
  X,
  DollarSign,
  TrendingUp,
  BarChart3,
  Phone,
  Calendar,
  Sparkles,
  Search,
  Download
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Payments = () => {
  const { role, user, showToast } = useAuth();
  const [payments, setPayments] = useState([]);
  const [debts, setDebts] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(role === 'Student' ? 'myPayments' : 'history'); // 'history' | 'debts' | 'analytics' | 'myPayments'
  const [searchQuery, setSearchQuery] = useState('');

  // Record Payment Modal (for Admin & Student self-payment)
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    studentId: '',
    amount: '800000',
    method: 'Card',
    note: ''
  });

  // Receipt Modal
  const [receiptPayment, setReceiptPayment] = useState(null);

  useEffect(() => {
    loadData();
  }, [role]);

  const loadData = async () => {
    setLoading(true);
    try {
      const payRes = await api.payments.getAll();
      if (payRes?.data) setPayments(payRes.data);

      if (role === 'Admin') {
        const [debtsRes, stdRes] = await Promise.all([
          api.payments.getDebts(),
          api.users.getAll({ role: 'Student', pageSize: 150 })
        ]);
        if (debtsRes?.data) setDebts(debtsRes.data);
        if (stdRes?.data?.items) setStudents(stdRes.data.items);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    try {
      const targetStudentId = role === 'Student' ? user.id : form.studentId;
      await api.payments.create({
        studentId: targetStudentId,
        amount: parseFloat(form.amount),
        method: form.method,
        note: form.note || (role === 'Student' ? "O'quvchi tomonidan o'tkazilgan to'lov" : "Ma'muriyat tomonidan qayd etilgan to'lov")
      });

      showToast('To\'lov muvaffaqiyatli qabul qilindi!', 'success');
      setShowModal(false);
      setForm({ studentId: '', amount: '800000', method: 'Card', note: '' });
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Student specific balance data
  const studentTotalPaid = payments.reduce((sum, p) => sum + (p.status === 'Completed' ? Number(p.amount) : 0), 0);
  const studentBalance = user?.balance ?? (studentTotalPaid - 800000);

  // Filtered debts for Admin search
  const filteredDebts = (debts || []).filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const sName = (d?.studentName || '').toLowerCase();
    const sPhone = (d?.studentPhone || '').toLowerCase();
    const pPhone = (d?.parentPhone || '').toLowerCase();
    return sName.includes(q) || sPhone.includes(q) || pPhone.includes(q);
  });

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Moliya & To'lovlar Tizimi</h1>
          <p className="page-subtitle">
            Oylik to'lov 800 000 so'm, talaba hisob-kitobi va tushumlar analitikasi
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              studentId: role === 'Student' ? user.id : (students[0]?.id || ''),
              amount: '800000',
              method: 'Card',
              note: ''
            });
            setShowModal(true);
          }}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <CreditCard size={18} />
          <span>{role === 'Student' ? 'To\'lov Qilish' : 'To\'lovni Qayd Etish'}</span>
        </button>
      </div>

      {/* STUDENT HERO FINANCIAL BANNER */}
      {role === 'Student' && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '24px',
            padding: '28px',
            marginBottom: '28px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-emerald">Oylik To'lov Tizimi</span>
                <span style={{ fontSize: '13px', color: '#9ca3af' }}>Shartnoma bo'yicha</span>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: 0 }}>
                {user?.fullName} &mdash; Shaxsiy Balansingiz
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '6px' }}>
                Oylik o'quv to'lovi: <strong style={{ color: '#fff' }}>800 000 so'm</strong>. Har oy hisobingizdan ushbu summa yechib boriladi.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              {/* Balance Box */}
              <div
                style={{
                  background: studentBalance >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                  border: `2px solid ${studentBalance >= 0 ? '#10b981' : '#fb7185'}`,
                  borderRadius: '18px',
                  padding: '16px 24px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: studentBalance >= 0 ? '#34d399' : '#fb7185', letterSpacing: '0.5px' }}>
                  Joriy Balans
                </div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: studentBalance >= 0 ? '#10b981' : '#fb7185', marginTop: '4px' }}>
                  {formatBalance(studentBalance)}
                </div>
                <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>
                  {studentBalance > 0
                    ? 'Oldindan to\'langan summa'
                    : studentBalance === 0
                    ? 'To\'liq to\'langan (qarz yo\'q)'
                    : 'To\'lanmagan oylik qarzdorlik'}
                </div>
              </div>

              {/* Make Payment Action Button */}
              <button
                onClick={() => {
                  setForm({
                    studentId: user.id,
                    amount: '800000',
                    method: 'Card',
                    note: ''
                  });
                  setShowModal(true);
                }}
                className="btn btn-primary"
                style={{ padding: '16px 24px', fontSize: '15px', fontWeight: 800 }}
              >
                <Plus size={18} />
                <span>Ixtiyoriy To'lov Qilish</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN TABS */}
      {role === 'Admin' && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('history')}
            className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Receipt size={16} />
            <span>To'lovlar Tarixi ({payments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('debts')}
            className={`btn btn-sm ${activeTab === 'debts' ? 'btn-amber' : 'btn-secondary'}`}
          >
            <AlertCircle size={16} />
            <span>Qarzdorlik & Balans Hisoboti ({debts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`btn btn-sm ${activeTab === 'analytics' ? 'btn-emerald' : 'btn-secondary'}`}
          >
            <BarChart3 size={16} />
            <span>Oylik Tushumlar Diagrammasi</span>
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner" />
        </div>
      ) : activeTab === 'history' || role === 'Student' ? (
        /* PAYMENTS TABLE */
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>O'quvchi</th>
                  <th>To'lov Summasi</th>
                  <th>To'lov Usuli</th>
                  <th>Status</th>
                  <th>Sana</th>
                  <th>Izoh</th>
                  <th style={{ textAlign: 'right' }}>Kvitansiya</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                      To'lovlar tarixi mavjud emas
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{p.studentName}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>{p.studentEmail}</div>
                      </td>
                      <td style={{ color: '#10b981', fontWeight: 800, fontSize: '15px' }}>
                        {formatCurrency(p.amount)}
                      </td>
                      <td>
                        <span className="badge badge-slate">{p.method}</span>
                      </td>
                      <td>
                        <span className="badge badge-emerald">{p.status}</span>
                      </td>
                      <td style={{ fontSize: '13px', color: '#9ca3af' }}>{formatDate(p.paidAt)}</td>
                      <td style={{ fontSize: '13px', color: '#d1d5db' }}>{p.note || '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setReceiptPayment(p)}
                          className="btn btn-secondary btn-sm"
                        >
                          <Receipt size={14} />
                          <span>Chek</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'debts' ? (
        /* DEBTS & BALANCE TABLE (SUPER ADMIN) */
        <div>
          {/* Search bar for debts */}
          <div className="card" style={{ marginBottom: '16px', padding: '14px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Search size={16} color="#9ca3af" />
              <input
                type="text"
                placeholder="Talaba ismi, telefoni yoki ota-onasi raqami bo'yicha qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
              />
            </div>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>O'quvchi</th>
                    <th>Telefon & Ota-ona</th>
                    <th>Oylik To'lov</th>
                    <th>Jami To'lagan</th>
                    <th>Balans Holati</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Amal</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDebts.map((d) => (
                    <tr key={d.studentId}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{d.studentName}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>{d.studentEmail}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '13px', color: '#d1d5db' }}>
                          📞 {d.studentPhone || '—'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#fbbf24', marginTop: '2px' }}>
                          👨‍👩‍👦 Ota-onasi: <strong>{d.parentPhone || '—'}</strong>
                        </div>
                      </td>
                      <td style={{ color: '#d1d5db', fontWeight: 600 }}>
                        {formatCurrency(d.monthlyFee)}
                      </td>
                      <td style={{ color: '#10b981', fontWeight: 700 }}>
                        {formatCurrency(d.totalPaid)}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '14px',
                            fontWeight: 800,
                            color: d.balance > 0 ? '#10b981' : d.balance === 0 ? '#34d399' : '#fb7185'
                          }}
                        >
                          {formatBalance(d.balance)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            d.balance > 0
                              ? 'badge-emerald'
                              : d.balance === 0
                              ? 'badge-emerald'
                              : 'badge-rose'
                          }`}
                        >
                          {d.statusText}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            setForm({
                              studentId: d.studentId,
                              amount: '800000',
                              method: 'Card',
                              note: `${d.studentName} oylik to'lovi`
                            });
                            setShowModal(true);
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          <Plus size={13} />
                          <span>To'lov olish</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ANALYTICS DIAGRAM VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="stat-grid">
            <div className="stat-card">
              <div>
                <div className="stat-label">Jami Tushum</div>
                <div className="stat-value" style={{ color: '#10b981' }}>
                  {formatCurrency(debts.reduce((s, d) => s + Number(d.totalPaid), 0))}
                </div>
              </div>
              <div className="stat-icon emerald">
                <TrendingUp size={24} />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">To'liq To'langanlar</div>
                <div className="stat-value" style={{ color: '#34d399' }}>
                  {debts.filter((d) => d.balance >= 0).length} nafar
                </div>
              </div>
              <div className="stat-icon emerald">
                <CheckCircle2 size={24} />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">Qarzdor O'quvchilar (-800k)</div>
                <div className="stat-value" style={{ color: '#fb7185' }}>
                  {debts.filter((d) => d.balance < 0).length} nafar
                </div>
              </div>
              <div className="stat-icon rose">
                <AlertCircle size={24} />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">9 Oylik Oldindan To'laganlar</div>
                <div className="stat-value" style={{ color: '#a78bfa' }}>
                  {debts.filter((d) => d.balance > 800000).length} nafar
                </div>
              </div>
              <div className="stat-icon violet">
                <Sparkles size={24} />
              </div>
            </div>
          </div>

          {/* Monthly Revenue Chart Diagram */}
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} color="#10b981" /> Oylik To'lovlar Dinamikasi (Diagramma)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px', alignItems: 'flex-end', minHeight: '220px', padding: '20px 0' }}>
              {[
                { month: 'Aprel', amount: 38400000, height: '60%' },
                { month: 'May', amount: 43200000, height: '70%' },
                { month: 'Iyun', amount: 46800000, height: '78%' },
                { month: 'Iyul', amount: 49600000, height: '82%' },
                { month: 'Avgust', amount: 55200000, height: '90%' },
                { month: 'Sentabr', amount: 64800000, height: '100%' }
              ].map((m) => (
                <div key={m.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>
                    {formatCurrency(m.amount)}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '60px',
                      height: m.height,
                      background: 'linear-gradient(180deg, #10b981 0%, rgba(16, 185, 129, 0.2) 100%)',
                      borderRadius: '8px 8px 0 0',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                      transition: 'height 0.4s ease'
                    }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                    {m.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL (ANY AMOUNT CUSTOM PAYMENT) */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {role === 'Student' ? 'O\'quv To\'lovini Amalga Oshirish' : 'To\'lovni Qayd Etish'}
              </h3>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePayment}>
              <div className="modal-body">
                {/* Notice banner */}
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    marginBottom: '18px',
                    fontSize: '13px',
                    color: '#d1fae5'
                  }}
                >
                  Oylik to'lov shartnomasi: <strong>800 000 so'm</strong>. Siz istalgan summani kiritishingiz mumkin (1 oylik, 9 oylik yoki ixtiyoriy summa).
                </div>

                {role === 'Admin' && (
                  <div className="form-group">
                    <label className="form-label">Talabani Tanlang *</label>
                    <select
                      required
                      value={form.studentId}
                      onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                      className="form-select"
                    >
                      <option value="">Talabani tanlang...</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.fullName} ({s.phone || s.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Amount with Quick Presets */}
                <div className="form-group">
                  <label className="form-label">To'lov Summasi (UZS) *</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="800000"
                    className="form-input"
                    style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}
                  />

                  {/* Quick Preset Buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, amount: '800000', note: '1 oylik to\'lov' })}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '11px', padding: '6px' }}
                    >
                      800 ming (1 oy)
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, amount: '2400000', note: '3 oylik to\'lov' })}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '11px', padding: '6px' }}
                    >
                      2.4 mln (3 oy)
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, amount: '7200000', note: '9 oylik to\'liq kurs to\'lovi' })}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '11px', padding: '6px', color: '#a78bfa', borderColor: 'rgba(139, 92, 246, 0.4)' }}
                    >
                      7.2 mln (9 oylik)
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">To'lov Usuli</label>
                  <select
                    value={form.method}
                    onChange={(e) => setForm({ ...form, method: e.target.value })}
                    className="form-select"
                  >
                    <option value="Card">Bank Plastik Kartasi (Humo / UzCard / Visa)</option>
                    <option value="Cash">Naqd Pul (Kassa orqali)</option>
                    <option value="BankTransfer">Bank O'tkazmasi (Hisob raqam orqali)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Izoh</label>
                  <input
                    type="text"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="Masalan: Sentabr oyi to'lovi yoki shartnoma raqami"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 800 }}>
                  To'lovni Tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT / CHEQUE MODAL */}
      {receiptPayment && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div className="modal-header" style={{ justifyContent: 'center', position: 'relative' }}>
              <h3 className="modal-title">To'lov Kvitansiyasi</h3>
              <button
                onClick={() => setReceiptPayment(null)}
                className="btn btn-ghost btn-icon"
                style={{ position: 'absolute', right: '16px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '26px 20px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34d399',
                  marginBottom: '16px'
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#10b981', margin: '0 0 4px 0' }}>
                {formatCurrency(receiptPayment.amount)}
              </h2>
              <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '24px' }}>
                EduFlow To'lov Tizimi Cheki Tasdiqlandi
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '16px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  textAlign: 'left',
                  fontSize: '13px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9ca3af' }}>Talaba:</span>
                  <strong style={{ color: '#fff' }}>{receiptPayment.studentName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9ca3af' }}>To'lov Usuli:</span>
                  <span className="badge badge-slate">{receiptPayment.method}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9ca3af' }}>Sana:</span>
                  <span style={{ color: '#d1d5db' }}>{formatDate(receiptPayment.paidAt)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9ca3af' }}>Izoh:</span>
                  <span style={{ color: '#34d399' }}>{receiptPayment.note || 'Oylik to\'lov'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9ca3af' }}>Tranzaksiya ID:</span>
                  <span style={{ fontFamily: 'monospace', color: '#6b7280', fontSize: '11px' }}>
                    {receiptPayment.id}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button
                onClick={() => {
                  window.print();
                }}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={14} />
                <span>Chop etish / PDF</span>
              </button>
              <button onClick={() => setReceiptPayment(null)} className="btn btn-primary">
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
