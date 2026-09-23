import React, { useState, useEffect } from 'react';
import { 
  Building2, Plus, Edit2, Trash2, ArrowUpRight, AlertTriangle, 
  CheckCircle2, ShieldAlert, Users, BookOpen, Layers, Phone, 
  MapPin, Mail, Calendar, DollarSign, Search, RefreshCw, X, Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Centers = ({ onSelectCenterForUsers }) => {
  const { user, showToast } = useAuth();
  const [centers, setCenters] = useState([]);
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [planFilter, setPlanFilter] = useState('ALL');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    name: '',
    slug: '',
    phone: '',
    email: '',
    address: '',
    tariffPlan: 0,
    initialMonths: 1,
    adminFullName: '',
    adminUsername: '',
    adminPassword: '+998991992012'
  });

  const [upgradeForm, setUpgradeForm] = useState({
    tariffPlan: 1,
    additionalMonths: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [centersRes, tariffsRes] = await Promise.all([
        api.centers.getAll(),
        api.centers.getTariffs()
      ]);

      if (centersRes?.data) setCenters(centersRes.data);
      if (tariffsRes?.data) setTariffs(tariffsRes.data);
    } catch (err) {
      showToast(err.message || 'Ma\'lumotlarni yuklashda xatolik', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpgrade = (center) => {
    setSelectedCenter(center);
    // Default to next plan up
    const nextPlan = center.tariffPlan < 3 ? center.tariffPlan + 1 : center.tariffPlan;
    setUpgradeForm({
      tariffPlan: nextPlan,
      additionalMonths: 1
    });
    setShowUpgradeModal(true);
  };

  const handleUpgradeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCenter) return;

    try {
      const res = await api.centers.updateTariff(selectedCenter.id, upgradeForm);
      showToast(res.message || 'Tarif muvaffaqiyatli yangilandi!', 'success');
      setShowUpgradeModal(false);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.centers.create(createForm);
      showToast(res.message || 'Yangi o\'quv markazi ochildi!', 'success');
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        slug: '',
        phone: '',
        email: '',
        address: '',
        tariffPlan: 0,
        initialMonths: 1,
        adminFullName: '',
        adminUsername: '',
        adminPassword: '+998991992012'
      });
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" o'quv markazini tizimdan o'chirmoqchimisiz?`)) return;
    try {
      await api.centers.delete(id);
      showToast('Markaz muvaffaqiyatli o\'chirildi', 'success');
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Calculations for KPI Cards
  const totalCenters = centers.length;
  const totalStudents = centers.reduce((sum, c) => sum + (c.activeStudentsCount || 0), 0);
  const totalMRR = centers.reduce((sum, c) => sum + (c.monthlySubscriptionPrice || 0), 0);
  const blockedCentersCount = centers.filter(c => c.isBlocked || c.isQuotaExceeded).length;
  const warningCentersCount = centers.filter(c => !c.isBlocked && c.quotaUsagePercentage >= 90).length;

  // Filtered centers
  const filteredCenters = centers.filter(c => {
    const matchesSearch = !search || 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.slug && c.slug.toLowerCase().includes(search.toLowerCase())) ||
      (c.phone && c.phone.includes(search)) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' ||
      (statusFilter === 'BLOCKED' && (c.isBlocked || c.isQuotaExceeded)) ||
      (statusFilter === 'ACTIVE' && (!c.isBlocked && !c.isQuotaExceeded)) ||
      (statusFilter === 'WARNING' && (c.quotaUsagePercentage >= 90 && !c.isBlocked));

    const matchesPlan = planFilter === 'ALL' || String(c.tariffPlan) === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const formatCurrency = (val) => {
    return (val || 0).toLocaleString('uz-UZ') + ' so\'m';
  };

  const defaultTariffOptions = [
    { plan: 0, name: "Boshlang'ich", maxStudentsQuota: 200, monthlyPrice: 500000, desc: "200 tagacha faol o'quvchi" },
    { plan: 1, name: "Standart", maxStudentsQuota: 400, monthlyPrice: 700000, desc: "400 tagacha faol o'quvchi (Eng ommabop)" },
    { plan: 2, name: "Katta Markaz", maxStudentsQuota: 1000, monthlyPrice: 1200000, desc: "1000 tagacha faol o'quvchi" },
    { plan: 3, name: "Cheksiz (VIP)", maxStudentsQuota: 999999, monthlyPrice: 2500000, desc: "Cheksiz o'quvchilar soni" }
  ];

  const activeTariffs = tariffs.length > 0 ? tariffs : defaultTariffOptions;

  return (
    <div>
      {/* PAGE HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="page-title" style={{ margin: 0 }}>🏢 O'quv Markazlari (SaaS Hub)</h1>
            <span className="badge badge-emerald" style={{ fontSize: '12px' }}>Multi-Tenant SaaS</span>
          </div>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>
            Barcha hamkor ta'lim markazlari, o'quvchi soni kvotalari va avtomatik bloklash nazorati
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={fetchData} className="btn btn-secondary btn-sm" title="Yangilash">
            <RefreshCw size={15} />
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>Yangi Markaz Ochish</span>
          </button>
        </div>
      </div>

      {/* SaaS PLATFORM KPI CARDS */}
      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        {/* Total Centers */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div className="stat-label">Faol O'quv Markazlari</div>
            <div className="stat-value">{totalCenters} ta markaz</div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>O'zbekiston bo'yicha</div>
          </div>
        </div>

        {/* Total Students */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-label">Jami O'quvchilar Soni</div>
            <div className="stat-value" style={{ color: '#34d399' }}>{totalStudents.toLocaleString('uz-UZ')} ta</div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Tizimda o'qiyotgan aktiv talabalar</div>
          </div>
        </div>

        {/* Platform MRR */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div className="stat-label">Oylik Obuna Tushumi (MRR)</div>
            <div className="stat-value" style={{ color: '#fbbf24', fontSize: '20px' }}>{formatCurrency(totalMRR)}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Har oylik SaaS daromadi</div>
          </div>
        </div>

        {/* Quota Alerts & Blocked */}
        <div className="stat-card" style={{ borderColor: blockedCentersCount > 0 ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-subtle)' }}>
          <div className="stat-icon" style={{ background: blockedCentersCount > 0 ? 'rgba(244, 63, 94, 0.2)' : 'rgba(139, 92, 246, 0.15)', color: blockedCentersCount > 0 ? '#f43f5e' : '#a855f7' }}>
            {blockedCentersCount > 0 ? <ShieldAlert size={24} /> : <CheckCircle2 size={24} />}
          </div>
          <div>
            <div className="stat-label">Kvota Holati & Bloklanganlar</div>
            <div className="stat-value" style={{ color: blockedCentersCount > 0 ? '#f43f5e' : '#34d399' }}>
              {blockedCentersCount > 0 ? `${blockedCentersCount} ta bloklangan!` : 'Barcha kvotalar joyida'}
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
              {warningCentersCount > 0 && `${warningCentersCount} ta markaz limitga yaqin`}
              {blockedCentersCount === 0 && warningCentersCount === 0 && 'Hech qanday cheklov yo\'q'}
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ flex: '1', minWidth: '240px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Markaz nomi, slug, telefon yoki email bo'yicha qidirish..."
              className="form-input"
              style={{ paddingLeft: '38px', margin: 0 }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: '180px' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
              style={{ margin: 0 }}
            >
              <option value="ALL">Barcha holatlar</option>
              <option value="ACTIVE">Faqat Faol markazlar</option>
              <option value="WARNING">Limitga yaqin (90%+)</option>
              <option value="BLOCKED">🚫 Bloklangan (Limit to'lgan)</option>
            </select>
          </div>

          {/* Plan Filter */}
          <div style={{ minWidth: '180px' }}>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="form-select"
              style={{ margin: 0 }}
            >
              <option value="ALL">Barcha tariflar</option>
              <option value="0">Boshlang'ich (200 ta)</option>
              <option value="1">Standart (400 ta)</option>
              <option value="2">Katta Markaz (1000 ta)</option>
              <option value="3">Cheksiz (VIP)</option>
            </select>
          </div>
        </div>
      </div>

      {/* CENTERS GRID */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#9ca3af' }}>
          <RefreshCw size={32} className="spin" style={{ margin: '0 auto 12px' }} />
          <p>O'quv markazlari ma'lumotlari yuklanmoqda...</p>
        </div>
      ) : filteredCenters.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <Building2 size={48} color="#6b7280" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Hech qanday markaz topilmadi</h3>
          <p style={{ color: '#9ca3af', fontSize: '14px', maxWidth: '450px', margin: '0 auto 20px' }}>
            Qidiruv shartlariga mos keluvchi o'quv markazlari mavjud emas yoki yangi markaz ro'yxatdan o'tkazilmagan.
          </p>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Yangi Markaz Ochish</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
          {filteredCenters.map((center) => {
            const isBlocked = center.isBlocked || center.isQuotaExceeded;
            const isWarning = !isBlocked && center.quotaUsagePercentage >= 90;
            const cardClass = isBlocked ? 'card card-rose' : (isWarning ? 'card card-amber' : 'card card-emerald');

            return (
              <div 
                key={center.id} 
                className={cardClass}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  boxShadow: isBlocked ? '0 8px 30px rgba(244, 63, 94, 0.15)' : 'none'
                }}
              >
                <div>
                  {/* Card Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px', color: '#9ca3af', fontFamily: 'monospace' }}>
                          @{center.slug || 'markaz'}
                        </span>
                        <span style={{ fontSize: '12px', color: '#34d399', fontWeight: 600 }}>
                          {formatCurrency(center.monthlySubscriptionPrice)}/oy
                        </span>
                      </div>
                      <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#fff', margin: 0 }}>
                        {center.name}
                      </h3>
                    </div>

                    {/* Status Badge */}
                    {isBlocked ? (
                      <span className="badge badge-rose" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                        <ShieldAlert size={13} />
                        <span>Bloklangan</span>
                      </span>
                    ) : isWarning ? (
                      <span className="badge badge-amber" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={13} />
                        <span>Limitga yaqin</span>
                      </span>
                    ) : (
                      <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={13} />
                        <span>Faol</span>
                      </span>
                    )}
                  </div>

                  {/* Address & Contacts */}
                  <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {center.address && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} color="#6b7280" />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{center.address}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {center.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={13} color="#6b7280" />
                          <span>{center.phone}</span>
                        </div>
                      )}
                      {center.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={13} color="#6b7280" />
                          <span>{center.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* QUOTA PROGRESS SECTION */}
                  <div style={{ 
                    background: isBlocked ? 'rgba(244, 63, 94, 0.08)' : (isWarning ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.03)'), 
                    border: `1px solid ${isBlocked ? 'rgba(244, 63, 94, 0.25)' : (isWarning ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.06)')}`,
                    borderRadius: '10px', 
                    padding: '14px 16px',
                    marginBottom: '18px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#d1d5db', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        O'quvchi Kvotasi:
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: isBlocked ? '#fb7185' : (isWarning ? '#fbbf24' : '#34d399') }}>
                        {center.activeStudentsCount} / {center.maxStudentsQuota} ta ({center.quotaUsagePercentage}%)
                      </span>
                    </div>

                    {/* Progress Bar Track */}
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden', marginBottom: '8px' }}>
                      <div 
                        style={{ 
                          width: `${Math.min(100, center.quotaUsagePercentage)}%`, 
                          height: '100%', 
                          background: isBlocked 
                            ? 'linear-gradient(90deg, #f43f5e 0%, #e11d48 100%)' 
                            : (isWarning ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(90deg, #10b981 0%, #059669 100%)'),
                          borderRadius: '999px',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>

                    {/* Quota Help / Warning text */}
                    {isBlocked ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#fb7185', fontWeight: 600 }}>
                        <ShieldAlert size={14} />
                        <span>Limit to'lgan! Yangi o'quvchi qo'shish avtomatik bloklandi.</span>
                      </div>
                    ) : isWarning ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#fbbf24', fontWeight: 600 }}>
                        <AlertTriangle size={14} />
                        <span>Diqqat: Atigi {center.remainingQuota} ta o'rin qoldi! Tez orada to'ladi.</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        Bo'sh joylar: <strong style={{ color: '#fff' }}>{center.remainingQuota} ta o'quvchi</strong>
                      </div>
                    )}
                  </div>

                  {/* Sub-Metrics: Courses, Groups, Teachers */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '18px', fontSize: '13px', color: '#9ca3af' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BookOpen size={15} color="#3b82f6" />
                      <span>{center.coursesCount} ta kurs</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Layers size={15} color="#8b5cf6" />
                      <span>{center.groupsCount} ta guruh</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={15} color="#10b981" />
                      <span>{center.teachersCount} ta o'qituvchi</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                  {/* Upgrade Tariff Button */}
                  <button 
                    onClick={() => handleOpenUpgrade(center)} 
                    className={isBlocked ? "btn btn-danger btn-sm" : "btn btn-primary btn-sm"}
                    style={{ flex: '1', minWidth: '160px' }}
                  >
                    <Sparkles size={14} />
                    <span>{isBlocked ? 'Tarifni Oshirish (Ochish)' : 'Tarifni Yangilash'}</span>
                  </button>

                  {/* Jump to Users filtered by center */}
                  {onSelectCenterForUsers && (
                    <button 
                      onClick={() => onSelectCenterForUsers(center.id)} 
                      className="btn btn-secondary btn-sm"
                      title="Ushbu markaz o'quvchilarini ko'rish"
                    >
                      <Users size={14} />
                      <span>O'quvchilar</span>
                    </button>
                  )}

                  {/* Delete Center (Super Admin only) */}
                  <button 
                    onClick={() => handleDelete(center.id, center.name)} 
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#f43f5e' }}
                    title="Markazni o'chirish"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* UPGRADE TARIFF MODAL */}
      {showUpgradeModal && selectedCenter && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="#f59e0b" />
                  <span>Tarifni Yangilash & Kvotani Oshirish</span>
                </h3>
                <p style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0 0 0' }}>
                  Markaz: <strong style={{ color: '#fff' }}>{selectedCenter.name}</strong> (Hozirgi talabalar: {selectedCenter.activeStudentsCount} ta)
                </p>
              </div>
              <button onClick={() => setShowUpgradeModal(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpgradeSubmit}>
              <div className="modal-body">
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ fontWeight: 700, marginBottom: '8px' }}>
                    Yangi O'quvchi Kvotasi Tarifini Tanlang:
                  </label>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                    {activeTariffs.map((t) => {
                      const isSelected = upgradeForm.tariffPlan === t.plan;
                      return (
                        <div
                          key={t.plan}
                          onClick={() => setUpgradeForm({ ...upgradeForm, tariffPlan: t.plan })}
                          style={{
                            background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                            border: `2px solid ${isSelected ? '#10b981' : 'rgba(255, 255, 255, 0.08)'}`,
                            borderRadius: '12px',
                            padding: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            position: 'relative'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 800, fontSize: '16px', color: isSelected ? '#34d399' : '#fff' }}>
                              {t.name}
                            </span>
                            {isSelected && <CheckCircle2 size={18} color="#10b981" />}
                          </div>

                          <div style={{ fontSize: '20px', fontWeight: 800, color: '#fbbf24', marginBottom: '6px' }}>
                            {formatCurrency(t.monthlyPrice)} <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 400 }}>/ oy</span>
                          </div>

                          <div style={{ fontSize: '13px', color: '#d1d5db', marginBottom: '6px', fontWeight: 600 }}>
                            Limit: {t.maxStudentsQuota >= 999999 ? 'Cheksiz o\'quvchi' : `${t.maxStudentsQuota} tagacha o'quvchi`}
                          </div>

                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                            {t.description || t.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Obuna muddatini uzaytirish (oylar soni):</label>
                  <select
                    value={upgradeForm.additionalMonths}
                    onChange={(e) => setUpgradeForm({ ...upgradeForm, additionalMonths: parseInt(e.target.value) })}
                    className="form-select"
                  >
                    <option value={1}>1 oy</option>
                    <option value={3}>3 oy (Kvartal)</option>
                    <option value={6}>6 oy (Yarim yillik)</option>
                    <option value={12}>12 oy (Yillik to'lov)</option>
                  </select>
                </div>

                {/* Calculation summary */}
                {(() => {
                  const selTariff = activeTariffs.find(t => t.plan === upgradeForm.tariffPlan) || activeTariffs[0];
                  const totalCost = selTariff.monthlyPrice * upgradeForm.additionalMonths;
                  const willUnblock = selectedCenter.activeStudentsCount < selTariff.maxStudentsQuota;

                  return (
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px', color: '#9ca3af' }}>
                        <span>Tanlangan Tarif Limiti:</span>
                        <strong style={{ color: '#fff' }}>{selTariff.maxStudentsQuota} ta o'quvchi</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px', color: '#9ca3af' }}>
                        <span>Hisoblangan To'lov ({upgradeForm.additionalMonths} oy):</span>
                        <strong style={{ color: '#fbbf24' }}>{formatCurrency(totalCost)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#9ca3af' }}>
                        <span>Yangi Holat:</span>
                        <strong style={{ color: willUnblock ? '#34d399' : '#f43f5e' }}>
                          {willUnblock ? '✅ Markaz faollashadi (Blokdan yechiladi)' : '⚠️ O\'quvchilar soni yangi limitdan ham ko\'p'}
                        </strong>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowUpgradeModal(false)} className="btn btn-secondary">
                  Bekor Qilish
                </button>
                <button type="submit" className="btn btn-primary">
                  <span>Tarifni Faollashtirish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW CENTER MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Yangi O'quv Markazi Ochish (SaaS Akkaunt)</h3>
                <p style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0 0 0' }}>
                  Yangi mijoz maktab yoki o'quv markazini tizimga qo'shish va unga admin hisobini yaratish
                </p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Markaz Nomi *</label>
                    <input
                      type="text"
                      required
                      value={createForm.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
                        setCreateForm({ ...createForm, name, slug: createForm.slug ? createForm.slug : slug });
                      }}
                      placeholder="Masalan: Milliy IT Academy"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Subdomain / Identifikator (Slug) *</label>
                    <input
                      type="text"
                      required
                      value={createForm.slug}
                      onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                      placeholder="milliy-it"
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Telefon Raqami *</label>
                    <input
                      type="text"
                      required
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                      placeholder="+998 71 200 00 00"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Manzili *</label>
                    <input
                      type="email"
                      required
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      placeholder="info@markaz.uz"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Markaz Joylashuvi (Manzil)</label>
                  <input
                    type="text"
                    value={createForm.address}
                    onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                    placeholder="Toshkent shahri, Yunusobod tumani..."
                    className="form-input"
                  />
                </div>

                {/* Tariff Selection */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>Dastlabki Tarif Rejasi *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {activeTariffs.map((t) => (
                      <div
                        key={t.plan}
                        onClick={() => setCreateForm({ ...createForm, tariffPlan: t.plan })}
                        style={{
                          background: createForm.tariffPlan === t.plan ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                          border: `2px solid ${createForm.tariffPlan === t.plan ? '#10b981' : 'rgba(255, 255, 255, 0.08)'}`,
                          borderRadius: '8px',
                          padding: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ fontWeight: 700, color: createForm.tariffPlan === t.plan ? '#34d399' : '#fff' }}>
                          {t.name}
                        </div>
                        <div style={{ fontSize: '13px', color: '#fbbf24', fontWeight: 600 }}>
                          {formatCurrency(t.monthlyPrice)} / oy
                        </div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                          Limit: {t.maxStudentsQuota >= 999999 ? 'Cheksiz' : `${t.maxStudentsQuota} ta o'quvchi`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Center Admin Account Creation */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', marginTop: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#34d399', marginBottom: '12px' }}>
                    👤 Markaz Boshqaruvchisi (Admin Akkaunti)
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Admin To'liq Ismi</label>
                      <input
                        type="text"
                        value={createForm.adminFullName}
                        onChange={(e) => setCreateForm({ ...createForm, adminFullName: e.target.value })}
                        placeholder="Admin Ismi Familiyasi"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Admin Logini (Username) *</label>
                      <input
                        type="text"
                        required
                        value={createForm.adminUsername}
                        onChange={(e) => setCreateForm({ ...createForm, adminUsername: e.target.value })}
                        placeholder="markaz_admin"
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Admin Boshlang'ich Paroli *</label>
                    <input
                      type="password"
                      required
                      value={createForm.adminPassword}
                      onChange={(e) => setCreateForm({ ...createForm, adminPassword: e.target.value })}
                      placeholder="Parol kiriting"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Bekor Qilish
                </button>
                <button type="submit" className="btn btn-primary">
                  <span>Markazni Yaratish & Akkaunt Ochish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
