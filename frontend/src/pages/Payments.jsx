import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Receipt, AlertCircle, CheckCircle2, Wallet, X, DollarSign } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Payments = () => {
  const { role, showToast } = useAuth();
  const [payments, setPayments] = useState([]);
  const [debts, setDebts] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'debts'

  // Record Payment Modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    studentId: '',
    amount: '',
    method: 'Card',
    note: ''
  });

  // Receipt Modal
  const [receiptPayment, setReceiptPayment] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const payRes = await api.payments.getAll();
      if (payRes?.data) setPayments(payRes.data);

      if (role === 'Admin') {
        const [debtsRes, stdRes] = await Promise.all([
          api.payments.getDebts(),
          api.users.getAll({ role: 'Student', pageSize: 100 })
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
      await api.payments.create({
        studentId: form.studentId,
        amount: parseFloat(form.amount),
        method: form.method,
        note: form.note
      });
      showToast('To\'lov muvaffaqiyatli qabul qilindi', 'success');
      setShowModal(false);
      setForm({ studentId: '', amount: '', method: 'Card', note: '' });
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString('uz-UZ') + " so'm";
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

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Moliya & To'lovlar Tizimi</h1>
          <p className="page-subtitle">O'quv to'lovlari hisobi, kvitansiyalar va qarzdorlik hisobotlari</p>
        </div>
        {role === 'Admin' && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>To'lovni Qayd Etish</span>
          </button>
        )}
      </div>

      {/* Tabs for Admin */}
      {role === 'Admin' && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('history')}
            className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Receipt size={16} />
            <span>To'lovlar Tarixi</span>
          </button>
          <button
            onClick={() => setActiveTab('debts')}
            className={`btn btn-sm ${activeTab === 'debts' ? 'btn-amber' : 'btn-secondary'}`}
          >
            <AlertCircle size={16} />
            <span>Qarzdorlik Hisoboti</span>
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner" />
        </div>
      ) : activeTab === 'history' ? (
        /* Payments Table */
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>O'quvchi</th>
                  <th>Summa</th>
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
                      To'lovlar topilmadi
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
      ) : (
        /* Debts Report Table (Admin) */
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>O'quvchi</th>
                  <th>Guruhlar Soni</th>
                  <th>Jami Shartnoma Narxi</th>
                  <th>To'langan Summa</th>
                  <th>Qoldiq Qarzdorlik</th>
                  <th>Holat</th>
                </tr>
              </thead>
              <tbody>
                {debts.map((d) => (
                  <tr key={d.studentId}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{d.studentName}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>{d.studentEmail}</div>
                    </td>
                    <td>
                      <span className="badge badge-violet">{d.activeEnrollmentsCount} ta guruh</span>
                    </td>
                    <td style={{ color: '#d1d5db' }}>{formatCurrency(d.totalCourseFee)}</td>
                    <td style={{ color: '#10b981', fontWeight: 700 }}>{formatCurrency(d.totalPaid)}</td>
                    <td style={{ color: d.remainingDebt > 0 ? '#fb7185' : '#34d399', fontWeight: 800 }}>
                      {formatCurrency(d.remainingDebt)}
                    </td>
                    <td>
                      {d.remainingDebt === 0 ? (
                        <span className="badge badge-emerald">To'liq to'langan</span>
                      ) : (
                        <span className="badge badge-rose">Qarzdor</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">To'lov Qabul Qilish</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreatePayment}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Talaba *</label>
                  <select
                    required
                    value={form.studentId}
                    onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                    className="form-select"
                  >
                    <option value="">Talabani tanlang...</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.fullName} ({s.email})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">To'lov Summasi (UZS) *</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="Masalan: 1500000"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">To'lov Usuli</label>
                  <select
                    value={form.method}
                    onChange={(e) => setForm({ ...form, method: e.target.value })}
                    className="form-select"
                  >
                    <option value="Card">Bank Plastik Kartasi (Humo / UzCard)</option>
                    <option value="Cash">Naqd Pul (Kassa)</option>
                    <option value="BankTransfer">Bank O'tkazmasi (Hisob raqam)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Izoh</label>
                  <input
                    type="text"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="Masalan: 1-oy to'lovi yoki shartnoma raqami"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-primary">
                  To'lovni Saqlash
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

            <div className="modal-body" style={{ padding: '30px 24px' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34d399',
                  marginBottom: '16px'
                }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#10b981', margin: '0 0 4px 0' }}>
                {formatCurrency(receiptPayment.amount)}
              </h2>
              <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '24px' }}>
                To'lov Muvaffaqiyatli Tasdiqlandi
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'left', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                  <span style={{ color: '#9ca3af' }}>Tranzaksiya ID:</span>
                  <span style={{ fontFamily: 'monospace', color: '#6b7280', fontSize: '11px' }}>{receiptPayment.id}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button onClick={() => setReceiptPayment(null)} className="btn btn-primary" style={{ width: '100%' }}>
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
