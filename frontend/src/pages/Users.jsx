import React, { useState, useEffect } from 'react';
import {
  Users as UsersIcon,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Filter,
  GraduationCap,
  Phone,
  BarChart3,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Percent,
  Wallet,
  Eye,
  AlertCircle,
  Building2,
  ShieldAlert,
  Settings2,
  Sliders,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Users = ({ initialCenterId = 'ALL', setTab }) => {
  const { showToast, role } = useAuth();
  const [users, setUsers] = useState([]);
  const [centers, setCenters] = useState([]);
  const [selectedCenterId, setSelectedCenterId] = useState(initialCenterId);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'teachers' | 'all'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Selected student for detailed analytics modal
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Selected teacher for students list modal
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Teacher compensation configuration modal
  const [showCompensationModal, setShowCompensationModal] = useState(false);
  const [selectedTeacherForCompensation, setSelectedTeacherForCompensation] = useState(null);
  const [compensationForm, setCompensationForm] = useState({
    compensationType: 'Percentage',
    customSharePercentage: 70,
    fixedType: 'FixedPerStudent',
    fixedAmount: 400000
  });
  const [compensationSaving, setCompensationSaving] = useState(false);

  // Create & Edit Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    role: 'Student',
    phone: '',
    parentPhone: '',
    experienceYears: 0,
    centerId: ''
  });

  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    username: '',
    role: 'Student',
    status: 'Active',
    phone: '',
    parentPhone: '',
    experienceYears: 0,
    centerId: '',
    newPassword: ''
  });

  useEffect(() => {
    if (initialCenterId) {
      setSelectedCenterId(initialCenterId);
    }
  }, [initialCenterId]);

  useEffect(() => {
    api.centers.getAll().then(r => {
      if (r?.data) {
        setCenters(r.data);
        if (!createForm.centerId && r.data.length > 0) {
          setCreateForm(prev => ({ ...prev, centerId: r.data[0].id }));
        }
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, activeTab, selectedCenterId]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, pageSize: 35 };
      if (activeTab === 'students') params.role = 'Student';
      else if (activeTab === 'teachers') params.role = 'Teacher';
      if (search) params.search = search;

      const res = await api.users.getAll(params);
      if (res?.data) {
        let items = res.data.items || [];
        if (selectedCenterId && selectedCenterId !== 'ALL') {
          items = items.filter(u => u.centerId === selectedCenterId);
        }
        setUsers(items);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const targetCenterId = createForm.centerId || (selectedCenterId !== 'ALL' ? selectedCenterId : centers[0]?.id);
      const targetCenter = centers.find(c => c.id === targetCenterId);

      if (createForm.role === 'Student' && targetCenter && (targetCenter.isBlocked || targetCenter.activeStudentsCount >= targetCenter.maxStudentsQuota)) {
        showToast(`❌ DIQQAT: "${targetCenter.name}" markazi kvotasi to'lgan (${targetCenter.activeStudentsCount}/${targetCenter.maxStudentsQuota}). Yangi o'quvchi qo'shish bloklangan!`, 'error');
        return;
      }

      await api.users.create({ ...createForm, centerId: targetCenterId });
      showToast('Foydalanuvchi muvaffaqiyatli qo\'shildi', 'success');
      setShowCreateModal(false);
      setCreateForm({
        fullName: '',
        email: '',
        username: '',
        password: '',
        role: 'Student',
        phone: '',
        parentPhone: '',
        experienceYears: 0,
        centerId: centers[0]?.id || ''
      });
      fetchUsers();
      // refresh centers to get updated quotas
      api.centers.getAll().then(r => r?.data && setCenters(r.data)).catch(() => {});
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await api.users.update(currentUser.id, editForm);
      showToast('Foydalanuvchi ma\'lumotlari yangilandi', 'success');
      setShowEditModal(false);
      setCurrentUser(null);
      fetchUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`${name} ni o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await api.users.delete(id);
      showToast('Foydalanuvchi o\'chirildi', 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openEdit = (u) => {
    setCurrentUser(u);
    setEditForm({
      fullName: u.fullName,
      email: u.email,
      username: u.username || '',
      role: u.role,
      status: u.status,
      phone: u.phone || '',
      parentPhone: u.parentPhone || '',
      experienceYears: u.experienceYears || 0,
      newPassword: ''
    });
    setShowEditModal(true);
  };

  const openCompensationModal = (t) => {
    setSelectedTeacherForCompensation(t);
    const expPct = t.experienceYears >= 3 ? 70 : (t.experienceYears >= 2 ? 60 : (t.experienceYears >= 1 ? 50 : 40));
    const compType = t.compensationType || 'Percentage';
    const isFixedMonthly = compType === 'FixedMonthly';
    setCompensationForm({
      compensationType: compType,
      customSharePercentage: t.customSharePercentage || t.sharePercentage || expPct,
      fixedType: isFixedMonthly ? 'FixedMonthly' : 'FixedPerStudent',
      fixedAmount: t.fixedAmount || (isFixedMonthly ? 8000000 : 400000)
    });
    setShowCompensationModal(true);
  };

  const handleSaveCompensation = async (e) => {
    e.preventDefault();
    if (!selectedTeacherForCompensation) return;
    setCompensationSaving(true);
    try {
      const type = compensationForm.compensationType === 'Percentage'
        ? 'Percentage'
        : compensationForm.fixedType;

      const payload = {
        compensationType: type,
        customSharePercentage: type === 'Percentage' ? Number(compensationForm.customSharePercentage) : null,
        fixedAmount: type !== 'Percentage' ? Number(compensationForm.fixedAmount) : null
      };

      await api.users.updateCompensation(selectedTeacherForCompensation.id, payload);
      showToast("O'qituvchi ulush va maosh parametrlari muvaffaqiyatli saqlandi!", 'success');
      setShowCompensationModal(false);
      fetchUsers();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCompensationSaving(false);
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

  const activeCenter = centers.find(c => c.id === selectedCenterId);

  return (
    <div>
      {/* QUOTA WARNING / BLOCK ALERT BANNER */}
      {activeCenter && (activeCenter.isBlocked || activeCenter.isQuotaExceeded) && (
        <div style={{ background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.35)', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#f43f5e', color: '#fff', padding: '8px', borderRadius: '8px', display: 'flex' }}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#fff' }}>
                🚫 DIQQAT: "{activeCenter.name}" kvotasi to'lgan ({activeCenter.activeStudentsCount} / {activeCenter.maxStudentsQuota} ta o'quvchi)!
              </div>
              <div style={{ fontSize: '13px', color: '#fb7185', marginTop: '2px' }}>
                Tizim avtomatik ravishda ushbu markazga yangi o'quvchi qo'shishni blokladi. Yangi o'quvchi qabul qilish uchun tarifni oshiring.
              </div>
            </div>
          </div>
          {setTab && (
            <button onClick={() => setTab('centers')} className="btn btn-danger btn-sm">
              <Sparkles size={14} /> <span>Tarifni Oshirish (Upgrade)</span>
            </button>
          )}
        </div>
      )}

      {activeCenter && !activeCenter.isBlocked && !activeCenter.isQuotaExceeded && activeCenter.quotaUsagePercentage >= 90 && (
        <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: '12px', padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#f59e0b', color: '#fff', padding: '8px', borderRadius: '8px', display: 'flex' }}>
              <AlertCircle size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '14px', color: '#fff' }}>
                ⚡ OGOHLANTIRISH: "{activeCenter.name}" kvotasi deyarli to'ldi ({activeCenter.activeStudentsCount} / {activeCenter.maxStudentsQuota} ta - {activeCenter.quotaUsagePercentage}%)!
              </div>
              <div style={{ fontSize: '12px', color: '#fcd34d', marginTop: '2px' }}>
                Atigi {activeCenter.remainingQuota} ta bo'sh o'rin qoldi. Tez orada limit to'ladi.
              </div>
            </div>
          </div>
          {setTab && (
            <button onClick={() => setTab('centers')} className="btn btn-amber btn-sm">
              <Sparkles size={14} /> <span>Tarifni Oshirish</span>
            </button>
          )}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Super Admin Boshqaruvi & Analitika</h1>
          <p className="page-subtitle">
            O'quvchilar ro'yxati, ota-onalar kontaktlari, oylik to'lovlar diagrammasi va o'qituvchilar maosh analitikasi
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)} 
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>Yangi Foydalanuvchi</span>
        </button>
      </div>

      {/* 3 Dedicated Top Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}
      >
        <button
          onClick={() => {
            setActiveTab('students');
            setPage(1);
          }}
          className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <GraduationCap size={18} />
          <span>O'quvchilar Ro'yxati & To'lov Analitikasi</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('teachers');
            setPage(1);
          }}
          className={`btn ${activeTab === 'teachers' ? 'btn-emerald' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Percent size={18} />
          <span>O'qituvchilar Ro'yxati & Maosh (70%) Analitikasi</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('all');
            setPage(1);
          }}
          className={`btn ${activeTab === 'all' ? 'btn-amber' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <UsersIcon size={18} />
          <span>Barcha Foydalanuvchilar Boshqaruvi</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '14px 20px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#6b7280' }} />
            <input
              type="text"
              placeholder={
                activeTab === 'students'
                  ? "O'quvchi ismi, username, telefoni yoki ota-onasi raqami bo'yicha qidirish..."
                  : activeTab === 'teachers'
                  ? "O'qituvchi ismi, staji yoki telefoni bo'yicha qidirish..."
                  : "Foydalanuvchi qidirish..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '38px', margin: 0 }}
            />
          </div>

          {/* Center Selector Dropdown */}
          <div style={{ minWidth: '240px' }}>
            <select
              value={selectedCenterId}
              onChange={(e) => {
                setSelectedCenterId(e.target.value);
                setPage(1);
              }}
              className="form-select"
              style={{ margin: 0 }}
            >
              <option value="ALL">🏢 Barcha O'quv Markazlari ({centers.length})</option>
              {centers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.isBlocked ? '🚫 (BLOK)' : `(${c.activeStudentsCount}/${c.maxStudentsQuota})`}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-secondary">
            <Filter size={16} />
            <span>Qidirish</span>
          </button>
        </form>
      </div>

      {/* 1. SEPARATE STUDENTS LIST & FINANCIAL ANALYTICS */}
      {activeTab === 'students' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>O'quvchi</th>
                  <th>Telefon & Ota-onasi</th>
                  <th>Guruhlari</th>
                  <th>Oylik To'lov</th>
                  <th>Balans Holati</th>
                  <th>Davomat Ko'rsatkichi</th>
                  <th>To'lov Statistikasi (Oylar)</th>
                  <th style={{ textAlign: 'right' }}>Batafsil</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                      <div className="spinner" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                      O'quvchilar topilmadi
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      {/* Name & Username */}
                      <td>
                        <div style={{ fontWeight: 800, color: '#fff' }}>{u.fullName}</div>
                        <div style={{ fontSize: '12px', color: '#10b981', fontFamily: 'monospace' }}>
                          @{u.username || u.email.split('@')[0]}
                        </div>
                        {u.centerName && (
                          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Building2 size={11} color="#34d399" />
                            <span>{u.centerName}</span>
                          </div>
                        )}
                      </td>

                      {/* Phone & Parent Phone */}
                      <td>
                        <div style={{ fontSize: '13px', color: '#d1d5db' }}>
                          📞 {u.phone || '—'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#fbbf24', marginTop: '3px', fontWeight: 600 }}>
                          👨‍👩‍👦 Ota-onasi: <strong>{u.parentPhone || '—'}</strong>
                        </div>
                      </td>

                      {/* Groups */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {u.groupNames && u.groupNames.length > 0 ? (
                            u.groupNames.map((g, idx) => (
                              <span key={idx} className="badge badge-slate" style={{ fontSize: '11px' }}>
                                {g}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>Biriktirilmagan</span>
                          )}
                        </div>
                      </td>

                      {/* Monthly Fee */}
                      <td>
                        <div style={{ color: '#d1d5db', fontWeight: 700 }}>
                          {formatCurrency(u.monthlyFee || 800000)}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                          Jami to'lagan: <strong style={{ color: '#10b981' }}>{formatCurrency(u.totalPaid)}</strong>
                        </div>
                      </td>

                      {/* Balance Status */}
                      <td>
                        <div
                          style={{
                            fontSize: '15px',
                            fontWeight: 900,
                            color: u.balance > 0 ? '#10b981' : u.balance === 0 ? '#34d399' : '#fb7185'
                          }}
                        >
                          {formatBalance(u.balance)}
                        </div>
                        <span
                          className={`badge ${
                            u.balance > 0
                              ? 'badge-emerald'
                              : u.balance === 0
                              ? 'badge-emerald'
                              : 'badge-rose'
                          }`}
                          style={{ marginTop: '4px' }}
                        >
                          {u.balance > 0 ? 'Oldindan to\'langan' : u.balance === 0 ? 'To\'langan' : 'Qarzdor'}
                        </span>
                      </td>

                      {/* Attendance breakdown */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                          <span title="Kelgan" style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}>
                            <CheckCircle2 size={12} /> {u.presentCount}
                          </span>
                          <span style={{ color: '#6b7280' }}>|</span>
                          <span title="Kechikkan" style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <Clock size={12} /> {u.lateCount}
                          </span>
                          <span style={{ color: '#6b7280' }}>|</span>
                          <span title="Kelmagan" style={{ color: '#fb7185', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <XCircle size={12} /> {u.absentCount}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '3px' }}>
                          Davomat: <strong style={{ color: u.attendanceRate >= 80 ? '#34d399' : '#fbbf24' }}>{u.attendanceRate}%</strong>
                        </div>
                      </td>

                      {/* Monthly Payment Stats Diagram (Mini Chart) */}
                      <td>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          {(u.monthlyPaymentStats || []).map((ms, idx) => (
                            <div
                              key={idx}
                              title={`${ms.month}: ${ms.isPaid ? 'To\'langan' : 'To\'lanmagan'}`}
                              style={{
                                width: '12px',
                                height: ms.isPaid ? '24px' : '10px',
                                borderRadius: '3px',
                                background: ms.isPaid ? '#10b981' : 'rgba(244, 63, 94, 0.4)',
                                border: ms.isPaid ? '1px solid #059669' : '1px solid #f43f5e',
                                transition: 'height 0.2s ease'
                              }}
                            />
                          ))}
                        </div>
                        <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
                          Aprel &rarr; Sentabr
                        </div>
                      </td>

                      {/* Action */}
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedStudent(u)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 12px' }}
                        >
                          <Eye size={14} />
                          <span>Analitika</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. SEPARATE TEACHERS LIST & SALARY (70%) ANALYTICS */}
      {activeTab === 'teachers' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>O'qituvchi</th>
                  <th>O'quvchilari</th>
                  <th>Markazga Tushumi (Oyiga)</th>
                  <th>Ulush / Maosh Modeli</th>
                  <th>O'qituvchi Maoshi</th>
                  <th>Markaz Sof Foydasi</th>
                  <th style={{ textAlign: 'right' }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                      <div className="spinner" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                      O'qituvchilar topilmadi
                    </td>
                  </tr>
                ) : (
                  users.map((t) => {
                    const stCount = t.studentsCount || 0;
                    const revenue = t.monthlyRevenueGenerated || (stCount * 800000);
                    const earned = t.monthlyEarned || 0;
                    const centerProfit = t.centerNetProfit != null ? t.centerNetProfit : Math.max(0, revenue - earned);
                    const isFixed = t.compensationType === 'FixedPerStudent' || t.compensationType === 'FixedMonthly';

                    return (
                      <tr key={t.id}>
                        {/* Name, Login & Experience */}
                        <td>
                          <div style={{ fontWeight: 800, color: '#fff' }}>{t.fullName}</div>
                          <div style={{ fontSize: '12px', color: '#10b981', fontFamily: 'monospace' }}>
                            Login: @{t.username || t.email.split('@')[0]}
                          </div>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                            <span style={{ fontSize: '11px', background: 'rgba(255, 255, 255, 0.08)', padding: '2px 6px', borderRadius: '4px', color: '#CBD5E1' }}>
                              {t.experienceYears >= 1 ? `${t.experienceYears} yil staj` : '6 oy (yangi)'}
                            </span>
                            {t.centerName && (
                              <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                                • {t.centerName}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Students List Button & Count */}
                        <td>
                          <button
                            onClick={() => setSelectedTeacher(t)}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <UsersIcon size={14} color="#10b981" />
                            <span>{stCount} nafar o'quvchi &rarr;</span>
                          </button>
                        </td>

                        {/* Monthly Revenue Generated (Center Revenue) */}
                        <td>
                          <div style={{ fontSize: '15px', fontWeight: 900, color: '#60A5FA' }}>
                            {formatCurrency(revenue)}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                            {stCount} o'quvchi × 800 000 so'm
                          </div>
                        </td>

                        {/* Compensation Model Badge & Setting */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: 800,
                                padding: '4px 10px',
                                borderRadius: '6px',
                                background: isFixed ? 'rgba(245, 158, 11, 0.18)' : 'rgba(16, 185, 129, 0.18)',
                                color: isFixed ? '#FBBF24' : '#34D399',
                                border: isFixed ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)'
                              }}
                            >
                              {t.compensationTypeName || (t.compensationType === 'FixedMonthly'
                                ? `Oylik ${(t.fixedAmount || 8000000).toLocaleString('uz-UZ')} so'm`
                                : t.compensationType === 'FixedPerStudent'
                                ? `Har biriga ${(t.fixedAmount || 400000).toLocaleString('uz-UZ')} so'm`
                                : `${t.sharePercentage || 70}% ulush`)}
                            </span>
                            <button
                              onClick={() => openCompensationModal(t)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#A855F7',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: 0
                              }}
                            >
                              <Settings2 size={12} />
                              <span>Ulush / Maoshni sozlash</span>
                            </button>
                          </div>
                        </td>

                        {/* Teacher Monthly Earned */}
                        <td>
                          <div style={{ fontSize: '15px', fontWeight: 900, color: '#10b981' }}>
                            {formatCurrency(earned)}
                          </div>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>O'qituvchi ulushi</div>
                        </td>

                        {/* Center Net Retained Profit */}
                        <td>
                          <div style={{ fontSize: '15px', fontWeight: 900, color: '#F59E0B' }}>
                            {formatCurrency(centerProfit)}
                          </div>
                          <div style={{ fontSize: '11px', color: '#34D399', fontWeight: 600 }}>
                            Markaz sof foydasi
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => openCompensationModal(t)}
                              title="Maosh va ulush sozlamalari"
                              className="btn btn-ghost btn-icon"
                              style={{ color: '#A855F7' }}
                            >
                              <Sliders size={16} />
                            </button>
                            <button onClick={() => openEdit(t)} title="Tahrirlash" className="btn btn-ghost btn-icon">
                              <Edit2 size={16} color="#34d399" />
                            </button>
                            <button onClick={() => handleDelete(t.id, t.fullName)} title="O'chirish" className="btn btn-ghost btn-icon">
                              <Trash2 size={16} color="#fb7185" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ALL USERS MANAGEMENT */}
      {activeTab === 'all' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Foydalanuvchi</th>
                  <th>Roli</th>
                  <th>Status</th>
                  <th>Telefon</th>
                  <th>Ota-onasi</th>
                  <th style={{ textAlign: 'right' }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{u.fullName}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>{u.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'Admin' ? 'badge-amber' : u.role === 'Teacher' ? 'badge-emerald' : 'badge-violet'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.status === 'Active' ? 'badge-emerald' : 'badge-rose'}`}>
                        {u.status === 'Active' ? 'Faol' : 'Nofaol'}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: '#d1d5db' }}>{u.phone || '—'}</td>
                    <td style={{ fontSize: '13px', color: '#fbbf24' }}>{u.parentPhone || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button onClick={() => openEdit(u)} className="btn btn-ghost btn-icon">
                          <Edit2 size={16} color="#34d399" />
                        </button>
                        <button onClick={() => handleDelete(u.id, u.fullName)} className="btn btn-ghost btn-icon">
                          <Trash2 size={16} color="#fb7185" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', marginTop: '14px' }}>
        <div style={{ fontSize: '13px', color: '#9ca3af' }}>
          Sahifa: <strong>{page}</strong> / {totalPages || 1}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="btn btn-secondary btn-sm">
            Oldingi
          </button>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="btn btn-secondary btn-sm">
            Keyingi
          </button>
        </div>
      </div>

      {/* MODAL: STUDENT DETAILED ANALYTICS & DIAGRAM */}
      {selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{selectedStudent.fullName} &mdash; To'liq Analitika</h3>
              <button onClick={() => setSelectedStudent(null)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Contact info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '12px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>Shaxsiy Telefoni:</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                    {selectedStudent.phone || 'Mavjud emas'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#fbbf24' }}>👨‍👩‍👦 Ota-onasi Telefoni:</span>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#fbbf24', marginTop: '2px' }}>
                    {selectedStudent.parentPhone || 'Mavjud emas'}
                  </div>
                </div>
              </div>

              {/* Financial cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '14px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#34d399', fontWeight: 700 }}>Oylik Shartnoma</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>
                    {formatCurrency(selectedStudent.monthlyFee)}
                  </div>
                </div>
                <div style={{ background: selectedStudent.balance >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)', border: `1px solid ${selectedStudent.balance >= 0 ? '#10b981' : '#fb7185'}`, padding: '14px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '12px', color: selectedStudent.balance >= 0 ? '#34d399' : '#fb7185', fontWeight: 700 }}>Qoldiq Balans</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: selectedStudent.balance >= 0 ? '#10b981' : '#fb7185', marginTop: '4px' }}>
                    {formatBalance(selectedStudent.balance)}
                  </div>
                </div>
              </div>

              {/* Monthly Payment Diagram */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BarChart3 size={16} color="#10b981" /> Oylik To'lov Statistikasi Diagrammasi
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', textAlign: 'center' }}>
                  {(selectedStudent.monthlyPaymentStats || []).map((ms, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          width: '100%',
                          height: '50px',
                          borderRadius: '8px',
                          background: ms.isPaid ? 'linear-gradient(180deg, #10b981 0%, #047857 100%)' : 'rgba(244, 63, 94, 0.25)',
                          border: ms.isPaid ? '1.5px solid #10b981' : '1.5px solid #fb7185',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: ms.isPaid ? '#fff' : '#fb7185',
                          fontSize: '12px',
                          fontWeight: 800
                        }}
                      >
                        {ms.isPaid ? '✓' : '✗'}
                      </div>
                      <span style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 600 }}>{ms.month}</span>
                      <span style={{ fontSize: '9px', color: ms.isPaid ? '#34d399' : '#fb7185' }}>
                        {ms.isPaid ? '800k' : '0 so\'m'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attendance logs breakdown */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#fff', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={16} color="#3b82f6" /> Davomat Statistikasi (Kelgan / Kelmagan)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#34d399' }}>{selectedStudent.presentCount}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>Darsda Qatnashgan</div>
                  </div>
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#fbbf24' }}>{selectedStudent.lateCount}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>Kechikkan</div>
                  </div>
                  <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#fb7185' }}>{selectedStudent.absentCount}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>Dars Qoldirgan</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setSelectedStudent(null)} className="btn btn-primary" style={{ width: '100%' }}>
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TEACHER'S ASSIGNED STUDENTS LIST */}
      {selectedTeacher && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {selectedTeacher.fullName} &mdash; O'quvchilari ({selectedTeacher.studentsCount} nafar)
              </h3>
              <button onClick={() => setSelectedTeacher(null)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid #10b981', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', fontSize: '13px', color: '#d1fae5' }}>
                O'qituvchi ulushi: <strong>{selectedTeacher.sharePercentage}%</strong>. Har bir o'quvchidan: <strong>{formatCurrency(800000 * (selectedTeacher.sharePercentage / 100))}</strong>.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(selectedTeacher.studentNames || []).map((name, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '13px' }}>
                      {i + 1}. {name}
                    </div>
                    <span className="badge badge-emerald">
                      +{formatCurrency(800000 * (selectedTeacher.sharePercentage / 100))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setSelectedTeacher(null)} className="btn btn-primary" style={{ width: '100%' }}>
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">Yangi Foydalanuvchi Qo'shish</h3>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                {/* Center selector with live quota status */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    🏢 Tegishli O'quv Markazi *
                  </label>
                  <select
                    value={createForm.centerId}
                    onChange={(e) => setCreateForm({ ...createForm, centerId: e.target.value })}
                    className="form-select"
                  >
                    {centers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} &mdash; ({c.activeStudentsCount} / {c.maxStudentsQuota} ta {c.isBlocked ? '🚫 LIMIT TO\'LGAN' : `${c.quotaUsagePercentage}% band`})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quota Exceeded Block Warning inside modal */}
                {(() => {
                  const targetCenter = centers.find(c => c.id === (createForm.centerId || centers[0]?.id));
                  if (createForm.role === 'Student' && targetCenter && (targetCenter.isBlocked || targetCenter.activeStudentsCount >= targetCenter.maxStudentsQuota)) {
                    return (
                      <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid #f43f5e', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fb7185' }}>
                        <ShieldAlert size={20} style={{ flexShrink: 0 }} />
                        <div style={{ fontSize: '13px', lineHeight: 1.4 }}>
                          <strong>Kvotasi to'lgan!</strong> "{targetCenter.name}" markazining o'quvchi limiti ({targetCenter.activeStudentsCount}/{targetCenter.maxStudentsQuota}) to'lganligi sababli yangi o'quvchi qo'shish avtomatik bloklandi.
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="form-group">
                  <label className="form-label">To'liq Ism Familiya *</label>
                  <input
                    type="text"
                    required
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                    placeholder="Masalan: Jasur Bekmirzayev"
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Email Manzil *</label>
                    <input
                      type="email"
                      required
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      placeholder="jasur@eduflow.uz"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Username / Login *</label>
                    <input
                      type="text"
                      required
                      value={createForm.username}
                      onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                      placeholder="jasur_b"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Dastlabki Parol *</label>
                  <input
                    type="password"
                    required
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="+998991992012"
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Rol</label>
                    <select
                      value={createForm.role}
                      onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                      className="form-select"
                    >
                      <option value="Student">Student (O'quvchi)</option>
                      <option value="Teacher">Teacher (O'qituvchi)</option>
                      <option value="Admin">Admin (Ma'mur)</option>
                    </select>
                  </div>

                  {createForm.role === 'Teacher' ? (
                    <div className="form-group">
                      <label className="form-label">Ish Staji (Yillarda)</label>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={createForm.experienceYears}
                        onChange={(e) => setCreateForm({ ...createForm, experienceYears: parseInt(e.target.value) || 0 })}
                        placeholder="3"
                        className="form-input"
                      />
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="form-label">Ota-onasi Telefoni</label>
                      <input
                        type="text"
                        value={createForm.parentPhone}
                        onChange={(e) => setCreateForm({ ...createForm, parentPhone: e.target.value })}
                        placeholder="+998 90 123 45 67"
                        className="form-input"
                      />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Shaxsiy Telefon Raqami</label>
                  <input
                    type="text"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="+998 99 199 20 12"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Bekor qilish
                </button>
                {(() => {
                  const targetCenter = centers.find(c => c.id === (createForm.centerId || centers[0]?.id));
                  const isBlocked = createForm.role === 'Student' && targetCenter && (targetCenter.isBlocked || targetCenter.activeStudentsCount >= targetCenter.maxStudentsQuota);
                  return (
                    <button 
                      type="submit" 
                      disabled={isBlocked} 
                      className={`btn ${isBlocked ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ opacity: isBlocked ? 0.5 : 1, cursor: isBlocked ? 'not-allowed' : 'pointer' }}
                    >
                      {isBlocked ? '🚫 Kvota To\'lgan (Bloklangan)' : 'Qo\'shish'}
                    </button>
                  );
                })()}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">Foydalanuvchini Tahrirlash</h3>
              <button onClick={() => setShowEditModal(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">To'liq Ism Familiya</label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      required
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Rol</label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="form-select"
                    >
                      <option value="Student">Student</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="form-select"
                    >
                      <option value="Active">Faol</option>
                      <option value="Inactive">Nofaol</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Telefon</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  {editForm.role === 'Teacher' ? (
                    <div className="form-group">
                      <label className="form-label">Ish Staji (Yillarda)</label>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={editForm.experienceYears}
                        onChange={(e) => setEditForm({ ...editForm, experienceYears: parseInt(e.target.value) || 0 })}
                        className="form-input"
                      />
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="form-label">Ota-onasi Telefoni</label>
                      <input
                        type="text"
                        value={editForm.parentPhone}
                        onChange={(e) => setEditForm({ ...editForm, parentPhone: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Yangi Parol (Ixtiyoriy)</label>
                  <input
                    type="password"
                    value={editForm.newPassword}
                    onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                    placeholder="Bo'sh qoldirilsa, o'zgarmaydi"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-primary">
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 4. TEACHER COMPENSATION & PROFIT SPLIT MODAL */}
      {showCompensationModal && selectedTeacherForCompensation && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '1rem'
        }}>
          <div style={{
            background: '#1E293B',
            borderRadius: '16px',
            border: '1px solid rgba(168, 85, 247, 0.35)',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '1.75rem',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.5rem' }}>⚙️</span>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
                    O'qituvchi Ulushi va Maoshini Sozlash
                  </h2>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
                    Markaz rahbari tomonidan o'qituvchiga beriladigan foiz yoki qat'iy summani belgilash
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowCompensationModal(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Teacher Details Badge */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div>
                <div style={{ fontWeight: 800, color: '#F8FAFC', fontSize: '0.95rem' }}>
                  {selectedTeacherForCompensation.fullName}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  Staj: {selectedTeacherForCompensation.experienceYears} yil • {selectedTeacherForCompensation.centerName || 'EduFlow'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60A5FA',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                  {selectedTeacherForCompensation.studentsCount || 0} ta o'quvchi biriktirilgan
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveCompensation} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Method Selection (2 Usul) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.5rem' }}>
                  To'lov va Ulush Usulini Tanlang:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setCompensationForm({ ...compensationForm, compensationType: 'Percentage' })}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      border: compensationForm.compensationType === 'Percentage'
                        ? '2px solid #A855F7'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      background: compensationForm.compensationType === 'Percentage'
                        ? 'rgba(168, 85, 247, 0.15)'
                        : 'rgba(15, 23, 42, 0.6)',
                      color: '#F8FAFC',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.9rem', color: compensationForm.compensationType === 'Percentage' ? '#C084FC' : '#F8FAFC' }}>
                      <Percent size={18} />
                      1. Foiz Usulida (%)
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.35rem' }}>
                      Har bir o'quvchining 800 000 so'm to'lovidan ma'lum % ulush
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCompensationForm({ ...compensationForm, compensationType: 'Fixed' })}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      border: compensationForm.compensationType !== 'Percentage'
                        ? '2px solid #F59E0B'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      background: compensationForm.compensationType !== 'Percentage'
                        ? 'rgba(245, 158, 11, 0.15)'
                        : 'rgba(15, 23, 42, 0.6)',
                      color: '#F8FAFC',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.9rem', color: compensationForm.compensationType !== 'Percentage' ? '#FBBF24' : '#F8FAFC' }}>
                      <DollarSign size={18} />
                      2. Qat'iy Summa (UZS)
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.35rem' }}>
                      Har bir o'quvchiga yoki oylik qat'iy belgilangan summa
                    </div>
                  </button>
                </div>
              </div>

              {/* MODE 1: FOIZ USULI */}
              {compensationForm.compensationType === 'Percentage' && (
                <div style={{
                  background: 'rgba(168, 85, 247, 0.08)',
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#C084FC' }}>
                      O'qituvchi Ulush Foizi (%):
                    </label>
                    <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#C084FC' }}>
                      {compensationForm.customSharePercentage}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="1"
                    value={compensationForm.customSharePercentage}
                    onChange={(e) => setCompensationForm({ ...compensationForm, customSharePercentage: parseInt(e.target.value) || 50 })}
                    style={{ width: '100%', accentColor: '#A855F7', cursor: 'pointer' }}
                  />

                  {/* Preset Pills */}
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.4rem' }}>
                      Tezkor ulush tanlash:
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {[40, 50, 60, 65, 70, 75, 80].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setCompensationForm({ ...compensationForm, customSharePercentage: pct })}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            border: compensationForm.customSharePercentage === pct ? '1px solid #A855F7' : '1px solid rgba(255, 255, 255, 0.1)',
                            background: compensationForm.customSharePercentage === pct ? '#A855F7' : 'rgba(15, 23, 42, 0.6)',
                            color: '#FFFFFF',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 2: QAT'IY SUMMA USULI */}
              {compensationForm.compensationType !== 'Percentage' && (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FBBF24', marginBottom: '0.4rem', display: 'block' }}>
                      Summa Turi:
                    </label>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#F8FAFC', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="fixedType"
                          value="FixedPerStudent"
                          checked={compensationForm.fixedType === 'FixedPerStudent'}
                          onChange={() => setCompensationForm({ ...compensationForm, fixedType: 'FixedPerStudent', fixedAmount: 400000 })}
                        />
                        Har bir o'quvchi uchun (so'm)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#F8FAFC', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="fixedType"
                          value="FixedMonthly"
                          checked={compensationForm.fixedType === 'FixedMonthly'}
                          onChange={() => setCompensationForm({ ...compensationForm, fixedType: 'FixedMonthly', fixedAmount: 8000000 })}
                        />
                        Oylik qat'iy maosh (so'm)
                      </label>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.35rem' }}>
                      {compensationForm.fixedType === 'FixedPerStudent' ? "Har bir o'quvchi uchun summa (UZS) *" : "Oylik qat'iy maosh summasi (UZS) *"}
                    </label>
                    <input
                      type="number"
                      step="10000"
                      min="50000"
                      required
                      value={compensationForm.fixedAmount}
                      onChange={(e) => setCompensationForm({ ...compensationForm, fixedAmount: parseInt(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        background: 'rgba(15, 23, 42, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        color: '#F8FAFC',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Preset Pills */}
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.4rem' }}>
                      Tezkor namunalar:
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {compensationForm.fixedType === 'FixedPerStudent' ? (
                        [300000, 350000, 400000, 450000, 500000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setCompensationForm({ ...compensationForm, fixedAmount: amt })}
                            style={{
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              border: compensationForm.fixedAmount === amt ? '1px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.1)',
                              background: compensationForm.fixedAmount === amt ? '#F59E0B' : 'rgba(15, 23, 42, 0.6)',
                              color: compensationForm.fixedAmount === amt ? '#000' : '#FFFFFF',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {(amt / 1000)} ming
                          </button>
                        ))
                      ) : (
                        [6000000, 7000000, 8000000, 9000000, 10000000, 12000000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setCompensationForm({ ...compensationForm, fixedAmount: amt })}
                            style={{
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              border: compensationForm.fixedAmount === amt ? '1px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.1)',
                              background: compensationForm.fixedAmount === amt ? '#F59E0B' : 'rgba(15, 23, 42, 0.6)',
                              color: compensationForm.fixedAmount === amt ? '#000' : '#FFFFFF',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {(amt / 1000000)} mln
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* LIVE SIMULATION (JONLI HISOBLASH) */}
              {(() => {
                const sCount = selectedTeacherForCompensation.studentsCount || 4;
                const totalRevenue = sCount * 800000;
                let simulatedEarned = 0;

                if (compensationForm.compensationType === 'Percentage') {
                  simulatedEarned = totalRevenue * (Number(compensationForm.customSharePercentage) || 50) / 100;
                } else if (compensationForm.fixedType === 'FixedPerStudent') {
                  simulatedEarned = sCount * (Number(compensationForm.fixedAmount) || 400000);
                } else {
                  simulatedEarned = Number(compensationForm.fixedAmount) || 8000000;
                }

                const simulatedCenterProfit = Math.max(0, totalRevenue - simulatedEarned);
                const teacherPctOfRevenue = totalRevenue > 0 ? Math.round((simulatedEarned / totalRevenue) * 100) : 50;

                return (
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      📊 Jonli Moliya Taqsimoti ({sCount} ta o'quvchi misolida):
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                      <div style={{ background: 'rgba(59, 130, 246, 0.12)', padding: '0.6rem 0.4rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Markaz Tushumi</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#60A5FA' }}>
                          {formatCurrency(totalRevenue)}
                        </div>
                      </div>

                      <div style={{ background: 'rgba(16, 185, 129, 0.12)', padding: '0.6rem 0.4rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>O'qituvchiga</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#34D399' }}>
                          {formatCurrency(simulatedEarned)}
                        </div>
                      </div>

                      <div style={{ background: 'rgba(245, 158, 11, 0.12)', padding: '0.6rem 0.4rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Markaz Sof Foydasi</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FBBF24' }}>
                          {formatCurrency(simulatedCenterProfit)}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar of Split */}
                    <div style={{ marginTop: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#CBD5E1', marginBottom: '0.25rem' }}>
                        <span>O'qituvchi: {teacherPctOfRevenue}%</span>
                        <span>Markaz foydasi: {Math.max(0, 100 - teacherPctOfRevenue)}%</span>
                      </div>
                      <div style={{ height: '8px', width: '100%', background: 'rgba(245, 158, 11, 0.4)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, teacherPctOfRevenue)}%`, background: '#10B981', transition: 'width 0.2s ease' }} />
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCompensationModal(false)}
                  style={{
                    padding: '0.65rem 1.2rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'transparent',
                    color: '#94A3B8',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={compensationSaving}
                  style={{
                    padding: '0.65rem 1.4rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)'
                  }}
                >
                  {compensationSaving ? 'Saqlanmoqda...' : 'Parametrlarni Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
