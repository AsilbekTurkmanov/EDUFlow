import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  PhoneCall,
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  TrendingDown,
  Calendar,
  CreditCard,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const StudentRisks = () => {
  const { showToast } = useAuth();
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRisks();
  }, []);

  const fetchRisks = async () => {
    setLoading(true);
    try {
      const res = await api.risks.getAll();
      if (res?.data) {
        setRisks(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCallParent = (student) => {
    const phone = student.parentPhone || student.phone;
    if (phone) {
      window.open(`tel:${phone.replace(/\s+/g, '')}`);
    } else {
      showToast('Ota-onaning telefon raqami kiritilmagan!', 'warning');
    }
  };

  const handleSendWarning = (student) => {
    showToast(`${student.studentName} va uning ota-onasiga SMS ogohlantirish yuborildi!`, 'success');
  };

  const highCount = risks.filter((r) => r.riskLevel === 2 || r.riskLevelText?.includes('Yuqori')).length;
  const mediumCount = risks.filter((r) => r.riskLevel === 1 || r.riskLevelText?.includes('O\'rtacha')).length;
  const lowCount = risks.filter((r) => r.riskLevel === 0 || r.riskLevelText?.includes('Barqaror')).length;

  const filteredRisks = risks.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.groupName.toLowerCase().includes(search.toLowerCase()) ||
      (r.phone && r.phone.includes(search));

    if (!matchesSearch) return false;

    if (filterLevel === 'HIGH') return r.riskLevel === 2 || r.riskLevelText?.includes('Yuqori');
    if (filterLevel === 'MEDIUM') return r.riskLevel === 1 || r.riskLevelText?.includes('O\'rtacha');
    if (filterLevel === 'LOW') return r.riskLevel === 0 || r.riskLevelText?.includes('Barqaror');
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={28} color="#f87171" /> O'quvchilar Xavf Tahlili (Dropout Risk Engine)
        </h1>
        <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
          Davomat pasayishi, to'lov kechikishi va vazifalar topshirilmasligi asosida o'qishni tashlab ketish xavfi bor o'quvchilarni oldindan aniqlash.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div
          onClick={() => setFilterLevel(filterLevel === 'HIGH' ? 'ALL' : 'HIGH')}
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(15, 23, 42, 0.6) 100%)',
            border: `1px solid ${filterLevel === 'HIGH' ? '#f87171' : 'rgba(239, 68, 68, 0.3)'}`,
            padding: '18px',
            borderRadius: '16px',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', marginBottom: '8px' }}>
            <AlertTriangle size={18} />
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>Yuqori Xavf (Chora ko'rish zarur)</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff' }}>
            {highCount} <span style={{ fontSize: '13px', color: '#9ca3af' }}>nafar talaba</span>
          </div>
        </div>

        <div
          onClick={() => setFilterLevel(filterLevel === 'MEDIUM' ? 'ALL' : 'MEDIUM')}
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)',
            border: `1px solid ${filterLevel === 'MEDIUM' ? '#fbbf24' : 'rgba(245, 158, 11, 0.3)'}`,
            padding: '18px',
            borderRadius: '16px',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', marginBottom: '8px' }}>
            <TrendingDown size={18} />
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>O'rtacha Xavf (Nazoratda)</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff' }}>
            {mediumCount} <span style={{ fontSize: '13px', color: '#9ca3af' }}>nafar talaba</span>
          </div>
        </div>

        <div
          onClick={() => setFilterLevel(filterLevel === 'LOW' ? 'ALL' : 'LOW')}
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)',
            border: `1px solid ${filterLevel === 'LOW' ? '#34d399' : 'rgba(16, 185, 129, 0.3)'}`,
            padding: '18px',
            borderRadius: '16px',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', marginBottom: '8px' }}>
            <CheckCircle2 size={18} />
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>Barqaror O'quvchilar</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff' }}>
            {lowCount} <span style={{ fontSize: '13px', color: '#9ca3af' }}>nafar talaba</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="O'quvchi ismi yoki telefoni..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '38px', width: '100%', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setFilterLevel('ALL')}
            className={`btn btn-sm ${filterLevel === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Barchasi ({risks.length})
          </button>
          <button
            onClick={() => setFilterLevel('HIGH')}
            className={`btn btn-sm ${filterLevel === 'HIGH' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ color: '#f87171' }}
          >
            Faqat Yuqori Xavf ({highCount})
          </button>
        </div>
      </div>

      {/* Risk Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 12px' }} />
            <div style={{ color: '#9ca3af', fontSize: '13px' }}>O'quvchilar tahlil qilinmoqda...</div>
          </div>
        ) : filteredRisks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
            <CheckCircle2 size={36} style={{ opacity: 0.3, margin: '0 auto 12px', color: '#34d399' }} />
            <div>Tanlangan filtr bo'yicha xavf aniqlanmadi. Barcha talabalar faol!</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '14px 18px', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase' }}>O'quvchi</th>
                  <th style={{ padding: '14px 18px', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase' }}>Guruh / Kurs</th>
                  <th style={{ padding: '14px 18px', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase' }}>Davomat</th>
                  <th style={{ padding: '14px 18px', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase' }}>Qarzdorlik</th>
                  <th style={{ padding: '14px 18px', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase' }}>Xavf Darajasi</th>
                  <th style={{ padding: '14px 18px', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase' }}>Aniqlangan Omillar</th>
                  <th style={{ padding: '14px 18px', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase' }}>Tavsiya & Amal</th>
                </tr>
              </thead>
              <tbody>
                {filteredRisks.map((item) => {
                  const isHigh = item.riskLevel === 2 || item.riskLevelText?.includes('Yuqori');
                  const isMed = item.riskLevel === 1 || item.riskLevelText?.includes('O\'rtacha');

                  return (
                    <tr
                      key={item.studentId}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        background: isHigh ? 'rgba(239, 68, 68, 0.03)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 800, color: '#fff', fontSize: '14px' }}>{item.studentName}</div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>Tel: {item.phone || '—'}</div>
                        {item.parentPhone && (
                          <div style={{ fontSize: '11px', color: '#38bdf8' }}>Ota-onasi: {item.parentPhone}</div>
                        )}
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: '#e5e7eb', fontSize: '13px' }}>{item.groupName}</div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>{item.courseName}</div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            fontWeight: 800,
                            color: item.attendanceRate < 60 ? '#f87171' : item.attendanceRate < 80 ? '#fbbf24' : '#34d399'
                          }}
                        >
                          {item.attendanceRate}%
                        </span>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>{item.missedLessonsCount} dars qoldirilgan</div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        {item.overdueDebt > 0 ? (
                          <span style={{ fontWeight: 800, color: '#f87171', fontSize: '13px' }}>
                            -{item.overdueDebt.toLocaleString()} UZS
                          </span>
                        ) : (
                          <span style={{ color: '#34d399', fontSize: '12px', fontWeight: 600 }}>Qarzi yo'q</span>
                        )}
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span
                            className={isHigh ? 'badge badge-danger' : isMed ? 'badge badge-amber' : 'badge badge-emerald'}
                            style={{ fontSize: '11px' }}
                          >
                            {item.riskLevelText}
                          </span>
                          <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 700 }}>
                            {item.riskScore}/100
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ width: '110px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${item.riskScore}%`,
                              height: '100%',
                              background: isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#10b981'
                            }}
                          />
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px', maxWidth: '240px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {item.riskFactors.map((f, idx) => (
                            <span
                              key={idx}
                              style={{
                                background: 'rgba(255,255,255,0.05)',
                                color: '#d1d5db',
                                fontSize: '10px',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}
                            >
                              • {f}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '8px', lineHeight: 1.3 }}>
                          {item.recommendedAction}
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleCallParent(item)}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '4px 8px' }}
                            title="Ota-onasiga qo'ng'iroq qilish"
                          >
                            <PhoneCall size={12} /> Qo'ng'iroq
                          </button>

                          <button
                            onClick={() => handleSendWarning(item)}
                            className="btn btn-ghost btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '4px 8px', color: '#38bdf8' }}
                            title="SMS ogohlantirish yuborish"
                          >
                            <MessageSquare size={12} /> SMS
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRisks;
