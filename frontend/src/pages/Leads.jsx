import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Plus, ArrowRight, ArrowLeft, CheckCircle2, UserCheck, 
  Calendar, Phone, Mail, DollarSign, Filter, Search, Edit3, Trash2, 
  X, AlertCircle, Building2, BookOpen, Clock, Sparkles, TrendingUp
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STAGES = [
  {
    key: 'Interested',
    label: 'Qiziqish bildirganlar',
    badge: '1-bosqich',
    icon: '🟣',
    color: '#A855F7',
    border: 'rgba(168, 85, 247, 0.4)',
    bg: 'rgba(168, 85, 247, 0.08)',
    desc: 'Reklama yoki ijtimoiy tarmoqdan yozgan yangi qiziqishlar'
  },
  {
    key: 'Contacted',
    label: 'Gaplashilganlar',
    badge: '2-bosqich',
    icon: '🔵',
    color: '#3B82F6',
    border: 'rgba(59, 130, 246, 0.4)',
    bg: 'rgba(59, 130, 246, 0.08)',
    desc: 'Menejer bog\'langan va konsultatsiya berilgan'
  },
  {
    key: 'MeetingScheduled',
    label: 'Uchrashuv belgilanganlar',
    badge: '3-bosqich',
    icon: '🟡',
    color: '#F59E0B',
    border: 'rgba(245, 158, 11, 0.4)',
    bg: 'rgba(245, 158, 11, 0.08)',
    desc: 'O\'quv markaziga yoki onlayn suhbatga chaqirilgan'
  },
  {
    key: 'DemoAttended',
    label: 'Demo darsga kelganlar',
    badge: '4-bosqich',
    icon: '🟠',
    color: '#EC4899',
    border: 'rgba(236, 72, 153, 0.4)',
    bg: 'rgba(236, 72, 153, 0.08)',
    desc: 'Sinov yoki ochiq darsda qatnashgan'
  },
  {
    key: 'Converted',
    label: 'To\'lov qilganlar',
    badge: '5-bosqich (Konversiya)',
    icon: '🟢',
    color: '#10B981',
    border: 'rgba(16, 185, 129, 0.4)',
    bg: 'rgba(16, 185, 129, 0.08)',
    desc: 'To\'lov qilgan va o\'quvchiga aylantirishga tayyor'
  }
];

const SOURCES = [
  { value: 'Instagram', label: '📸 Instagram Direct', color: '#E1306C' },
  { value: 'Telegram', label: '✈️ Telegram', color: '#0088cc' },
  { value: 'Facebook', label: '📘 Facebook Ads', color: '#1877F2' },
  { value: 'Recommendation', label: '👥 Tavsiya / Do\'sti', color: '#10B981' },
  { value: 'Website', label: '🌐 Rasmiy Veb-sayt', color: '#6366F1' },
  { value: 'Banner', label: '📢 Tashqi Banner', color: '#F59E0B' },
  { value: 'WalkIn', label: '🚶 O\'zi Kelgan', color: '#8B5CF6' }
];

export const Leads = () => {
  const { user, showToast } = useAuth();
  const [leads, setLeads] = useState([]);
  const [centers, setCenters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCenter, setSelectedCenter] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState('ALL');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [leadForm, setLeadForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    source: 'Instagram',
    status: 'Interested',
    courseOfInterest: '',
    targetCourseId: '',
    centerId: '',
    notes: '',
    meetingDate: '',
    demoLessonDate: '',
    estimatedBudget: 800000
  });

  // Convert to Student Modal
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertingLead, setConvertingLead] = useState(null);
  const [convertForm, setConvertForm] = useState({
    groupId: '',
    initialPaymentAmount: 800000,
    paymentMethod: 'Card',
    parentPhone: '',
    password: '+998991992012'
  });
  const [convertingLoading, setConvertingLoading] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [leadsRes, centersRes, coursesRes, groupsRes] = await Promise.all([
        api.leads.getAll(),
        api.centers.getAll().catch(() => ({ data: [] })),
        api.courses.getAll().catch(() => ({ data: [] })),
        api.groups.getAll().catch(() => ({ data: [] }))
      ]);

      if (leadsRes?.data) setLeads(leadsRes.data);
      if (centersRes?.data) setCenters(centersRes.data);
      if (coursesRes?.data) setCourses(coursesRes.data);
      if (groupsRes?.data) setGroups(groupsRes.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const reloadLeads = async () => {
    try {
      const res = await api.leads.getAll();
      if (res?.data) setLeads(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (selectedCenter !== 'ALL' && lead.centerId !== selectedCenter) return false;
      if (selectedSource !== 'ALL' && lead.source !== selectedSource) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = lead.fullName?.toLowerCase().includes(q);
        const matchPhone = lead.phone?.includes(q);
        const matchCourse = (lead.courseOfInterest || lead.targetCourseName || '').toLowerCase().includes(q);
        const matchNotes = (lead.notes || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchCourse && !matchNotes) return false;
      }
      return true;
    });
  }, [leads, selectedCenter, selectedSource, search]);

  // Stage groups
  const stageColumns = useMemo(() => {
    const map = {};
    STAGES.forEach((s) => (map[s.key] = []));
    filteredLeads.forEach((lead) => {
      const st = lead.status || 'Interested';
      if (!map[st]) map[st] = [];
      map[st].push(lead);
    });
    return map;
  }, [filteredLeads]);

  // Pipeline Metrics
  const metrics = useMemo(() => {
    const total = filteredLeads.length;
    const converted = filteredLeads.filter((l) => l.status === 'Converted').length;
    const rate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0';
    const totalValue = filteredLeads.reduce((acc, l) => acc + (Number(l.estimatedBudget) || 800000), 0);
    const convertedValue = filteredLeads
      .filter((l) => l.status === 'Converted')
      .reduce((acc, l) => acc + (Number(l.estimatedBudget) || 800000), 0);

    return { total, converted, rate, totalValue, convertedValue };
  }, [filteredLeads]);

  // Handle stage change (Next / Prev)
  const handleMoveStage = async (lead, direction) => {
    const currentIndex = STAGES.findIndex((s) => s.key === lead.status);
    const newIndex = currentIndex + direction;
    if (newIndex < 0 || newIndex >= STAGES.length) return;

    const nextStage = STAGES[newIndex].key;
    try {
      await api.leads.updateStatus(lead.id, { status: nextStage });
      showToast(`Lid bosqichi '${STAGES[newIndex].label}' ga o'tkazildi`, 'success');
      reloadLeads();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Open Create / Edit Modal
  const openCreateModal = () => {
    setEditingLead(null);
    setLeadForm({
      fullName: '',
      phone: '+998 ',
      email: '',
      source: 'Instagram',
      status: 'Interested',
      courseOfInterest: courses[0]?.name || '.NET Backend',
      targetCourseId: courses[0]?.id || '',
      centerId: centers[0]?.id || '',
      notes: '',
      meetingDate: '',
      demoLessonDate: '',
      estimatedBudget: 800000
    });
    setShowModal(true);
  };

  const openEditModal = (lead) => {
    setEditingLead(lead);
    setLeadForm({
      fullName: lead.fullName || '',
      phone: lead.phone || '',
      email: lead.email || '',
      source: lead.source || 'Instagram',
      status: lead.status || 'Interested',
      courseOfInterest: lead.courseOfInterest || lead.targetCourseName || '',
      targetCourseId: lead.targetCourseId || '',
      centerId: lead.centerId || '',
      notes: lead.notes || '',
      meetingDate: lead.meetingDate ? lead.meetingDate.split('T')[0] : '',
      demoLessonDate: lead.demoLessonDate ? lead.demoLessonDate.split('T')[0] : '',
      estimatedBudget: lead.estimatedBudget || 800000
    });
    setShowModal(true);
  };

  const handleSaveLead = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...leadForm,
        meetingDate: leadForm.meetingDate ? new Date(leadForm.meetingDate).toISOString() : null,
        demoLessonDate: leadForm.demoLessonDate ? new Date(leadForm.demoLessonDate).toISOString() : null,
        estimatedBudget: Number(leadForm.estimatedBudget) || 800000,
        targetCourseId: leadForm.targetCourseId || null,
        centerId: leadForm.centerId || null
      };

      if (editingLead) {
        await api.leads.update(editingLead.id, payload);
        showToast("Lid muvaffaqiyatli yangilandi", 'success');
      } else {
        await api.leads.create(payload);
        showToast("Yangi lid muvaffaqiyatli saqlandi", 'success');
      }
      setShowModal(false);
      reloadLeads();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteLead = async (id, name) => {
    if (!window.confirm(`Haqiqatan ham '${name}' lidini o'chirmoqchimisiz?`)) return;
    try {
      await api.leads.delete(id);
      showToast("Lid o'chirildi", 'success');
      reloadLeads();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Convert to Student
  const openConvertModal = (lead) => {
    setConvertingLead(lead);
    const leadCenterGroups = groups.filter((g) => !lead.centerId || g.centerId === lead.centerId);
    setConvertForm({
      groupId: leadCenterGroups[0]?.id || groups[0]?.id || '',
      initialPaymentAmount: 800000,
      paymentMethod: 'Card',
      parentPhone: lead.phone || '',
      password: '+998991992012'
    });
    setShowConvertModal(true);
  };

  const handleConvertSubmit = async (e) => {
    e.preventDefault();
    if (!convertingLead) return;

    setConvertingLoading(true);
    try {
      const payload = {
        groupId: convertForm.groupId || null,
        initialPaymentAmount: Number(convertForm.initialPaymentAmount) || 800000,
        paymentMethod: convertForm.paymentMethod,
        parentPhone: convertForm.parentPhone,
        password: convertForm.password
      };

      const res = await api.leads.convert(convertingLead.id, payload);
      showToast(res?.message || "Lid muvaffaqiyatli o'quvchiga aylantirildi va tizimga qo'shildi!", 'success');
      setShowConvertModal(false);
      reloadLeads();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setConvertingLoading(false);
    }
  };

  // Target center for quota preview in Convert Modal
  const leadTargetCenter = useMemo(() => {
    if (!convertingLead) return null;
    return centers.find((c) => c.id === convertingLead.centerId) || centers[0];
  }, [convertingLead, centers]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', minWidth: 0 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.75rem' }}>🎯</span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#F8FAFC', letterSpacing: '-0.02em' }}>
              Lidlar CRM Doskasi (Pipeline)
            </h1>
            <span style={{ 
              fontSize: '0.75rem', 
              padding: '0.25rem 0.6rem', 
              borderRadius: '9999px', 
              background: 'rgba(59, 130, 246, 0.15)', 
              color: '#60A5FA', 
              border: '1px solid rgba(59, 130, 246, 0.3)',
              fontWeight: 600
            }}>
              5 Bosqichli CRM Voronkasi
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#94A3B8' }}>
            Instagram Direct, Telegram, Reklama va Veb-saytdan kelgan potensial o'quvchilarni kuzatish va 1-bosishda o'quvchiga aylantirish
          </p>
        </div>

        <button
          onClick={openCreateModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
            transition: 'all 0.2s ease'
          }}
        >
          <Plus size={18} />
          Yangi Lid Qo'shish
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', 
        gap: '1rem' 
      }}>
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.7)', 
          border: '1px solid rgba(255, 255, 255, 0.08)', 
          borderRadius: '12px', 
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '10px', 
            background: 'rgba(59, 130, 246, 0.15)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#60A5FA'
          }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Jami Lidlar Soni</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F8FAFC' }}>{metrics.total} ta</div>
          </div>
        </div>

        <div style={{ 
          background: 'rgba(30, 41, 59, 0.7)', 
          border: '1px solid rgba(255, 255, 255, 0.08)', 
          borderRadius: '12px', 
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '10px', 
            background: 'rgba(16, 185, 129, 0.15)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#34D399'
          }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>To'lov Qilganlar (Muvaffaqiyat)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34D399' }}>{metrics.converted} ta</div>
          </div>
        </div>

        <div style={{ 
          background: 'rgba(30, 41, 59, 0.7)', 
          border: '1px solid rgba(255, 255, 255, 0.08)', 
          borderRadius: '12px', 
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '10px', 
            background: 'rgba(168, 85, 247, 0.15)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#C084FC'
          }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Konversiya Ko'rsatkichi</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#C084FC' }}>{metrics.rate}%</div>
          </div>
        </div>

        <div style={{ 
          background: 'rgba(30, 41, 59, 0.7)', 
          border: '1px solid rgba(255, 255, 255, 0.08)', 
          borderRadius: '12px', 
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '10px', 
            background: 'rgba(245, 158, 11, 0.15)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#FBBF24'
          }}>
            <DollarSign size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Pipeline Potensial Qiymati</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FBBF24' }}>
              {(metrics.totalValue).toLocaleString('uz-UZ')} UZS
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem', 
        flexWrap: 'wrap', 
        background: 'rgba(30, 41, 59, 0.5)', 
        padding: '0.85rem 1.25rem', 
        borderRadius: '12px', 
        border: '1px solid rgba(255, 255, 255, 0.06)' 
      }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px', background: 'rgba(15, 23, 42, 0.6)', padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Ism, telefon, kurs yoki izoh bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#F8FAFC',
              fontSize: '0.875rem',
              width: '100%'
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Source Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>Manba:</span>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '0.45rem 0.75rem',
              color: '#F8FAFC',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">Barcha Manbalar (Instagram, TG...)</option>
            {SOURCES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Center Filter (for Super Admin) */}
        {centers.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>Filial:</span>
            <select
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '0.45rem 0.75rem',
                color: '#F8FAFC',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">Barcha O'quv Markazlari</option>
              {centers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 5-Column Kanban Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, minmax(290px, 1fr))',
        gap: '1.25rem',
        overflowX: 'auto',
        paddingBottom: '1rem',
        alignItems: 'start'
      }}>
        {STAGES.map((stage, colIdx) => {
          const colLeads = stageColumns[stage.key] || [];
          return (
            <div
              key={stage.key}
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(12px)',
                borderRadius: '14px',
                border: `1px solid ${stage.border}`,
                display: 'flex',
                flexDirection: 'column',
                minHeight: '620px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)'
              }}
            >
              {/* Column Header */}
              <div style={{
                padding: '1rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                background: stage.bg,
                borderTopLeftRadius: '13px',
                borderTopRightRadius: '13px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>{stage.icon}</span>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#F8FAFC' }}>
                      {stage.label}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '9999px',
                    background: 'rgba(15, 23, 42, 0.7)',
                    color: stage.color,
                    border: `1px solid ${stage.color}`
                  }}>
                    {colLeads.length}
                  </span>
                </div>
                <div style={{ fontSize: '0.725rem', color: '#94A3B8' }}>
                  {stage.desc}
                </div>
              </div>

              {/* Column Cards Container */}
              <div style={{
                padding: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                flex: 1,
                overflowY: 'auto'
              }}>
                {colLeads.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '2.5rem 1rem',
                    color: '#64748B',
                    fontSize: '0.85rem',
                    border: '1px dashed rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px'
                  }}>
                    Ushbu bosqichda lidlar yo'q
                  </div>
                ) : (
                  colLeads.map((lead) => {
                    const sourceInfo = SOURCES.find((s) => s.value === lead.source) || { label: lead.sourceName || lead.source, color: '#94A3B8' };
                    const isConverted = lead.status === 'Converted';
                    const hasStudent = Boolean(lead.convertedStudentId);

                    return (
                      <div
                        key={lead.id}
                        style={{
                          background: 'rgba(30, 41, 59, 0.85)',
                          borderRadius: '10px',
                          border: isConverted 
                            ? '1px solid rgba(16, 185, 129, 0.5)' 
                            : '1px solid rgba(255, 255, 255, 0.08)',
                          padding: '0.9rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.65rem',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                          transition: 'transform 0.15s ease, border-color 0.15s ease'
                        }}
                      >
                        {/* Header: Name + Source Badge */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.925rem', color: '#F8FAFC' }}>
                            {lead.fullName}
                          </span>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            background: `${sourceInfo.color}22`,
                            color: sourceInfo.color,
                            border: `1px solid ${sourceInfo.color}55`,
                            whiteSpace: 'nowrap'
                          }}>
                            {sourceInfo.label}
                          </span>
                        </div>

                        {/* Phone & Course */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.8rem' }}>
                          <a 
                            href={`tel:${lead.phone}`} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.4rem', 
                              color: '#60A5FA', 
                              textDecoration: 'none',
                              fontWeight: 500
                            }}
                          >
                            <Phone size={13} />
                            {lead.phone}
                          </a>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#CBD5E1' }}>
                            <BookOpen size={13} color="#A855F7" />
                            <span style={{ fontWeight: 600, color: '#E2E8F0' }}>
                              {lead.courseOfInterest || lead.targetCourseName || 'Kurs tanlanmagan'}
                            </span>
                          </div>

                          {lead.centerName && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94A3B8', fontSize: '0.75rem' }}>
                              <Building2 size={12} />
                              <span>{lead.centerName}</span>
                            </div>
                          )}
                        </div>

                        {/* Dates (Meeting / Demo) */}
                        {(lead.meetingDate || lead.demoLessonDate) && (
                          <div style={{ 
                            background: 'rgba(15, 23, 42, 0.5)', 
                            padding: '0.45rem 0.6rem', 
                            borderRadius: '6px', 
                            fontSize: '0.75rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.2rem'
                          }}>
                            {lead.meetingDate && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#FBBF24' }}>
                                <Calendar size={12} />
                                <span>Uchrashuv: {new Date(lead.meetingDate).toLocaleDateString('uz-UZ')}</span>
                              </div>
                            )}
                            {lead.demoLessonDate && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#F472B6' }}>
                                <Clock size={12} />
                                <span>Demo dars: {new Date(lead.demoLessonDate).toLocaleDateString('uz-UZ')}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Notes */}
                        {lead.notes && (
                          <p style={{ 
                            margin: 0, 
                            fontSize: '0.775rem', 
                            color: '#94A3B8', 
                            fontStyle: 'italic',
                            lineHeight: 1.35,
                            background: 'rgba(15, 23, 42, 0.35)',
                            padding: '0.4rem 0.55rem',
                            borderRadius: '6px'
                          }}>
                            "{lead.notes}"
                          </p>
                        )}

                        {/* Budget Tag */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.2rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>To'lov byudjeti:</span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34D399' }}>
                            {(lead.estimatedBudget || 800000).toLocaleString('uz-UZ')} UZS
                          </span>
                        </div>

                        {/* Convert to Student Action Button (on 5th stage) */}
                        {isConverted && (
                          <div style={{ marginTop: '0.25rem' }}>
                            {hasStudent ? (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.4rem',
                                padding: '0.45rem',
                                borderRadius: '6px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#10B981',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}>
                                <CheckCircle2 size={14} />
                                O'quvchiga aylantirilgan
                              </div>
                            ) : (
                              <button
                                onClick={() => openConvertModal(lead)}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.4rem',
                                  padding: '0.55rem 0.75rem',
                                  borderRadius: '8px',
                                  border: 'none',
                                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                  color: '#FFFFFF',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  boxShadow: '0 4px 10px rgba(16, 185, 129, 0.35)',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <UserCheck size={15} />
                                O'quvchiga Aylantirish (1-Click)
                              </button>
                            )}
                          </div>
                        )}

                        {/* Bottom Actions: Move Next/Prev & Edit/Delete */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                          paddingTop: '0.5rem',
                          marginTop: '0.2rem'
                        }}>
                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <button
                              disabled={colIdx === 0}
                              onClick={() => handleMoveStage(lead, -1)}
                              title="Oldingi bosqichga qaytarish"
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: colIdx === 0 ? '#475569' : '#CBD5E1',
                                padding: '0.3rem 0.5rem',
                                borderRadius: '5px',
                                cursor: colIdx === 0 ? 'not-allowed' : 'pointer'
                              }}
                            >
                              <ArrowLeft size={13} />
                            </button>

                            <button
                              disabled={colIdx === STAGES.length - 1}
                              onClick={() => handleMoveStage(lead, 1)}
                              title="Keyingi bosqichga o'tkazish"
                              style={{
                                background: colIdx === STAGES.length - 2 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: colIdx === STAGES.length - 1 ? '#475569' : (colIdx === STAGES.length - 2 ? '#34D399' : '#CBD5E1'),
                                padding: '0.3rem 0.5rem',
                                borderRadius: '5px',
                                cursor: colIdx === STAGES.length - 1 ? 'not-allowed' : 'pointer'
                              }}
                            >
                              <ArrowRight size={13} />
                            </button>
                          </div>

                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <button
                              onClick={() => openEditModal(lead)}
                              title="Tahrirlash"
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#94A3B8',
                                cursor: 'pointer',
                                padding: '0.3rem'
                              }}
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteLead(lead.id, lead.fullName)}
                              title="O'chirish"
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#EF4444',
                                cursor: 'pointer',
                                padding: '0.3rem'
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT LEAD MODAL */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#1E293B',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.5rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
                {editingLead ? 'Lid Ma\'lumotlarini Tahrirlash' : '🎯 Yangi Lid Ro\'yxatga Olish'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveLead} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.35rem' }}>
                  To'liq Ism Sharif *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Sardor Rustamov"
                  value={leadForm.fullName}
                  onChange={(e) => setLeadForm({ ...leadForm, fullName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.35rem' }}>
                    Telefon Raqam *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+998 90 123 45 67"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.35rem' }}>
                    Email (ixtiyoriy)
                  </label>
                  <input
                    type="email"
                    placeholder="email@misol.uz"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.35rem' }}>
                    Murojaat Manbasi *
                  </label>
                  <select
                    value={leadForm.source}
                    onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    {SOURCES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.35rem' }}>
                    Pipeline Bosqichi *
                  </label>
                  <select
                    value={leadForm.status}
                    onChange={(e) => setLeadForm({ ...leadForm, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    {STAGES.map((st) => (
                      <option key={st.key} value={st.key}>{st.icon} {st.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.35rem' }}>
                  Qiziqqan Kursi / Yo'nalish
                </label>
                <input
                  type="text"
                  placeholder="Masalan: .NET Backend Architecture yoki React"
                  value={leadForm.courseOfInterest}
                  onChange={(e) => setLeadForm({ ...leadForm, courseOfInterest: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {centers.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.35rem' }}>
                    Biriktiriladigan O'quv Markazi (Filial)
                  </label>
                  <select
                    value={leadForm.centerId}
                    onChange={(e) => setLeadForm({ ...leadForm, centerId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    {centers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.35rem' }}>
                    Uchrashuv Sanasi
                  </label>
                  <input
                    type="date"
                    value={leadForm.meetingDate}
                    onChange={(e) => setLeadForm({ ...leadForm, meetingDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.35rem' }}>
                    Demo Dars Sanasi
                  </label>
                  <input
                    type="date"
                    value={leadForm.demoLessonDate}
                    onChange={(e) => setLeadForm({ ...leadForm, demoLessonDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.35rem' }}>
                  Menejer Izohi & Eslatma
                </label>
                <textarea
                  rows={3}
                  placeholder="Mijoz bilan suhbat tafsilotlari, talablari..."
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '0.6rem 1.1rem',
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
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#3B82F6',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {editingLead ? 'Saqlash' : 'Lidni Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONVERT TO STUDENT MODAL (1-Click Conversion) */}
      {showConvertModal && convertingLead && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#1E293B',
            borderRadius: '16px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            width: '100%',
            maxWidth: '540px',
            padding: '1.75rem',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🎓</span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
                  Lidni O'quvchiga Aylantirish
                </h2>
              </div>
              <button
                onClick={() => setShowConvertModal(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Lead Summary Card */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: '#F8FAFC', fontSize: '0.95rem' }}>{convertingLead.fullName}</span>
                <span style={{ color: '#60A5FA', fontSize: '0.85rem', fontWeight: 600 }}>{convertingLead.phone}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                Yo'nalish: <strong style={{ color: '#CBD5E1' }}>{convertingLead.courseOfInterest || convertingLead.targetCourseName || '.NET Backend'}</strong>
              </div>
            </div>

            {/* Quota Check Alert */}
            {leadTargetCenter && (
              <div style={{
                background: leadTargetCenter.isBlocked || leadTargetCenter.remainingQuota <= 0
                  ? 'rgba(239, 68, 68, 0.15)'
                  : 'rgba(16, 185, 129, 0.12)',
                border: leadTargetCenter.isBlocked || leadTargetCenter.remainingQuota <= 0
                  ? '1px solid rgba(239, 68, 68, 0.4)'
                  : '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.825rem'
              }}>
                <Building2 size={20} color={leadTargetCenter.isBlocked ? '#EF4444' : '#10B981'} />
                <div>
                  <div style={{ fontWeight: 700, color: leadTargetCenter.isBlocked ? '#EF4444' : '#34D399' }}>
                    {leadTargetCenter.name}
                  </div>
                  <div style={{ color: '#CBD5E1', fontSize: '0.775rem' }}>
                    O'quvchi kvotasi: <strong>{leadTargetCenter.activeStudentsCount} / {leadTargetCenter.maxStudentsQuota}</strong> ta 
                    {' '}(Bo'sh o'rin: <strong>{leadTargetCenter.remainingQuota}</strong> ta)
                  </div>
                  {leadTargetCenter.remainingQuota <= 0 && (
                    <div style={{ color: '#F87171', fontWeight: 700, marginTop: '0.2rem' }}>
                      ⚠️ Kvota chegarasi to'lgan! Yangi o'quvchi qo'shish tizim tomonidan bloklangan.
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleConvertSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.35rem' }}>
                  Biriktiriladigan Guruh *
                </label>
                <select
                  required
                  value={convertForm.groupId}
                  onChange={(e) => setConvertForm({ ...convertForm, groupId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Guruhni tanlang...</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} — {g.courseName} ({g.teacherName || 'Mentor'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.35rem' }}>
                    Dastlabki To'lov Summasi (UZS)
                  </label>
                  <input
                    type="number"
                    value={convertForm.initialPaymentAmount}
                    onChange={(e) => setConvertForm({ ...convertForm, initialPaymentAmount: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.35rem' }}>
                    To'lov Usuli
                  </label>
                  <select
                    value={convertForm.paymentMethod}
                    onChange={(e) => setConvertForm({ ...convertForm, paymentMethod: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Card">💳 Karta (Click / Payme)</option>
                    <option value="Cash">💵 Naqd pul</option>
                    <option value="BankTransfer">🏦 Bank o'tkazmasi</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.35rem' }}>
                    Ota-onasi Telefoni
                  </label>
                  <input
                    type="text"
                    value={convertForm.parentPhone}
                    onChange={(e) => setConvertForm({ ...convertForm, parentPhone: e.target.value })}
                    placeholder="+998 90 777 55 44"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.35rem' }}>
                    O'quvchi Paroli
                  </label>
                  <input
                    type="text"
                    value={convertForm.password}
                    onChange={(e) => setConvertForm({ ...convertForm, password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowConvertModal(false)}
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
                  disabled={convertingLoading || (leadTargetCenter && leadTargetCenter.remainingQuota <= 0)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 1.4rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: leadTargetCenter && leadTargetCenter.remainingQuota <= 0 
                      ? '#475569' 
                      : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    cursor: leadTargetCenter && leadTargetCenter.remainingQuota <= 0 ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                  }}
                >
                  <CheckCircle2 size={16} />
                  {convertingLoading ? 'O\'tkazilmoqda...' : 'O\'quvchiga Aylantirish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
